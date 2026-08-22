import { queryAll, queryGet, queryRun, getDb } from '../../database/db.js';
import { calculateRestaurantMetrics } from '../utils/waitAlgorithm.js';
import { invalidateRestaurantCache } from '../services/waitTimeService.js';

export const createReservation = async (req, res) => {
  const db = await getDb();
  const connection = await db.getConnection();

  try {
    const {
      restaurantId,
      restaurantName,
      tableId,
      tableName,
      guestName,
      guestEmail,
      guestPhone,
      partySize,
      date,
      time,
      specialRequests,
      preOrderedItems
    } = req.body;

    const resId = req.body.id || `RES-${Math.floor(1000 + Math.random() * 9000)}`;
    const qrCode = `SMART-TABLE-${resId}-${(restaurantName || 'ST').substring(0, 2).toUpperCase()}`;
    const orderStatus = (preOrderedItems && preOrderedItems.length > 0) ? 'Pending Acceptance' : 'No Order';
    const userId = req.user ? req.user.id : null;
    const finalEmail = (req.user && req.user.email) || guestEmail || 'diner@example.com';
    const finalName = (req.user && req.user.name) || guestName || 'Verified Diner';

    await connection.beginTransaction();

    // 1. Fetch tables locked FOR UPDATE
    const [tables] = await connection.query(
      'SELECT * FROM `tables` WHERE restaurant_id = ? FOR UPDATE',
      [restaurantId]
    );

    // 2. Fetch active reservations locked FOR UPDATE
    const [activeReservations] = await connection.query(
      `SELECT * FROM reservations 
       WHERE restaurant_id = ? 
         AND reservation_date = ? 
         AND status != 'Cancelled'
       FOR UPDATE`,
      [restaurantId, date]
    );

    const toMinutes = (timeStr) => {
      if (!timeStr) return 0;
      const [h, m] = timeStr.split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };

    const reqMinutes = toMinutes(time);

    const isOverlap = (t1, t2) => {
      return Math.abs(toMinutes(t1) - toMinutes(t2)) < 120; // 2 hour window
    };

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    const isToday = date === todayStr;

    let assignedTable = null;

    if (tableId && tableId !== 'Auto-Assigned') {
      const targetTable = tables.find(t => t.id === tableId);
      if (!targetTable) {
        await connection.rollback();
        return res.status(404).json({ success: false, message: 'Requested table does not exist.' });
      }

      if (targetTable.capacity < Number(partySize)) {
        await connection.rollback();
        return res.status(409).json({
          success: false,
          code: 'NO_SUITABLE_CAPACITY',
          message: 'No table can accommodate this party size.'
        });
      }

      const hasReservationConflict = activeReservations.some(r => 
        r.table_id === tableId && isOverlap(r.reservation_time, time)
      );
      if (hasReservationConflict) {
        await connection.rollback();
        return res.status(409).json({
          success: false,
          code: 'NO_TABLE_AVAILABLE',
          message: 'No suitable table is available for the selected time and party size.'
        });
      }

      if (isToday && (targetTable.status === 'occupied' || targetTable.status === 'cleaning')) {
        // Use authoritative timestamp when available, fall back to mins_remaining
        let minsUntilFree = 0;
        if (targetTable.status === 'occupied' && targetTable.expected_available_at) {
          minsUntilFree = Math.max(0, Math.ceil((new Date(targetTable.expected_available_at).getTime() - now.getTime()) / 60000));
        } else if (targetTable.status === 'cleaning' && targetTable.cleaning_started_at) {
          const cleanDone = new Date(targetTable.cleaning_started_at).getTime() + 5 * 60000;
          minsUntilFree = Math.max(0, Math.ceil((cleanDone - now.getTime()) / 60000));
        } else {
          minsUntilFree = targetTable.mins_remaining || 0;
        }
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const occupiedUntil = currentMinutes + minsUntilFree;
        if (reqMinutes < occupiedUntil) {
          await connection.rollback();
          return res.status(409).json({
            success: false,
            code: 'NO_TABLE_AVAILABLE',
            message: 'No suitable table is available for the selected time and party size.'
          });
        }
      }

      assignedTable = targetTable;
    } else {
      const eligibleTables = tables.filter(t => t.capacity >= Number(partySize));
      if (eligibleTables.length === 0) {
        await connection.rollback();
        return res.status(409).json({
          success: false,
          code: 'NO_SUITABLE_CAPACITY',
          message: 'No table can accommodate this party size.'
        });
      }

      const suitableTables = eligibleTables.filter(t => {
        const hasReservationConflict = activeReservations.some(r => 
          r.table_id === t.id && isOverlap(r.reservation_time, time)
        );
        if (hasReservationConflict) return false;

        if (isToday && (t.status === 'occupied' || t.status === 'cleaning')) {
          // Use authoritative timestamp when available, fall back to mins_remaining
          let minsUntilFree = 0;
          if (t.status === 'occupied' && t.expected_available_at) {
            minsUntilFree = Math.max(0, Math.ceil((new Date(t.expected_available_at).getTime() - now.getTime()) / 60000));
          } else if (t.status === 'cleaning' && t.cleaning_started_at) {
            const cleanDone = new Date(t.cleaning_started_at).getTime() + 5 * 60000;
            minsUntilFree = Math.max(0, Math.ceil((cleanDone - now.getTime()) / 60000));
          } else {
            minsUntilFree = t.mins_remaining || 0;
          }
          const currentMinutes = now.getHours() * 60 + now.getMinutes();
          const occupiedUntil = currentMinutes + minsUntilFree;
          if (reqMinutes < occupiedUntil) return false;
        }

        return true;
      });

      if (suitableTables.length === 0) {
        await connection.rollback();
        return res.status(409).json({
          success: false,
          code: 'NO_TABLE_AVAILABLE',
          message: 'No suitable table is available for the selected time and party size.'
        });
      }

      suitableTables.sort((a, b) => a.capacity - b.capacity);
      assignedTable = suitableTables[0];
    }

    await connection.query(
      `INSERT INTO reservations (
        id, restaurant_id, restaurant_name, table_id, table_name,
        guest_name, guest_email, guest_phone, party_size,
        reservation_date, reservation_time, status, order_status, special_requests,
        pre_ordered_items_json, qr_code, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resId,
        restaurantId,
        restaurantName || 'Restaurant',
        assignedTable.id,
        assignedTable.name,
        finalName,
        finalEmail,
        guestPhone || '',
        Number(partySize),
        date,
        time,
        'Confirmed',
        orderStatus,
        specialRequests || 'None',
        JSON.stringify(preOrderedItems || []),
        qrCode,
        userId
      ]
    );

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const shouldUpdateLiveStatus = isToday && (reqMinutes >= currentMinutes - 60 && reqMinutes <= currentMinutes + 120);

    if (shouldUpdateLiveStatus) {
      await connection.query(
        `UPDATE \`tables\` SET status = 'reserved', reservation_name = ? WHERE id = ? AND restaurant_id = ?`,
        [`${finalName} (${time})`, assignedTable.id, restaurantId]
      );
    }

    await connection.commit();

    invalidateRestaurantCache(restaurantId);
    const metrics = await calculateRestaurantMetrics(restaurantId);

    const io = req.app.get('io');
    if (io) {
      if (shouldUpdateLiveStatus) {
        io.to(`restaurant_${restaurantId}_public`).emit('table_status_changed', {
          tableId: assignedTable.id,
          restaurantId,
          status: 'reserved',
          minsRemaining: null
        });
      }

      io.to(`restaurant_${restaurantId}_public`).emit('restaurant_occupancy_updated', {
        restaurantId,
        metrics
      });
    }

    res.status(201).json({
      success: true,
      message: 'Reservation confirmed successfully',
      data: {
        id: resId,
        restaurantId,
        restaurantName,
        tableId: assignedTable.id,
        tableName: assignedTable.name,
        guestName: finalName,
        guestEmail: finalEmail,
        guestPhone: guestPhone || '',
        partySize: Number(partySize),
        date,
        time,
        status: 'Confirmed',
        orderStatus,
        specialRequests: specialRequests || 'None',
        preOrderedItems: preOrderedItems || [],
        qrCode,
        createdAt: now.toISOString()
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error in createReservation:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

export const getAllReservations = async (req, res) => {
  try {
    const { restaurantId } = req.query;

    let sql = 'SELECT * FROM reservations';
    const params = [];

    if (req.user.role === 'customer') {
      sql += ' WHERE (guest_email = ? OR user_id = ?)';
      params.push(req.user.email, req.user.id);
    } else if (req.user.role === 'owner' || req.user.role === 'admin') {
      const targetRestId = req.user.restaurantId || restaurantId;
      if (!targetRestId) {
        return res.status(400).json({ success: false, message: 'Missing restaurant ID' });
      }

      // Enforce restaurant ownership check
      if (req.user.restaurantId && req.user.restaurantId !== targetRestId) {
        return res.status(403).json({ success: false, message: "Forbidden: You do not have permission to access this restaurant's reservations." });
      }

      sql += ' WHERE restaurant_id = ?';
      params.push(targetRestId);
    } else {
      if (restaurantId) {
        sql += ' WHERE restaurant_id = ?';
        params.push(restaurantId);
      }
    }

    sql += ' ORDER BY created_at DESC';

    const rows = await queryAll(sql, params);

    const formatted = rows.map(r => ({
      id: r.id,
      restaurantId: r.restaurant_id,
      restaurantName: r.restaurant_name,
      tableId: r.table_id,
      tableName: r.table_name,
      guestName: r.guest_name,
      guestEmail: r.guest_email,
      guestPhone: r.guest_phone,
      partySize: r.party_size,
      date: r.reservation_date,
      time: r.reservation_time,
      status: r.status,
      orderStatus: r.order_status || 'Received',
      specialRequests: r.special_requests,
      preOrderedItems: r.pre_ordered_items_json ? JSON.parse(r.pre_ordered_items_json) : [],
      qrCode: r.qr_code,
      createdAt: r.created_at,
      userId: r.user_id
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    console.error('Error in getAllReservations:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const resItem = await queryGet('SELECT * FROM reservations WHERE id = ?', [id]);
    if (!resItem) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    await queryRun('UPDATE reservations SET order_status = ? WHERE id = ?', [orderStatus, id]);

    // Synchronize with the connected order if it exists
    await queryRun('UPDATE orders SET order_status = ? WHERE booking_id = ?', [orderStatus, id]);

    // Invalidate cached wait times
    invalidateRestaurantCache(resItem.restaurant_id);

    // Get dynamic metrics
    const metrics = await calculateRestaurantMetrics(resItem.restaurant_id);

    const io = req.app.get('io');
    if (io) {
      io.to(`restaurant_${resItem.restaurant_id}_public`).emit('restaurant_occupancy_updated', {
        restaurantId: resItem.restaurant_id,
        metrics
      });

      // Emit order status and reservation status change
      io.to(`restaurant_${resItem.restaurant_id}_private`).emit('reservation_status_changed', {
        id: resItem.id,
        orderStatus: orderStatus,
        status: resItem.status,
        restaurantId: resItem.restaurant_id
      });

      try {
        const sockets = await io.fetchSockets();
        for (const s of sockets) {
          const sUser = s.data?.user || s.user;
          if (sUser && (sUser.email === resItem.guest_email || sUser.id === resItem.user_id)) {
            s.emit('reservation_status_changed', {
              id: resItem.id,
              orderStatus: orderStatus,
              status: resItem.status,
              restaurantId: resItem.restaurant_id
            });
          }
        }
      } catch (socketErr) {
        console.error('[Socket.io] Error fetching sockets:', socketErr.message);
      }
    }

    res.json({
      success: true,
      message: `Order status for ${id} updated to "${orderStatus}"`,
      data: { id, orderStatus }
    });
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Resolve reservation from DB — never trust any ID from the client
    const resItem = await queryGet('SELECT * FROM reservations WHERE id = ?', [id]);
    if (!resItem) {
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }

    const { role, id: userId, email: userEmail, restaurantId: userRestaurantId } = req.user;

    // 2. Platform admin (role=admin with no bound restaurant) — full access
    const isPlatformAdmin = role === 'admin' && !userRestaurantId;
    if (isPlatformAdmin) {
      // fall through to cancellation
    }
    // 3. Restaurant-scoped admin or owner — can only cancel reservations for their restaurant
    else if (role === 'admin' || role === 'owner') {
      if (!userRestaurantId || userRestaurantId !== resItem.restaurant_id) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not have permission to cancel reservations for this restaurant.'
        });
      }
    }
    // 4. Customer — can only cancel their own reservation (matched by user_id or email)
    else if (role === 'customer') {
      const isOwnReservation = resItem.user_id === userId || resItem.guest_email === userEmail;
      if (!isOwnReservation) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only cancel your own reservations.'
        });
      }
    }
    // 5. Any other role is denied
    else {
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions.' });
    }

    await queryRun("UPDATE reservations SET status = 'Cancelled' WHERE id = ?", [id]);
    await queryRun("UPDATE orders SET status = 'Cancelled', order_status = 'Cancelled' WHERE booking_id = ?", [id]);

    let tableFreed = false;
    if (resItem.table_id && resItem.table_id !== 'Auto-Assigned') {
      const updateResult = await queryRun(
        "UPDATE `tables` SET status = 'available', reservation_name = NULL WHERE id = ? AND restaurant_id = ? AND status = 'reserved'",
        [resItem.table_id, resItem.restaurant_id]
      );
      if (updateResult.affectedRows > 0) {
        tableFreed = true;
      }
    }

    // Invalidate cached wait times
    invalidateRestaurantCache(resItem.restaurant_id);

    // Get dynamic metrics
    const metrics = await calculateRestaurantMetrics(resItem.restaurant_id);

    const io = req.app.get('io');
    if (io) {
      if (tableFreed) {
        io.to(`restaurant_${resItem.restaurant_id}_public`).emit('table_status_changed', {
          tableId: resItem.table_id,
          restaurantId: resItem.restaurant_id,
          status: 'available',
          minsRemaining: null
        });
      }

      io.to(`restaurant_${resItem.restaurant_id}_public`).emit('restaurant_occupancy_updated', {
        restaurantId: resItem.restaurant_id,
        metrics
      });

      // 1. Emit to restaurant private room for staff/owner
      io.to(`restaurant_${resItem.restaurant_id}_private`).emit('reservation_status_changed', {
        id: resItem.id,
        status: 'Cancelled',
        orderStatus: 'Cancelled',
        restaurantId: resItem.restaurant_id
      });

      // 2. Emit directly to the specific customer socket if they are connected
      try {
        const sockets = await io.fetchSockets();
        for (const s of sockets) {
          const sUser = s.data?.user || s.user;
          if (sUser && (sUser.email === resItem.guest_email || sUser.id === resItem.user_id)) {
            s.emit('reservation_status_changed', {
              id: resItem.id,
              status: 'Cancelled',
              orderStatus: 'Cancelled',
              restaurantId: resItem.restaurant_id
            });
          }
        }
      } catch (socketErr) {
        console.error('[Socket.io] Error fetching sockets for direct client emit:', socketErr.message);
      }
    }

    res.json({ success: true, message: `Reservation ${id} cancelled successfully` });
  } catch (error) {
    console.error('Error in cancelReservation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
