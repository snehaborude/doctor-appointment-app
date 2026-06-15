const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// All appointment routes are protected
router.use(protect);

router.post('/', restrictTo('patient'), appointmentController.createAppointment);
router.get('/patient', restrictTo('patient'), appointmentController.getPatientAppointments);
router.get('/doctor', restrictTo('doctor'), appointmentController.getDoctorAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.patch('/:id/status', appointmentController.updateAppointmentStatus);

module.exports = router;
