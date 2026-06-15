import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './PrescriptionHistory.css';
import { FileText, Search, ArrowUpDown, ChevronRight, Calendar, Heart, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAvatarUrl } from '../utils/imageHelper';

const PrescriptionHistory = () => {
    const { user } = useAuth();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('desc'); // 'desc' = latest, 'asc' = oldest

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const fetchPrescriptions = async () => {
        setLoading(true);
        setError('');
        try {
            const endpoint = user.role === 'doctor' ? '/prescriptions/doctor' : '/prescriptions/patient';
            const { data } = await api.get(endpoint);
            setPrescriptions(data.data.prescriptions);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch prescription history.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

    const filteredPrescriptions = prescriptions
        .filter(presc => {
            const searchName = user.role === 'doctor' ? presc.patient?.name : presc.doctor?.name;
            if (searchTerm && !searchName?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            return true;
        })
        .sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return sortBy === 'desc' ? dateB - dateA : dateA - dateB;
        });

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 mb-8 text-white shadow-md flex items-center justify-between">
                    <div>
                        <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium">Medical Files</span>
                        <h1 className="text-2xl font-bold mt-2">Prescription Records</h1>
                        <p className="text-teal-100 text-sm mt-1">Access and review all prescriptions issued during your clinical consultations.</p>
                    </div>
                    <FileText size={60} className="opacity-20 hidden md:block" />
                </div>

                {/* Filters */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

                    <div className="flex items-center gap-2">
                        <ArrowUpDown size={16} className="text-gray-400" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-teal-500 bg-white"
                        >
                            <option value="desc">Latest Issued</option>
                            <option value="asc">Oldest Issued</option>
                        </select>
                    </div>
                </div>

                {/* List */}
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
                            <p className="text-sm font-medium">Fetching medical files...</p>
                        </div>
                    ) : filteredPrescriptions.length === 0 ? (
                        <div className="flex flex-col items-center py-20 text-gray-400 gap-2 text-center px-4">
                            <FileText size={48} className="text-gray-300" />
                            <h3 className="font-semibold text-gray-700">No Prescriptions Found</h3>
                            <p className="text-sm max-w-xs leading-relaxed">You do not have any saved prescription records currently.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredPrescriptions.map((presc) => {
                                const participant = user.role === 'doctor' ? presc.patient : presc.doctor;
                                return (
                                    <Link
                                        key={presc._id}
                                        to={`/prescriptions/${presc._id}`}
                                        className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors no-underline group"
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <img
                                                src={getAvatarUrl(
                                                    participant?.avatar,
                                                    user.role === 'doctor' ? null : presc.doctor?.specialization,
                                                    user.role === 'doctor' ? 'patient' : 'doctor'
                                                )}
                                                alt={participant?.name}
                                                className="w-11 h-11 rounded-full object-cover border border-gray-100 shadow-sm transition-transform group-hover:scale-105"
                                            />
                                            <div>
                                                <div className="font-semibold text-gray-800 text-sm group-hover:text-teal-600 transition-colors">
                                                    {user.role === 'doctor' ? '' : 'Dr. '}{participant?.name}
                                                </div>
                                                <div className="text-xs text-teal-600 font-medium">
                                                    {user.role === 'doctor' ? 'Diagnosis:' : presc.doctor?.specialization || 'General Physician'}
                                                </div>
                                                <div className="text-xs text-gray-800 font-semibold mt-0.5 max-w-sm truncate">
                                                    {presc.diagnosis}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:items-end gap-1 text-xs text-gray-500">
                                            <div className="flex items-center gap-1.5 font-medium text-gray-700">
                                                <Calendar size={13} /> Issued: {formatDate(presc.createdAt)}
                                            </div>
                                            <div className="text-[11px] text-gray-400">
                                                Medicines count: {presc.medications?.length || 0}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
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

export default PrescriptionHistory;
