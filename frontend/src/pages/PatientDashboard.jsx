import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Calendar, Clock, XCircle, Heart, User, CheckCircle2, AlertCircle } from 'lucide-react';
import './PatientDashboard.css';
import { getAvatarUrl } from '../utils/imageHelper';

const statusStyles = {
  pending:   'bg-yellow-100 text-yellow-800 border border-yellow-300',
  approved:  'bg-green-100 text-green-800 border border-green-300',
  rejected:  'bg-red-100 text-red-800 border border-red-300',
  cancelled: 'bg-gray-100 text-gray-600 border border-gray-300',
  completed: 'bg-blue-100 text-blue-800 border border-blue-300',
};

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0 });

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/appointments/patient');
      const list = data.data.appointments;
      setAppointments(list);
      setStats({
        total: list.length,
        approved: list.filter(a => a.status === 'approved').length,
        pending: list.filter(a => a.status === 'pending').length,
      });
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.patch(`/appointments/${id}/status`, { status: 'cancelled' });
      fetchAppointments();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel appointment.');
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Welcome Banner */}
        <div className="bg-teal-600 rounded-2xl p-6 mb-6 flex items-center justify-between text-white">
          <div>
            <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium">Patient Space</span>
            <h1 className="text-2xl font-bold mt-2">Hello, {user?.name}!</h1>
            <p className="text-teal-100 text-sm mt-1">Manage your upcoming doctor consultations.</p>
          </div>
          <Heart size={70} className="opacity-20 hidden sm:block" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { icon: <Calendar size={20} />, label: 'Total Bookings', value: stats.total, color: 'text-teal-600 bg-teal-100' },
            { icon: <CheckCircle2 size={20} />, label: 'Approved', value: stats.approved, color: 'text-green-600 bg-green-100' },
            { icon: <AlertCircle size={20} />, label: 'Pending', value: stats.pending, color: 'text-yellow-600 bg-yellow-100' },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>{s.icon}</div>
              <div>
                <div className="text-xs text-gray-500">{s.label}</div>
                <div className="text-xl font-bold text-gray-800">{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Appointments */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">Your Appointments</h2>
            <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
              {appointments.length} Scheduled
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center py-16 text-gray-400 gap-3">
              <div className="spinner" />
              <p className="text-sm">Fetching appointments...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-gray-400 gap-2">
              <Calendar size={44} />
              <h3 className="font-semibold">No Appointments Found</h3>
              <p className="text-sm">Search for a doctor to book your first consultation.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {appointments.map((app) => (
                <div key={app._id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Doctor info */}
                  <div className="flex items-center gap-3 flex-1">
                    <img 
                      src={getAvatarUrl(app.doctor?.avatar, app.doctor?.specialization, 'doctor')} 
                      alt={app.doctor?.name} 
                      className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm" 
                    />
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">Dr. {app.doctor?.name}</div>
                      <div className="text-xs text-gray-400">{app.doctor?.specialization}</div>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="flex flex-col gap-1 text-xs text-gray-500">
                    <div className="flex items-center gap-1"><Calendar size={12} /> {formatDate(app.date)}</div>
                    <div className="flex items-center gap-1"><Clock size={12} /> {app.timeSlot}</div>
                  </div>

                  {/* Notes */}
                  {app.notes && (
                    <div className="text-xs text-gray-400 italic max-w-xs truncate">"{app.notes}"</div>
                  )}

                  {/* Status & Action */}
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusStyles[app.status] || ''}`}>
                      {app.status}
                    </span>
                    {['pending', 'approved'].includes(app.status) && (
                      <button
                        onClick={() => handleCancelAppointment(app._id)}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 border border-red-200 hover:bg-red-50 px-2.5 py-1 rounded-full transition-colors cursor-pointer bg-transparent"
                      >
                        <XCircle size={13} /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
