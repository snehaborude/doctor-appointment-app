import { useState, useEffect } from 'react';
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
import AvailabilityManagement from './pages/AvailabilityManagement';
import AppointmentHistory from './pages/AppointmentHistory';
import AppointmentDetails from './pages/AppointmentDetails';
import PrescriptionForm from './pages/PrescriptionForm';
import PrescriptionHistory from './pages/PrescriptionHistory';
import PrescriptionDetails from './pages/PrescriptionDetails';
import { Stethoscope, HeartPulse, Brain, Bone, Baby, ShieldCheck, Star, Clock, Calendar, ArrowRight, Sparkles, Plus, ChevronLeft, ChevronRight, Activity, Droplet, Moon, Apple } from 'lucide-react';
import heroImg from './assets/hero-doctors.png';
import medicalHeroBanner from './assets/medical_hero_banner.png';
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

  // Tips State
  const [currentTip, setCurrentTip] = useState(0);

  const healthyTips = [
    {
      category: "Heart Care",
      icon: <HeartPulse className="text-red-500" size={32} />,
      title: "Aim for 150 minutes of aerobic activity",
      desc: "Brisk walking, cycling, or jogging keeps blood vessels flexible. Avoid processed sugars and get cholesterol checked annually.",
      color: "from-red-50 to-rose-50/50 text-red-700 border-red-100",
      accent: "bg-red-500"
    },
    {
      category: "Cellular Hydration",
      icon: <Droplet className="text-blue-500" size={32} />,
      title: "Drink 3 liters of water daily",
      desc: "Water maintains cellular detox, supports joint lubrication, and keeps energy levels high. Carry a reusable flask to track progress.",
      color: "from-blue-50 to-cyan-50/50 text-blue-700 border-blue-100",
      accent: "bg-blue-500"
    },
    {
      category: "Mental Balance",
      icon: <Activity className="text-purple-500" size={32} />,
      title: "Practice 10 minutes of daily mindfulness",
      desc: "Controlled deep breathing reduces cortisol levels, preventing chronic inflammation, improving cognitive focus and sleep.",
      color: "from-purple-50 to-violet-50/50 text-purple-700 border-purple-100",
      accent: "bg-purple-500"
    },
    {
      category: "Rest & Sleep",
      icon: <Moon className="text-amber-500" size={32} />,
      title: "Prioritize 7-9 hours of deep rest",
      desc: "Deep sleep allows neural tissue restoration. Avoid phone/laptop screens for at least 1 hour before bedtime to boost melatonin production.",
      color: "from-amber-50 to-orange-50/50 text-amber-700 border-amber-100",
      accent: "bg-amber-500"
    }
  ];

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
    <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
      {/* Immersive Full-Screen Hero Section */}
      <section className="relative min-h-[calc(100vh-64px)] flex items-center justify-center lg:justify-start px-6 py-12 sm:px-12 lg:px-20 overflow-hidden border-b border-gray-150">
        {/* Full Screen Bleed Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={medicalHeroBanner} 
            alt="Healthcare professionals background" 
            className="w-full h-full object-cover filter brightness-[0.75] contrast-[1.05] object-[center_30%]" 
          />
          {/* Linear gradient overlay for high contrast text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/60 to-transparent lg:block hidden" />
          <div className="absolute inset-0 bg-slate-950/60 lg:hidden" />
        </div>
        
        {/* Elegant Floating Card on top of the image */}
        <div className="relative z-10 w-full max-w-xl animate-fade-in">
          <div className="bg-white/95 backdrop-blur-xl border border-white/50 p-8 sm:p-10 md:p-12 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-50 text-teal-800 rounded-full font-bold text-xs mb-6 border border-teal-150 shadow-sm">
              <Sparkles size={12} className="text-teal-600 animate-pulse" />
              Healthcare Scheduling Made Easy
            </div>
            
            <h1 className="text-3xl sm:text-4.5xl font-black text-slate-800 leading-tight mb-5 tracking-tight">
              Healthcare <span className="text-teal-600 font-extrabold relative font-sans">Simplified<span className="absolute left-0 bottom-1 w-full h-1 bg-teal-200/60 rounded-full -z-10"></span></span>.
            </h1>
            
            <p className="text-gray-650 text-sm sm:text-base mb-8 leading-relaxed">
              Connect with premium, verified doctors and book your appointments in just a few clicks. Your health is our highest priority.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/doctors')}
                className="flex-1 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all duration-300 shadow-md shadow-teal-500/10 hover:shadow-lg hover:scale-[1.01] text-sm cursor-pointer border-0 flex items-center justify-center gap-2"
              >
                <span>Find a Doctor</span>
                <ArrowRight size={15} />
              </button>
              <button
                onClick={() => navigate('/about')}
                className="flex-1 py-3.5 border border-gray-300 text-gray-700 bg-white/70 hover:bg-white/95 hover:border-teal-500 font-bold rounded-xl transition-all duration-300 text-sm cursor-pointer"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-slate-800">Browse by Specialty</h2>
          <p className="text-gray-500 text-sm mt-2">Find experienced doctors across different clinical fields</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialties.map((spec) => (
            <div
              key={spec.name}
              onClick={() => navigate(`/doctors?specialization=${encodeURIComponent(spec.name)}`)}
              className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-teal-500/40 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
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

      {/* Interactive Healthy Tips Module */}
      <section className="bg-slate-50 border-y border-gray-200/60 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs bg-teal-100 text-teal-800 px-3.5 py-1 rounded-full font-bold uppercase tracking-wider">Health Tips</span>
            <h2 className="text-3xl font-black text-slate-800 mt-2">Wellness & Healthy Tips</h2>
            <p className="text-gray-550 text-sm">Actionable advice from verified physicians for a healthier life.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Selection Column */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              {healthyTips.map((tip, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentTip(idx)}
                  className={`w-full p-4 text-left border rounded-xl font-bold text-sm cursor-pointer transition-all duration-300 flex items-center gap-3 ${
                    currentTip === idx
                      ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/10'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-teal-400 hover:bg-teal-50/10'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${currentTip === idx ? 'bg-white' : 'bg-gray-400'}`} />
                  {tip.category}
                </button>
              ))}
            </div>

            {/* Content Display Card */}
            <div className="lg:col-span-8">
              <div className={`p-8 sm:p-10 border rounded-3xl bg-gradient-to-br ${healthyTips[currentTip].color} shadow-sm transition-all duration-500`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md">
                    {healthyTips[currentTip].icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/60 px-3 py-1 rounded-full text-gray-700">
                    Category: {healthyTips[currentTip].category}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-6 leading-tight">
                  {healthyTips[currentTip].title}
                </h3>
                <p className="text-gray-650 text-sm sm:text-base mt-4 leading-relaxed">
                  {healthyTips[currentTip].desc}
                </p>
                <div className="mt-8 flex items-center gap-2.5 text-xs font-semibold text-slate-650">
                  <Apple size={14} />
                  <span>Verified Medical Advice</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat) => (
            <div key={feat.title} className="flex gap-4 items-start bg-slate-50/50 p-5 rounded-2xl border border-gray-100 hover:shadow-sm transition-shadow">
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
          <h2 className="text-3xl font-black text-gray-800">How It Works</h2>
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
        <div className="app-wrapper bg-gray-50">
          <Navbar />
          <main className="main-content">
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
              <Route
                path="/availability"
                element={
                  <ProtectedRoute>
                    <AvailabilityManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appointments/history"
                element={
                  <ProtectedRoute>
                    <AppointmentHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appointments/:id"
                element={
                  <ProtectedRoute>
                    <AppointmentDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/prescriptions"
                element={
                  <ProtectedRoute>
                    <PrescriptionHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/prescriptions/:id"
                element={
                  <ProtectedRoute>
                    <PrescriptionDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/prescriptions/new/:appointmentId"
                element={
                  <ProtectedRoute>
                    <PrescriptionForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/prescriptions/edit/:id"
                element={
                  <ProtectedRoute>
                    <PrescriptionForm />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

