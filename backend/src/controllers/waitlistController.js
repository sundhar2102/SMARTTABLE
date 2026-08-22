import { queryAll, queryGet, queryRun } from '../../database/db.js';
import { calculateWaitTimeForParty } from '../services/waitTimeService.js';

/**
 * Customer joins virtual waitlist queue when tables are full.
 * POST /api/waitlist/join
 */
export const joinWaitlist = async (req, res) => {
  try {
    const { restaurantId, guestName, guestPhone, guestEmail, partySize = 2, notes } = req.body;

    if (!restaurantId || !guestName || !guestPhone) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant ID, Guest Name, and Guest Phone number are required.'
      });
    }

    const rest = await queryGet('SELECT * FROM restaurants WHERE id = ?', [restaurantId]);
    if (!rest || rest.is_accepting_orders === 0) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant is currently not accepting new waitlist entries.'
      });
    }

    // Calculate current queue count
    const existingQueue = await queryAll(
      "SELECT id FROM waitlist WHERE restaurant_id = ? AND status IN ('waiting', 'notified')",
      [restaurantId]
    );
    const queuePosition = existingQueue.length + 1;

    // Calculate dynamic wait estimate
    const waitMetrics = await calculateWaitTimeForParty(restaurantId, Number(partySize));
    const estimatedWaitMins = Math.max(15, waitMetrics.estimatedWaitMinutes || (queuePosition * 15));

    const now = new Date();
    const readyDate = new Date(now.getTime() + estimatedWaitMins * 60000);
    const estimatedReadyTime = readyDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const ticketId = `WTL-${Date.now().toString().slice(-6)}`;
    const userId = req.user?.id || null;

    await queryRun(
      `INSERT INTO waitlist (id, restaurant_id, user_id, guest_name, guest_phone, guest_email, party_size, status, estimated_wait_mins, estimated_ready_time, queue_position, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'waiting', ?, ?, ?, ?)`,
      [
        ticketId,
        restaurantId,
        userId,
        guestName.trim(),
        guestPhone.trim(),
        guestEmail ? guestEmail.trim().toLowerCase() : null,
        Number(partySize),
        estimatedWaitMins,
        estimatedReadyTime,
        queuePosition,
        notes || null
      ]
    );

    const io = req.app.get('io');
    if (io) {
      io.to(`restaurant_${restaurantId}_private`).emit('waitlist_updated', {
        action: 'JOINED',
        ticketId,
        guestName,
        partySize,
        queuePosition
      });
    }

    return res.status(201).json({
      success: true,
      message: `Joined waitlist successfully! You are #${queuePosition} in queue.`,
      data: {
        ticketId,
        restaurantId,
        restaurantName: rest.name,
        guestName,
        partySize: Number(partySize),
        queuePosition,
        estimatedWaitMins,
        estimatedReadyTime,
        status: 'waiting'
      }
    });
  } catch (err) {
    console.error('[waitlistController.joinWaitlist]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Fetch current waitlist status & queue position for restaurant.
 * GET /api/waitlist/:restaurantId/status
 */
export const getWaitlistStatus = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { email, ticketId } = req.query;

    const activeWaitlist = await queryAll(
      `SELECT * FROM waitlist 
       WHERE restaurant_id = ? AND status IN ('waiting', 'notified')
       ORDER BY created_at ASC`,
      [restaurantId]
    );

    let myTicket = null;
    if (ticketId) {
      myTicket = activeWaitlist.find(t => t.id === ticketId);
    } else if (email) {
      myTicket = activeWaitlist.find(t => t.guest_email === email.trim().toLowerCase());
    }

    const currentPosition = myTicket 
      ? activeWaitlist.findIndex(t => t.id === myTicket.id) + 1 
      : null;

    return res.json({
      success: true,
      data: {
        restaurantId,
        totalInQueue: activeWaitlist.length,
        myTicket: myTicket ? {
          ticketId: myTicket.id,
          guestName: myTicket.guest_name,
          partySize: myTicket.party_size,
          status: myTicket.status,
          queuePosition: currentPosition,
          estimatedWaitMins: myTicket.estimated_wait_mins,
          estimatedReadyTime: myTicket.estimated_ready_time
        } : null,
        activeQueue: activeWaitlist
      }
    });
  } catch (err) {
    console.error('[waitlistController.getWaitlistStatus]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Leave waitlist queue.
 * POST /api/waitlist/:id/leave
 */
export const leaveWaitlist = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await queryGet('SELECT * FROM waitlist WHERE id = ?', [id]);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Waitlist ticket not found.' });
    }

    await queryRun("UPDATE waitlist SET status = 'cancelled' WHERE id = ?", [id]);

    const io = req.app.get('io');
    if (io) {
      io.to(`restaurant_${ticket.restaurant_id}_private`).emit('waitlist_updated', {
        action: 'LEFT',
        ticketId: id
      });
    }

    return res.json({
      success: true,
      message: 'Successfully left the waitlist queue.'
    });
  } catch (err) {
    console.error('[waitlistController.leaveWaitlist]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Staff notifies customer table is ready.
 * POST /api/waitlist/:id/notify
 */
export const notifyWaitlistCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await queryGet('SELECT * FROM waitlist WHERE id = ?', [id]);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Waitlist ticket not found.' });
    }

    await queryRun("UPDATE waitlist SET status = 'notified' WHERE id = ?", [id]);

    const io = req.app.get('io');
    if (io) {
      io.to(`restaurant_${ticket.restaurant_id}_public`).emit('waitlist_customer_notified', {
        ticketId: id,
        guestName: ticket.guest_name,
        restaurantId: ticket.restaurant_id
      });
    }

    return res.json({
      success: true,
      message: `Notified ${ticket.guest_name} that their table is ready!`,
      data: { ticketId: id, status: 'notified' }
    });
  } catch (err) {
    console.error('[waitlistController.notifyWaitlistCustomer]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Staff seats customer from waitlist.
 * POST /api/waitlist/:id/seat
 */
export const seatWaitlistCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await queryGet('SELECT * FROM waitlist WHERE id = ?', [id]);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Waitlist ticket not found.' });
    }

    await queryRun("UPDATE waitlist SET status = 'seated' WHERE id = ?", [id]);

    const io = req.app.get('io');
    if (io) {
      io.to(`restaurant_${ticket.restaurant_id}_private`).emit('waitlist_updated', {
        action: 'SEATED',
        ticketId: id
      });
    }

    return res.json({
      success: true,
      message: `Seated ${ticket.guest_name} successfully!`,
      data: { ticketId: id, status: 'seated' }
    });
  } catch (err) {
    console.error('[waitlistController.seatWaitlistCustomer]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
