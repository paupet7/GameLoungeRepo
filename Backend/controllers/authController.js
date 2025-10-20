const bcrypt = require('bcrypt');
const { sql, getConnection } = require('../db');
const { generateToken } = require('../middleware/auth');

// Register new user
exports.register = async (req, res) => {
  try {
    const { username, email, password, role = 'client' } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const pool = await getConnection();
    
    // Check if user exists
    const checkUser = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT id FROM Users WHERE email = @email');
    
    if (checkUser.recordset.length > 0) {
      return res.status(422).json({ error: 'Email already exists' });
    }
    
    // Hash password
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
    const token = generateToken(user);
    
    res.status(201).json({ token, user });
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
    
    const token = generateToken(user);
    
    res.json({
      token,
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