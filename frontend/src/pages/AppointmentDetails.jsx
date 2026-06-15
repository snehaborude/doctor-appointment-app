import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './AppointmentDetails.css';
import { Calendar, Clock, ChevronLeft, AlertCircle, FileText, CheckSquare, Heart, Check, X, Ban, Sparkles } from 'lucide-react';
import { getAvatarUrl } from '../utils/imageHelper';

const statusStyles = {
    pending:   'bg-yellow-100 text-yellow-800 border border-yellow-300',
    approved:  'bg-green-100 text-green-800 border border-green-300',
    rejected:  'bg-red-100 text-red-800 border border-red-300',
    cancelled: 'bg-gray-100 text-gray-600 border border-gray-300',
    completed: 'bg-blue-100 text-blue-800 border border-blue-300',
};

const AppointmentDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [appointment, setAppointment] = useState(null);
    const [prescription, setPrescription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await api.get(`/appointments/${id}`);
            setAppointment(data.data.appointment);
            
            // If completed, check if prescription exists
            if (data.data.appointment.status === 'completed') {
                try {
                    const prescRes = await api.get(`/prescriptions/appointment/${id}`);
                    setPrescription(prescRes.data.data.prescription);
                } catch (prescErr) {
                    // 404 is normal if no prescription is written yet
                    if (prescErr.response?.status !== 404) {
                        console.error('Error fetching prescription:', prescErr);
                    }
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch appointment details.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (status) => {
        if (!window.confirm(`Are you sure you want to change this appointment status to ${status}?`)) return;
        setError('');
        setActionLoading(true);
        try {
            await api.patch(`/appointments/${id}/status`, { status });
            fetchDetails();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update appointment status.');
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-500 gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                <p className="text-sm font-medium">Loading details...</p>
            </div>
        );
    }

    if (error && !appointment) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
                <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-center">
                    <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-lg font-bold text-gray-800 mb-2">Error Occurred</h2>
                    <p className="text-gray-500 text-sm mb-6">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-xl text-sm hover:bg-teal-700 transition-colors border-0 cursor-pointer"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const participant = user.role === 'doctor' ? appointment.patient : appointment.doctor;
    const participantRole = user.role === 'doctor' ? 'Patient' : 'Doctor';

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">
                {/* Back Link */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-teal-600 transition-colors mb-6 border-0 bg-transparent cursor-pointer"
                >
                    <ChevronLeft size={16} /> Back to Directory
                </button>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl mb-6 flex items-start gap-2">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden mb-6">
                    {/* Header Banner */}
                    <div className="bg-gradient-to-r from-teal-50 to-white px-8 py-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest block mb-1">Appointment Details</span>
                            <h1 className="text-xl font-bold text-gray-800">Consultation Overview</h1>
                        </div>
                        <span className={`self-start sm:self-center text-xs px-3 py-1.5 rounded-full font-semibold capitalize border ${statusStyles[appointment.status]}`}>
                            {appointment.status}
                        </span>
                    </div>

                    <div className="p-8 space-y-6">
                        {/* Participant info */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-6 bg-gray-50/50 p-4 border border-gray-100 rounded-2xl">
                            <img
                                src={getAvatarUrl(
                                    participant?.avatar,
                                    user.role === 'doctor' ? null : appointment.doctor?.specialization,
                                    user.role === 'doctor' ? 'patient' : 'doctor'
                                )}
                                alt={participant?.name}
                                className="w-16 h-16 rounded-2xl object-cover border border-white shadow-sm"
                            />
                            <div className="flex-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{participantRole} Information</span>
                                <h3 className="text-lg font-bold text-gray-800 mt-0.5">
                                    {user.role === 'doctor' ? '' : 'Dr. '}{participant?.name}
                                </h3>
                                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                    {user.role === 'doctor'
                                        ? `Contact details: ${participant?.email}`
                                        : `${appointment.doctor?.specialization || 'General Physician'} | Experience: ${appointment.doctor?.experience || 0} years`
                                    }
                                </p>
                            </div>
                            {!appointment.doctor?.fees ? null : (
                                <div className="text-right sm:border-l sm:border-gray-200 sm:pl-6">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">Consultation Fee</span>
                                    <span className="text-xl font-bold text-teal-600">${appointment.doctor.fees}</span>
                                </div>
                            )}
                        </div>

                        {/* Date & Time Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="border border-gray-100 p-4 rounded-2xl flex items-center gap-3.5 hover:border-teal-500/20 transition-all">
                                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">Scheduled Date</span>
                                    <span className="text-sm font-semibold text-gray-800">{formatDate(appointment.date)}</span>
                                </div>
                            </div>

                            <div className="border border-gray-100 p-4 rounded-2xl flex items-center gap-3.5 hover:border-teal-500/20 transition-all">
                                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">Scheduled Hours</span>
                                    <span className="text-sm font-semibold text-gray-800">{appointment.timeSlot}</span>
                                </div>
                            </div>
                        </div>

                        {/* Symptoms / Notes */}
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-2">Patient Diagnosis / Notes</span>
                            <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm text-gray-600 leading-relaxed min-h-[70px] italic">
                                {appointment.notes ? `"${appointment.notes}"` : 'No symptom notes provided by the patient.'}
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-4 items-center justify-between">
                            {/* Actions for doctor */}
                            {user.role === 'doctor' && (
                                <div className="flex flex-wrap gap-2.5">
                                    {appointment.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleUpdateStatus('approved')}
                                                disabled={actionLoading}
                                                className="px-5 py-2.5 bg-teal-600 text-white font-semibold rounded-xl text-xs hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center gap-1.5 border-0 cursor-pointer shadow-sm shadow-teal-500/10"
                                            >
                                                <Check size={14} /> Approve Request
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus('rejected')}
                                                disabled={actionLoading}
                                                className="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-xl text-xs hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-1.5 border-0 cursor-pointer shadow-sm shadow-red-500/10"
                                            >
                                                <X size={14} /> Reject Request
                                            </button>
                                        </>
                                    )}

                                    {appointment.status === 'approved' && (
                                        <button
                                            onClick={() => handleUpdateStatus('completed')}
                                            disabled={actionLoading}
                                            className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-xs hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1.5 border-0 cursor-pointer shadow-sm shadow-blue-500/10"
                                        >
                                            <CheckSquare size={14} /> Complete Consultation
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Actions for patient (cancellation) */}
                            {user.role === 'patient' && ['pending', 'approved'].includes(appointment.status) && (
                                <button
                                    onClick={() => handleUpdateStatus('cancelled')}
                                    disabled={actionLoading}
                                    className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 font-semibold rounded-xl text-xs hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Ban size={14} /> Cancel Appointment
                                </button>
                            )}

                            {/* Prescription Links */}
                            {appointment.status === 'completed' && (
                                <div className="flex gap-3">
                                    {prescription ? (
                                        <Link
                                            to={`/prescriptions/${prescription._id}`}
                                            className="px-5 py-2.5 bg-teal-50 text-teal-700 border border-teal-200 font-semibold rounded-xl text-xs hover:bg-teal-100 transition-colors flex items-center gap-1.5 no-underline"
                                        >
                                            <FileText size={14} /> View Prescription
                                        </Link>
                                    ) : (
                                        user.role === 'doctor' && (
                                            <Link
                                                to={`/prescriptions/new/${appointment._id}`}
                                                className="px-5 py-2.5 bg-teal-600 text-white font-semibold rounded-xl text-xs hover:bg-teal-700 transition-colors flex items-center gap-1.5 no-underline shadow-sm border-0"
                                            >
                                                <Sparkles size={14} /> Write Prescription
                                            </Link>
                                        )
                                    )}
                                    {prescription && user.role === 'doctor' && (
                                        <Link
                                            to={`/prescriptions/edit/${prescription._id}`}
                                            className="px-5 py-2.5 bg-slate-800 text-white font-semibold rounded-xl text-xs hover:bg-slate-900 transition-colors flex items-center gap-1.5 no-underline shadow-sm border-0"
                                        >
                                            Edit Prescription
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentDetails;
