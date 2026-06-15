const Notification = require('../models/Notification');

// Internal helper to create a notification (exported so other controllers can call it)
exports.createNotification = async (userId, title, message, type, link = '') => {
    try {
        return await Notification.create({
            user: userId,
            title,
            message,
            type,
            link
        });
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

// Get notifications for user
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.status(200).json({
            success: true,
            count: notifications.length,
            data: { notifications }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Mark single notification as read
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        if (notification.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized action' });
        }
        notification.isRead = true;
        await notification.save();
        res.status(200).json({ success: true, data: { notification } });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, isRead: false },
            { isRead: true }
        );
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
