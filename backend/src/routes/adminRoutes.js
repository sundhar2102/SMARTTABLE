import express from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import {
  listUsers,
  getUser,
  updateUserStatus,
  deleteUser,
  listOwners,
  updateOwnerStatus,
  listRestaurants,
  updateRestaurantStatus,
  getPlatformStats
} from '../controllers/adminController.js';
import { getPlatformAnalytics, getRestaurantAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

// All routes require authentication + admin role
router.use(requireAuth);
router.use(requireRole('admin'));

// ── Platform Stats & Analytics ──────────────────────────────────────────────
router.get('/stats', getPlatformStats);
router.get('/platform-analytics', getPlatformAnalytics);
router.get('/analytics/:id', getRestaurantAnalytics);

// ── User Management ─────────────────────────────────────────────────────────
router.get('/users', listUsers);
router.get('/users/:id', getUser);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// ── Owner Management ────────────────────────────────────────────────────────
router.get('/owners', listOwners);
router.patch('/owners/:id/status', updateOwnerStatus);

// ── Restaurant Management ───────────────────────────────────────────────────
router.get('/restaurants', listRestaurants);
router.patch('/restaurants/:id/status', updateRestaurantStatus);

export default router;
