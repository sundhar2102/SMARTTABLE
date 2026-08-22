import dotenv from 'dotenv';
dotenv.config();

// Verify JWT_SECRET is defined at startup
if (!process.env.JWT_SECRET) {
  console.error('❌ FATAL SERVER CONFIGURATION ERROR: JWT_SECRET environment variable is missing.');
  process.exit(1);
}

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import apiRouter from './routes/api.js';
import { initDb, queryGet } from '../database/db.js';
import { reconcileCleaningTables } from './services/waitTimeService.js';
import jwt from 'jsonwebtoken';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});

const PORT = process.env.PORT || 5000;

// Expose io to routes
app.set('io', io);

const JWT_SECRET = process.env.JWT_SECRET;

// Socket.io connection authentication middleware (optional - guests allowed for public room access)
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    
    // No token: allow as guest (public room access only)
    if (!token) {
      socket.user = { id: null, name: 'Guest', email: null, role: 'guest', restaurantId: null };
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await queryGet('SELECT id, name, email, role, restaurant_id FROM users WHERE id = ?', [decoded.id]);
    
    if (!user) {
      // Token valid but user deleted — treat as guest
      socket.user = { id: null, name: 'Guest', email: null, role: 'guest', restaurantId: null };
      return next();
    }

    socket.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurant_id
    };

    next();
  } catch (err) {
    // Invalid/expired token: reject the connection so the client knows to re-authenticate
    console.error('[Socket.io] Auth middleware error:', err.message);
    return next(new Error('Authentication error: Invalid or expired token'));
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id} (User: ${socket.user.email}, Role: ${socket.user.role})`);
  
  // Clients can join rooms specific to a restaurant (separated into public and private channels)
  socket.on('join_restaurant', (restaurantId) => {
    // 1. Join public room (for occupancy updates, wait times, public table status) - open to guests
    socket.join(`restaurant_${restaurantId}_public`);
    console.log(`[Socket.io] Socket ${socket.id} (Role: ${socket.user.role}) joined restaurant_${restaurantId}_public`);

    // 2. Guests can never join the private room
    if (socket.user.role === 'guest') {
      return;
    }

    // 3. Validate if the user is an owner/manager of this restaurant before letting them join private room
    const isOwnerOrStaff = socket.user.role === 'owner' || socket.user.role === 'admin';
    const isAuthorizedForThisRestaurant = socket.user.restaurantId === restaurantId;

    if (isOwnerOrStaff && isAuthorizedForThisRestaurant) {
      socket.join(`restaurant_${restaurantId}_private`);
      console.log(`[Socket.io] Socket ${socket.id} (Owner/Staff) joined restaurant_${restaurantId}_private`);
    } else {
      console.log(`[Socket.io] Socket ${socket.id} (Role: ${socket.user.role}) was BLOCKED from private room for restaurant ${restaurantId}`);
    }
  });

  socket.on('leave_restaurant', (restaurantId) => {
    socket.leave(`restaurant_${restaurantId}_public`);
    socket.leave(`restaurant_${restaurantId}_private`);
    console.log(`[Socket.io] Socket ${socket.id} left restaurant rooms for ${restaurantId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for dev flexibility
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api', apiRouter);

// Root Welcome Route
app.get('/', (req, res) => {
  res.json({
    message: 'SmartTable AI Backend Server Running',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: [
      '/api/restaurants',
      '/api/tables/:restaurantId/:tableId/status',
      '/api/reservations',
      '/api/ai/predict',
      '/api/auth/login'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// Start server
httpServer.listen(PORT, async () => {
  await initDb();
  console.log(`🚀 SmartTable AI Backend running on http://localhost:${PORT}`);
  console.log(`📡 REST API & Socket.IO active on http://localhost:${PORT}`);
  
  // Clean up expired cleaning tables in background every 10 seconds
  setInterval(() => {
    reconcileCleaningTables(io);
  }, 10000);
});
