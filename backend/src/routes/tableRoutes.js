import express from 'express';
import { getTablesByRestaurant, updateTableStatus } from '../controllers/tableController.js';
import { requireAuth, requireRole, requireRestaurantOwnership } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:restaurantId', getTablesByRestaurant);
router.patch('/:restaurantId/:tableId/status', requireAuth, requireRole('owner', 'admin'), requireRestaurantOwnership, updateTableStatus);

export default router;
