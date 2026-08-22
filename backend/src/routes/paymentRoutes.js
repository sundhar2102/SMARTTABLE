import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { processPaymentCheckout, getPaymentHistory } from '../controllers/paymentController.js';

const router = express.Router();

router.use(requireAuth);

router.post('/checkout', processPaymentCheckout);
router.get('/history', getPaymentHistory);

export default router;
