import express from 'express';
import { updateTableStatus } from '../controllers/tableController.js';
import { requireAuth, requireRole, requireRestaurantOwnership } from '../middleware/authMiddleware.js';

const router = express.Router();

router.patch('/:restaurantId/:tableId/status', requireAuth, requireRole('owner', 'admin'), requireRestaurantOwnership, updateTableStatus);

export default router;
