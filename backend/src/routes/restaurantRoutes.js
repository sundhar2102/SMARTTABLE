import express from 'express';
import { getAllRestaurants, getRestaurantById, updateRestaurantCrowdLevel, getNearbyRestaurants, getWaitTimeExplanation } from '../controllers/restaurantController.js';
import { getRestaurantAnalytics } from '../controllers/analyticsController.js';
import { requireAuth, requireRole, requireRestaurantOwnership } from '../middleware/authMiddleware.js';

const router = express.Router();

// Must be before /:id to avoid route shadowing
router.get('/nearby', getNearbyRestaurants);
router.get('/', getAllRestaurants);
router.get('/:id', getRestaurantById);
router.get('/:id/wait-time', getWaitTimeExplanation);
router.get('/:id/analytics', requireAuth, requireRole('owner', 'admin'), requireRestaurantOwnership, getRestaurantAnalytics);
router.patch('/:id/crowd-level', requireAuth, requireRole('owner', 'admin'), requireRestaurantOwnership, updateRestaurantCrowdLevel);

export default router;
