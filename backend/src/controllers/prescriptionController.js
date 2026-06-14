const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');

// Create a prescription (doctor only, appointment must be completed)
exports.createPrescription = async (req, res) => {
    try {
        const { appointmentId, diagnosis, medications, labTests, attachments, followUpDate, notes } = req.body;

        // Verify appointment exists and is completed
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }
        if (appointment.status !== 'completed') {
            return res.status(400).json({ success: false, message: 'Prescription can only be written for completed appointments' });
        }
        if (appointment.doctor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You can only write prescriptions for your own appointments' });
        }

        // Check if prescription already exists for this appointment
        const existing = await Prescription.findOne({ appointment: appointmentId });
        if (existing) {
            return res.status(400).json({ success: false, message: 'A prescription already exists for this appointment' });
        }

        const prescription = await Prescription.create({
            appointment: appointmentId,
            doctor: req.user._id,
            patient: appointment.patient,
            diagnosis,
            medications: medications || [],
            labTests: labTests || [],
            attachments: (attachments || []).map(att => ({ ...att, uploadedBy: 'doctor' })),
            followUpDate,
            notes,
        });

        res.status(201).json({ success: true, data: { prescription } });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get prescription for a specific appointment (doctor or patient of that appointment)
exports.getPrescriptionByAppointment = async (req, res) => {
    try {
        const prescription = await Prescription.findOne({ appointment: req.params.appointmentId })
            .populate('doctor', 'name email avatar')
            .populate('patient', 'name email avatar');

        if (!prescription) {
            return res.status(404).json({ success: false, message: 'No prescription found for this appointment' });
        }

        // Only the doctor or patient of this prescription can view it
        const userId = req.user._id.toString();
        if (prescription.doctor._id.toString() !== userId && prescription.patient._id.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'You do not have access to this prescription' });
        }

        // Enrich with doctor specialization
        const profile = await DoctorProfile.findOne({ user: prescription.doctor._id });
        const prescObj = prescription.toObject();
        if (profile) {
            prescObj.doctor.specialization = profile.specialization;
        }

        res.status(200).json({ success: true, data: { prescription: prescObj } });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get all prescriptions for the logged-in patient (medical history)
exports.getPatientPrescriptions = async (req, res) => {
    try {
        const prescriptions = await Prescription.find({ patient: req.user._id })
            .populate('doctor', 'name email avatar')
            .populate('appointment', 'date timeSlot')
            .sort({ createdAt: -1 });

        // Enrich with doctor specializations
        const doctorIds = [...new Set(prescriptions.map(p => p.doctor._id.toString()))];
        const profiles = await DoctorProfile.find({ user: { $in: doctorIds } });
        const profileMap = {};
        profiles.forEach(p => { profileMap[p.user.toString()] = p.specialization; });

        const enriched = prescriptions.map(p => {
            const obj = p.toObject();
            obj.doctor.specialization = profileMap[obj.doctor._id.toString()] || 'General Physician';
            return obj;
        });

        res.status(200).json({ success: true, count: enriched.length, data: { prescriptions: enriched } });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get all prescriptions written by the logged-in doctor
exports.getDoctorPrescriptions = async (req, res) => {
    try {
        const prescriptions = await Prescription.find({ doctor: req.user._id })
            .populate('patient', 'name email avatar')
            .populate('appointment', 'date timeSlot')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: prescriptions.length, data: { prescriptions } });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Add attachments to an existing prescription (doctor or patient)
exports.addAttachments = async (req, res) => {
    try {
        const prescription = await Prescription.findById(req.params.id);

        if (!prescription) {
            return res.status(404).json({ success: false, message: 'Prescription not found' });
        }

        const userId = req.user._id.toString();
        if (prescription.doctor.toString() !== userId && prescription.patient.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'You do not have access to this prescription' });
        }

        const { attachments } = req.body;
        if (!attachments || !attachments.length) {
            return res.status(400).json({ success: false, message: 'Please provide at least one attachment' });
        }

        const newAttachments = attachments.map(att => ({
            ...att,
            uploadedBy: req.user.role === 'doctor' ? 'doctor' : 'patient',
            uploadedAt: new Date(),
        }));

        prescription.attachments.push(...newAttachments);
        await prescription.save();

        res.status(200).json({ success: true, data: { prescription } });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
