import { queryAll, queryGet, queryRun, getDb } from '../../database/db.js';
import { calculateRestaurantMetrics } from '../utils/waitAlgorithm.js';
import { invalidateRestaurantCache } from '../services/waitTimeService.js';

export const createOrder = async (req, res) => {
  const maxRetries = 3;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const db = await getDb();
    const connection = await db.getConnection();

    try {
      const {
        restaurantId,
        restaurantName,
        fulfillmentType,
        tableId,
        tableName,
        guestName,
        guestEmail,
        guestPhone,
        partySize,
        date,
        time,
        status,
        orderStatus,
        deliveryAddress,
        deliveryLocality,
        deliveryDistanceKm,
        deliveryEtaMins,
        deliveryFee,
        tipAmount,
        itemTotal,
        grandTotal,
        riderId,
        riderName,
        items, // pre_ordered_items_json
        specialRequests
      } = req.body;

      const orderId = req.body.id || `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      const qrCode = `SMART-TABLE-${orderId}-${(restaurantName || 'ST').substring(0, 2).toUpperCase()}`;

      const userId = req.user ? req.user.id : null;
      const finalEmail = (req.user && req.user.email) || guestEmail || 'diner@example.com';
      const finalName = (req.user && req.user.name) || guestName || 'Verified Diner';
      const bookingId = req.body.bookingId || req.body.booking_id || null;

      await connection.beginTransaction();

      // 1. Fetch active orders locked FOR UPDATE (blocks concurrent duplicate order creation)
      const [activeOrders] = await connection.query(
        `SELECT * FROM orders 
         WHERE restaurant_id = ? 
           AND (guest_email = ? OR (user_id IS NOT NULL AND user_id = ?))
           AND status != 'Cancelled'
         FOR UPDATE`,
        [restaurantId, finalEmail, userId]
      );

      // 0. Deduplication check:
      // If booking_id provided, check if an order already exists for this booking
      if (bookingId) {
        const existingBooking = activeOrders.find(o => o.booking_id === bookingId);
        if (existingBooking) {
          await connection.rollback();
          return res.status(200).json({
            success: true,
            isDuplicate: true,
            message: 'Existing order returned for booking (duplicate suppressed)',
            data: existingBooking
          });
        }
      }

      // Check duplicate recent submission with same total
      const existingRecent = activeOrders.find(o => 
        Number(o.grand_total) === Number(grandTotal || 0) &&
        (o.fulfillment_type === (fulfillmentType || 'dine-in'))
      );

      if (existingRecent) {
        await connection.rollback();
        return res.status(200).json({
          success: true,
          isDuplicate: true,
          message: 'Existing order returned (duplicate request suppressed)',
          data: existingRecent
        });
      }

      await connection.query(
        `INSERT INTO orders (
          id, restaurant_id, restaurant_name, fulfillment_type, table_id, table_name,
          guest_name, guest_email, guest_phone, party_size, reservation_date, reservation_time,
          status, order_status, delivery_address, delivery_locality, delivery_distance_km,
          delivery_eta_mins, delivery_fee, tip_amount, item_total, grand_total, rider_id, rider_name,
          pre_ordered_items_json, special_requests, qr_code, user_id, booking_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          restaurantId,
          restaurantName || 'Restaurant',
          fulfillmentType || 'dine-in',
          tableId || null,
          tableName || null,
          finalName,
          finalEmail,
          guestPhone || '',
          Number(partySize) || 1,
          date || '',
          time || '',
          status || 'Confirmed',
          orderStatus || 'Pending Acceptance',
          deliveryAddress || null,
          deliveryLocality || null,
          deliveryDistanceKm || null,
          deliveryEtaMins || null,
          deliveryFee || 0,
          tipAmount || 0,
          itemTotal || 0,
          grandTotal || 0,
          riderId || null,
          riderName || null,
          JSON.stringify(items || []),
          specialRequests || '',
          qrCode,
          userId,
          bookingId
        ]
      );

      const [rows] = await connection.query('SELECT * FROM orders WHERE id = ?', [orderId]);
      const createdOrder = rows[0];

      await connection.commit();
      
      // Invalidate cached wait times
      invalidateRestaurantCache(restaurantId);

      // Get dynamic metrics
      const metrics = await calculateRestaurantMetrics(restaurantId);

      // Emit real-time event for owner dashboard
      const io = req.app.get('io');
      if (io) {
        io.to(`restaurant_${restaurantId}_private`).emit('new_order', createdOrder);
        // Emit new deterministic occupancy event
        io.to(`restaurant_${restaurantId}_public`).emit('restaurant_occupancy_updated', {
          restaurantId,
          metrics
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: createdOrder
      });
    } catch (error) {
      await connection.rollback();
      if ((error.code === 'ER_LOCK_DEADLOCK' || error.errno === 1213) && attempt < maxRetries - 1) {
        await new Promise(r => setTimeout(r, 60 * (attempt + 1)));
        continue;
      }
      console.error('Error in createOrder:', error);
      return res.status(500).json({ success: false, message: error.message });
    } finally {
      connection.release();
    }
  }
};

export const getOrdersByCustomer = async (req, res) => {
  try {
    const email = req.user.role === 'customer' ? req.user.email : (req.query.email || req.user.email);
    let rows;
    if (req.user.role === 'customer') {
      rows = await queryAll('SELECT * FROM orders WHERE (guest_email = ? OR user_id = ?) ORDER BY created_at DESC', [req.user.email, req.user.id]);
    } else if (req.user.role === 'owner' || req.user.role === 'admin') {
      if (req.user.restaurantId) {
        rows = await queryAll('SELECT * FROM orders WHERE guest_email = ? AND restaurant_id = ? ORDER BY created_at DESC', [email, req.user.restaurantId]);
      } else {
        rows = await queryAll('SELECT * FROM orders WHERE guest_email = ? ORDER BY created_at DESC', [email]);
      }
    } else {
      rows = [];
    }
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error in getOrdersByCustomer:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { role, id: userId, email: userEmail, restaurantId: userRestaurantId } = req.user;
    let rows = [];

    if (role === 'customer') {
      // Customers see only their own orders — scoped by both user_id and email for safety
      rows = await queryAll(
        'SELECT * FROM orders WHERE (user_id = ? OR guest_email = ?) ORDER BY created_at DESC',
        [userId, userEmail]
      );
    } else if (role === 'owner') {
      // Owners must always have a bound restaurant — deny if missing
      if (!userRestaurantId) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Owner account has no restaurant assigned.'
        });
      }
      rows = await queryAll(
        'SELECT * FROM orders WHERE restaurant_id = ? ORDER BY created_at DESC',
        [userRestaurantId]
      );
    } else if (role === 'admin') {
      if (userRestaurantId) {
        // Restaurant-scoped admin: scoped to their restaurant only
        rows = await queryAll(
          'SELECT * FROM orders WHERE restaurant_id = ? ORDER BY created_at DESC',
          [userRestaurantId]
        );
      } else {
        // Platform admin: unrestricted access
        rows = await queryAll('SELECT * FROM orders ORDER BY created_at DESC');
      }
    } else {
      // Unknown/unsupported role — deny
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions.' });
    }

    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error in getAllOrders:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrdersByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const rows = await queryAll('SELECT * FROM orders WHERE restaurant_id = ? ORDER BY created_at DESC', [restaurantId]);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error in getOrdersByRestaurant:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await queryGet('SELECT * FROM orders WHERE id = ?', [id]);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isOwner = req.user.role === 'owner' || req.user.role === 'admin';
    const isTheirOwnOrder = order.guest_email === req.user.email || order.user_id === req.user.id;
    const isTheirOwnRestaurant = isOwner && req.user.restaurantId === order.restaurant_id;

    if (!isTheirOwnOrder && !isTheirOwnRestaurant && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not have permission to view this order.' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error in getOrderById:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  const db = await getDb();
  const connection = await db.getConnection();

  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    await connection.beginTransaction();

    const [orderRows] = await connection.query('SELECT * FROM orders WHERE id = ? FOR UPDATE', [id]);
    if (orderRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const orderItem = orderRows[0];

    await connection.query('UPDATE orders SET order_status = ? WHERE id = ?', [orderStatus, id]);
    
    // Synchronize with the connected reservation if it exists
    if (orderItem.booking_id) {
      await connection.query('UPDATE reservations SET order_status = ? WHERE id = ?', [orderStatus, orderItem.booking_id]);
    }
    
    const [updatedRows] = await connection.query('SELECT * FROM orders WHERE id = ?', [id]);
    const updatedOrder = updatedRows[0];

    await connection.commit();

    // Invalidate cached wait times
    invalidateRestaurantCache(updatedOrder.restaurant_id);

    // Get dynamic metrics
    const metrics = await calculateRestaurantMetrics(updatedOrder.restaurant_id);

    // Emit real-time event for customer and owner updates
    const io = req.app.get('io');
    if (io) {
      // 1. Emit to private management room for owner/staff
      io.to(`restaurant_${updatedOrder.restaurant_id}_private`).emit('order_status_changed', updatedOrder);
      
      // 2. Emit directly to the specific customer socket if they are connected
      (async () => {
        try {
          const sockets = await io.fetchSockets();
          for (const s of sockets) {
            if (s.user && (s.user.id === updatedOrder.user_id || s.user.email === updatedOrder.guest_email)) {
              s.emit('order_status_changed', updatedOrder);
            }
          }
        } catch (socketErr) {
          console.error('[Socket.io] Error fetching sockets for direct client emit:', socketErr.message);
        }
      })();

      // 3. Emit new occupancy metrics to public channel
      io.to(`restaurant_${updatedOrder.restaurant_id}_public`).emit('restaurant_occupancy_updated', {
        restaurantId: updatedOrder.restaurant_id,
        metrics
      });
    }

    res.json({
      success: true,
      message: `Order status for ${id} updated to "${orderStatus}"`,
      data: updatedOrder
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error in updateOrderStatus:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};
