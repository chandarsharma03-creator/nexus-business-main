import mongoose from 'mongoose';

const collaborationRequestSchema = new mongoose.Schema({
  investorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  entrepreneurId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'], 
    default: 'pending' 
  }
}, { 
  timestamps: true // Automatically manages createdAt and updatedAt
});

const CollaborationRequest = mongoose.model('CollaborationRequest', collaborationRequestSchema);
export default CollaborationRequest;