import express from 'express';
import { protect } from '../middlewares/auth-middleware.js';
import { getNotifications, markAllAsRead } from '../controllers/notification-controller.js';

const router = express.Router();

router.use(protect); // Secure all notification routes

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);

export default router;