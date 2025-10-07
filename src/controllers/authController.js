const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const AuthController = {
register: async (req, res) => {
  try {
    const { fullname, email, phone, password, role } = req.body;

    // Allow only 'farmer' or 'buyer'
    const validRoles = ['farmer', 'buyer'];
    const userRole = validRoles.includes(role) ? role : 'buyer';

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email already registered' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      fullname,
      email,
      phone,
      password: hashedPassword,
      role: userRole
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, fullname: user.fullname, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
},


  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) return res.status(404).json({ error: 'User not found' });

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ error: 'Invalid password' });

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        user: { id: user.id, fullname: user.fullname, email: user.email, role: user.role, walletBalance: user.walletBalance },
        token
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = AuthController;
