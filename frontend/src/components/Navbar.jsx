import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, X, Heart, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  
  // Theme state
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbarWrapper">
        <Link to="/" className="logo">
          <div className="logoIcon">
            <Heart size={22} color="white" fill="white" />
          </div>
          <span className="logoText">
            Doc<span className="logoHighlight">Reserv</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="desktopMenu">
          <Link to="/doctors" className="navLink">Find Doctors</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="navLink">Dashboard</Link>
              <div className="userSection">
                <button onClick={toggleTheme} className="themeToggleBtn mr-2" title="Toggle Theme">
                  {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
                <div className="userInfo">
                  <div className="userName">{user.name}</div>
                  <div className="userRole">{user.role}</div>
                </div>
                <button onClick={handleLogout} className="logoutBtn" title="Logout">
                  <LogOut size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="authButtons">
              <button onClick={toggleTheme} className="themeToggleBtn mr-2" title="Toggle Theme">
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              <Link to="/login" className="btn btn-outline border-slate-200 text-slate-600 hover:border-teal-600 hover:text-teal-600">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <button onClick={toggleTheme} className="themeToggleBtn" title="Toggle Theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button className="mobileMenuBtn" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t dark:border-t-slate-800 animate-fade-in">
          <div className="flex flex-col gap-4">
            <Link to="/doctors" className="navLink py-2" onClick={() => setIsOpen(false)}>Find Doctors</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="navLink py-2" onClick={() => setIsOpen(false)}>Dashboard</Link>
                <div className="flex items-center justify-between py-2 border-t dark:border-t-slate-800 mt-2 pt-4">
                  <div>
                    <div className="userName">{user.name}</div>
                    <div className="userRole">{user.role}</div>
                  </div>
                  <button onClick={handleLogout} className="logoutBtn">
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-3 pt-2">
                <Link to="/login" className="btn btn-outline w-full" onClick={() => setIsOpen(false)}>Login</Link>
                <Link to="/register" className="btn btn-primary w-full" onClick={() => setIsOpen(false)}>Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
