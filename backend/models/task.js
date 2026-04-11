const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
    dueDate: { type: Date },
    owner: { type: String }, // optional for multi-user
    sharedWith: { type: [String], default: [] } // for collaborative features
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);