// import mongoose from 'mongoose';

// const documentSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   type: { type: String, default: 'application/pdf' },
//   size: { type: Number, default: 0 }, // File size in bytes
  
//   uploaded_by: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'User', 
//     required: true 
//   },
  
//   status: { 
//     type: String, 
//     enum: ['draft', 'pending_signature', 'signed', 'archived'], 
//     default: 'draft' 
//   },
//   version: { type: Number, default: 1 },
  
//   storage_path: { type: String }, // AWS S3 URL or similar
//   signature_data: { type: String } // Can store digital signature hash/data
// }, {
//   timestamps: true
// });

// export const Document = mongoose.model('Document', documentSchema);


// backend/models/Document.js
import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  name: { type: String, required: true },       // Original file name
  type: { type: String, required: true },       // e.g., 'PDF', 'Spreadsheet'
  size: { type: String, required: true },       // Formatted size e.g., '2.4 MB'
  fileUrl: { type: String, required: true },    // Where it's stored on the server
  shared: { type: Boolean, default: false }
}, { 
  timestamps: true 
});

export const Document = mongoose.model('Document', documentSchema);