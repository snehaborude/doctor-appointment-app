import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Calendar, Clock, Search, ArrowUpDown, ChevronRight, Filter, AlertCircle, Heart } from 'lucide-react';
import './AppointmentHistory.css';
import { Link } from 'react-router-dom';
import { getAvatarUrl } from '../utils/imageHelper';

const statusStyles = {
    pending:   'bg-yellow-100 text-yellow-800 border border-yellow-200',
    approved:  'bg-green-100 text-green-800 border border-green-200',
    rejected:  'bg-red-100 text-red-800 border border-red-200',
    cancelled: 'bg-gray-100 text-gray-600 border border-gray-200',
    completed: 'bg-blue-100 text-blue-800 border border-blue-200',
};

const AppointmentHistory = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('desc'); // 'desc' = latest first, 'asc' = oldest first

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        setLoading(true);
        setError('');
        try {
            const endpoint = user.role === 'doctor' ? '/appointments/doctor' : '/appointments/patient';
            const { data } = await api.get(endpoint);
            setAppointments(data.data.appointments);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to retrieve appointments history.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' });

    // Filter and sort appointments
    const filteredAppointments = appointments
        .filter(app => {
            // Filter by status
            if (statusFilter !== 'all' && app.status !== statusFilter) return false;

            // Filter by search term
            const searchName = user.role === 'doctor' ? app.patient?.name : app.doctor?.name;
            if (searchTerm && !searchName?.toLowerCase().includes(searchTerm.toLowerCase())) return false;

            return true;
        })
        .sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return sortBy === 'desc' ? dateB - dateA : dateA - dateB;
        });

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 mb-8 text-white shadow-md flex items-center justify-between">
                    <div>
                        <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium">History Log</span>
                        <h1 className="text-2xl font-bold mt-2">Appointments Directory</h1>
                        <p className="text-teal-100 text-sm mt-1">Review all your previous and upcoming consultation details.</p>
                    </div>
                    <Heart size={60} className="opacity-20 hidden md:block animate-pulse" />
                </div>

                {/* Filters Board */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder={user.role === 'doctor' ? "Search patient name..." : "Search doctor name..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-teal-500"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-teal-500 bg-white"
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <ArrowUpDown size={16} className="text-gray-400" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-teal-500 bg-white"
                            >
                                <option value="desc">Latest First</option>
                                <option value="asc">Oldest First</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    {error && (
                        <div className="bg-red-50 border-b border-red-100 text-red-600 text-sm p-4 flex items-center gap-2">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex flex-col items-center py-24 text-gray-400 gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                            <p className="text-sm font-medium">Fetching history log...</p>
                        </div>
                    ) : filteredAppointments.length === 0 ? (
                        <div className="flex flex-col items-center py-20 text-gray-400 gap-2 text-center px-4">
                            <Calendar size={48} className="text-gray-300" />
                            <h3 className="font-semibold text-gray-700">No Appointments Found</h3>
                            <p className="text-sm max-w-xs leading-relaxed">Try adjusting your filters or search term to locate specific logs.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredAppointments.map((app) => {
                                const participant = user.role === 'doctor' ? app.patient : app.doctor;
                                const participantRole = user.role === 'doctor' ? 'Patient' : 'Doctor';
                                return (
                                    <Link
                                        key={app._id}
                                        to={`/appointments/${app._id}`}
                                        className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors no-underline group"
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <img
                                                src={getAvatarUrl(
                                                    participant?.avatar,
                                                    user.role === 'doctor' ? null : app.doctor?.specialization,
                                                    user.role === 'doctor' ? 'patient' : 'doctor'
                                                )}
                                                alt={participant?.name}
                                                className="w-11 h-11 rounded-full object-cover border border-gray-100 shadow-sm transition-transform group-hover:scale-105"
                                            />
                                            <div>
                                                <div className="font-semibold text-gray-800 text-sm group-hover:text-teal-600 transition-colors">
                                                    {user.role === 'doctor' ? '' : 'Dr. '}{participant?.name}
                                                </div>
                                                <div className="text-xs text-gray-400 font-medium">
                                                    {user.role === 'doctor' ? `Email: ${participant?.email}` : app.doctor?.specialization || 'General Physician'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:items-end gap-1 text-xs text-gray-500">
                                            <div className="flex items-center gap-1.5 font-medium text-gray-700">
                                                <Calendar size={13} /> {formatDate(app.date)}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={13} /> {app.timeSlot}
                                            </div>
                                        </div>

                                        {app.notes && (
                                            <div className="hidden lg:block text-xs text-gray-400 italic max-w-xs truncate px-4">
                                                "{app.notes}"
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize border ${statusStyles[app.status]}`}>
                                                {app.status}
                                            </span>
                                            <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppointmentHistory;
