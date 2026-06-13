import { Link } from 'react-router-dom';
import { Stethoscope, CalendarCheck, Clock, ShieldCheck, HeartPulse, Brain, Bone, Baby } from 'lucide-react';

const Services = () => {
  const services = [
    { icon: <Stethoscope size={32} className="text-teal-600" />, title: 'General Consultation', desc: 'Book a visit with a general physician for routine checkups, illness diagnosis, and overall health management.' },
    { icon: <HeartPulse size={32} className="text-red-500" />, title: 'Cardiology', desc: 'Expert heart specialists for ECG, cardiac consultations, and cardiovascular health monitoring.' },
    { icon: <Brain size={32} className="text-purple-600" />, title: 'Neurology', desc: 'Top neurologists for brain and nervous system disorders, migraines, seizures, and more.' },
    { icon: <Bone size={32} className="text-orange-500" />, title: 'Orthopedics', desc: 'Bone, joint, and muscle specialists for injuries, arthritis, physiotherapy referrals.' },
    { icon: <Baby size={32} className="text-pink-500" />, title: 'Pediatrics', desc: 'Trusted child health specialists for vaccinations, growth tracking, and illness care.' },
    { icon: <ShieldCheck size={32} className="text-green-600" />, title: 'Dermatology', desc: 'Skin, hair and nail specialists for acne, eczema, allergies, and cosmetic concerns.' },
  ];

  const features = [
    { icon: <CalendarCheck size={22} className="text-teal-600" />, title: 'Easy Online Booking', desc: 'Book appointments 24/7 from any device without phone calls or waiting.' },
    { icon: <Clock size={22} className="text-teal-600" />, title: 'Choose Your Time', desc: 'Pick from flexible time slots that suit your schedule.' },
    { icon: <ShieldCheck size={22} className="text-teal-600" />, title: 'Verified Doctors', desc: 'All our doctors are credential-verified and reviewed by patients.' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-800 text-white py-20 px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">Our <span className="text-teal-200">Services</span></h1>
        <p className="text-teal-100 max-w-xl mx-auto text-lg">
          Comprehensive healthcare services from verified specialists — all bookable online in minutes.
        </p>
      </div>

      {/* Services Grid */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">Medical Specializations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div key={s.title} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4">{s.icon}</div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">{s.desc}</p>
              <Link
                to={`/doctors?specialization=${encodeURIComponent(s.title === 'General Consultation' ? 'General Physician' : s.title)}`}
                className="text-sm text-teal-600 font-semibold hover:underline"
              >
                Find {s.title} Doctors →
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Search a Doctor', desc: 'Browse by specialization, name, or rating to find the right doctor.' },
              { step: '02', title: 'Pick a Slot', desc: 'Select a convenient date and available time slot from the doctor\'s schedule.' },
              { step: '03', title: 'Get Confirmed', desc: 'Receive confirmation and visit your doctor at the scheduled time.' },
            ].map((h) => (
              <div key={h.step} className="text-center">
                <div className="w-14 h-14 bg-teal-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {h.step}
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{h.title}</h3>
                <p className="text-gray-500 text-sm">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex gap-4 items-start">
              <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center shrink-0">{f.icon}</div>
              <div>
                <h3 className="font-bold text-gray-800 text-sm mb-1">{f.title}</h3>
                <p className="text-gray-500 text-xs">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-teal-600 rounded-2xl p-10 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Ready to Book Your Appointment?</h2>
          <p className="text-teal-100 mb-6 text-sm">Join thousands of patients who trust DocReserv for their healthcare needs.</p>
          <div className="flex gap-4 justify-center">
            <Link to="/doctors" className="px-6 py-3 bg-white text-teal-700 font-semibold rounded-xl hover:bg-teal-50 transition-colors text-sm">
              Find Doctors
            </Link>
            <Link to="/register" className="px-6 py-3 border border-white text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors text-sm">
              Sign Up Free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
