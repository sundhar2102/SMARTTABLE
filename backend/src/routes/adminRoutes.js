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

const router = express.Router();

// All routes require authentication + admin role
router.use(requireAuth);
router.use(requireRole('admin'));

// ── Platform Stats ──────────────────────────────────────────────────────────
router.get('/stats', getPlatformStats);

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
