const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Notification must belong to a user'],
    },
    title: {
        type: String,
        required: [true, 'Please provide a notification title'],
    },
    message: {
        type: String,
        required: [true, 'Please provide a notification message'],
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    type: {
        type: String,
        enum: ['appointment', 'prescription', 'system'],
        default: 'system',
    },
    link: {
        type: String,
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

// Index to query notifications fast for a user sorted by latest first
notificationSchema.index({ user: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
