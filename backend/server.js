const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB Compass
const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.mongoURL)
        console.log("DB is connected");
    } catch (error) {
        console.error("DB connection failed:", error.message);
    }
};

dbConnect();


// Task Schema & Model
const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' }
});

const Task = mongoose.model('Task', taskSchema);

// Routes

// Create a new task
app.post('/tasks', async (req, res) => {
    try {
        const { title, description, status } = req.body;
        const newTask = new Task({ title, description, status });
        await newTask.save();
        res.status(201).json(newTask);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Fetch all tasks
app.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Fetch a single task by ID
app.get('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a task
app.put('/tasks/:id', async (req, res) => {
    try {
        const { title, description, status } = req.body;
        const updatedTask = await Task.findByIdAndUpdate(req.params.id, { title, description, status }, { new: true });
        if (!updatedTask) return res.status(404).json({ error: 'Task not found' });
        res.json(updatedTask);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a task
app.delete('/tasks/:id', async (req, res) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);
        if (!deletedTask) return res.status(404).json({ error: 'Task not found' });
        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
