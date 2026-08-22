import express from 'express';
import { getTablesByRestaurant, updateTableStatus, getRestaurantAvailability } from '../controllers/tableController.js';
import { requireAuth, requireRole, requireRestaurantOwnership } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:restaurantId/availability', getRestaurantAvailability);
router.get('/:restaurantId', getTablesByRestaurant);
router.patch('/:restaurantId/:tableId/status', requireAuth, requireRole('owner', 'admin'), requireRestaurantOwnership, updateTableStatus);

export default router;
