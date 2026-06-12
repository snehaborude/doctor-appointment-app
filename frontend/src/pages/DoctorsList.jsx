import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Search, Calendar, Clock, Star, MapPin, DollarSign, Award, ChevronRight, X, Heart, ShieldAlert } from 'lucide-react';
import './DoctorsList.css';

const SPECIALIZATIONS = [
  'All',
  'General Physician',
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'Neurology',
  'Orthopedics'
];

const DEFAULT_SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];

const DoctorsList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  
  // Booking Modal States
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingSlot, setBookingSlot] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      let url = '/doctors';
      const params = [];
      if (selectedSpecialty !== 'All') {
        params.push(`specialization=${encodeURIComponent(selectedSpecialty)}`);
      }
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      const { data } = await api.get(url);
      setDoctors(data.data.profiles);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    if (!doc.user) return false;
    return doc.user.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const openBookingModal = (doctor) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'patient') {
      alert('Only patients can book appointments.');
      return;
    }
    setSelectedDoctor(doctor);
    setBookingDate('');
    setBookingSlot('');
    setBookingNotes('');
    setBookingError('');
    setBookingSuccess(false);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingDate || !bookingSlot) {
      setBookingError('Please select both a date and a time slot.');
      return;
    }

    setIsSubmitting(true);
    setBookingError('');
    
    try {
      await api.post('/appointments', {
        doctor: selectedDoctor.user._id,
        date: bookingDate,
        timeSlot: bookingSlot,
        notes: bookingNotes
      });
      setBookingSuccess(true);
      setTimeout(() => {
        setSelectedDoctor(null);
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      setBookingError(error.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get available slots for the selected doctor (or fallback to default)
  const getAvailableSlots = () => {
    if (!selectedDoctor) return DEFAULT_SLOTS;
    // Check if there is specialized availability for the selected day of week
    if (!bookingDate) return [];
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const selectedDayName = dayNames[new Date(bookingDate).getDay()];
    
    const dayConfig = selectedDoctor.availability?.find(
      (a) => a.day.toLowerCase() === selectedDayName.toLowerCase()
    );
    
    return dayConfig && dayConfig.slots.length > 0 ? dayConfig.slots : DEFAULT_SLOTS;
  };

  return (
    <div className="doctorsListPage">
      <div className="container">
        
        {/* Header section */}
        <div className="listHeader">
          <h1 className="listTitle">Find Your <span className="highlight">Specialist</span></h1>
          <p className="listSubtitle">Book appointments with top-rated and verified doctors in your area.</p>
        </div>

        {/* Search and Filters */}
        <div className="searchFilterContainer">
          <div className="searchBox">
            <Search className="searchIcon" size={20} />
            <input 
              type="text" 
              placeholder="Search doctor by name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filterBadges">
            {SPECIALIZATIONS.map((spec) => (
              <button
                key={spec}
                className={`filterBadge ${selectedSpecialty === spec ? 'active' : ''}`}
                onClick={() => setSelectedSpecialty(spec)}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Doctor Grid */}
        {loading ? (
          <div className="loadingSpinner">
            <div className="spinner"></div>
            <p>Loading medical specialists...</p>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="emptyState">
            <ShieldAlert size={48} className="emptyStateIcon" />
            <h3>No Doctors Found</h3>
            <p>We couldn't find any doctors matching your search query or filters. Please try another search.</p>
          </div>
        ) : (
          <div className="doctorGrid">
            {filteredDoctors.map((doc) => (
              <div key={doc._id} className="doctorCard">
                <div className="doctorCardHeader">
                  <div className="doctorAvatar">
                    <Heart size={28} className="avatarHeart" />
                  </div>
                  <div className="doctorMeta">
                    <span className="specialtyBadge">{doc.specialization || 'General'}</span>
                    <div className="ratingContainer">
                      <Star size={16} fill="#fbbf24" color="#fbbf24" />
                      <span>{doc.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <div className="doctorCardBody">
                  <h3 className="doctorName">Dr. {doc.user?.name}</h3>
                  <p className="doctorBio">{doc.bio || 'Experienced medical professional committed to providing exceptional care.'}</p>
                  
                  <div className="doctorDetails">
                    <div className="detailItem">
                      <Award size={16} />
                      <span>{doc.experience} Years Experience</span>
                    </div>
                    <div className="detailItem">
                      <DollarSign size={16} />
                      <span>${doc.fees} Consultation Fee</span>
                    </div>
                  </div>
                </div>

                <div className="doctorCardFooter">
                  <button 
                    onClick={() => openBookingModal(doc)} 
                    className="bookBtn"
                  >
                    Book Appointment <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedDoctor && (
        <div className="modalOverlay">
          <div className="bookingModal animate-fade-in">
            <button className="closeModalBtn" onClick={() => setSelectedDoctor(null)}>
              <X size={20} />
            </button>
            
            <div className="modalHeader">
              <h2>Schedule Appointment</h2>
              <p>With <strong>Dr. {selectedDoctor.user?.name}</strong> ({selectedDoctor.specialization})</p>
            </div>

            {bookingSuccess ? (
              <div className="bookingSuccessBox">
                <div className="successIconContainer">✓</div>
                <h3>Appointment Requested!</h3>
                <p>Your appointment has been requested. Redirecting you to your dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit}>
                {bookingError && <div className="modalError">{bookingError}</div>}
                
                <div className="input-group">
                  <label className="input-label">
                    <Calendar size={16} /> Select Date
                  </label>
                  <input 
                    type="date" 
                    className="input-field"
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingDate}
                    onChange={(e) => {
                      setBookingDate(e.target.value);
                      setBookingSlot('');
                    }}
                    required
                  />
                </div>

                {bookingDate && (
                  <div className="input-group">
                    <label className="input-label">
                      <Clock size={16} /> Available Slots
                    </label>
                    <div className="slotsGrid">
                      {getAvailableSlots().map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          className={`slotBtn ${bookingSlot === slot ? 'selected' : ''}`}
                          onClick={() => setBookingSlot(slot)}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="input-group mb-6">
                  <label className="input-label">Notes for Doctor (Optional)</label>
                  <textarea 
                    className="input-field min-h-[80px] py-2"
                    placeholder="Briefly describe your symptoms or reason for visit..."
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                  />
                </div>

                <button 
                  type="submit" 
                  className="confirmBookingBtn" 
                  disabled={isSubmitting || !bookingDate || !bookingSlot}
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
