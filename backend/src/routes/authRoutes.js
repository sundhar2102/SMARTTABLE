import express from 'express';
import rateLimit from 'express-rate-limit';
import { login, register, getMe, verifyOTP } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Phase 8: Strict rate limiting for authentication endpoints to prevent brute force attacks
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'production' ? 10 : 200, // 200 requests/min in dev/test, 10 in prod
  message: { success: false, message: 'Too many authentication attempts, please try again after a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', authLimiter, login);
router.post('/register', authLimiter, register);
router.post('/verify-otp', authLimiter, verifyOTP);
router.get('/me', requireAuth, getMe);

export default router;
