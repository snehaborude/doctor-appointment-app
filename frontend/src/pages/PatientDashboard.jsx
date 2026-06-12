import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Calendar, Clock, XCircle, Heart, User, CheckCircle2, AlertCircle } from 'lucide-react';
import './Dashboard.css';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0 });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/appointments/patient');
      const list = data.data.appointments;
      setAppointments(list);
      
      // Calculate Stats
      const total = list.length;
      const approved = list.filter(a => a.status === 'approved').length;
      const pending = list.filter(a => a.status === 'pending').length;
      setStats({ total, approved, pending });
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
      // Refresh list
      fetchAppointments();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel appointment.');
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="dashboardWrapper">
      {/* Welcome Banner */}
      <div className="welcomeBanner">
        <div className="bannerContent">
          <span className="welcomeLabel">Patient Space</span>
          <h1>Hello, {user?.name}!</h1>
          <p>Manage your upcoming doctor consultations and view your health stats in one place.</p>
        </div>
        <div className="bannerDecor">
          <Heart size={120} className="decorHeart" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="statsGrid">
        <div className="dashboardStatCard">
          <div className="statIcon total">
            <Calendar size={24} />
          </div>
          <div className="statInfo">
            <h3>Total Bookings</h3>
            <p className="statValue">{stats.total}</p>
          </div>
        </div>
        
        <div className="dashboardStatCard">
          <div className="statIcon approved">
            <CheckCircle2 size={24} />
          </div>
          <div className="statInfo">
            <h3>Approved</h3>
            <p className="statValue">{stats.approved}</p>
          </div>
        </div>

        <div className="dashboardStatCard">
          <div className="statIcon pending">
            <AlertCircle size={24} />
          </div>
          <div className="statInfo">
            <h3>Pending Review</h3>
            <p className="statValue">{stats.pending}</p>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="appointmentsContainer">
        <div className="sectionHeader">
          <h2>Your Appointments</h2>
          <span className="countBadge">{appointments.length} Scheduled</span>
        </div>

        {loading ? (
          <div className="loadingContainer">
            <div className="spinner"></div>
            <p>Fetching appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="emptyDashboardState">
            <Calendar size={48} className="emptyIcon" />
            <h3>No Appointments Found</h3>
            <p>You haven't scheduled any consultations yet. Start by searching for a doctor!</p>
          </div>
        ) : (
          <div className="appointmentsGrid">
            {appointments.map((app) => (
              <div key={app._id} className="appointmentRowCard">
                <div className="appCardMain">
                  <div className="docAvatarSmall">
                    <User size={24} />
                  </div>
                  <div className="appMetaDetails">
                    <h4 className="appDoctorName">Dr. {app.doctor?.name}</h4>
                    <span className="appDoctorSpecialty">{app.doctor?.specialization}</span>
                  </div>
                </div>

                <div className="appCardTime">
                  <div className="timeDetail">
                    <Calendar size={16} />
                    <span>{formatDate(app.date)}</span>
                  </div>
                  <div className="timeDetail">
                    <Clock size={16} />
                    <span>{app.timeSlot}</span>
                  </div>
                </div>

                {app.notes && (
                  <div className="appNotes">
                    <strong>Symptoms / Notes:</strong> {app.notes}
                  </div>
                )}

                <div className="appCardStatusActions">
                  <span className={`badge badge-${app.status}`}>
                    {app.status}
                  </span>
                  
                  {['pending', 'approved'].includes(app.status) && (
                    <button
                      onClick={() => handleCancelAppointment(app._id)}
                      className="cancelAppBtn"
                      title="Cancel Consultation"
                    >
                      <XCircle size={18} /> Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
