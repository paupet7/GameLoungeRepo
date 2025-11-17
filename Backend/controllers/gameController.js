const bcrypt = require('bcrypt');
const { sql, getConnection } = require('../db');

// GET all games
exports.games = async (req, res) => {
  try {
    const pool = await getConnection();
    
    const result = await pool.request().query(`
      SELECT g.*, u.username as createdByUsername
      FROM Games g
      LEFT JOIN Users u ON g.createdBy = u.id
      ORDER BY g.createdAt DESC
    `);
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Games not found' });
    }
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
};

// GET single game
exports.game = async (req, res) => {
  try {
    const gameId = req.params.gameId;
    const pool = await getConnection();

    const result = await pool.request()
      .input('gameId', sql.UniqueIdentifier, gameId)
      .query(`
        SELECT g.*, u.username as createdByUsername
        FROM Games g
        LEFT JOIN Users u ON g.createdBy = u.id
        WHERE g.id = @gameId
      `);
      console.log(result.recordset.length)
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({ error: 'Failed to fetch game' });
  }
};

// CREATE game
exports.addGame = async (req, res) => {
  try {
    const { title, description, imageUrl, genre } = req.body;
    
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required and must be a non-empty string.' });
    }
    
    const pool = await getConnection();

    const existing = await pool.request()
      .input('title', sql.NVarChar, title)
      .query('SELECT id FROM Games WHERE title = @title');
    
    if (existing.recordset.length > 0) {
      return res.status(422).json({ error: 'A game with this title already exists.' });
    }
    
    const result = await pool.request()
      .input('title', sql.NVarChar, title)
      .input('description', sql.NVarChar, description || '')
      .input('imageUrl', sql.NVarChar, imageUrl || '')
      .input('genre', sql.NVarChar, genre || '')
      .input('createdBy', sql.UniqueIdentifier, req.user.id)
      .query(`
        INSERT INTO Games (title, description, imageUrl, genre, createdBy)
        OUTPUT INSERTED.*
        VALUES (@title, @description, @imageUrl, @genre, @createdBy)
      `);
    
    
    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({ error: 'Failed to create game' });
  }
};

// UPDATE game
exports.updateGame = async (req, res) => {
  try {
    const gameId = req.params.gameId;
    const pool = await getConnection();
    
    // Check permission
    const checkResult = await pool.request()
      .input('gameId', sql.UniqueIdentifier, gameId)
      .query('SELECT createdBy FROM Games WHERE id = @gameId');
    
    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    const game = checkResult.recordset[0];
    if (game.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No permission' });
    }
    
    const { title, description, imageUrl, genre } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required and must be a non-empty string.' });
    }

    const existing = await pool.request()
      .input('title', sql.NVarChar, title)
      .input('gameId', sql.UniqueIdentifier, gameId)
      .query('SELECT id FROM Games WHERE title = @title AND id != @gameId');
    
    if (existing.recordset.length > 0) {
      return res.status(422).json({ error: 'A game with this title already exists.' });
    }


    
    const result = await pool.request()
      .input('gameId', sql.UniqueIdentifier, gameId)
      .input('title', sql.NVarChar, title)
      .input('description', sql.NVarChar, description)
      .input('imageUrl', sql.NVarChar, imageUrl)
      .input('genre', sql.NVarChar, genre)
      .query(`
        UPDATE Games 
        SET title = COALESCE(@title, title),
            description = COALESCE(@description, description),
            imageUrl = COALESCE(@imageUrl, imageUrl),
            genre = COALESCE(@genre, genre),
            updatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @gameId
      `);
    
    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Update game error:', error);
    res.status(500).json({ error: 'Failed to update game' });
  }
};

// DELETE game
exports.deleteGame = async (req, res) => {
  try {
    const gameId = req.params.gameId;
    const pool = await getConnection();
    
    // Patikrinti ar žaidimas egzistuoja
    const checkResult = await pool.request()
      .input('gameId', sql.UniqueIdentifier, gameId)
      .query('SELECT id FROM Games WHERE id = @gameId');
    
    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    const game = checkResult.recordset[0];
    if (game.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No permission' });
    }
    
    await pool.request()
      .input('gameId', sql.UniqueIdentifier, gameId)
      .query('DELETE FROM Games WHERE id = @gameId');
    
    res.status(200).send();
  } catch (error) {
    console.error('Delete game error:', error);
    res.status(500).json({ error: 'Failed to delete game' });
  }
};