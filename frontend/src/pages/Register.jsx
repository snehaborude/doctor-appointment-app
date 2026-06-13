import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, UserCircle, ArrowRight, Loader2 } from 'lucide-react';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'patient' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    const result = await register(formData);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
          <p className="text-gray-500 mt-1 text-sm">Join thousands of patients and doctors</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm text-center py-3 px-4 rounded-lg mb-5">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Name */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Full Name</label>
            <div className="relative flex items-center">
              <User size={16} className="absolute left-3 text-gray-400 pointer-events-none" />
              <input
                type="text" name="name"
                className="auth-input w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Email Address</label>
            <div className="relative flex items-center">
              <Mail size={16} className="absolute left-3 text-gray-400 pointer-events-none" />
              <input
                type="email" name="email"
                className="auth-input w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Role */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">I am a...</label>
            <div className="relative flex items-center">
              <UserCircle size={16} className="absolute left-3 text-gray-400 pointer-events-none" />
              <select
                name="role"
                className="auth-input w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3 text-gray-400 pointer-events-none" />
              <input
                type="password" name="password"
                className="auth-input w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-1 cursor-pointer border-0"
          >
            {isSubmitting
              ? <Loader2 className="animate-spin" size={20} />
              : <><span>Create Account</span> <ArrowRight size={18} /></>}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-600 font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
