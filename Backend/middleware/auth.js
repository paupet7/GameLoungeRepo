const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }  // 15 minučių
  );
};

// Generate Refresh Token (ilgas galiojimas)
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,  // Atskiras secret!
    { expiresIn: '7d' }  // 7 dienos
  );
};

// Generate both tokens
const generateTokens = (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  
  return { accessToken, refreshToken };
};

// Authenticate user
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
   if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Please refresh your token'
      });
    }
    res.status(401).json({ error: 'Invalid token' });
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Check if user is client or admin (not guest)
const isClientOrAdmin = (req, res, next) => {
  if (req.user.role === 'guest') {
    return res.status(403).json({ error: 'Client or Admin access required' });
  }
  next();
};

module.exports = {
  generateTokens,
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  authenticate,
  isAdmin,
  isClientOrAdmin
};