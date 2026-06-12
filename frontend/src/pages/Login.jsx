import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="loginPage">
      <div className="loginCard">
        <div className="loginHeader">
          <h2 className="loginTitle">Welcome Back</h2>
          <p className="loginSubtitle">Sign in to manage your appointments</p>
        </div>

        {error && (
          <div className="errorBox">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div className="relative inputFieldFocus">
              <Mail size={18} className="inputIcon" />
              <input 
                type="email" 
                className="inputFieldWithIcon" 
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group mb-8">
            <label className="input-label">Password</label>
            <div className="relative inputFieldFocus">
              <Lock size={18} className="inputIcon" />
              <input 
                type="password" 
                className="inputFieldWithIcon" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="submitBtn" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
              <>Sign In <ArrowRight size={20} /></>
            )}
          </button>
        </form>

        <p className="loginFooter">
          Don't have an account? <Link to="/register" className="loginLink">Create account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
