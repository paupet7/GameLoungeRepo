const { sql, getConnection } = require('../db');

// GET all users (Admin only)
exports.users = async (req, res) => {
  try {
    const pool = await getConnection();
    
    const result = await pool.request().query(`
      SELECT id, username, email, role, createdAt, updatedAt
      FROM Users
      ORDER BY createdAt DESC
    `);
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// GET single user (Admin only)
exports.user = async (req, res) => {
  try {
    const userId = req.params.userId;
    const pool = await getConnection();
    
    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query(`
        SELECT id, username, email, role, createdAt, updatedAt
        FROM Users
        WHERE id = @userId
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// UPDATE user role (Admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { role } = req.body;
    const pool = await getConnection();
    
    // Prevent admin from changing their own role
    if (userId === req.user.id) {
      return res.status(403).json({ error: 'You cannot change your own role' });
    }
    
    // Validate role
    if (!['client', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be "client" or "admin"' });
    }
    
    // Check if user exists
    const checkResult = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query('SELECT id FROM Users WHERE id = @userId');
    
    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update role
    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .input('role', sql.NVarChar, role)
      .query(`
        UPDATE Users 
        SET role = @role,
            updatedAt = GETDATE()
        OUTPUT INSERTED.id, INSERTED.username, INSERTED.email, INSERTED.role, INSERTED.updatedAt
        WHERE id = @userId
      `);
    
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

// DELETE user (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const pool = await getConnection();
    
    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return res.status(403).json({ error: 'You cannot delete your own account' });
    }
    
    // Check if user exists
    const checkResult = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query('SELECT id FROM Users WHERE id = @userId');
    
    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Delete user's related data first (cascade delete)
    await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query('DELETE FROM Comments WHERE userId = @userId');
    
    await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query('DELETE FROM Themes WHERE createdBy = @userId');
    
    await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query('DELETE FROM Games WHERE createdBy = @userId');
    
    await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query('DELETE FROM RefreshTokens WHERE userId = @userId');
    
    // Finally delete the user
    await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query('DELETE FROM Users WHERE id = @userId');
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};