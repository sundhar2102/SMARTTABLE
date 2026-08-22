import express from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { 
  getMenuItems, 
  addMenuItem, 
  updateMenuItem, 
  deleteMenuItem 
} from '../controllers/menuController.js';

const router = express.Router();

// Public route to view menu items for a restaurant
router.get('/:restaurantId', getMenuItems);

// Protected routes for restaurant owner & admin
router.post('/', requireAuth, requireRole('owner', 'admin'), addMenuItem);
router.put('/:id', requireAuth, requireRole('owner', 'admin'), updateMenuItem);
router.delete('/:id', requireAuth, requireRole('owner', 'admin'), deleteMenuItem);

export default router;
