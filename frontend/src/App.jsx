import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import { configureStore, createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { PlusIcon, CheckCircleIcon, TrashIcon } from '@heroicons/react/24/outline';

// API URL
const API_URL = "https://taskmanagerbackend-aqm3.onrender.com/tasks";

// Async Thunks for API calls
export const fetchTasks = createAsyncThunk("tasks/fetchTasks", async () => {
  const response = await axios.get(API_URL);
  return response.data;
});

export const addTask = createAsyncThunk("tasks/addTask", async (task) => {
  const response = await axios.post(API_URL, task);
  return response.data;
});

export const updateTask = createAsyncThunk("tasks/updateTask", async ({ id, task }) => {
  const response = await axios.put(`${API_URL}/${id}`, task);
  return response.data;
});

export const deleteTask = createAsyncThunk("tasks/deleteTask", async (id) => {
  await axios.delete(`${API_URL}/${id}`);
  return id;
});

// Redux Slice
const taskSlice = createSlice({
  name: "tasks",
  initialState: { list: [], status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.list = action.payload;
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.list.findIndex((task) => task._id === action.payload._id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.list = state.list.filter((task) => task._id !== action.payload);
      });
  },
});

const store = configureStore({ reducer: { tasks: taskSlice.reducer } });

// Components
const Home = () => {
  const dispatch = useDispatch();
  const tasks = useSelector((state) => state.tasks.list);

  useEffect(() => { dispatch(fetchTasks()); }, [dispatch]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 ">Task List</h2>
      <Link
        to="/new"
        className="flex items-center text-gray-700 hover:text-blue-600 font-medium mb-7 "
      >
        <PlusIcon className="h-5 w-5 mr-1" />
        New Task
      </Link>
      <div className="grid gap-4">
        {tasks.map((task) => (
          <div
            key={task._id}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <Link
                to={`/tasks/${task._id}`}
                className="text-lg font-medium text-gray-700 hover:text-blue-600"
              >
                {task.title}
              </Link>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm ${task.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : task.status === 'in-progress'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                  {task.status}
                </span>
                <button
                  onClick={() => dispatch(updateTask({
                    id: task._id,
                    task: { ...task, status: "completed" }
                  }))}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                >
                  <CheckCircleIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// TaskDetail Component
const TaskDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const task = useSelector((state) =>
    state.tasks.list.find((t) => t._id === id)
  );

  return task ? (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{task.title}</h2>
        <p className="text-gray-600 mb-4">{task.description}</p>
        <div className="flex items-center justify-between">
          <span className={`px-4 py-2 rounded-full text-sm ${task.status === 'completed'
              ? 'bg-green-100 text-green-800'
              : task.status === 'in-progress'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
            {task.status}
          </span>
          <button
            onClick={() => dispatch(updateTask({
              id: task._id,
              task: { ...task, status: "completed" }
            }))}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            Mark as Completed
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );
};

// NewTask Component
const NewTask = () => {
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(addTask({ title, description, status }));
    navigate("/");
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Task</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter task title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter task description"
              rows="4"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Task
          </button>
        </div>
      </form>
    </div>
  );
};

// App Component
const App = () => (
  <Provider store={store}>
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-600 font-medium "
              >
                Task Manager
              </Link>
            </div>
          </div>
        </nav>
        <main className="py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tasks/:id" element={<TaskDetail />} />
            <Route path="/new" element={<NewTask />} />
          </Routes>
        </main>
      </div>
    </Router>
  </Provider>
);

export default App;
