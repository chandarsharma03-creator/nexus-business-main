// backend/routes/user-routes.js
import express from 'express';
import { protect } from '../middlewares/auth-middleware.js';
import { getDashboardStats, getUserById, getUsers, updatePassword, updateUserProfile, updateUserStatus } from '../controllers/user-controller.js';

const router = express.Router();

router.get('/', protect, getUsers);
router.put('/profile', protect, updateUserProfile);
router.put('/password', protect, updatePassword);

// MUST be above /:id
router.get('/me/stats', protect, getDashboardStats);

// MUST be at the very bottom
router.get('/:id', protect, getUserById);


router.post('/ping', protect, updateUserStatus);

export default router;