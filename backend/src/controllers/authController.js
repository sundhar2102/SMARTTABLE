import { queryAll, queryGet, queryRun } from '../../database/db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sendOTP } from '../services/emailService.js';
import { JWT_SECRET } from '../config/jwt.js';

export const login = async (req, res) => {
  try {
    const { role, email, username, password, restaurantId } = req.body;
    const identifier = (email || username || '').trim();

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email/username and password.' });
    }

    // Check predefined / seeded demo users or database users
    const user = await queryGet('SELECT * FROM users WHERE email = ? OR id = ?', [identifier, identifier]);

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Handle existing/legacy user records without password_hash safely (migration fallback)
    if (!user.password_hash) {
      // Seeded accounts default fallback passwords based on username/role
      const defaultPassword = identifier.includes('admin') ? 'admin123' : (identifier.includes('owner') ? 'owner123' : 'password');
      
      if (password === defaultPassword) {
        // Dynamically hash and upgrade legacy user password in database
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        await queryRun('UPDATE users SET password_hash = ? WHERE id = ?', [hash, user.id]);
        user.password_hash = hash;
      } else {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    } else {
      // Secure password hash comparison using bcrypt
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    }

    // Phase 6: Block login for suspended or rejected accounts
    if (user.status === 'suspended' || user.status === 'rejected') {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_SUSPENDED',
        message: user.status === 'suspended'
          ? 'Your account has been suspended. Please contact support.'
          : 'Your account registration was rejected. Please contact support.'
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, restaurantId: user.restaurant_id || null },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      message: `Signed in successfully as ${user.role || role || 'User'}`,
      token,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurant_id || restaurantId
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const register = async (req, res) => {
  console.log('\n[DEBUG] --- NEW REGISTRATION REQUEST RECEIVED ---', req.body?.email);
  try {
    const { 
      name, 
      email, 
      password, 
      role = 'customer', 
      phone, 
      restaurantName, 
      restaurantId, 
      dietaryPreference, 
      city,
      gstin,
      fssai
    } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Full name, email address, and password are required.' 
      });
    }

    // Input Validation: password length must be >= 6
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await queryGet('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    if (existing) {
      return res.status(409).json({ 
        success: false, 
        message: `An account with email "${cleanEmail}" already exists. Please log in instead.` 
      });
    }

    const finalRole = role === 'owner' ? 'owner' : 'customer';
    const userId = `USR-${finalRole.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-6)}`;

    // Hash the password securely using bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // We chose Option B: Skip OTP entirely.
    // Insert verified user directly
    await queryRun(
      'INSERT INTO users (id, name, email, role, password_hash, restaurant_id, is_verified) VALUES (?, ?, ?, ?, ?, ?, 1)',
      [userId, name.trim(), cleanEmail, finalRole, hash, restaurantId || null]
    );

    const token = jwt.sign(
      { id: userId, role: finalRole, restaurantId: restaurantId || null },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      data: {
        id: userId,
        name: name.trim(),
        email: cleanEmail,
        role: finalRole,
        restaurantId: restaurantId || null
      }
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await queryGet('SELECT * FROM users WHERE email = ?', [cleanEmail]);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.is_verified) {
      return res.status(400).json({ success: false, message: 'User is already verified' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code' });
    }

    // Check expiry. In MySQL, NOW() returns the current timestamp.
    const expiredCheck = await queryGet(
      'SELECT CASE WHEN NOW() > ? THEN 1 ELSE 0 END as isExpired',
      [user.otp_expires_at]
    );

    if (expiredCheck && expiredCheck.isExpired === 1) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    // Verify user
    await queryRun(
      'UPDATE users SET is_verified = 1, otp = NULL, otp_expires_at = NULL WHERE id = ?',
      [user.id]
    );

    const token = jwt.sign(
      { id: user.id, role: user.role, restaurantId: user.restaurant_id || null },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      message: 'Account verified successfully',
      token,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurant_id || null
      }
    });

  } catch (error) {
    console.error('Error in verifyOTP:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await queryGet('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurant_id
      }
    });
  } catch (error) {
    console.error('Error in getMe:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
