import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, UserCircle, ArrowRight, Loader2 } from 'lucide-react';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient'
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
    <div className="registerPage">
      <div className="registerCard">
        <div className="registerHeader">
          <h2 className="registerTitle">Create Account</h2>
          <p className="registerSubtitle">Join thousands of patients and doctors</p>
        </div>

        {error && (
          <div className="errorBox">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <div className="relative inputFieldFocus">
              <User size={18} className="inputIcon" />
              <input 
                type="text" 
                name="name"
                className="inputFieldWithIcon" 
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div className="relative inputFieldFocus">
              <Mail size={18} className="inputIcon" />
              <input 
                type="email" 
                name="email"
                className="inputFieldWithIcon" 
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">I am a...</label>
            <div className="relative inputFieldFocus">
              <UserCircle size={18} className="inputIcon" />
              <select 
                name="role"
                className="inputFieldWithIcon appearance-none" 
                value={formData.role}
                onChange={handleChange}
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>
          </div>

          <div className="input-group mb-8">
            <label className="input-label">Password</label>
            <div className="relative inputFieldFocus">
              <Lock size={18} className="inputIcon" />
              <input 
                type="password" 
                name="password"
                className="inputFieldWithIcon" 
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="submitBtn" disabled={isSubmitting}>
             {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
              <>Create Account <ArrowRight size={20} /></>
            )}
          </button>
        </form>

        <p className="registerFooter">
          Already have an account? <Link to="/login" className="registerLink">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
