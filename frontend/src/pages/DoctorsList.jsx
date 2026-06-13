import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Search, Calendar, Clock, Star, DollarSign, Award, ChevronRight, X, Heart, ShieldAlert } from 'lucide-react';
import './DoctorsList.css';
import { getAvatarUrl } from '../utils/imageHelper';

const SPECIALIZATIONS = ['All', 'General Physician', 'Cardiology', 'Dermatology', 'Pediatrics', 'Neurology', 'Orthopedics'];
const DEFAULT_SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];

const DoctorsList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingSlot, setBookingSlot] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchDoctors(); }, [selectedSpecialty]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      let url = '/doctors';
      if (selectedSpecialty !== 'All') url += `?specialization=${encodeURIComponent(selectedSpecialty)}`;
      const { data } = await api.get(url);
      setDoctors(data.data.profiles);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doc =>
    doc.user && doc.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openBookingModal = (doctor) => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'patient') { alert('Only patients can book appointments.'); return; }
    setSelectedDoctor(doctor);
    setBookingDate(''); setBookingSlot(''); setBookingNotes('');
    setBookingError(''); setBookingSuccess(false);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingDate || !bookingSlot) { setBookingError('Please select both a date and a time slot.'); return; }
    setIsSubmitting(true); setBookingError('');
    try {
      await api.post('/appointments', {
        doctor: selectedDoctor.user._id, date: bookingDate, timeSlot: bookingSlot, notes: bookingNotes,
      });
      setBookingSuccess(true);
      setTimeout(() => { setSelectedDoctor(null); navigate('/dashboard'); }, 2000);
    } catch (error) {
      setBookingError(error.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvailableSlots = () => {
    if (!selectedDoctor || !bookingDate) return [];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[new Date(bookingDate).getDay()];
    const dayConfig = selectedDoctor.availability?.find(a => a.day.toLowerCase() === dayName.toLowerCase());
    return dayConfig?.slots?.length ? dayConfig.slots : DEFAULT_SLOTS;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            Find Your <span className="text-teal-600">Specialist</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Book appointments with top-rated and verified doctors.</p>
        </div>

        {/* Search & Filter */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 mb-8">
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search doctor by name..."
              className="modal-input w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {SPECIALIZATIONS.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                  selectedSpecialty === spec
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-teal-400 hover:text-teal-600'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Doctors Grid */}
        {loading ? (
          <div className="flex flex-col items-center py-20 text-gray-400 gap-3">
            <div className="spinner" />
            <p className="text-sm">Loading medical specialists...</p>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-gray-400 gap-2">
            <ShieldAlert size={48} />
            <h3 className="font-semibold text-lg">No Doctors Found</h3>
            <p className="text-sm">Try a different search or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => (
              <div key={doc._id} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col gap-3 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <img 
                    src={getAvatarUrl(doc.user?.avatar, doc.specialization, 'doctor')} 
                    alt={doc.user?.name} 
                    className="w-12 h-12 rounded-xl object-cover border border-gray-100 shadow-sm" 
                  />
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full font-medium">
                      {doc.specialization || 'General'}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-yellow-500 font-medium">
                      <Star size={12} fill="#f59e0b" color="#f59e0b" />
                      {doc.rating?.toFixed(1)}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Dr. {doc.user?.name}</h3>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                    {doc.bio || 'Experienced medical professional committed to exceptional care.'}
                  </p>
                </div>

                <div className="flex gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1"><Award size={14} /> {doc.experience} Yrs</div>
                  <div className="flex items-center gap-1"><DollarSign size={14} /> ${doc.fees} Fee</div>
                </div>

                <button
                  onClick={() => openBookingModal(doc)}
                  className="mt-auto w-full py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center justify-center gap-1 text-sm cursor-pointer border-0"
                >
                  Book Appointment <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative max-h-screen overflow-y-auto">
            <button
              onClick={() => setSelectedDoctor(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 border-0 bg-transparent cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-5 mt-2">
              <img 
                src={getAvatarUrl(selectedDoctor.user?.avatar, selectedDoctor.specialization, 'doctor')} 
                alt={selectedDoctor.user?.name} 
                className="w-12 h-12 rounded-xl object-cover border border-gray-100 shadow-sm" 
              />
              <div>
                <h2 className="text-xl font-bold text-gray-800 leading-tight">Schedule Appointment</h2>
                <p className="text-gray-500 text-sm mt-0.5">
                  With <strong>Dr. {selectedDoctor.user?.name}</strong> — {selectedDoctor.specialization}
                </p>
              </div>
            </div>

            {bookingSuccess ? (
              <div className="flex flex-col items-center py-8 text-center gap-2">
                <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-2xl font-bold">✓</div>
                <h3 className="text-lg font-bold text-gray-800">Appointment Requested!</h3>
                <p className="text-gray-500 text-sm">Redirecting you to your dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="flex flex-col gap-4">
                {bookingError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm py-2.5 px-3 rounded-lg">
                    {bookingError}
                  </div>
                )}

                {/* Date */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <Calendar size={14} /> Select Date
                  </label>
                  <input
                    type="date"
                    className="modal-input w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingDate}
                    onChange={(e) => { setBookingDate(e.target.value); setBookingSlot(''); }}
                    required
                  />
                </div>

                {/* Slots */}
                {bookingDate && (
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                      <Clock size={14} /> Available Slots
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {getAvailableSlots().map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setBookingSlot(slot)}
                          className={`py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                            bookingSlot === slot
                              ? 'bg-teal-600 text-white border-teal-600'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-teal-400'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-700">Notes (Optional)</label>
                  <textarea
                    className="modal-input w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm resize-none h-20"
                    placeholder="Briefly describe your symptoms..."
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !bookingDate || !bookingSlot}
                  className="w-full py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-0"
                >
                  {isSubmitting ? 'Booking...' : 'Confirm Appointment'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsList;
