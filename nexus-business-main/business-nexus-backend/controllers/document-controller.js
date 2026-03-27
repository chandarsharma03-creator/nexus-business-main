// import { Document } from '../models/document-model.js';
// import fs from 'fs';
// import path from 'path';

// // @desc    Get all documents for logged in user
// // @route   GET /api/documents
// export const getDocuments = async (req, res) => {
//   try {
//     const docs = await Document.find({ uploaded_by: req.user._id }).sort('-createdAt');
//     res.json(docs);
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to fetch documents' });
//   }
// };

// // @desc    Upload a new document
// // @route   POST /api/documents
// export const uploadDocument = async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

//     const newDoc = await Document.create({
//       name: req.file.originalname,
//       type: req.file.mimetype,
//       size: req.file.size,
//       uploaded_by: req.user._id,
//       storage_path: req.file.path, // Path where multer saved it
//       status: 'draft',
//       version: 1,
//     });

//     res.status(201).json(newDoc);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // @desc    Sign a document
// // @route   PUT /api/documents/:id/sign
// export const signDocument = async (req, res) => {
//   try {
//     const doc = await Document.findOneAndUpdate(
//       { _id: req.params.id, uploaded_by: req.user._id },
//       { status: 'signed', signature_data: req.body.signature_data },
//       { new: true }
//     );
//     if (!doc) return res.status(404).json({ message: 'Document not found' });
//     res.json(doc);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // @desc    Update document status
// // @route   PUT /api/documents/:id/status
// export const updateStatus = async (req, res) => {
//   try {
//     const doc = await Document.findOneAndUpdate(
//       { _id: req.params.id, uploaded_by: req.user._id },
//       { status: req.body.status },
//       { new: true }
//     );
//     res.json(doc);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // @desc    Delete a document
// // @route   DELETE /api/documents/:id
// export const deleteDocument = async (req, res) => {
//   try {
//     const doc = await Document.findOne({ _id: req.params.id, uploaded_by: req.user._id });
//     if (!doc) return res.status(404).json({ message: 'Document not found' });

//     // Delete file from local storage
//     if (doc.storage_path && fs.existsSync(doc.storage_path)) {
//       fs.unlinkSync(doc.storage_path);
//     }

//     await doc.deleteOne();
//     res.json({ message: 'Document removed' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // @desc    Download a document
// // @route   GET /api/documents/:id/download
// export const downloadDocument = async (req, res) => {
//   try {
//     const doc = await Document.findOne({ _id: req.params.id, uploaded_by: req.user._id });
//     if (!doc || !fs.existsSync(doc.storage_path)) {
//       return res.status(404).json({ message: 'File not found' });
//     }
//     // Send the file to the client
//     res.download(path.resolve(doc.storage_path), doc.name);
//   } catch (error) {
//     res.status(500).json({ message: 'Error downloading file' });
//   }
// };




// backend/controllers/document-controller.js
import { Document } from '../models/document-model.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// 1. Configure Multer Storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadDir = 'uploads/';
    // Create the uploads folder if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    // Format: "userId-timestamp-originalName.ext" to prevent naming conflicts
    cb(null, `${req.user._id}-${Date.now()}-${file.originalname}`);
  }
});

export const upload = multer({ 
  storage,
  limits: { fileSize: 10000000 }, // 10MB limit per file
});

// Helper function to format bytes into KB/MB
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper to determine file type based on extension
const getFileType = (mimetype) => {
  if (mimetype.includes('pdf')) return 'PDF';
  if (mimetype.includes('spreadsheet') || mimetype.includes('excel') || mimetype.includes('csv')) return 'Spreadsheet';
  if (mimetype.includes('word') || mimetype.includes('text')) return 'Document';
  if (mimetype.includes('image')) return 'Image';
  return 'File';
};

// -----------------------------------------
// CONTROLLER FUNCTIONS
// -----------------------------------------

// @desc    Upload a new document
// @route   POST /api/documents
// @access  Private
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const newDoc = await Document.create({
      userId: req.user._id,
      name: req.file.originalname,
      type: getFileType(req.file.mimetype),
      size: formatBytes(req.file.size),
      fileUrl: `/uploads/${req.file.filename}`, // Path to serve the file
      shared: false
    });

    res.status(201).json(newDoc);
  } catch (error) {
    res.status(500).json({ message: 'Server error uploading document', error: error.message });
  }
};

// @desc    Get all documents for logged-in user
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user._id }).sort({ createdAt: -1 });
    
    // Format to match frontend expectations
    const formattedDocs = documents.map(doc => ({
      _id: doc._id,
      name: doc.name,
      type: doc.type,
      size: doc.size,
      lastModified: doc.updatedAt.toISOString().split('T')[0], // e.g., '2024-03-27'
      shared: doc.shared,
      fileUrl: `http://localhost:5000${doc.fileUrl}` // Full URL for the frontend to download
    }));

    res.json(formattedDocs);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching documents', error: error.message });
  }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (document.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this document' });
    }

    // Remove the actual file from the server's filesystem
    const filePath = path.join(process.cwd(), document.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from database
    await document.deleteOne();

    res.json({ message: 'Document removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting document', error: error.message });
  }
};