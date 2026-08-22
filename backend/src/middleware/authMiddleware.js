import jwt from 'jsonwebtoken';
import { queryGet } from '../../database/db.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is missing.');
}

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing Authorization header.' });
  }

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Authorization header must use Bearer scheme.' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || !parts[1]) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Malformed Authorization header.' });
  }

  const token = parts[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Resolve full user profile from the database to keep JWT payload minimal and avoid PII leakage
    const user = await queryGet('SELECT id, name, email, role, restaurant_id, status FROM users WHERE id = ?', [decoded.id]);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User account not found.' });
    }

    // Phase 8: Immediately invalidate sessions for suspended or rejected accounts
    if (user.status === 'suspended' || user.status === 'rejected') {
      return res.status(403).json({ 
        success: false, 
        message: user.status === 'suspended' 
          ? 'Forbidden: Your account has been suspended.' 
          : 'Forbidden: Your account registration was rejected.' 
      });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurant_id
    };
    
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Unauthorized: Token has expired.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token signature or format.' });
    }
    return res.status(401).json({ success: false, message: 'Unauthorized: Authentication failed.' });
  }
};

/**
 * Reusable role-based authorization middleware.
 * Checks whether the authenticated user's role is permitted.
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: `Forbidden: Access denied. Required role: one of [${roles.join(', ')}]` });
    }

    next();
  };
};

/**
 * Reusable restaurant ownership validation middleware.
 * Verifies that the authenticated user owns or is authorized for the restaurant.
 * Resolves the restaurant ID from parameters, query, body, or database relationships (orders/reservations).
 */
export const requireRestaurantOwnership = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Authentication required.' });
  }

  const isOrderRoute = req.baseUrl.includes('orders') || req.path.includes('orders');
  const isReservationRoute = req.baseUrl.includes('reservations') || req.path.includes('reservations');

  let restaurantId = req.params.restaurantId || req.query.restaurantId || req.body.restaurantId;

  if (!isOrderRoute && !isReservationRoute) {
    restaurantId = restaurantId || req.params.id;
  }

  // Resolve restaurant ID from the order if the path contains 'orders' or 'reservations'
  if (!restaurantId && req.params.id) {
    if (isOrderRoute) {
      const order = await queryGet('SELECT restaurant_id FROM orders WHERE id = ?', [req.params.id]);
      if (order) restaurantId = order.restaurant_id;
    } else if (isReservationRoute) {
      const reservation = await queryGet('SELECT restaurant_id FROM reservations WHERE id = ?', [req.params.id]);
      if (reservation) restaurantId = reservation.restaurant_id;
    }
  }

  if (!restaurantId) {
    return res.status(400).json({ success: false, message: 'Bad Request: Missing restaurant identifier in request.' });
  }

  // Platform admin bypass
  if (req.user.role === 'admin' && !req.user.restaurantId) {
    return next();
  }

  // Verify ownership
  if (req.user.restaurantId !== restaurantId) {
    return res.status(403).json({ 
      success: false, 
      message: 'Forbidden: You do not have permission to manage this restaurant.' 
    });
  }

  next();
};
