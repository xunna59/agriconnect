const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateUser = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Access denied - No token provided.' });
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, error: 'Access denied. Invalid token format.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch user from DB
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found.' });
    }

    req.user = user; // attach full user object
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token or expired.', expired: true });
  }
};

module.exports = authenticateUser;
