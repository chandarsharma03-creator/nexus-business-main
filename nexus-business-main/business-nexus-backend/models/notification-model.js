// import mongoose from 'mongoose';

// const notificationSchema = new mongoose.Schema({
//   user_id: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'User', 
//     required: true 
//   },
//   title: { type: String, required: true },
//   message: { type: String, required: true },
//   type: { 
//     type: String, 
//     enum: ['info', 'success', 'warning', 'error'], 
//     default: 'info' 
//   },
//   read: { type: Boolean, default: false }
// }, {
//   timestamps: true
// });

// export const Notification = mongoose.model('Notification', notificationSchema);


import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  // Who triggered the notification (e.g., who sent the message or request)
  senderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  type: { 
    type: String, 
    enum: ['message', 'connection', 'investment', 'system'], 
    required: true 
  },
  content: { type: String, required: true },
  unread: { type: Boolean, default: true }
}, { 
  timestamps: true 
});

export const Notification = mongoose.model('Notification', notificationSchema);