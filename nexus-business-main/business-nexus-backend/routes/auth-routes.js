
import express from 'express';
import { protect } from '../middlewares/auth-middleware.js';
import { 
  registerUser, 
  loginUser, 
  forgotPassword, 
  resetPassword,
  updateUserProfile,
  logoutUser
} from '../controllers/auth-controller.js';

const router = express.Router();

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', protect, logoutUser);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Protected Routes (Requires a valid JWT token in the header)
router.put('/users/:id', protect, updateUserProfile);

export default router;