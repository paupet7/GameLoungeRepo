const bcrypt = require('bcrypt');
const { sql, getConnection } = require('../db');
const { generateTokens, generateAccessToken, verifyRefreshToken } = require('../middleware/auth');

// Register new user
exports.register = async (req, res) => {
  try {
    const { username, email, password, role = 'client' } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const pool = await getConnection();
    
    
    const checkUser = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT id FROM Users WHERE email = @email');
    
    if (checkUser.recordset.length > 0) {
      return res.status(422).json({ error: 'Email already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, hashedPassword)
      .input('role', sql.NVarChar, role === 'admin' ? 'client' : role)
      .query(`
        INSERT INTO Users (username, email, password, role) 
        OUTPUT INSERTED.id, INSERTED.username, INSERTED.email, INSERTED.role
        VALUES (@username, @email, @password, @role)
      `);

    const user = result.recordset[0];
    const { accessToken, refreshToken } = generateTokens(user);
    
    await pool.request()
      .input('userId', sql.UniqueIdentifier, user.id)
      .input('token', sql.NVarChar, refreshToken)
      .input('expiresAt', sql.DateTime, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
      .query(`
        INSERT INTO RefreshTokens (userId, token, expiresAt)
        VALUES (@userId, @token, @expiresAt)
      `);
    
    res.status(201).json({ 
      accessToken, 
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const pool = await getConnection();
    
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT id, username, email, password, role FROM Users WHERE email = @email');
    
    if (result.recordset.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const user = result.recordset[0];
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return res.status(404).json({ error: 'Invalid password' });
    }
    
    const { accessToken, refreshToken } = generateTokens(user);

     await pool.request()
      .input('userId', sql.UniqueIdentifier, user.id)
      .input('token', sql.NVarChar, refreshToken)
      .input('expiresAt', sql.DateTime, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
      .query(`
        INSERT INTO RefreshTokens (userId, token, expiresAt)
        VALUES (@userId, @token, @expiresAt)
      `);
    
    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Refresh access token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }
    
    const pool = await getConnection();
    
    // Patikrinti ar token'as egzistuoja DB
    const tokenCheck = await pool.request()
      .input('token', sql.NVarChar, refreshToken)
      .query(`
        SELECT userId, expiresAt, isRevoked 
        FROM RefreshTokens 
        WHERE token = @token
      `);
    
    if (tokenCheck.recordset.length === 0) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }
    
    const tokenData = tokenCheck.recordset[0];
    
    if (tokenData.isRevoked) {
      return res.status(403).json({ error: 'Refresh token has been revoked' });
    }
    
    if (new Date(tokenData.expiresAt) < new Date()) {
      return res.status(403).json({ error: 'Refresh token expired' });
    }

    
    const decoded = verifyRefreshToken(refreshToken);
    
    if (!decoded) {
      return res.status(403).json({ error: 'Invalid refresh token signature' });
    }
    
    // Get user from database
    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, decoded.id)
      .query('SELECT id, username, email, role FROM Users WHERE id = @userId');
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.recordset[0];
    
    // Generate new access token
    const newAccessToken = generateAccessToken(user);
    
    res.json({
      accessToken: newAccessToken
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
};

// Logout 
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }
    
    const pool = await getConnection();
    
    
    await pool.request()
      .input('token', sql.NVarChar, refreshToken)
      .query(`
        UPDATE RefreshTokens 
        SET isRevoked = 1 
        WHERE token = @token
      `);
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};