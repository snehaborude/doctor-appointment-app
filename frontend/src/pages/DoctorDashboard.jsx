import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Calendar, Clock, Check, X, CheckSquare, PlusCircle, Settings, Users, Sparkles } from 'lucide-react';
import './Dashboard.css';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DoctorDashboard = () => {
  const { user } = useAuth();
  
  // States
  const [appointments, setAppointments] = useState([]);
  const [loadingApp, setLoadingApp] = useState(true);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  // Profile Form States
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState(0);
  const [fees, setFees] = useState(0);
  const [bio, setBio] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  
  // Dashboard Stats
  const [stats, setStats] = useState({ bookings: 0, pending: 0, earnings: 0 });

  useEffect(() => {
    fetchProfile();
    fetchAppointments();
  }, []);

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const { data } = await api.get(`/doctors/${user._id}`);
      const prof = data.data.profile;
      if (prof && prof.specialization) {
        setProfile(prof);
        setSpecialization(prof.specialization);
        setExperience(prof.experience);
        setFees(prof.fees);
        setBio(prof.bio);
        setSelectedDays(prof.availability?.map(a => a.day) || []);
      }
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchAppointments = async () => {
    setLoadingApp(true);
    try {
      const { data } = await api.get('/appointments/doctor');
      const list = data.data.appointments;
      setAppointments(list);
      
      // Calculate Stats
      const bookings = list.length;
      const pending = list.filter(a => a.status === 'pending').length;
      
      // Calculate earnings from completed appointments
      const completedCount = list.filter(a => a.status === 'completed').length;
      // Fetch fee from profile or fallback to 0
      const currentFees = fees || profile?.fees || 0;
      const earnings = completedCount * currentFees;
      
      setStats({ bookings, pending, earnings });
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoadingApp(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      fetchAppointments();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update appointment status.');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMessage({ type: '', text: '' });

    // Map selected days to availability structure
    const availability = selectedDays.map(day => ({
      day,
      slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM']
    }));

    try {
      const { data } = await api.put('/doctors/profile', {
        specialization,
        experience: Number(experience),
        fees: Number(fees),
        bio,
        availability
      });
      setProfile(data.data.profile);
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
      // Update stats earnings
      fetchAppointments();
    } catch (error) {
      setProfileMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile.' 
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDayToggle = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="dashboardWrapper">
      {/* Welcome Banner */}
      <div className="welcomeBanner doctor">
        <div className="bannerContent">
          <span className="welcomeLabel">Doctor Practice Portal</span>
          <h1>Welcome, Dr. {user?.name}!</h1>
          <p>Configure your specialties, manage appointments, and review your practice performance.</p>
        </div>
        <div className="bannerDecor">
          <Sparkles size={120} className="decorHeart" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="statsGrid">
        <div className="dashboardStatCard">
          <div className="statIcon total">
            <Users size={24} />
          </div>
          <div className="statInfo">
            <h3>Total Bookings</h3>
            <p className="statValue">{stats.bookings}</p>
          </div>
        </div>

        <div className="dashboardStatCard">
          <div className="statIcon pending">
            <Clock size={24} />
          </div>
          <div className="statInfo">
            <h3>Pending Actions</h3>
            <p className="statValue">{stats.pending}</p>
          </div>
        </div>

        <div className="dashboardStatCard">
          <div className="statIcon approved">
            <span>$</span>
          </div>
          <div className="statInfo">
            <h3>Estimated Earnings</h3>
            <p className="statValue">${stats.earnings}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Appointments on left, Profile setup on right */}
      <div className="doctorDashboardGrid">
        
        {/* Left column: Appointments list */}
        <div className="appointmentsContainer">
          <div className="sectionHeader">
            <h2>Patient Schedule</h2>
            <span className="countBadge">{appointments.length} Consultations</span>
          </div>

          {loadingApp ? (
            <div className="loadingContainer">
              <div className="spinner"></div>
              <p>Fetching schedule...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="emptyDashboardState">
              <Calendar size={48} className="emptyIcon" />
              <h3>No Appointments Booked</h3>
              <p>You don't have any booked appointments yet. Keep your profile updated so patients can find you.</p>
            </div>
          ) : (
            <div className="appointmentsGrid">
              {appointments.map((app) => (
                <div key={app._id} className="appointmentRowCard">
                  <div className="appCardMain">
                    <div className="patientAvatarSmall">
                      {app.patient?.name?.[0] || 'P'}
                    </div>
                    <div className="appMetaDetails">
                      <h4 className="appDoctorName">{app.patient?.name}</h4>
                      <span className="appDoctorSpecialty">{app.patient?.email}</span>
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
                      <strong>Reason for Visit:</strong> {app.notes}
                    </div>
                  )}

                  <div className="appCardStatusActions flex-wrap">
                    <span className={`badge badge-${app.status}`}>
                      {app.status}
                    </span>
                    
                    {app.status === 'pending' && (
                      <div className="actionButtonsGroup">
                        <button
                          onClick={() => handleUpdateStatus(app._id, 'approved')}
                          className="approveBtn"
                          title="Approve"
                        >
                          <Check size={16} /> Approve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(app._id, 'rejected')}
                          className="rejectBtn"
                          title="Reject"
                        >
                          <X size={16} /> Reject
                        </button>
                      </div>
                    )}

                    {app.status === 'approved' && (
                      <button
                        onClick={() => handleUpdateStatus(app._id, 'completed')}
                        className="completeBtn"
                        title="Mark Completed"
                      >
                        <CheckSquare size={16} /> Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Profile details */}
        <div className="profileSetupContainer">
          <div className="profileSetupCard">
            <div className="profileCardHeader">
              <Settings size={22} className="text-[#4361ee]" />
              <h2>Practice Settings</h2>
            </div>
            
            {!profile && !loadingProfile && (
              <div className="profileWarningAlert">
                <PlusCircle size={20} />
                <p>Please complete your practice profile settings so patients can see and book you in the directory.</p>
              </div>
            )}

            {loadingProfile ? (
              <div className="loadingContainer py-12">
                <div className="spinner"></div>
              </div>
            ) : (
              <form onSubmit={handleProfileSubmit}>
                {profileMessage.text && (
                  <div className={`profileAlert ${profileMessage.type}`}>
                    {profileMessage.text}
                  </div>
                )}

                <div className="input-group">
                  <label className="input-label">Specialization</label>
                  <select
                    className="input-field appearance-none"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    required
                  >
                    <option value="">Select Specialization</option>
                    <option value="General Physician">General Physician</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Orthopedics">Orthopedics</option>
                  </select>
                </div>

                <div className="formRow">
                  <div className="input-group flex-1">
                    <label className="input-label">Experience (Years)</label>
                    <input
                      type="number"
                      min="0"
                      className="input-field"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-group flex-1">
                    <label className="input-label">Consultation Fee ($)</label>
                    <input
                      type="number"
                      min="0"
                      className="input-field"
                      value={fees}
                      onChange={(e) => setFees(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Professional Bio</label>
                  <textarea
                    className="input-field min-h-[100px] py-2"
                    placeholder="Describe your qualifications, history, and approach to care..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Available Days</label>
                  <div className="daysSelectGrid">
                    {DAYS_OF_WEEK.map((day) => {
                      const isSelected = selectedDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          className={`dayToggleBtn ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleDayToggle(day)}
                        >
                          {day.substring(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="saveProfileBtn"
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? 'Saving Settings...' : 'Save Profile Settings'}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DoctorDashboard;
