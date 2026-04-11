require('dotenv').config(); // MUST be first

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Use CLIENT_URL from env, fallback to localhost for development
const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

const io = new Server(server, { 
  cors: { 
    origin: clientUrl,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  } 
});

app.use(cors({ origin: clientUrl }));
app.use(express.json());

// Task Schema
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  dueDate: Date,
  owner: String,
  sharedWith: { type: [String], default: [] }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

// Notification Schema
const notificationSchema = new mongoose.Schema({
  message: String,
  taskId: String,
  type: { type: String, enum: ['share', 'update'] },
  read: { type: Boolean, default: false }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

// API Endpoints
app.get('/tasks', async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

// Shared tasks endpoint
app.get('/tasks/shared', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email is required" });
  try {
    const tasks = await Task.find({ sharedWith: email });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/tasks', async (req, res) => {
  const task = await Task.create(req.body);
  res.status(201).json(task);
});

app.put('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (task) {
      // Create notification for status update
      const notification = await Notification.create({
        message: `Task "${task.title}" updated to ${task.status}`,
        taskId: task._id,
        type: 'update'
      });
      io.emit('notification', notification);
      io.emit('taskUpdated', task);
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Share task endpoint
app.put('/tasks/:id/share', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { sharedWith: email } },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: "Task not found" });
    
    // Create notification for share
    const notification = await Notification.create({
      message: `Task "${task.title}" shared with ${email}`,
      taskId: task._id,
      type: 'share'
    });
    
    io.emit('notification', notification);
    io.emit('taskUpdated', task);
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Notification Endpoints
app.get('/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(10);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/notifications/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// Analytics
app.get('/analytics/overview', async (req, res) => {
  try {
    const counts = await Task.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const total = await Task.countDocuments();
    
    // Format response explicitly
    const result = {
      totalTasks: total,
      completedTasks: 0,
      pendingTasks: 0,
      inProgressTasks: 0
    };

    counts.forEach(item => {
      if (item._id === 'Completed') result.completedTasks = item.count;
      if (item._id === 'Pending') result.pendingTasks = item.count;
      if (item._id === 'In Progress') result.inProgressTasks = item.count;
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/analytics/trends', async (req, res) => {
  try {
    const trends = await Task.aggregate([
      { $match: { status: "Completed" } },
      { 
        $group: { 
          _id: { 
            $dateToString: { format: "%Y-%U", date: "$updatedAt" } 
          }, 
          completedCount: { $sum: 1 } 
        } 
      },
      { $sort: { "_id": 1 } },
      { $project: { _id: 0, week: "$_id", completedCount: 1 } }
    ]);
    res.json(trends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// MongoDB connection + server start
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("CRITICAL: MONGO_URI is not defined in environment variables ❌");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected ✅");
    const PORT = process.env.PORT || 8000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT} 🚀`);
    });
  })
  .catch(err => {
    console.error("MongoDB connection error ❌", err);
  });