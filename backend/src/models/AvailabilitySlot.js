const mongoose = require('mongoose');

const availabilitySlotSchema = new mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Slot must belong to a doctor'],
    },
    date: {
        type: Date,
        required: [true, 'Please provide the slot date'],
    },
    startTime: {
        type: String, // format "HH:mm" (24-hour) or "hh:mm A" (12-hour)
        required: [true, 'Please provide the start time'],
    },
    endTime: {
        type: String, // format "HH:mm" or "hh:mm A"
        required: [true, 'Please provide the end time'],
    },
    isBooked: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true
});

// Index to quickly query slots for a doctor on a specific date
availabilitySlotSchema.index({ doctor: 1, date: 1 });

const AvailabilitySlot = mongoose.model('AvailabilitySlot', availabilitySlotSchema);

module.exports = AvailabilitySlot;
