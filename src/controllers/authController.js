const { User, FarmerProfile } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require("sequelize");


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

      if (userRole === 'farmer') {
      await FarmerProfile.create({
        userId: user.id,
        farmName: `${fullname}'s Farm`,
        location: '',
        bio: '',
        coverPhoto: ''
      });
    }

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
  },

getUsers: async (req, res) => {
  try {
    // Pagination params
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // Fetch all users excluding admins
    const { count, rows: users } = await User.findAndCountAll({
      where: {
        role: {
          [Op.ne]: "admin", // Exclude users with role 'admin'
        },
      },
      attributes: ["id", "fullname", "email", "phone", "role"],
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      status: "success",
      message: "Users retrieved successfully (excluding admins).",
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      data: users,
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: err.message });
  }
},

};

module.exports = AuthController;
