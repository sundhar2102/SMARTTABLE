import express from 'express';
import { requireAuth, requireRole, requireRestaurantOwnership } from '../middleware/authMiddleware.js';
import { 
  createReservation, 
  getAllReservations, 
  cancelReservation,
  updateOrderStatus 
} from '../controllers/reservationController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getAllReservations);
router.post('/', createReservation);
router.patch('/:id/order-status', requireRole('owner', 'admin'), requireRestaurantOwnership, updateOrderStatus);
router.delete('/:id', cancelReservation);

export default router;
