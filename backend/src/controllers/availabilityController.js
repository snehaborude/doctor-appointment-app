const AvailabilitySlot = require('../models/AvailabilitySlot');

// Helper to convert time "09:00 AM", "14:30", etc. to minutes from midnight
const timeToMinutes = (timeStr) => {
    if (!timeStr) return null;
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3];

    if (ampm) {
        const ampmUpper = ampm.toUpperCase();
        if (ampmUpper === 'PM' && hours < 12) hours += 12;
        if (ampmUpper === 'AM' && hours === 12) hours = 0;
    }
    return hours * 60 + minutes;
};

// Normalize date to UTC midnight
const normalizeDate = (dateVal) => {
    if (!dateVal) return null;
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return null;
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

// Add an availability slot
exports.addSlot = async (req, res) => {
    try {
        const { date, startTime, endTime } = req.body;

        if (!date || !startTime || !endTime) {
            return res.status(400).json({ success: false, message: 'Please provide date, startTime, and endTime' });
        }

        const startMinutes = timeToMinutes(startTime);
        const endMinutes = timeToMinutes(endTime);

        if (startMinutes === null || endMinutes === null) {
            return res.status(400).json({ success: false, message: 'Invalid time format' });
        }

        if (startMinutes >= endMinutes) {
            return res.status(400).json({ success: false, message: 'Start time must be before end time' });
        }

        const normalizedDate = normalizeDate(date);
        if (!normalizedDate) {
            return res.status(400).json({ success: false, message: 'Invalid date format' });
        }

        // Check for duplicates/overlaps
        const existingSlots = await AvailabilitySlot.find({
            doctor: req.user._id,
            date: normalizedDate,
        });

        const hasOverlap = existingSlots.some(slot => {
            const slotStart = timeToMinutes(slot.startTime);
            const slotEnd = timeToMinutes(slot.endTime);
            return startMinutes < slotEnd && slotStart < endMinutes;
        });

        if (hasOverlap) {
            return res.status(400).json({
                success: false,
                message: 'This slot overlaps with an existing availability slot.',
            });
        }

        const slot = await AvailabilitySlot.create({
            doctor: req.user._id,
            date: normalizedDate,
            startTime,
            endTime,
        });

        res.status(201).json({ success: true, data: { slot } });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Edit an availability slot
exports.editSlot = async (req, res) => {
    try {
        const { date, startTime, endTime } = req.body;
        const slot = await AvailabilitySlot.findById(req.params.id);

        if (!slot) {
            return res.status(404).json({ success: false, message: 'Slot not found' });
        }

        if (slot.doctor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized action' });
        }

        if (slot.isBooked) {
            return res.status(400).json({ success: false, message: 'Cannot edit a slot that has already been booked' });
        }

        const startMinutes = timeToMinutes(startTime || slot.startTime);
        const endMinutes = timeToMinutes(endTime || slot.endTime);

        if (startMinutes === null || endMinutes === null) {
            return res.status(400).json({ success: false, message: 'Invalid time format' });
        }

        if (startMinutes >= endMinutes) {
            return res.status(400).json({ success: false, message: 'Start time must be before end time' });
        }

        const targetDate = date ? normalizeDate(date) : slot.date;

        // Check overlaps with other slots
        const existingSlots = await AvailabilitySlot.find({
            doctor: req.user._id,
            date: targetDate,
            _id: { $ne: slot._id },
        });

        const hasOverlap = existingSlots.some(s => {
            const slotStart = timeToMinutes(s.startTime);
            const slotEnd = timeToMinutes(s.endTime);
            return startMinutes < slotEnd && slotStart < endMinutes;
        });

        if (hasOverlap) {
            return res.status(400).json({
                success: false,
                message: 'This slot overlaps with another availability slot.',
            });
        }

        slot.date = targetDate;
        slot.startTime = startTime || slot.startTime;
        slot.endTime = endTime || slot.endTime;

        await slot.save();

        res.status(200).json({ success: true, data: { slot } });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Delete an availability slot
exports.deleteSlot = async (req, res) => {
    try {
        const slot = await AvailabilitySlot.findById(req.params.id);

        if (!slot) {
            return res.status(404).json({ success: false, message: 'Slot not found' });
        }

        if (slot.doctor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized action' });
        }

        if (slot.isBooked) {
            return res.status(400).json({ success: false, message: 'Cannot delete a booked slot. Please cancel the associated appointment first.' });
        }

        await AvailabilitySlot.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: 'Slot deleted successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get all slots for a doctor
exports.getDoctorSlots = async (req, res) => {
    try {
        const slots = await AvailabilitySlot.find({ doctor: req.user._id });

        // Sort in JS
        slots.sort((a, b) => {
            const dateDiff = new Date(a.date) - new Date(b.date);
            if (dateDiff !== 0) return dateDiff;
            return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
        });

        res.status(200).json({ success: true, count: slots.length, data: { slots } });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get available slots for a specific doctor (Patient flow)
exports.getAvailableSlots = async (req, res) => {
    try {
        const { date } = req.query;
        const query = {
            doctor: req.params.doctorId,
            isBooked: false,
        };

        if (date) {
            const normalizedDate = normalizeDate(date);
            if (normalizedDate) {
                query.date = normalizedDate;
            }
        }

        const slots = await AvailabilitySlot.find(query);

        // Sort in JS
        slots.sort((a, b) => {
            const dateDiff = new Date(a.date) - new Date(b.date);
            if (dateDiff !== 0) return dateDiff;
            return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
        });

        res.status(200).json({ success: true, count: slots.length, data: { slots } });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
