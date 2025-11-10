const bcrypt = require('bcrypt');
const { sql, getConnection } = require('../db');

// GET comments for a theme
exports.comments = async (req, res) => {
  try {

    const themeId = req.params.themeId;
    const pool = await getConnection();
    
    const result = await pool.request()
      .input('themeId', sql.UniqueIdentifier, themeId)
      .query(`
        SELECT c.*, u.username
        FROM Comments c
        LEFT JOIN Users u ON c.userId = u.id
        WHERE c.themeId = @themeId
        ORDER BY c.createdAt DESC
      `);
      if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Comments not found' });
    }
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

// GET single comment
exports.comment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const pool = await getConnection();
    
    const result = await pool.request()
      .input('commentId', sql.UniqueIdentifier, commentId)
      .query(`
        SELECT c.*, u.username
        FROM Comments c
        LEFT JOIN Users u ON c.userId = u.id
        WHERE c.id = @commentId
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Get comment error:', error);
    res.status(500).json({ error: 'Failed to fetch comment' });
  }
};


// CREATE comment
exports.addComment = async (req, res) => {
  try {
    const themeId = req.params.themeId;
    const gameId =  req.params.gameId;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    const pool = await getConnection();
    
    const result = await pool.request()
      .input('themeId', sql.UniqueIdentifier, themeId)
      .input('gameId', sql.UniqueIdentifier, gameId)
      .input('userId',  sql.UniqueIdentifier, req.user.id)
      .input('content', sql.NVarChar, content)
      .query(`
        INSERT INTO Comments (themeId, gameId, userId, content)
        OUTPUT INSERTED.*
        VALUES (@themeId, @gameId, @userId, @content)
      `);
    
    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
};

// UPDATE comment
exports.updateComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const pool = await getConnection();
    
    // Check permission
    const checkResult = await pool.request()
      .input('commentId', sql.UniqueIdentifier, commentId)
      .query('SELECT userId FROM Comments WHERE id = @commentId');
    
    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    const comment = checkResult.recordset[0];
    if (comment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No permission' });
    }
    
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    const result = await pool.request()
      .input('commentId', sql.UniqueIdentifier, commentId)
      .input('content', sql.NVarChar, content)
      .query(`
        UPDATE Comments 
        SET content = @content,
            updatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @commentId
      `);
    
    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
};

// DELETE comment
exports.deleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const pool = await getConnection();
    
    // Check permission
    const checkResult = await pool.request()
      .input('commentId', sql.UniqueIdentifier, commentId)
      .query('SELECT userId FROM Comments WHERE id = @commentId');
    
    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    const comment = checkResult.recordset[0];
    if (comment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No permission' });
    }
    
    await pool.request()
      .input('commentId', sql.UniqueIdentifier, commentId)
      .query('DELETE FROM Comments WHERE id = @commentId');
    
    res.status(200).send();
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};
