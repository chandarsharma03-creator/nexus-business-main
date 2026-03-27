import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['deposit', 'withdraw', 'transfer'], 
    required: true 
  },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'pending' 
  },
  from_party: { type: String },
  to_party: { type: String },
  description: { type: String }
}, {
  timestamps: true
});

export const Transaction = mongoose.model('Transaction', transactionSchema);