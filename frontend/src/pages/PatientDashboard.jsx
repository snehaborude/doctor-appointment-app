import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Calendar, Clock, XCircle, Heart, User, CheckCircle2, AlertCircle, FileText, Upload, Paperclip, ExternalLink } from 'lucide-react';
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
  
  // Prescription history state
  const [activeTab, setActiveTab] = useState('appointments');
  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(true);
  const [uploadingMap, setUploadingMap] = useState({});

  useEffect(() => {
    fetchAppointments();
    fetchPrescriptions();
  }, []);

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

  const fetchPrescriptions = async () => {
    setLoadingPrescriptions(true);
    try {
      const { data } = await api.get('/prescriptions/patient');
      setPrescriptions(data.data.prescriptions);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoadingPrescriptions(false);
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

  const handleAttachmentUpload = async (prescriptionId, files) => {
    if (!files || files.length === 0) return;

    setUploadingMap(prev => ({ ...prev, [prescriptionId]: true }));

    try {
      const { data: authParamsResponse } = await api.get('/auth/imagekit-auth');
      const { signature, expire, token, publicKey } = authParamsResponse.data;

      const uploaded = [];
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} exceeds the 5MB size limit.`);
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', `patient-report-${Date.now()}-${file.name}`);
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
        uploaded.push({
          url: result.url,
          name: file.name,
          type: file.type,
        });
      }

      await api.patch(`/prescriptions/${prescriptionId}/attachments`, { attachments: uploaded });
      fetchPrescriptions();
      alert('Medical report uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.message || 'Failed to upload attachments.');
    } finally {
      setUploadingMap(prev => ({ ...prev, [prescriptionId]: false }));
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Welcome Banner */}
        <div className="bg-teal-600 rounded-2xl p-6 mb-6 flex items-center justify-between text-white animate-fade-in">
          <div>
            <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium">Patient Space</span>
            <h1 className="text-2xl font-bold mt-2">Hello, {user?.name}!</h1>
            <p className="text-teal-100 text-sm mt-1">Manage your upcoming doctor consultations and view prescription records.</p>
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
            <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>{s.icon}</div>
              <div>
                <div className="text-xs text-gray-500">{s.label}</div>
                <div className="text-xl font-bold text-gray-800">{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-6 bg-white p-1 rounded-xl shadow-sm gap-2">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex-1 py-2.5 text-center text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'appointments'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-teal-600 hover:bg-teal-50'
            }`}
          >
            My Appointments
          </button>
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`flex-1 py-2.5 text-center text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'prescriptions'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-teal-600 hover:bg-teal-50'
            }`}
          >
            Prescriptions & Reports
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'appointments' ? (
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
                  <div key={app._id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50/50 transition-colors">
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
        ) : (
          /* Prescriptions & Reports Tab */
          <div className="space-y-6">
            {loadingPrescriptions ? (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col items-center py-16 text-gray-400 gap-3">
                <div className="spinner" />
                <p className="text-sm">Fetching prescriptions...</p>
              </div>
            ) : prescriptions.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col items-center py-16 text-gray-400 gap-2">
                <FileText size={44} />
                <h3 className="font-semibold">No Prescriptions Found</h3>
                <p className="text-sm">When your doctor issues a prescription, it will appear here.</p>
              </div>
            ) : (
              prescriptions.map((presc) => (
                <div key={presc._id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-teal-50 to-white px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={getAvatarUrl(presc.doctor?.avatar, presc.doctor?.specialization, 'doctor')} 
                        alt={presc.doctor?.name} 
                        className="w-11 h-11 rounded-full object-cover border border-white shadow-sm" 
                      />
                      <div>
                        <div className="font-semibold text-gray-800 text-sm">Dr. {presc.doctor?.name}</div>
                        <div className="text-xs text-teal-600 font-medium">{presc.doctor?.specialization}</div>
                      </div>
                    </div>
                    
                    <div className="text-right text-xs text-gray-500">
                      <div className="flex items-center gap-1 sm:justify-end font-medium text-gray-700">
                        <Calendar size={13} /> {formatDate(presc.appointment?.date)}
                      </div>
                      <div className="mt-0.5 text-gray-400">Time: {presc.appointment?.timeSlot}</div>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Diagnosis */}
                    <div className="mb-4">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Diagnosis</span>
                      <p className="text-gray-800 font-medium text-base">{presc.diagnosis}</p>
                    </div>

                    {/* Medications */}
                    {presc.medications && presc.medications.length > 0 && (
                      <div className="mb-4">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Prescribed Medications</span>
                        <div className="overflow-x-auto border border-gray-100 rounded-xl">
                          <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
                            <thead className="bg-gray-50 text-gray-500 font-semibold">
                              <tr>
                                <th className="px-4 py-3">Medicine</th>
                                <th className="px-4 py-3">Dosage</th>
                                <th className="px-4 py-3">Frequency</th>
                                <th className="px-4 py-3">Duration</th>
                                <th className="px-4 py-3">Instructions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-700">
                              {presc.medications.map((med, index) => (
                                <tr key={index} className="hover:bg-gray-50/30 transition-colors">
                                  <td className="px-4 py-3 font-semibold text-teal-700">{med.name}</td>
                                  <td className="px-4 py-3">{med.dosage}</td>
                                  <td className="px-4 py-3">{med.frequency}</td>
                                  <td className="px-4 py-3">{med.duration}</td>
                                  <td className="px-4 py-3 text-gray-500 italic">{med.instructions || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Recommended Lab Tests */}
                    {presc.labTests && presc.labTests.length > 0 && (
                      <div className="mb-4">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Recommended Lab Tests</span>
                        <div className="flex flex-wrap gap-2">
                          {presc.labTests.map((test, index) => (
                            <span key={index} className="bg-teal-50 text-teal-800 border border-teal-100 px-3 py-1 rounded-full text-xs font-medium">
                              {test}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes & Follow up in a grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {presc.notes && (
                        <div className="bg-gray-50 border-l-4 border-teal-500 p-3.5 rounded-r-xl">
                          <span className="text-xs font-semibold text-gray-500 block mb-1">Doctor's Notes</span>
                          <p className="text-xs text-gray-600 leading-relaxed italic">"{presc.notes}"</p>
                        </div>
                      )}

                      {presc.followUpDate && (
                        <div className="bg-teal-50/40 border border-teal-100 p-3.5 rounded-xl flex items-center gap-3">
                          <Calendar className="text-teal-600 flex-shrink-0" size={20} />
                          <div>
                            <span className="text-[10px] text-teal-700 font-semibold uppercase tracking-wider block">Follow-up Consultation</span>
                            <span className="text-xs text-teal-900 font-bold">{formatDate(presc.followUpDate)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Attachments Section */}
                    <div className="border-t border-gray-100 pt-4 mt-6">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3">Attachments & Reports</span>
                      
                      {presc.attachments && presc.attachments.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                          {presc.attachments.map((att, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-gray-50 hover:bg-gray-100/50 border border-gray-200/60 rounded-xl p-3 text-xs transition-colors">
                              <div className="flex items-center gap-2.5 truncate flex-1 mr-2">
                                <Paperclip size={14} className="text-gray-400 flex-shrink-0" />
                                <div className="truncate">
                                  <div className="text-gray-700 font-semibold truncate" title={att.name}>{att.name}</div>
                                  <span className="text-[9px] text-gray-400 capitalize bg-gray-200/50 px-1.5 py-0.5 rounded-full">
                                    By {att.uploadedBy}
                                  </span>
                                </div>
                              </div>
                              <a
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-teal-600 hover:text-teal-800 hover:underline flex items-center gap-1.5 font-semibold flex-shrink-0 px-2.5 py-1.5 bg-white border border-gray-100 rounded-lg shadow-sm"
                              >
                                View <ExternalLink size={12} />
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic mb-4">No attachments uploaded yet.</p>
                      )}

                      {/* File Upload zone */}
                      <div className="mt-2">
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-teal-500 rounded-xl p-5 cursor-pointer hover:bg-teal-50/10 transition-all">
                          {uploadingMap[presc._id] ? (
                            <div className="flex items-center gap-2.5 text-teal-600">
                              <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                              <span className="text-xs font-semibold">Uploading Report...</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1.5 text-center">
                              <Upload size={20} className="text-teal-600 mb-1" />
                              <span className="text-xs text-gray-700 font-bold">Upload lab reports or scans</span>
                              <span className="text-[10px] text-gray-400">PDF, PNG, JPG (Max 5MB per file)</span>
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            disabled={uploadingMap[presc._id]}
                            onChange={(e) => handleAttachmentUpload(presc._id, e.target.files)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;

