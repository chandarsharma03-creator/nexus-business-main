import express from 'express';
import { protect } from '../middlewares/auth-middleware.js';
import { 
  sendMessage, 
  getMessages, 
  getConversations 
} from '../controllers/message-controller.js';

const router = express.Router();

// Apply protect middleware to all chat routes
router.use(protect);

// Get the sidebar conversations list
router.get('/conversations', getConversations);

// Get chat history with a specific user
router.get('/:userId', getMessages);

// Send a message to a specific user
router.post('/:userId', sendMessage);

export default router;