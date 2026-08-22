import { queryAll, queryGet, queryRun } from '../../database/db.js';

/**
 * GET /api/menu/:restaurantId
 * Fetch all menu items for a specific restaurant.
 */
export const getMenuItems = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const items = await queryAll('SELECT * FROM menu_items WHERE restaurant_id = ? ORDER BY category ASC, name ASC', [restaurantId]);
    
    // Group by category
    const grouped = items.reduce((acc, item) => {
      const cat = item.category || 'General';
      if (!acc[cat]) {
        acc[cat] = [];
      }
      acc[cat].push({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        desc: item.description || '',
        tags: item.tags_json ? (typeof item.tags_json === 'string' ? JSON.parse(item.tags_json) : item.tags_json) : ['v'],
        isAvailable: item.is_available === 1
      });
      return acc;
    }, {});

    const categoryList = Object.keys(grouped).map(cat => ({
      category: cat,
      items: grouped[cat]
    }));

    return res.json({ success: true, count: items.length, data: categoryList, rawItems: items });
  } catch (err) {
    console.error('Error in getMenuItems:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/menu
 * Add a new menu item to a restaurant.
 */
export const addMenuItem = async (req, res) => {
  try {
    const { restaurantId, category, name, price, description, tags, isAvailable } = req.body;

    if (!restaurantId || !category || !name || price === undefined) {
      return res.status(400).json({ success: false, message: 'Restaurant ID, category, item name, and price are required.' });
    }

    // Role check: Only owner or admin of the restaurant can modify
    if (req.user.role === 'owner' && req.user.restaurantId && req.user.restaurantId !== restaurantId) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not have permission to manage this restaurant menu.' });
    }

    const itemId = `MENU-${restaurantId.slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-6)}`;
    const tagsJson = JSON.stringify(tags || ['v']);

    await queryRun(
      `INSERT INTO menu_items (id, restaurant_id, category, name, price, description, tags_json, is_available) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [itemId, restaurantId, category.trim(), name.trim(), Number(price), description || '', tagsJson, isAvailable !== false ? 1 : 0]
    );

    const created = await queryGet('SELECT * FROM menu_items WHERE id = ?', [itemId]);

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      io.to(`restaurant_${restaurantId}_public`).emit('menu_updated', { restaurantId, action: 'add', itemId });
    }

    return res.status(201).json({
      success: true,
      message: 'Menu item added successfully.',
      data: created
    });
  } catch (err) {
    console.error('Error in addMenuItem:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/menu/:id
 * Update an existing menu item.
 */
export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, name, price, description, tags, isAvailable } = req.body;

    const existing = await queryGet('SELECT * FROM menu_items WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    // Role check
    if (req.user.role === 'owner' && req.user.restaurantId && req.user.restaurantId !== existing.restaurant_id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not have permission to manage this restaurant menu.' });
    }

    const newCategory = category !== undefined ? category.trim() : existing.category;
    const newName = name !== undefined ? name.trim() : existing.name;
    const newPrice = price !== undefined ? Number(price) : existing.price;
    const newDesc = description !== undefined ? description : existing.description;
    const newTagsJson = tags !== undefined ? JSON.stringify(tags) : existing.tags_json;
    const newAvailable = isAvailable !== undefined ? (isAvailable ? 1 : 0) : existing.is_available;

    await queryRun(
      `UPDATE menu_items 
       SET category = ?, name = ?, price = ?, description = ?, tags_json = ?, is_available = ? 
       WHERE id = ?`,
      [newCategory, newName, newPrice, newDesc, newTagsJson, newAvailable, id]
    );

    const updated = await queryGet('SELECT * FROM menu_items WHERE id = ?', [id]);

    const io = req.app.get('io');
    if (io) {
      io.to(`restaurant_${existing.restaurant_id}_public`).emit('menu_updated', { restaurantId: existing.restaurant_id, action: 'update', itemId: id });
    }

    return res.json({
      success: true,
      message: 'Menu item updated successfully.',
      data: updated
    });
  } catch (err) {
    console.error('Error in updateMenuItem:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/menu/:id
 * Delete a menu item.
 */
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await queryGet('SELECT * FROM menu_items WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    if (req.user.role === 'owner' && req.user.restaurantId && req.user.restaurantId !== existing.restaurant_id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not have permission to manage this restaurant menu.' });
    }

    await queryRun('DELETE FROM menu_items WHERE id = ?', [id]);

    const io = req.app.get('io');
    if (io) {
      io.to(`restaurant_${existing.restaurant_id}_public`).emit('menu_updated', { restaurantId: existing.restaurant_id, action: 'delete', itemId: id });
    }

    return res.json({ success: true, message: `Menu item ${id} deleted successfully.` });
  } catch (err) {
    console.error('Error in deleteMenuItem:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};
