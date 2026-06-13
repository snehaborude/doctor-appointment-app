import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorsList from './pages/DoctorsList';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import { Stethoscope, HeartPulse, Brain, Bone, Baby, ShieldCheck, Star, Clock, Calendar, ArrowRight, Sparkles, Plus } from 'lucide-react';
import heroImg from './assets/hero-doctors.png';
import { getAvatarUrl } from './utils/imageHelper';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm">
      Loading...
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  return children;
};

const Home = () => {
  const navigate = useNavigate();

  const specialties = [
    { name: 'General Physician', icon: <Stethoscope size={24} />, desc: 'For general health queries, fever, cold, checkups.', color: 'from-teal-500/10 to-teal-500/20 text-teal-600' },
    { name: 'Cardiology', icon: <HeartPulse size={24} />, desc: 'For heart related health issues and monitoring.', color: 'from-red-500/10 to-red-500/20 text-red-600' },
    { name: 'Neurology', icon: <Brain size={24} />, desc: 'For brain, spinal cord, and sensory system care.', color: 'from-purple-500/10 to-purple-500/20 text-purple-600' },
    { name: 'Orthopedics', icon: <Bone size={24} />, desc: 'For bone, joint, and muscle wellness and injury.', color: 'from-orange-500/10 to-orange-500/20 text-orange-600' },
    { name: 'Pediatrics', icon: <Baby size={24} />, desc: 'Dedicated healthcare specialists for your kids.', color: 'from-pink-500/10 to-pink-500/20 text-pink-600' },
    { name: 'Dermatology', icon: <ShieldCheck size={24} />, desc: 'For skin, hair, and nail conditions and treatments.', color: 'from-blue-500/10 to-blue-500/20 text-blue-600' },
  ];

  const features = [
    { title: 'Verified Profiles', icon: <ShieldCheck size={20} className="text-teal-600" />, desc: 'All doctor credentials and licenses are rigorously verified by our medical panel.' },
    { title: 'Flexible Scheduling', icon: <Calendar size={20} className="text-teal-600" />, desc: 'Choose a date and specific time slot that perfectly fits your personal calendar.' },
    { title: 'Instant Confirmation', icon: <Clock size={20} className="text-teal-600" />, desc: 'Skip the phone call queue. Your booking is confirmed instantly in real-time.' },
  ];

  const steps = [
    { step: '01', title: 'Choose Specialization', desc: 'Select from our wide range of clinical specialities and verified experts.' },
    { step: '02', title: 'Pick Date & Time', desc: 'Choose a suitable day and hour slot from the doctor\'s live availability.' },
    { step: '03', title: 'Visit & Consult', desc: 'Attend your consultation stress-free. Your spot is secured.' },
  ];

  const reviews = [
    { name: 'Aarav Mehta', role: 'Patient', comment: 'Booking was so smooth. I selected a cardiologist, picked a slot at 4 PM, and walked in without any wait time. Incredible service!' },
    { name: 'Dr. Sarah Joseph', role: 'General Physician', comment: 'DocReserv helps me manage my patient slots effectively. The dashboard is clean, and appointments are always organized.' }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 to-white border-b border-gray-100 py-16 px-6 sm:py-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full font-semibold text-xs mb-6 border border-teal-100">
              <Sparkles size={12} className="animate-pulse" />
              Healthcare Scheduling Made Easy
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-800 leading-tight mb-6 tracking-tight">
              Healthcare <span className="text-teal-600 relative">Simplified<span className="absolute left-0 bottom-1 w-full h-1 bg-teal-200/60 rounded-full -z-10"></span></span>.
            </h1>
            <p className="text-gray-600 max-w-xl text-lg mb-10 leading-relaxed">
              Connect with premium, verified doctors and book your appointments in just a few clicks. Your health is our highest priority.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/doctors')}
                className="px-8 py-3.5 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-all shadow-md shadow-teal-600/10 hover:shadow-lg hover:scale-[1.01] text-sm cursor-pointer border-0"
              >
                Find a Doctor
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-3.5 border border-gray-300 text-gray-700 bg-white font-semibold rounded-xl hover:border-teal-500 hover:text-teal-600 transition-all text-sm cursor-pointer"
              >
                Get Started
              </button>
            </div>
          </div>
          <div className="hidden lg:flex justify-end">
            <img src={heroImg} alt="Healthcare professionals" className="w-full max-w-md rounded-3xl shadow-2xl shadow-teal-600/8 object-cover" />
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800">Browse by Specialty</h2>
          <p className="text-gray-500 text-sm mt-2">Find experienced doctors across different clinical fields</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialties.map((spec) => (
            <div
              key={spec.name}
              onClick={() => navigate(`/doctors?specialization=${encodeURIComponent(spec.name)}`)}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-teal-500/40 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl overflow-hidden mb-4 border border-gray-100 shadow-sm transition-transform group-hover:scale-110">
                  <img 
                    src={getAvatarUrl(null, spec.name, 'doctor')} 
                    alt={spec.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-teal-600 transition-colors">{spec.name}</h3>
                <p className="text-gray-500 text-xs leading-relaxed mb-6">{spec.desc}</p>
              </div>
              <div className="flex items-center gap-1 text-teal-600 font-semibold text-xs mt-auto">
                <span>Find Doctors</span>
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-white border-y border-gray-100 py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat) => (
            <div key={feat.title} className="flex gap-4 items-start">
              <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
                {feat.icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-base mb-1">{feat.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800">How It Works</h2>
          <p className="text-gray-500 text-sm mt-2">Get your clinical slots scheduled in three direct steps</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {steps.map((st) => (
            <div key={st.step} className="text-center relative">
              <div className="w-14 h-14 bg-teal-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-sm">
                {st.step}
              </div>
              <h3 className="font-bold text-gray-800 text-base mb-2">{st.title}</h3>
              <p className="text-gray-500 text-xs max-w-xs mx-auto leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-900 text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-20 -translate-y-20">
          <Plus size={400} className="text-teal-400" strokeWidth={1} />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {reviews.map((rev, i) => (
              <div key={i} className="bg-slate-800 border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between">
                <p className="text-slate-300 text-xs italic leading-relaxed mb-6">"{rev.comment}"</p>
                <div className="flex justify-between items-center mt-auto">
                  <div>
                    <h4 className="font-bold text-sm text-white">{rev.name}</h4>
                    <span className="text-teal-400 text-[11px] uppercase tracking-wider font-semibold">{rev.role}</span>
                  </div>
                  <div className="flex gap-0.5 text-yellow-500">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} size={11} fill="currentColor" stroke="none" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="bg-teal-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl shadow-teal-600/10">
          <h2 className="text-3xl font-bold mb-4">Ready to Schedule an Appointment?</h2>
          <p className="text-teal-100 mb-8 max-w-md mx-auto text-sm leading-relaxed">
            Join thousands of patients who trust DocReserv for simplified, high-speed medical appointments.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/doctors" className="px-6 py-3 bg-white text-teal-700 font-semibold rounded-xl hover:bg-teal-50 transition-colors text-sm">
              Find Doctors
            </Link>
            <Link to="/register" className="px-6 py-3 border border-white text-white font-semibold rounded-xl hover:bg-teal-700/80 transition-colors text-sm">
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

const DashboardSelector = () => {
  const { user } = useAuth();
  if (user?.role === 'doctor') return <DoctorDashboard />;
  return <PatientDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/doctors" element={<DoctorsList />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardSelector />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
