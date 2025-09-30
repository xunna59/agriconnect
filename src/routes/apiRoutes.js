const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const authenticateUser = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

// app status check route
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        message: 'Application is running smoothly!',
    });
});

// rate limiter for login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts, please try again later.',
});



module.exports = router;