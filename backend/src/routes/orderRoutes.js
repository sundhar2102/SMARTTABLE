import express from 'express';
import { requireAuth, requireRole, requireRestaurantOwnership } from '../middleware/authMiddleware.js';
import { createOrder, getOrdersByCustomer, getOrdersByRestaurant, getOrderById, updateOrderStatus, getAllOrders } from '../controllers/orderController.js';

const router = express.Router();

router.use(requireAuth);

router.post('/', createOrder);
router.get('/', getAllOrders);
router.get('/customer', getOrdersByCustomer);
router.get('/restaurant/:restaurantId', requireRole('owner', 'admin'), requireRestaurantOwnership, getOrdersByRestaurant);
router.get('/:id', getOrderById);
router.patch('/:id/status', requireRole('owner', 'admin'), requireRestaurantOwnership, updateOrderStatus);

export default router;
