const express = require('express');
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected by JWT authentication
router.use(protect);

router.get('/', notificationController.getNotifications);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;
