const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: [true, 'Prescription must be linked to an appointment'],
        unique: true,
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Prescription must have a doctor'],
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Prescription must have a patient'],
    },
    diagnosis: {
        type: String,
        required: [true, 'Please provide a diagnosis'],
    },
    medications: [
        {
            name: { type: String, required: true },
            dosage: { type: String, required: true },
            frequency: { type: String, required: true },
            duration: { type: String, required: true },
            instructions: { type: String, default: '' },
        },
    ],
    labTests: [{ type: String }],
    attachments: [
        {
            url: { type: String, required: true },
            name: { type: String, required: true },
            type: { type: String, default: 'application/octet-stream' },
            uploadedBy: { type: String, enum: ['doctor', 'patient'], required: true },
            uploadedAt: { type: Date, default: Date.now },
        },
    ],
    followUpDate: {
        type: Date,
    },
    notes: {
        type: String,
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;
