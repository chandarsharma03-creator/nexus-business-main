import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  receiverId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  isRead: { 
    type: Boolean, 
    default: false 
  }
}, { 
  // This automatically creates and manages 'createdAt' and 'updatedAt' fields, 
  // which your frontend uses to display the time the message was sent.
  timestamps: true 
});

export const Message = mongoose.model('Message', messageSchema);