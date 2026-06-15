import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Calendar as CalendarIcon, Clock, Trash2, Edit, Plus, X, AlertCircle, Save, Check } from 'lucide-react';
import './AvailabilityManagement.css';

// Helpers to convert times between 24h (UI) and 12h AM/PM (API)
const formatTime24to12 = (time24) => {
    if (!time24) return '';
    const [h, m] = time24.split(':');
    let hours = parseInt(h, 10);
    const minutes = parseInt(m, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    const strHours = hours < 10 ? '0' + hours : hours;
    return `${strHours}:${strMinutes} ${ampm}`;
};

const formatTime12to24 = (time12) => {
    if (!time12) return '';
    const match = time12.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return '';
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    const strHours = hours < 10 ? '0' + hours : hours;
    return `${strHours}:${minutes}`;
};

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC'
    });
};

const AvailabilityManagement = () => {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Add slot form state
    const [newSlot, setNewSlot] = useState({
        date: '',
        startTime: '09:00',
        endTime: '10:00'
    });

    // Edit slot state
    const [editingSlotId, setEditingSlotId] = useState(null);
    const [editForm, setEditForm] = useState({
        date: '',
        startTime: '',
        endTime: ''
    });

    useEffect(() => {
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await api.get('/doctors/availability');
            setSlots(data.data.slots);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch availability slots.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSlot = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setActionLoading(true);

        const startTime12 = formatTime24to12(newSlot.startTime);
        const endTime12 = formatTime24to12(newSlot.endTime);

        try {
            const { data } = await api.post('/doctors/availability', {
                date: newSlot.date,
                startTime: startTime12,
                endTime: endTime12
            });
            setSlots(prev => [...prev, data.data.slot].sort((a, b) => new Date(a.date) - new Date(b.date)));
            setSuccess('Availability slot added successfully.');
            setNewSlot({
                date: '',
                startTime: '09:00',
                endTime: '10:00'
            });
            fetchSlots(); // refetch to trigger correct sorting
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add availability slot.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleStartEdit = (slot) => {
        setEditingSlotId(slot._id);
        setEditForm({
            date: slot.date.split('T')[0],
            startTime: formatTime12to24(slot.startTime),
            endTime: formatTime12to24(slot.endTime)
        });
    };

    const handleCancelEdit = () => {
        setEditingSlotId(null);
    };

    const handleSaveEdit = async (id) => {
        setError('');
        setSuccess('');
        setActionLoading(true);

        const startTime12 = formatTime24to12(editForm.startTime);
        const endTime12 = formatTime24to12(editForm.endTime);

        try {
            await api.put(`/doctors/availability/${id}`, {
                date: editForm.date,
                startTime: startTime12,
                endTime: endTime12
            });
            setSuccess('Slot updated successfully.');
            setEditingSlotId(null);
            fetchSlots();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update slot.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteSlot = async (id) => {
        if (!window.confirm('Are you sure you want to delete this availability slot?')) return;
        setError('');
        setSuccess('');
        setActionLoading(true);

        try {
            await api.delete(`/doctors/availability/${id}`);
            setSlots(prev => prev.filter(s => s._id !== id));
            setSuccess('Slot deleted successfully.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete slot.');
        } finally {
            setActionLoading(false);
        }
    };

    // Group slots by date
    const groupedSlots = slots.reduce((acc, slot) => {
        const dStr = slot.date.split('T')[0];
        if (!acc[dStr]) acc[dStr] = [];
        acc[dStr].push(slot);
        return acc;
    }, {});

    const sortedDates = Object.keys(groupedSlots).sort();

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 mb-8 text-white shadow-md flex items-center justify-between">
                    <div>
                        <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium">Doctor Calendar</span>
                        <h1 className="text-2xl font-bold mt-2">Manage Availability Slots</h1>
                        <p className="text-teal-100 text-sm mt-1">Add, edit, or delete date-specific consultation slots for your patients.</p>
                    </div>
                    <CalendarIcon size={60} className="opacity-20 hidden md:block" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Slot Panel */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm h-fit">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Plus size={20} className="text-teal-600" /> Create Slot
                        </h2>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl mb-4 flex items-start gap-2">
                                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                <span>{typeof error === 'object' ? (error.message || JSON.stringify(error)) : error}</span>
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-50 border border-green-200 text-green-600 text-sm p-3 rounded-xl mb-4 flex items-start gap-2">
                                <Check size={16} className="mt-0.5 shrink-0" />
                                <span>{success}</span>
                            </div>
                        )}
                        <form onSubmit={handleAddSlot} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</label>
                                <input
                                    type="date"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    value={newSlot.date}
                                    onChange={e => setNewSlot(prev => ({ ...prev, date: e.target.value }))}
                                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Time</label>
                                    <input
                                        type="time"
                                        required
                                        value={newSlot.startTime}
                                        onChange={e => setNewSlot(prev => ({ ...prev, startTime: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">End Time</label>
                                    <input
                                        type="time"
                                        required
                                        value={newSlot.endTime}
                                        onChange={e => setNewSlot(prev => ({ ...prev, endTime: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={actionLoading}
                                className="w-full py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 mt-2 cursor-pointer border-0 shadow-sm"
                            >
                                {actionLoading ? 'Creating...' : 'Create Availability'}
                            </button>
                        </form>
                    </div>

                    {/* Slots List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-800">Your Availability Schedule</h2>
                                <span className="text-xs bg-teal-100 text-teal-800 px-3 py-1 rounded-full font-semibold">
                                    {slots.length} Total Slots
                                </span>
                            </div>

                            {loading ? (
                                <div className="flex flex-col items-center py-20 text-gray-400 gap-3">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                                    <p className="text-sm font-medium">Loading slots...</p>
                                </div>
                            ) : slots.length === 0 ? (
                                <div className="flex flex-col items-center py-20 text-gray-400 gap-3 text-center px-4">
                                    <Clock size={48} className="text-gray-300" />
                                    <h3 className="font-semibold text-gray-700">No Slots Defined</h3>
                                    <p className="text-sm max-w-xs leading-relaxed">Create availability slots on the left panel so patients can book appointments with you.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                                    {sortedDates.map(dateKey => (
                                        <div key={dateKey} className="p-6">
                                            <h3 className="font-bold text-teal-700 text-sm mb-3 flex items-center gap-1.5">
                                                <CalendarIcon size={15} /> {formatDate(dateKey)}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {groupedSlots[dateKey].map((slot) => {
                                                    const isEditing = editingSlotId === slot._id;
                                                    return (
                                                        <div
                                                            key={slot._id}
                                                            className={`border rounded-xl p-3.5 flex flex-col justify-between transition-all ${
                                                                slot.isBooked
                                                                    ? 'bg-red-50/30 border-red-100 shadow-sm'
                                                                    : isEditing
                                                                    ? 'bg-teal-50/30 border-teal-300 ring-1 ring-teal-300'
                                                                    : 'bg-white border-gray-200 hover:shadow-sm'
                                                            }`}
                                                        >
                                                            {isEditing ? (
                                                                <div className="flex flex-col gap-3">
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <div className="flex flex-col gap-0.5">
                                                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Start</span>
                                                                            <input
                                                                                type="time"
                                                                                value={editForm.startTime}
                                                                                onChange={e => setEditForm(prev => ({ ...prev, startTime: e.target.value }))}
                                                                                className="px-2 py-1 border border-gray-300 rounded-lg text-xs"
                                                                            />
                                                                        </div>
                                                                        <div className="flex flex-col gap-0.5">
                                                                            <span className="text-[10px] font-bold text-gray-400 uppercase">End</span>
                                                                            <input
                                                                                type="time"
                                                                                value={editForm.endTime}
                                                                                onChange={e => setEditForm(prev => ({ ...prev, endTime: e.target.value }))}
                                                                                className="px-2 py-1 border border-gray-300 rounded-lg text-xs"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex gap-2 justify-end mt-1">
                                                                        <button
                                                                            onClick={handleCancelEdit}
                                                                            className="px-2.5 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer bg-white text-gray-600"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleSaveEdit(slot._id)}
                                                                            disabled={actionLoading}
                                                                            className="px-2.5 py-1 text-xs bg-teal-600 text-white rounded-lg hover:bg-teal-700 cursor-pointer border-0 flex items-center gap-1"
                                                                        >
                                                                            <Save size={12} /> Save
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center justify-between w-full">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`p-2 rounded-lg ${slot.isBooked ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                                                            <Clock size={16} />
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-sm font-semibold text-gray-800">
                                                                                {slot.startTime} - {slot.endTime}
                                                                            </div>
                                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                                                <span className={`w-2 h-2 rounded-full ${slot.isBooked ? 'bg-red-500' : 'bg-green-500'}`} />
                                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                                                                    {slot.isBooked ? 'Booked' : 'Available'}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {!slot.isBooked && (
                                                                        <div className="flex items-center gap-1">
                                                                            <button
                                                                                onClick={() => handleStartEdit(slot)}
                                                                                title="Edit Slot"
                                                                                className="p-1.5 rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-colors border-0 bg-transparent cursor-pointer"
                                                                            >
                                                                                <Edit size={14} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDeleteSlot(slot._id)}
                                                                                title="Delete Slot"
                                                                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors border-0 bg-transparent cursor-pointer"
                                                                            >
                                                                                <Trash2 size={14} />
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AvailabilityManagement;
