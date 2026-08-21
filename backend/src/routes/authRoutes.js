import express from 'express';
import { login, register, getMe, verifyOTP } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.get('/me', requireAuth, getMe);

export default router;
