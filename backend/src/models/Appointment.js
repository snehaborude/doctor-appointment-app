const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Appointment must belong to a patient'],
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Appointment must belong to a doctor'],
    },
    date: {
        type: Date,
        required: [true, 'Please provide the appointment date'],
    },
    timeSlot: {
        type: String,
        required: [true, 'Please select a time slot'],
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
        default: 'pending',
    },
    notes: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
