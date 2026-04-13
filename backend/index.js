require('dotenv').config(); // MUST be first

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Pusher = require('pusher');

const app = express();

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

// Allow both local and production origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true
}));
app.use(express.json());

// Request logger to debug 404s
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url} 📥`);
  next();
});

// Error handling for malformed JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error(`Malformed JSON request received at ${req.url} ❌`);
    return res.status(400).json({ error: "Invalid JSON format" });
  }
  next(err);
});


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
const apiRouter = express.Router();

apiRouter.get('/tasks', async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

// Shared tasks endpoint
apiRouter.get('/tasks/shared', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email is required" });
  try {
    const tasks = await Task.find({ sharedWith: email });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/tasks', async (req, res) => {
  const task = await Task.create(req.body);
  res.status(201).json(task);
});

apiRouter.put('/tasks/:id', async (req, res) => {
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
      pusher.trigger('tasks', 'notification', notification);
      pusher.trigger('tasks', 'taskUpdated', task);
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Share task endpoint
apiRouter.put('/tasks/:id/share', async (req, res) => {
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
    
    pusher.trigger('tasks', 'notification', notification);
    pusher.trigger('tasks', 'taskUpdated', task);
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Notification Endpoints
apiRouter.get('/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(10);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.patch('/notifications/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/tasks/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// Analytics
apiRouter.get('/analytics/overview', async (req, res) => {
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

apiRouter.get('/analytics/trends', async (req, res) => {
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

// Apply the /api prefix to all routes
app.use('/api', apiRouter);

// Global error handler (Express 5 async error support)
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.url}:`, err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
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
    
    // Only listen if not running as a Vercel serverless function
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      const PORT = process.env.PORT || 8000;
      app.listen(PORT, (err) => {
        if (err) {
          console.error("Failed to start server ❌", err);
          return;
        }
        console.log(`Server running on port ${PORT} 🚀`);
      });
    }
  })
  .catch(err => {
    console.error("MongoDB connection error ❌", err);
    process.exit(1);
  });
module.exports = app;
