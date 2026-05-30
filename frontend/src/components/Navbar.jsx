import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Menu, X, Heart } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-card" style={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 1000, 
      borderRadius: 0, 
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none'
    }}>
      <div className="container" style={{ 
        height: 'var(--header-height)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            background: 'var(--primary)', 
            padding: '8px', 
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(67, 97, 238, 0.2)'
          }}>
            <Heart size={24} color="white" fill="white" />
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Doc<span style={{ color: 'var(--primary)' }}>Reserv</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="nav-menu">
          <Link to="/doctors" style={{ fontWeight: 500, color: 'var(--text-muted)' }}>Find Doctors</Link>
          {user ? (
            <>
              <Link to="/dashboard" style={{ fontWeight: 500, color: 'var(--text-muted)' }}>Dashboard</Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--glass-border)', paddingLeft: '24px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</div>
                </div>
                <button onClick={handleLogout} className="btn" style={{ padding: '8px' }}>
                  <LogOut size={20} color="var(--text-muted)" />
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
