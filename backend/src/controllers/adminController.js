/**
 * Phase 6 — Super Admin Controller
 *
 * All endpoints require:
 *   - requireAuth  (valid JWT)
 *   - requireRole('admin')  (role = 'admin' in DB)
 *
 * Super Admin = admin with no restaurant_id
 * Restaurant Manager = admin with restaurant_id
 *
 * Safety rules enforced here:
 *   - Admin cannot suspend/reject themselves
 *   - System protects the last super-admin (admin with no restaurantId)
 *   - Normal role escalation to 'admin' is blocked
 */

import { queryAll, queryGet, queryRun } from '../../database/db.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ALLOWED_USER_STATUSES = ['active', 'suspended', 'rejected', 'pending'];

const safeUser = (u) => ({
  id:           u.id,
  name:         u.name,
  email:        u.email,
  role:         u.role,
  status:       u.status || 'active',
  restaurantId: u.restaurant_id || null,
  isVerified:   !!u.is_verified,
  createdAt:    u.created_at
});

// ─── GET /api/admin/users ─────────────────────────────────────────────────────

export const listUsers = async (req, res) => {
  try {
    const { role, status } = req.query;

    let sql = 'SELECT id, name, email, role, status, restaurant_id, is_verified, created_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    sql += ' ORDER BY created_at DESC';

    const users = await queryAll(sql, params);
    return res.json({ success: true, data: users.map(safeUser) });
  } catch (err) {
    console.error('[adminController.listUsers]', err.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── GET /api/admin/users/:id ─────────────────────────────────────────────────

export const getUser = async (req, res) => {
  try {
    const user = await queryGet(
      'SELECT id, name, email, role, status, restaurant_id, is_verified, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    if (!user) return res.status(404).json({ success: false, code: 'USER_NOT_FOUND', message: 'User not found' });
    return res.json({ success: true, data: safeUser(user) });
  } catch (err) {
    console.error('[adminController.getUser]', err.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── PATCH /api/admin/users/:id/status ───────────────────────────────────────

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !ALLOWED_USER_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_STATUS',
        message: `status must be one of: ${ALLOWED_USER_STATUSES.join(', ')}`
      });
    }

    // Self-protection: admin cannot suspend/reject themselves
    if (id === req.user.id && (status === 'suspended' || status === 'rejected')) {
      return res.status(400).json({
        success: false,
        code: 'CANNOT_MODIFY_SELF',
        message: 'You cannot suspend or reject your own account.'
      });
    }

    const target = await queryGet('SELECT * FROM users WHERE id = ?', [id]);
    if (!target) {
      return res.status(404).json({ success: false, code: 'USER_NOT_FOUND', message: 'User not found' });
    }

    // Protect the last super admin (admin with no restaurant_id)
    if (target.role === 'admin' && !target.restaurant_id && (status === 'suspended' || status === 'rejected')) {
      const superAdmins = await queryAll(
        "SELECT id FROM users WHERE role = 'admin' AND (restaurant_id IS NULL OR restaurant_id = '') AND (status = 'active' OR status IS NULL)"
      );
      if (superAdmins.length <= 1) {
        return res.status(400).json({
          success: false,
          code: 'CANNOT_REMOVE_LAST_SUPER_ADMIN',
          message: 'Cannot suspend the last active super admin account.'
        });
      }
    }

    await queryRun('UPDATE users SET status = ? WHERE id = ?', [status, id]);

    const updated = await queryGet(
      'SELECT id, name, email, role, status, restaurant_id, is_verified, created_at FROM users WHERE id = ?',
      [id]
    );

    return res.json({
      success: true,
      message: `User status updated to '${status}'.`,
      data: safeUser(updated)
    });
  } catch (err) {
    console.error('[adminController.updateUserStatus]', err.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── DELETE /api/admin/users/:id ─────────────────────────────────────────────

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        code: 'CANNOT_MODIFY_SELF',
        message: 'You cannot delete your own account.'
      });
    }

    const target = await queryGet('SELECT * FROM users WHERE id = ?', [id]);
    if (!target) {
      return res.status(404).json({ success: false, code: 'USER_NOT_FOUND', message: 'User not found' });
    }

    // Protect last super admin
    if (target.role === 'admin' && !target.restaurant_id) {
      const superAdmins = await queryAll(
        "SELECT id FROM users WHERE role = 'admin' AND (restaurant_id IS NULL OR restaurant_id = '')"
      );
      if (superAdmins.length <= 1) {
        return res.status(400).json({
          success: false,
          code: 'CANNOT_REMOVE_LAST_SUPER_ADMIN',
          message: 'Cannot delete the last super admin account.'
        });
      }
    }

    await queryRun('DELETE FROM users WHERE id = ?', [id]);
    return res.json({ success: true, message: `User ${id} deleted.` });
  } catch (err) {
    console.error('[adminController.deleteUser]', err.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── GET /api/admin/owners ────────────────────────────────────────────────────

export const listOwners = async (req, res) => {
  try {
    const owners = await queryAll(
      `SELECT u.id, u.name, u.email, u.role, u.status, u.restaurant_id, u.is_verified, u.created_at,
              r.name AS restaurantName, r.city AS restaurantCity
       FROM users u
       LEFT JOIN restaurants r ON r.id = u.restaurant_id
       WHERE u.role IN ('owner', 'admin') AND u.restaurant_id IS NOT NULL
       ORDER BY u.created_at DESC`
    );
    const mapped = owners.map(u => ({
      ...safeUser(u),
      restaurantName: u.restaurantName || null,
      restaurantCity: u.restaurantCity || null
    }));
    return res.json({ success: true, data: mapped });
  } catch (err) {
    console.error('[adminController.listOwners]', err.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── PATCH /api/admin/owners/:id/status ──────────────────────────────────────

export const updateOwnerStatus = async (req, res) => {
  // Reuse user status logic — owners are users with role='owner' or 'admin'
  return updateUserStatus(req, res);
};

// ─── GET /api/admin/restaurants ──────────────────────────────────────────────

export const listRestaurants = async (req, res) => {
  try {
    const rests = await queryAll(
      `SELECT r.id, r.name, r.city, r.cuisine, r.is_accepting_orders,
              u.id AS ownerId, u.name AS ownerName, u.email AS ownerEmail, u.status AS ownerStatus
       FROM restaurants r
       LEFT JOIN users u ON u.restaurant_id = r.id AND u.role IN ('owner', 'admin')
       ORDER BY r.name ASC`
    );
    return res.json({ success: true, data: rests });
  } catch (err) {
    console.error('[adminController.listRestaurants]', err.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── PATCH /api/admin/restaurants/:id/status ─────────────────────────────────

export const updateRestaurantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAcceptingOrders } = req.body;  // boolean: true = active, false = suspended

    if (typeof isAcceptingOrders !== 'boolean') {
      return res.status(400).json({
        success: false,
        code: 'INVALID_STATUS',
        message: 'isAcceptingOrders must be a boolean.'
      });
    }

    const rest = await queryGet('SELECT * FROM restaurants WHERE id = ?', [id]);
    if (!rest) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    await queryRun('UPDATE restaurants SET is_accepting_orders = ? WHERE id = ?', [isAcceptingOrders ? 1 : 0, id]);

    const updated = await queryGet('SELECT id, name, city, is_accepting_orders FROM restaurants WHERE id = ?', [id]);
    
    const io = req.app.get('io');
    if (io) {
      io.to(`restaurant_${id}_public`).emit('restaurant_status_changed', {
        id,
        isAcceptingOrders: !!updated.is_accepting_orders
      });
    }

    return res.json({
      success: true,
      message: `Restaurant ${isAcceptingOrders ? 'activated' : 'suspended'}.`,
      data: updated
    });
  } catch (err) {
    console.error('[adminController.updateRestaurantStatus]', err.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────

export const getPlatformStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      totalOwners,
      totalRestaurants,
      activeRestaurants,
    ] = await Promise.all([
      queryGet("SELECT COUNT(*) as c FROM users WHERE role = 'customer'"),
      queryGet("SELECT COUNT(*) as c FROM users WHERE role = 'customer' AND (status IS NULL OR status = 'active')"),
      queryGet("SELECT COUNT(*) as c FROM users WHERE status = 'suspended'"),
      queryGet("SELECT COUNT(*) as c FROM users WHERE role IN ('owner', 'admin') AND restaurant_id IS NOT NULL"),
      queryGet("SELECT COUNT(*) as c FROM restaurants"),
      queryGet("SELECT COUNT(*) as c FROM restaurants WHERE is_accepting_orders = 1"),
    ]);

    return res.json({
      success: true,
      data: {
        totalUsers:          totalUsers?.c || 0,
        activeUsers:         activeUsers?.c || 0,
        suspendedUsers:      suspendedUsers?.c || 0,
        totalOwners:         totalOwners?.c || 0,
        totalRestaurants:    totalRestaurants?.c || 0,
        activeRestaurants:   activeRestaurants?.c || 0,
      }
    });
  } catch (err) {
    console.error('[adminController.getPlatformStats]', err.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── OWNER APPLICATIONS LIFECYCLE ──────────────────────────────────────────

export const getOwnerApplications = async (req, res) => {
  try {
    const applications = await queryAll(`
      SELECT 
        u.id as userId,
        u.name as ownerName,
        u.email as ownerEmail,
        u.status as userStatus,
        u.created_at as submittedAt,
        r.id as restaurantId,
        r.name as restaurantName,
        r.cuisine,
        r.location,
        r.status as restaurantStatus,
        r.is_accepting_orders as isAcceptingOrders
      FROM users u
      LEFT JOIN restaurants r ON u.restaurant_id = r.id
      WHERE u.role = 'owner'
      ORDER BY u.created_at DESC
    `);
    return res.json({ success: true, data: applications });
  } catch (err) {
    console.error('[adminController.getOwnerApplications]', err.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const approveOwnerApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await queryGet('SELECT * FROM users WHERE (id = ? OR restaurant_id = ?) AND role = "owner"', [id, id]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Owner application not found.' });
    }

    const restId = user.restaurant_id;

    await queryRun('UPDATE users SET status = "active" WHERE id = ?', [user.id]);
    if (restId) {
      await queryRun('UPDATE restaurants SET status = "live", is_accepting_orders = 1 WHERE id = ?', [restId]);
    }

    const io = req.app.get('io');
    if (io && restId) {
      io.to(`restaurant_${restId}_public`).emit('restaurant_status_changed', {
        id: restId,
        isAcceptingOrders: true,
        status: 'live'
      });
    }

    return res.json({
      success: true,
      message: `Owner application for ${user.name} approved successfully. Restaurant is now LIVE.`,
      data: { userId: user.id, restaurantId: restId, userStatus: 'active', restaurantStatus: 'live' }
    });
  } catch (err) {
    console.error('[adminController.approveOwnerApplication]', err.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const rejectOwnerApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await queryGet('SELECT * FROM users WHERE (id = ? OR restaurant_id = ?) AND role = "owner"', [id, id]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Owner application not found.' });
    }

    const restId = user.restaurant_id;

    await queryRun('UPDATE users SET status = "rejected" WHERE id = ?', [user.id]);
    if (restId) {
      await queryRun('UPDATE restaurants SET status = "rejected", is_accepting_orders = 0 WHERE id = ?', [restId]);
    }

    return res.json({
      success: true,
      message: `Owner application for ${user.name} rejected.`,
      data: { userId: user.id, restaurantId: restId, userStatus: 'rejected', restaurantStatus: 'rejected' }
    });
  } catch (err) {
    console.error('[adminController.rejectOwnerApplication]', err.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
