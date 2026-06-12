const express = require('express');
const doctorController = require('../controllers/doctorController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', doctorController.getAllDoctors);
router.get('/:id', doctorController.getDoctorById);

// Protected routes (Doctor only)
router.put('/profile', protect, restrictTo('doctor'), doctorController.updateProfile);

module.exports = router;
