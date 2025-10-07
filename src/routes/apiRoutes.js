const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const rateLimit = require('express-rate-limit');
const AuthController = require('../controllers/authController');
const FarmerProfileController = require('../controllers/FarmerProfileController');
const ProductController = require('../controllers/productController');
const OrderController = require('../controllers/orderController');
const PayoutController = require('../controllers/payoutController');
const WalletTransactionController = require('../controllers/walletTransactionController');
// Middleware
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const uploadToCloudinary = require("../middleware/upload");


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

/////////////////////////
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);

/////////////////////////
// Protected Routes
/////////////////////////
router.use(authMiddleware); // all routes below require authentication

// Farmer Profile
router.get('/farmer/profile', roleMiddleware(['farmer']), FarmerProfileController.getProfile);
router.put('/farmer/profile', roleMiddleware(['farmer']),  uploadToCloudinary("coverPhoto", { multiple: false, folder: "farmer_covers" }), FarmerProfileController.updateProfile);

// Products (Farmer)
router.post('/products', roleMiddleware(['farmer']), ProductController.create);
router.get('/products', roleMiddleware(['farmer']), ProductController.list);
router.get('/products/:id', roleMiddleware(['farmer','buyer','admin']), ProductController.get);
router.put('/products/:id', roleMiddleware(['farmer']), ProductController.update);
router.delete('/products/:id', roleMiddleware(['farmer']), ProductController.delete);

// Orders
router.post('/orders', roleMiddleware(['buyer']), OrderController.placeOrder);
router.post('/orders/:id/confirm', roleMiddleware(['buyer']), OrderController.confirmDelivery);
router.get('/orders', roleMiddleware(['buyer','farmer','admin']), OrderController.listOrders);

// Payouts
router.post('/payouts', roleMiddleware(['farmer']), PayoutController.requestPayout);
router.post('/payouts/:id/approve', roleMiddleware(['admin']), PayoutController.approvePayout);
router.get('/payouts', roleMiddleware(['farmer','admin']), PayoutController.listPayouts);

// Wallet Transactions
router.get('/wallet/transactions', roleMiddleware(['farmer','buyer','admin']), WalletTransactionController.listTransactions);



module.exports = router;