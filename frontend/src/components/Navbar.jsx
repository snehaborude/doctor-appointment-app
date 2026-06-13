import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, X, Heart } from 'lucide-react';
import { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-800 no-underline">
          <div className="bg-teal-600 p-2 rounded-lg flex items-center justify-center">
            <Heart size={20} color="white" fill="white" />
          </div>
          Doc<span className="text-teal-600">Reserv</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/doctors" className="text-sm font-medium text-gray-500 hover:text-teal-600 transition-colors no-underline">
            Find Doctors
          </Link>
          <Link to="/services" className="text-sm font-medium text-gray-500 hover:text-teal-600 transition-colors no-underline">
            Services
          </Link>
          <Link to="/about" className="text-sm font-medium text-gray-500 hover:text-teal-600 transition-colors no-underline">
            About
          </Link>
          {user && (
            <Link to="/dashboard" className="text-sm font-medium text-gray-500 hover:text-teal-600 transition-colors no-underline">
              Dashboard
            </Link>
          )}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3 border-l border-gray-200 pl-6">
          {user ? (
            <>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-gray-200" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
              )}
              <div className="text-left">
                <div className="text-sm font-semibold text-gray-800">{user.name}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">{user.role}</div>
              </div>
              <button onClick={handleLogout} title="Logout"
                className="p-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors border-0 bg-transparent cursor-pointer">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login"
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:border-teal-500 hover:text-teal-600 font-medium text-sm transition-colors no-underline">
                Login
              </Link>
              <Link to="/register"
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm transition-colors no-underline">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2 text-gray-700 border-0 bg-transparent cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-6 pb-4 bg-white border-t border-gray-100">
          <div className="flex flex-col gap-3 pt-3">
            <Link to="/doctors" className="text-sm font-medium text-gray-500 hover:text-teal-600 no-underline"
              onClick={() => setIsOpen(false)}>
              Find Doctors
            </Link>
            <Link to="/services" className="text-sm font-medium text-gray-500 hover:text-teal-600 no-underline"
              onClick={() => setIsOpen(false)}>
              Services
            </Link>
            <Link to="/about" className="text-sm font-medium text-gray-500 hover:text-teal-600 no-underline"
              onClick={() => setIsOpen(false)}>
              About
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="text-sm font-medium text-gray-500 hover:text-teal-600 no-underline"
                  onClick={() => setIsOpen(false)}>
                  Dashboard
                </Link>
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm uppercase">
                        {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{user.name}</div>
                      <div className="text-xs text-gray-400 uppercase">{user.role}</div>
                    </div>
                  </div>
                  <button onClick={handleLogout}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg border-0 bg-transparent cursor-pointer">
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link to="/login"
                  className="text-center py-2 border border-gray-300 rounded-lg text-gray-600 font-medium text-sm no-underline"
                  onClick={() => setIsOpen(false)}>
                  Login
                </Link>
                <Link to="/register"
                  className="text-center py-2 bg-teal-600 text-white rounded-lg font-medium text-sm no-underline"
                  onClick={() => setIsOpen(false)}>
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
