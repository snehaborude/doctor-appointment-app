const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');

exports.createAppointment = async (req, res) => {
    try {
        const { doctor, date, timeSlot, notes } = req.body;

        // Verify doctor exists and has role doctor
        const doctorUser = await User.findOne({ _id: doctor, role: 'doctor' });
        if (!doctorUser) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found',
            });
        }

        // Check if patient is trying to book themselves
        if (req.user._id.toString() === doctor) {
            return res.status(400).json({
                success: false,
                message: 'Doctors cannot book appointments with themselves',
            });
        }

        // Check if the slot is already booked for this doctor on this date
        const existingAppointment = await Appointment.findOne({
            doctor,
            date: new Date(date),
            timeSlot,
            status: { $in: ['pending', 'approved'] }
        });

        if (existingAppointment) {
            return res.status(400).json({
                success: false,
                message: 'This time slot is already booked. Please choose another slot.',
            });
        }

        const appointment = await Appointment.create({
            patient: req.user._id,
            doctor,
            date: new Date(date),
            timeSlot,
            notes,
        });

        res.status(201).json({
            success: true,
            data: { appointment },
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getPatientAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ patient: req.user._id })
            .populate('doctor', 'name email')
            .sort({ date: -1, timeSlot: -1 });

        // Retrieve Doctor Profiles for these appointments to add specialization & experience
        const doctorIds = appointments.map(app => app.doctor._id);
        const profiles = await DoctorProfile.find({ user: { $in: doctorIds } });

        const profileMap = {};
        profiles.forEach(p => {
            profileMap[p.user.toString()] = {
                specialization: p.specialization,
                experience: p.experience,
                fees: p.fees
            };
        });

        const appointmentsWithSpecs = appointments.map(app => {
            const appObj = app.toObject();
            if (appObj.doctor) {
                const profile = profileMap[appObj.doctor._id.toString()];
                appObj.doctor.specialization = profile ? profile.specialization : 'General Physician';
                appObj.doctor.experience = profile ? profile.experience : 0;
                appObj.doctor.fees = profile ? profile.fees : 0;
            }
            return appObj;
        });

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: { appointments: appointmentsWithSpecs },
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getDoctorAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ doctor: req.user._id })
            .populate('patient', 'name email')
            .sort({ date: -1, timeSlot: -1 });

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: { appointments },
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
        }

        // Validate Roles and Permissions
        if (req.user.role === 'patient') {
            // Patient can only cancel their own appointment
            if (appointment.patient.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only manage your own appointments',
                });
            }
            if (status !== 'cancelled') {
                return res.status(400).json({
                    success: false,
                    message: 'Patients can only cancel appointments',
                });
            }
        } else if (req.user.role === 'doctor') {
            // Doctor can only manage appointments booked with them
            if (appointment.doctor.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only manage appointments assigned to you',
                });
            }
        } else if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized action',
            });
        }

        appointment.status = status;
        await appointment.save();

        res.status(200).json({
            success: true,
            data: { appointment },
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
