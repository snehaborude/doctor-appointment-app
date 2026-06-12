const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Profile must belong to a user'],
        unique: true,
    },
    specialization: {
        type: String,
        required: [true, 'Please provide your specialization'],
    },
    experience: {
        type: Number,
        required: [true, 'Please provide years of experience'],
    },
    fees: {
        type: Number,
        required: [true, 'Please provide consultation fees'],
    },
    bio: {
        type: String,
        required: [true, 'Please provide a brief bio'],
    },
    availability: [
        {
            day: {
                type: String,
                enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                required: true,
            },
            slots: {
                type: [String],
                default: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'],
            }
        }
    ],
    rating: {
        type: Number,
        default: 5.0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const DoctorProfile = mongoose.model('DoctorProfile', doctorProfileSchema);

module.exports = DoctorProfile;
