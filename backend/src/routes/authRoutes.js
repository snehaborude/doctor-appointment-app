const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/imagekit-auth', protect, authController.getImageKitAuthParameters);
router.put('/update-me', protect, authController.updateMe);

module.exports = router;
