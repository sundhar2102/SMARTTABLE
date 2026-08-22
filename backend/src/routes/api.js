import express from 'express';
import restaurantRoutes from './restaurantRoutes.js';
import tableRoutes from './tableRoutes.js';
import reservationRoutes from './reservationRoutes.js';
import orderRoutes from './orderRoutes.js';
import aiRoutes from './aiRoutes.js';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';
import { getDbStatus } from '../../database/db.js';

const router = express.Router();

router.use('/restaurants', restaurantRoutes);
router.use('/tables', tableRoutes);
router.use('/reservations', reservationRoutes);
router.use('/orders', orderRoutes);
router.use('/ai', aiRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);

// Mock Payment Gateway Endpoint
router.post('/payments/checkout', (req, res) => {
  const { amount, currency = 'INR', description } = req.body;
  // Simulate network delay and return a mock payment session ID
  setTimeout(() => {
    res.json({
      success: true,
      message: 'Payment session created successfully',
      data: {
        sessionId: `pay_${Date.now()}`,
        amount,
        currency,
        checkoutUrl: `http://localhost:5000/mock-checkout?session=pay_${Date.now()}`
      }
    });
  }, 800);
});

// Health check endpoint
router.get('/health', async (req, res) => {
  const dbStatus = await getDbStatus();
  res.json({
    status: 'online',
    service: 'SmartTable AI REST API Backend',
    database: dbStatus.type,
    databaseConnected: dbStatus.connected,
    // Only expose error reason internally — never expose file paths or credentials
    ...(dbStatus.error ? { databaseError: 'Connection unavailable' } : {}),
    timestamp: new Date().toISOString()
  });
});

export default router;
