import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema({
  investorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  // The startup being invested in
  startupId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  amount: { type: String, required: true }, // e.g., "$1.5M"
  equity: { type: String, required: true }, // e.g., "15%"
  status: { 
    type: String, 
    enum: ['Due Diligence', 'Term Sheet', 'Negotiation', 'Closed', 'Passed'], 
    default: 'Due Diligence' 
  },
  stage: { type: String, required: true }, // e.g., "Series A"
}, { 
  timestamps: true // Automatically gives us 'updatedAt' which we'll use for 'lastActivity'
});

export const Deal = mongoose.model('Deal', dealSchema);