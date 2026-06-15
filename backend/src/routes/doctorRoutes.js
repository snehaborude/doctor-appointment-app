const express = require('express');
const doctorController = require('../controllers/doctorController');
const availabilityController = require('../controllers/availabilityController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', doctorController.getAllDoctors);
router.get('/:id', doctorController.getDoctorById);
router.get('/:doctorId/availability-slots', availabilityController.getAvailableSlots);

// Protected routes (Doctor only)
router.put('/profile', protect, restrictTo('doctor'), doctorController.updateProfile);

// Slot availability routes (Doctor only)
router.post('/availability', protect, restrictTo('doctor'), availabilityController.addSlot);
router.get('/availability', protect, restrictTo('doctor'), availabilityController.getDoctorSlots);
router.put('/availability/:id', protect, restrictTo('doctor'), availabilityController.editSlot);
router.delete('/availability/:id', protect, restrictTo('doctor'), availabilityController.deleteSlot);

module.exports = router;
