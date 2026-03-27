// import express from 'express';
// import multer from 'multer';
// import fs from 'fs';
// import { 
//   getDocuments, uploadDocument, signDocument, 
//   updateStatus, deleteDocument, downloadDocument 
// } from '../controllers/document-controller.js';
// import { protect } from '../middlewares/auth-middleware.js';

// const router = express.Router();

// // Ensure 'uploads' directory exists
// const uploadDir = 'uploads/';
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
// }

// // Configure Multer storage
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     cb(null, `${req.user._id}-${Date.now()}-${file.originalname}`);
//   }
// });

// const upload = multer({ storage: storage, limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB limit

// // Routes
// router.route('/')
//   .get(protect, getDocuments)
//   .post(protect, upload.single('file'), uploadDocument);

// router.put('/:id/sign', protect, signDocument);
// router.put('/:id/status', protect, updateStatus);
// router.delete('/:id', protect, deleteDocument);
// router.get('/:id/download', protect, downloadDocument);

// export default router;


// backend/routes/documentRoutes.js
import express from 'express';
import { protect } from '../middlewares/auth-middleware.js';
import { upload, uploadDocument, getDocuments, deleteDocument } from '../controllers/document-controller.js';

const router = express.Router();

router.use(protect);

router.get('/', getDocuments);
router.delete('/:id', deleteDocument);

// upload.single('file') processes the file before hitting your controller
router.post('/', upload.single('file'), uploadDocument);

export default router;