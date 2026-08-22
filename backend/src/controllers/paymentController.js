import { queryAll, queryGet, queryRun, getDb } from '../../database/db.js';

/**
 * POST /api/payments/checkout
 * Process a verified payment for a dining reservation or order.
 */
export const processPaymentCheckout = async (req, res) => {
  const db = await getDb();
  const connection = await db.getConnection();

  try {
    const {
      bookingId,
      orderId,
      restaurantId,
      amount,
      paymentMethod = 'UPI',
      gateway = 'Razorpay Test PG (Demo Mode)',
      customNote
    } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payment amount.' });
    }

    const userId = req.user ? req.user.id : null;
    const paymentId = `PAY-${Date.now().toString().slice(-8)}`;
    const txnId = `TXN-${(paymentMethod || 'PAY').substring(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

    await connection.beginTransaction();

    // 1. Record payment transaction in MySQL
    await connection.query(
      `INSERT INTO payments (
        id, booking_id, order_id, user_id, restaurant_id,
        amount, currency, payment_method, payment_status, gateway, transaction_id
      ) VALUES (?, ?, ?, ?, ?, ?, 'INR', ?, 'SUCCESS', ?, ?)`,
      [
        paymentId,
        bookingId || null,
        orderId || null,
        userId,
        restaurantId || 'on-de-roof-chennai',
        Number(amount),
        paymentMethod,
        gateway,
        txnId
      ]
    );

    // 2. Update reservation status in MySQL if bookingId provided
    if (bookingId) {
      await connection.query(
        `UPDATE reservations 
         SET status = CASE WHEN status = 'Pending' THEN 'Confirmed' ELSE status END,
             order_status = CASE WHEN order_status = 'Pending Acceptance' THEN 'Accepted' ELSE order_status END
         WHERE id = ?`,
        [bookingId]
      );
    }

    // 3. Update order status if orderId provided
    if (orderId) {
      await connection.query(
        `UPDATE orders SET status = 'Confirmed' WHERE id = ?`,
        [orderId]
      );
    }

    await connection.commit();

    const paymentResult = {
      paymentId,
      transactionId: txnId,
      bookingId: bookingId || null,
      orderId: orderId || null,
      restaurantId,
      amount: Number(amount),
      paymentMethod,
      paymentStatus: 'SUCCESS',
      gateway,
      paidAt: new Date().toISOString()
    };

    // Broadcast socket event
    const io = req.app.get('io');
    if (io && restaurantId) {
      io.to(`restaurant_${restaurantId}_public`).emit('payment_completed', paymentResult);
      io.to(`restaurant_${restaurantId}_private`).emit('payment_completed', paymentResult);
    }

    return res.json({
      success: true,
      message: 'Payment verified and recorded successfully.',
      data: paymentResult
    });

  } catch (err) {
    await connection.rollback();
    console.error('Error in processPaymentCheckout:', err);
    return res.status(500).json({ success: false, message: err.message });
  } finally {
    connection.release();
  }
};

/**
 * GET /api/payments/history
 * Fetch payment records for current user or restaurant.
 */
export const getPaymentHistory = async (req, res) => {
  try {
    const { restaurantId } = req.query;
    let sql = 'SELECT * FROM payments';
    const params = [];

    if (req.user.role === 'customer') {
      sql += ' WHERE user_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'owner') {
      const targetRest = req.user.restaurantId || restaurantId;
      if (targetRest) {
        sql += ' WHERE restaurant_id = ?';
        params.push(targetRest);
      }
    }
    sql += ' ORDER BY created_at DESC';

    const rows = await queryAll(sql, params);
    return res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error('Error in getPaymentHistory:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};
