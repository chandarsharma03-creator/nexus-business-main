
import mongoose from 'mongoose';
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema({
  // Shared Fields
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Required for real auth
  role: { type: String, enum: ['entrepreneur', 'investor'], required: true },
  avatarUrl: { type: String },
  bio: { type: String },
  isOnline: { type: Boolean, default: false },
  // user-model.js
lastActive: { type: Date, default: Date.now },

  // --- Entrepreneur Specific Fields ---
  startupName: { type: String },
  pitchSummary: { type: String },
  fundingNeeded: { type: String }, // e.g., "$1.5M"
  industry: { type: String },
  location: { type: String },
  foundedYear: { type: Number },
  teamSize: { type: Number },

  // --- Investor Specific Fields ---
  investmentInterests: [{ type: String }], // Array of strings
  investmentStage: [{ type: String }],
  portfolioCompanies: [{ type: String }],
  totalInvestments: { type: Number, default: 0 },
  minimumInvestment: { type: String }, // e.g., "$250K"
  maximumInvestment: { type: String }, // e.g., "$1.5M"
  profileViews: {
    type: Number,
    default: 0
  },

}, { 
  timestamps: true // Automatically creates 'createdAt' and 'updatedAt'
});

// Hash password before saving

userSchema.pre('save', async function() {
  // If the password wasn't changed, just return and let Mongoose continue
  if (!this.isModified('password')) return;
  
  // Otherwise, hash the new password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


export const User = mongoose.model('User', userSchema);
