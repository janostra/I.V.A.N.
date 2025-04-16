const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true }
}, { _id: false });

const conversationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  history: [messageSchema],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Conversation', conversationSchema);
