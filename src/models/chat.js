import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId: String,      // Clerk ID
  senderName: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
  requestId: String,     // ID of the donation request
  messages: [messageSchema]
});

export default mongoose.models.Chat || mongoose.model('Chat', chatSchema);
