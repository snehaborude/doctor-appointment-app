import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Calendar, Clock, Check, X, CheckSquare, PlusCircle, Settings, Users, Sparkles, FileText, Upload, Trash2, Plus, Eye, Paperclip } from 'lucide-react';
import './DoctorDashboard.css';
import { getAvatarUrl } from '../utils/imageHelper';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const statusStyles = {
  pending:   'bg-yellow-100 text-yellow-800 border border-yellow-300',
  approved:  'bg-green-100 text-green-800 border border-green-300',
  rejected:  'bg-red-100 text-red-800 border border-red-300',
  cancelled: 'bg-gray-100 text-gray-600 border border-gray-300',
  completed: 'bg-teal-100 text-teal-800 border border-teal-300',
};

const DoctorDashboard = () => {
  const { user, updateUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loadingApp, setLoadingApp] = useState(true);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState(0);
  const [fees, setFees] = useState(0);
  const [bio, setBio] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [stats, setStats] = useState({ bookings: 0, pending: 0, earnings: 0 });
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Prescription modal state
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionAppointment, setPrescriptionAppointment] = useState(null);
  const [prescriptionForm, setPrescriptionForm] = useState({
    diagnosis: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    labTests: [''],
    followUpDate: '',
    notes: '',
  });
  const [prescriptionAttachments, setPrescriptionAttachments] = useState([]);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [isSavingPrescription, setIsSavingPrescription] = useState(false);
  const [prescriptionError, setPrescriptionError] = useState('');
  const [prescriptionMap, setPrescriptionMap] = useState({}); // appointmentId -> prescription

  // View prescription state
  const [viewPrescription, setViewPrescription] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Image size must be less than 2MB');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const { data: authParamsResponse } = await api.get('/auth/imagekit-auth');
      const { signature, expire, token, publicKey } = authParamsResponse.data;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', `avatar-${user._id}-${Date.now()}`);
      formData.append('publicKey', publicKey);
      formData.append('signature', signature);
      formData.append('expire', expire);
      formData.append('token', token);

      const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('ImageKit upload failed');
      }

      const uploadResult = await response.json();
      const newAvatarUrl = uploadResult.url;

      const { data: updateResponse } = await api.put('/auth/update-me', {
        avatar: newAvatarUrl,
      });

      updateUser(updateResponse.data.user);
      setAvatarUrl(newAvatarUrl);
      setProfileMessage({ type: 'success', text: 'Profile picture updated successfully!' });
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError(error.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => { fetchProfile(); fetchAppointments(); }, []);

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const { data } = await api.get(`/doctors/${user._id}`);
      const prof = data.data.profile;
      if (prof?.specialization) {
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
      const pending = list.filter(a => a.status === 'pending').length;
      const completedCount = list.filter(a => a.status === 'completed').length;
      setStats({ bookings: list.length, pending, earnings: completedCount * (fees || 0) });

      // Fetch prescriptions for completed appointments
      const completedApps = list.filter(a => a.status === 'completed');
      const prescMap = {};
      for (const app of completedApps) {
        try {
          const { data: prescData } = await api.get(`/prescriptions/appointment/${app._id}`);
          prescMap[app._id] = prescData.data.prescription;
        } catch {
          // No prescription for this appointment yet
        }
      }
      setPrescriptionMap(prescMap);
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
    const availability = selectedDays.map(day => ({
      day,
      slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'],
    }));
    try {
      const { data } = await api.put('/doctors/profile', {
        specialization, experience: Number(experience), fees: Number(fees), bio, availability,
      });
      setProfile(data.data.profile);
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
      fetchAppointments();
    } catch (error) {
      setProfileMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDayToggle = (day) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  // ——— Prescription Handlers ———

  const openPrescriptionModal = (appointment) => {
    setPrescriptionAppointment(appointment);
    setPrescriptionForm({
      diagnosis: '',
      medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
      labTests: [''],
      followUpDate: '',
      notes: '',
    });
    setPrescriptionAttachments([]);
    setPrescriptionError('');
    setShowPrescriptionModal(true);
  };

  const closePrescriptionModal = () => {
    setShowPrescriptionModal(false);
    setPrescriptionAppointment(null);
  };

  const addMedication = () => {
    setPrescriptionForm(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    }));
  };

  const removeMedication = (idx) => {
    setPrescriptionForm(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== idx),
    }));
  };

  const updateMedication = (idx, field, value) => {
    setPrescriptionForm(prev => {
      const meds = [...prev.medications];
      meds[idx] = { ...meds[idx], [field]: value };
      return { ...prev, medications: meds };
    });
  };

  const addLabTest = () => {
    setPrescriptionForm(prev => ({ ...prev, labTests: [...prev.labTests, ''] }));
  };

  const removeLabTest = (idx) => {
    setPrescriptionForm(prev => ({ ...prev, labTests: prev.labTests.filter((_, i) => i !== idx) }));
  };

  const updateLabTest = (idx, value) => {
    setPrescriptionForm(prev => {
      const tests = [...prev.labTests];
      tests[idx] = value;
      return { ...prev, labTests: tests };
    });
  };

  const handleAttachmentUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setPrescriptionError(`File "${file.name}" exceeds 5MB limit`);
        return;
      }
    }

    setIsUploadingAttachment(true);
    setPrescriptionError('');

    try {
      const { data: authParamsResponse } = await api.get('/auth/imagekit-auth');
      const { signature, expire, token, publicKey } = authParamsResponse.data;

      const uploaded = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', `prescription-${Date.now()}-${file.name}`);
        formData.append('publicKey', publicKey);
        formData.append('signature', signature);
        formData.append('expire', expire);
        formData.append('token', token);

        const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error(`Failed to upload ${file.name}`);
        const result = await response.json();
        uploaded.push({ url: result.url, name: file.name, type: file.type });
      }

      setPrescriptionAttachments(prev => [...prev, ...uploaded]);
    } catch (error) {
      setPrescriptionError(error.message || 'Failed to upload file(s)');
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  const removeAttachment = (idx) => {
    setPrescriptionAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    if (!prescriptionForm.diagnosis.trim()) {
      setPrescriptionError('Diagnosis is required');
      return;
    }
    if (!prescriptionForm.medications.length || !prescriptionForm.medications[0].name.trim()) {
      setPrescriptionError('At least one medication is required');
      return;
    }

    setIsSavingPrescription(true);
    setPrescriptionError('');

    try {
      const payload = {
        appointmentId: prescriptionAppointment._id,
        diagnosis: prescriptionForm.diagnosis,
        medications: prescriptionForm.medications.filter(m => m.name.trim()),
        labTests: prescriptionForm.labTests.filter(t => t.trim()),
        attachments: prescriptionAttachments,
        followUpDate: prescriptionForm.followUpDate || undefined,
        notes: prescriptionForm.notes,
      };

      await api.post('/prescriptions', payload);
      closePrescriptionModal();
      fetchAppointments();
    } catch (error) {
      setPrescriptionError(error.response?.data?.message || 'Failed to save prescription');
    } finally {
      setIsSavingPrescription(false);
    }
  };

  const openViewPrescription = (prescription) => {
    setViewPrescription(prescription);
    setShowViewModal(true);
  };

  const formatDate = (ds) =>
    new Date(ds).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const inputCls = "settings-input w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Welcome Banner */}
        <div className="bg-teal-600 rounded-2xl p-6 mb-6 flex items-center justify-between text-white">
          <div>
            <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium">Doctor Practice Portal</span>
            <h1 className="text-2xl font-bold mt-2">Welcome, Dr. {user?.name}!</h1>
            <p className="text-teal-100 text-sm mt-1">Configure your specialties and manage appointments.</p>
          </div>
          <Sparkles size={70} className="opacity-20 hidden sm:block" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { icon: <Users size={20} />, label: 'Total Bookings', value: stats.bookings, color: 'text-teal-600 bg-teal-100' },
            { icon: <Clock size={20} />, label: 'Pending Actions', value: stats.pending, color: 'text-yellow-600 bg-yellow-100' },
            { icon: <span className="font-bold text-lg">$</span>, label: 'Est. Earnings', value: `$${stats.earnings}`, color: 'text-green-600 bg-green-100' },
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

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Appointments (2 cols) */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Patient Schedule</h2>
              <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
                {appointments.length} Consultations
              </span>
            </div>

            {loadingApp ? (
              <div className="flex flex-col items-center py-16 text-gray-400 gap-3">
                <div className="spinner" />
                <p className="text-sm">Fetching schedule...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-gray-400 gap-2">
                <Calendar size={44} />
                <h3 className="font-semibold">No Appointments Booked</h3>
                <p className="text-sm">Keep your profile updated so patients can find you.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {appointments.map((app) => (
                  <div key={app._id} className="px-6 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <Link to={`/appointments/${app._id}`} className="flex items-center gap-3 no-underline group">
                        <div className="w-9 h-9 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform">
                          {app.patient?.name?.[0] || 'P'}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 text-sm group-hover:text-teal-600 transition-colors">{app.patient?.name}</div>
                          <div className="text-xs text-gray-400">{app.patient?.email}</div>
                        </div>
                      </Link>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusStyles[app.status] || ''}`}>
                          {app.status}
                        </span>
                        <Link
                          to={`/appointments/${app._id}`}
                          className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 border border-teal-200 hover:bg-teal-50 px-2.5 py-1 rounded-full transition-colors no-underline font-medium"
                        >
                          Details
                        </Link>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1"><Calendar size={12} /> {formatDate(app.date)}</div>
                      <div className="flex items-center gap-1"><Clock size={12} /> {app.timeSlot}</div>
                    </div>

                    {app.notes && (
                      <p className="text-xs text-gray-400 italic mt-1">Reason: "{app.notes}"</p>
                    )}

                    {app.status === 'pending' && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleUpdateStatus(app._id, 'approved')}
                          className="flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer bg-transparent"
                        >
                          <Check size={13} /> Approve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(app._id, 'rejected')}
                          className="flex items-center gap-1 text-xs text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer bg-transparent"
                        >
                          <X size={13} /> Reject
                        </button>
                      </div>
                    )}
                    {app.status === 'approved' && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleUpdateStatus(app._id, 'completed')}
                          className="flex items-center gap-1 text-xs text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer bg-transparent"
                        >
                          <CheckSquare size={13} /> Complete
                        </button>
                      </div>
                    )}
                    {app.status === 'completed' && (
                      <div className="flex gap-2 mt-3">
                        {prescriptionMap[app._id] ? (
                          <Link
                            to={`/prescriptions/${prescriptionMap[app._id]._id}`}
                            className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors no-underline font-medium"
                          >
                            <Eye size={13} /> View Prescription
                          </Link>
                        ) : (
                          <Link
                            to={`/prescriptions/new/${app._id}`}
                            className="flex items-center gap-1 text-xs text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors no-underline font-medium"
                          >
                            <FileText size={13} /> Write Prescription
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profile Settings (1 col) */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
              <Settings size={18} className="text-gray-500" />
              <h2 className="text-lg font-bold text-gray-800">Practice Settings</h2>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <Link
                  to="/availability"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-teal-600 text-white font-semibold rounded-xl text-sm hover:bg-teal-700 transition-colors shadow-sm shadow-teal-500/10 no-underline border-0"
                >
                  <Calendar size={16} /> Manage Availability Slots
                </Link>
              </div>

              {!profile && !loadingProfile && (
                <div className="flex items-center gap-2 text-xs text-teal-700 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2.5 mb-4">
                  <PlusCircle size={15} />
                  <span>Complete your profile so patients can find and book you.</span>
                </div>
              )}

              {loadingProfile ? (
                <div className="flex justify-center py-8">
                  <div className="spinner" />
                </div>
              ) : (
                <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
                  {profileMessage.text && (
                    <div className={`text-xs text-center py-2 px-3 rounded-lg font-medium ${
                      profileMessage.type === 'success'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {profileMessage.text}
                    </div>
                  )}

                  {/* Profile Image Upload */}
                  <div className="flex flex-col items-center gap-3 pb-4 border-b border-gray-100 mb-2">
                    <div className="relative group">
                      <img
                        src={getAvatarUrl(avatarUrl, specialization, 'doctor')}
                        alt="Doctor profile"
                        className="w-24 h-24 rounded-full object-cover border-2 border-teal-500/20 shadow-sm"
                      />
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <label className="px-3.5 py-1.5 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-lg text-xs font-semibold cursor-pointer transition-colors border border-teal-200">
                        {isUploading ? 'Uploading...' : 'Change Photo'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={isUploading}
                        />
                      </label>
                      {uploadError && (
                        <p className="text-[11px] text-red-500 mt-1.5">{uploadError}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">Specialization</label>
                    <select className={inputCls} value={specialization} onChange={(e) => setSpecialization(e.target.value)} required>
                      <option value="">Select Specialization</option>
                      <option value="General Physician">General Physician</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Orthopedics">Orthopedics</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-gray-700">Experience (Yrs)</label>
                      <input type="number" min="0" className={inputCls}
                        value={experience} onChange={(e) => setExperience(e.target.value)} required />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-gray-700">Fee ($)</label>
                      <input type="number" min="0" className={inputCls}
                        value={fees} onChange={(e) => setFees(e.target.value)} required />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">Professional Bio</label>
                    <textarea
                      className={`${inputCls} resize-none h-20`}
                      placeholder="Describe your qualifications..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Available Days</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {DAYS_OF_WEEK.map((day) => {
                        const isSelected = selectedDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleDayToggle(day)}
                            className={`py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-teal-600 text-white border-teal-600'
                                : 'bg-white text-gray-600 border-gray-300 hover:border-teal-400'
                            }`}
                          >
                            {day.substring(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="w-full py-2.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm cursor-pointer border-0"
                  >
                    {isSavingProfile ? 'Saving...' : 'Save Profile Settings'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ——— Write Prescription Modal ——— */}
      {showPrescriptionModal && (
        <div className="modal-overlay" onClick={closePrescriptionModal}>
          <div className="prescription-modal" onClick={e => e.stopPropagation()}>
            <div className="prescription-modal-header">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Write Prescription</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  For {prescriptionAppointment?.patient?.name} — {formatDate(prescriptionAppointment?.date)}
                </p>
              </div>
              <button onClick={closePrescriptionModal} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePrescriptionSubmit} className="prescription-modal-body">
              {prescriptionError && (
                <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
                  {prescriptionError}
                </div>
              )}

              {/* Diagnosis */}
              <div className="form-group">
                <label className="form-label">Diagnosis *</label>
                <textarea
                  className="form-textarea"
                  placeholder="Enter diagnosis summary..."
                  value={prescriptionForm.diagnosis}
                  onChange={e => setPrescriptionForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                  rows={2}
                  required
                />
              </div>

              {/* Medications */}
              <div className="form-group">
                <div className="flex items-center justify-between mb-2">
                  <label className="form-label mb-0">Medications *</label>
                  <button type="button" onClick={addMedication} className="add-btn">
                    <Plus size={12} /> Add
                  </button>
                </div>
                <div className="medications-list">
                  {prescriptionForm.medications.map((med, idx) => (
                    <div key={idx} className="medication-row">
                      <div className="medication-row-header">
                        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Medicine {idx + 1}</span>
                        {prescriptionForm.medications.length > 1 && (
                          <button type="button" onClick={() => removeMedication(idx)} className="remove-btn">
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                      <div className="medication-fields">
                        <input type="text" placeholder="Medicine name" value={med.name}
                          onChange={e => updateMedication(idx, 'name', e.target.value)} className="med-input" required />
                        <input type="text" placeholder="Dosage (e.g., 500mg)" value={med.dosage}
                          onChange={e => updateMedication(idx, 'dosage', e.target.value)} className="med-input" required />
                        <input type="text" placeholder="Frequency (e.g., 2x/day)" value={med.frequency}
                          onChange={e => updateMedication(idx, 'frequency', e.target.value)} className="med-input" required />
                        <input type="text" placeholder="Duration (e.g., 7 days)" value={med.duration}
                          onChange={e => updateMedication(idx, 'duration', e.target.value)} className="med-input" required />
                      </div>
                      <input type="text" placeholder="Special instructions (optional)" value={med.instructions}
                        onChange={e => updateMedication(idx, 'instructions', e.target.value)} className="med-input med-instructions" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Lab Tests */}
              <div className="form-group">
                <div className="flex items-center justify-between mb-2">
                  <label className="form-label mb-0">Recommended Lab Tests</label>
                  <button type="button" onClick={addLabTest} className="add-btn">
                    <Plus size={12} /> Add
                  </button>
                </div>
                {prescriptionForm.labTests.map((test, idx) => (
                  <div key={idx} className="flex gap-2 mb-1.5">
                    <input type="text" placeholder="e.g., Complete Blood Count" value={test}
                      onChange={e => updateLabTest(idx, e.target.value)} className="med-input flex-1" />
                    {prescriptionForm.labTests.length > 1 && (
                      <button type="button" onClick={() => removeLabTest(idx)} className="remove-btn">
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* File Uploads */}
              <div className="form-group">
                <label className="form-label">Attachments (Lab Reports, X-Rays, Scans)</label>
                <div className="upload-zone">
                  <label className="upload-zone-label">
                    {isUploadingAttachment ? (
                      <div className="flex items-center gap-2 text-teal-600">
                        <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                        <span>Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <Upload size={20} className="text-gray-400" />
                        <span className="text-xs text-gray-500">Click to upload files (max 5MB each)</span>
                        <span className="text-[10px] text-gray-400">JPG, PNG, PDF supported</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      multiple
                      className="hidden"
                      onChange={handleAttachmentUpload}
                      disabled={isUploadingAttachment}
                    />
                  </label>
                </div>
                {prescriptionAttachments.length > 0 && (
                  <div className="attachment-list">
                    {prescriptionAttachments.map((att, idx) => (
                      <div key={idx} className="attachment-item">
                        <div className="flex items-center gap-2">
                          <Paperclip size={12} className="text-gray-400" />
                          <span className="text-xs text-gray-700 truncate max-w-[180px]">{att.name}</span>
                        </div>
                        <button type="button" onClick={() => removeAttachment(idx)} className="remove-btn">
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Follow-up & Notes */}
              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label">Follow-up Date</label>
                  <input type="date" className="med-input"
                    value={prescriptionForm.followUpDate}
                    onChange={e => setPrescriptionForm(prev => ({ ...prev, followUpDate: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Additional Notes</label>
                  <input type="text" placeholder="Any extra notes..." className="med-input"
                    value={prescriptionForm.notes}
                    onChange={e => setPrescriptionForm(prev => ({ ...prev, notes: e.target.value }))} />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingPrescription}
                className="w-full py-2.5 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm cursor-pointer border-0 mt-2"
              >
                {isSavingPrescription ? 'Saving Prescription...' : 'Save Prescription'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ——— View Prescription Modal ——— */}
      {showViewModal && viewPrescription && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="prescription-modal view-mode" onClick={e => e.stopPropagation()}>
            <div className="prescription-modal-header">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Prescription Details</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {viewPrescription.patient?.name} — {new Date(viewPrescription.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button onClick={() => setShowViewModal(false)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <div className="prescription-modal-body">
              <div className="view-section">
                <h4 className="view-label">Diagnosis</h4>
                <p className="view-value">{viewPrescription.diagnosis}</p>
              </div>

              <div className="view-section">
                <h4 className="view-label">Medications</h4>
                <div className="view-medications-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Medicine</th>
                        <th>Dosage</th>
                        <th>Frequency</th>
                        <th>Duration</th>
                        <th>Instructions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewPrescription.medications?.map((med, idx) => (
                        <tr key={idx}>
                          <td className="font-medium">{med.name}</td>
                          <td>{med.dosage}</td>
                          <td>{med.frequency}</td>
                          <td>{med.duration}</td>
                          <td className="text-gray-500">{med.instructions || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {viewPrescription.labTests?.length > 0 && viewPrescription.labTests[0] && (
                <div className="view-section">
                  <h4 className="view-label">Recommended Lab Tests</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {viewPrescription.labTests.filter(t => t).map((test, idx) => (
                      <span key={idx} className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full">
                        {test}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {viewPrescription.attachments?.length > 0 && (
                <div className="view-section">
                  <h4 className="view-label">Attachments</h4>
                  <div className="attachment-list">
                    {viewPrescription.attachments.map((att, idx) => (
                      <a key={idx} href={att.url} target="_blank" rel="noopener noreferrer" className="attachment-item clickable">
                        <div className="flex items-center gap-2">
                          <Paperclip size={12} className="text-gray-400" />
                          <span className="text-xs text-teal-600 truncate max-w-[200px]">{att.name}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 capitalize">{att.uploadedBy}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {viewPrescription.followUpDate && (
                <div className="view-section">
                  <h4 className="view-label">Follow-up Date</h4>
                  <p className="view-value">{formatDate(viewPrescription.followUpDate)}</p>
                </div>
              )}

              {viewPrescription.notes && (
                <div className="view-section">
                  <h4 className="view-label">Additional Notes</h4>
                  <p className="view-value">{viewPrescription.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
