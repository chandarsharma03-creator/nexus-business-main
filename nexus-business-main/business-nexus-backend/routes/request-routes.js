import express from 'express';
import { protect } from '../middlewares/auth-middleware.js';
import { 
  getEntrepreneurRequests, 
  getInvestorRequests, 
  updateRequestStatus,
  createRequest
} from '../controllers/request-controller.js';

const router = express.Router();

// All request routes require the user to be logged in
router.use(protect);

router.get('/entrepreneur', getEntrepreneurRequests);
router.get('/investor', getInvestorRequests);
router.put('/:id/status', updateRequestStatus);
router.post('/', createRequest);

export default router;