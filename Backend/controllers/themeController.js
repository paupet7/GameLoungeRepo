const bcrypt = require('bcrypt');
const { sql, getConnection } = require('../db');

// GET themes for a game
exports.themes = async (req, res) => {
  try {
    const gameId = req.params.gameId;
    const pool = await getConnection();
    
    const result = await pool.request()
      .input('gameId', sql.UniqueIdentifier, gameId)
      .query(`
        SELECT t.*, u.username as createdByUsername
        FROM Themes t
        LEFT JOIN Users u ON t.createdBy = u.id
        WHERE t.gameId = @gameId
        ORDER BY t.createdAt DESC
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Theme not found' });
    }
     res.json(result.recordset);
  } catch (error) {
    console.error('Get themes error:', error);
    res.status(500).json({ error: 'Failed to fetch themes' });
  }
};

// GET single theme
exports.theme = async (req, res) => {
  try {
    const themeId = req.params.themeId;
    const gameId = req.params.gameId;
    const pool = await getConnection();
    
    const result = await pool.request()
      .input('themeId', sql.UniqueIdentifier, themeId)
      .input('gameId', sql.UniqueIdentifier, gameId)
      .query(`
        SELECT t.*, u.username as createdByUsername
        FROM Themes t
        LEFT JOIN Users u ON t.createdBy = u.id
        WHERE t.id = @themeId AND t.gameId = @gameId
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Theme not found' });
    }
    
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Get theme error:', error);
    res.status(500).json({ error: 'Failed to fetch theme' });
  }
};

// CREATE theme
exports.addTheme = async (req, res) => {
  try {
    const gameId = req.params.gameId;
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const pool = await getConnection();

    const existing = await pool.request()
      .input('title', sql.NVarChar, title)
      .query('SELECT id FROM Themes WHERE title = @title');
    
    if (existing.recordset.length > 0) {
      return res.status(422).json({ error: 'A theme with this title already exists.' });
    }
    
    const result = await pool.request()
      .input('gameId', sql.UniqueIdentifier, gameId)
      .input('title', sql.NVarChar, title)
      .input('description', sql.NVarChar, description || '')
      .input('createdBy', sql.UniqueIdentifier, req.user.id)
      .query(`
        INSERT INTO Themes (gameId, title, description)
        OUTPUT INSERTED.*
        VALUES (@gameId, @title, @description)
      `);
    
    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Create theme error:', error);
    res.status(500).json({ error: 'Failed to create theme' });
  }
};

// UPDATE theme
exports.updateTheme = async (req, res) => {
  try {
    const themeId = req.params.themeId;
    const pool = await getConnection();
    
    // Check permission
    const checkResult = await pool.request()
      .input('themeId', sql.UniqueIdentifier, themeId)
      .query('SELECT createdBy FROM Themes WHERE id = @themeId');
    
    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Theme not found' });
    }
    
    const theme = checkResult.recordset[0];
    if (theme.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No permission' });
    }
    
    const { title, description } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required and must be a non-empty string.' });
    }

    const existing = await pool.request()
      .input('title', sql.NVarChar, title)
      .query('SELECT id FROM Themes WHERE title = @title');
    
    if (existing.recordset.length > 0) {
      return res.status(422).json({ error: 'A Theme with this title already exists.' });
    }
    
    const result = await pool.request()
      .input('themeId', sql.UniqueIdentifier, themeId)
      .input('title', sql.NVarChar, title)
      .input('description', sql.NVarChar, description)
      .query(`
        UPDATE Themes 
        SET title = COALESCE(@title, title),
            description = COALESCE(@description, description),
            updatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @themeId
      `);
    
    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Update theme error:', error);
    res.status(500).json({ error: 'Failed to update theme' });
  }
};

// DELETE theme
exports.deleteTheme = async (req, res) => {
  try {
    const themeId = req.params.themeId;
    const pool = await getConnection();
    
    // Check permission
    const checkResult = await pool.request()
      .input('themeId', sql.UniqueIdentifier, themeId)
      .query('SELECT createdBy FROM Themes WHERE id = @themeId');
    
    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Theme not found' });
    }
    
    const theme = checkResult.recordset[0];
    if (theme.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No permission' });
    }
    
    await pool.request()
      .input('themeId', sql.UniqueIdentifier, themeId)
      .query('DELETE FROM Themes WHERE id = @themeId');
    
    res.status(200).Send();
  } catch (error) {
    console.error('Delete theme error:', error);
    res.status(500).json({ error: 'Failed to delete theme' });
  }
};
