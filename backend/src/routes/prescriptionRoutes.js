const express = require('express');
const prescriptionController = require('../controllers/prescriptionController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/', restrictTo('doctor'), prescriptionController.createPrescription);
router.get('/patient', restrictTo('patient'), prescriptionController.getPatientPrescriptions);
router.get('/doctor', restrictTo('doctor'), prescriptionController.getDoctorPrescriptions);
router.get('/appointment/:appointmentId', prescriptionController.getPrescriptionByAppointment);
router.patch('/:id/attachments', prescriptionController.addAttachments);

module.exports = router;
