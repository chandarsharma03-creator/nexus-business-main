import express from 'express';
import { protect } from '../middlewares/auth-middleware.js';
import { getDeals, createDeal } from '../controllers/deal-controller.js';

const router = express.Router();

router.use(protect); // Secure all deal routes

router.get('/', getDeals);
router.post('/', createDeal);

export default router;