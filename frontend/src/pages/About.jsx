import { Link } from 'react-router-dom';
import { Heart, Shield, Clock, Users, Award, Star } from 'lucide-react';
import aboutImg from '../assets/about-healthcare.png';
import './About.css';

const About = () => {
  const stats = [
    { value: '10,000+', label: 'Happy Patients' },
    { value: '500+', label: 'Verified Doctors' },
    { value: '20+', label: 'Specializations' },
    { value: '4.9★', label: 'Average Rating' },
  ];

  const values = [
    { icon: <Shield size={28} className="text-teal-600" />, title: 'Trust & Safety', desc: 'Every doctor is verified and credentialed before joining our platform.' },
    { icon: <Clock size={28} className="text-teal-600" />, title: 'Instant Booking', desc: 'Book appointments in under a minute — anytime, anywhere.' },
    { icon: <Heart size={28} className="text-teal-600" />, title: 'Patient First', desc: 'We put your health and comfort at the center of everything we do.' },
    { icon: <Award size={28} className="text-teal-600" />, title: 'Quality Care', desc: 'Only the best and most experienced doctors on our platform.' },
  ];

  const team = [
    { name: 'Dr. Priya Sharma', role: 'Chief Medical Officer', rating: 4.9 },
    { name: 'Dr. Rahul Mehta', role: 'Head of Cardiology', rating: 4.8 },
    { name: 'Dr. Ananya Patel', role: 'Chief of Pediatrics', rating: 4.9 },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-800 text-white py-20 px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">About <span className="text-teal-200">DocReserv</span></h1>
        <p className="text-teal-100 max-w-xl mx-auto text-lg">
          We're on a mission to make quality healthcare accessible to everyone — one appointment at a time.
        </p>
      </div>

      {/* Stats */}
      <div className="max-w-5xl mx-auto px-4 -mt-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="stat-card-about rounded-2xl p-6 text-center shadow-sm">
              <div className="text-3xl font-bold text-teal-700">{s.value}</div>
              <div className="text-sm text-gray-600 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              DocReserv was founded with a simple belief — everyone deserves fast, reliable access to qualified healthcare professionals. We bridge the gap between patients and doctors by providing a seamless digital booking experience.
            </p>
            <p className="text-gray-500 leading-relaxed mb-6">
              Whether you need a routine checkup, specialist consultation, or urgent care, our platform connects you with the right doctor at the right time.
            </p>
            <Link to="/doctors"
              className="inline-block px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors text-sm">
              Find a Doctor
            </Link>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <img src={aboutImg} alt="Doctor consulting with patient" className="w-full h-full object-cover" style={{minHeight: '280px'}} />
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="p-6 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow text-center">
                <div className="flex justify-center mb-3">{v.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">Meet Our Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {team.map((m) => (
            <div key={m.name} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                {m.name[0]}
              </div>
              <h3 className="font-bold text-gray-800">{m.name}</h3>
              <p className="text-gray-500 text-sm mt-1">{m.role}</p>
              <div className="flex items-center justify-center gap-1 mt-2 text-yellow-500 text-sm font-medium">
                <Star size={14} fill="currentColor" /> {m.rating}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
