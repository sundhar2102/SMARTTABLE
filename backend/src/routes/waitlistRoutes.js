import express from 'express';
import {
  joinWaitlist,
  getWaitlistStatus,
  leaveWaitlist,
  notifyWaitlistCustomer,
  seatWaitlistCustomer
} from '../controllers/waitlistController.js';
import { requireAuth, requireRole, requireRestaurantOwnership } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / Diner endpoints
router.post('/join', joinWaitlist);
router.get('/:restaurantId/status', getWaitlistStatus);
router.post('/:id/leave', leaveWaitlist);

// Staff / Owner control endpoints
router.post('/:id/notify', requireAuth, requireRole('owner', 'admin'), requireRestaurantOwnership, notifyWaitlistCustomer);
router.post('/:id/seat', requireAuth, requireRole('owner', 'admin'), requireRestaurantOwnership, seatWaitlistCustomer);

export default router;
