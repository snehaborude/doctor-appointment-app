import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, X, Activity, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../utils/api';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data && res.data.data) {
        const list = res.data.data.notifications || [];
        setNotifications(list);
        setUnreadCount(list.filter(n => !n.isRead).length);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15 seconds
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (isNotifOpen && !e.target.closest('.notification-container')) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [isNotifOpen]);

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleNotifClick = async (notif) => {
    setIsNotifOpen(false);
    setIsOpen(false);
    try {
      if (!notif.isRead) {
        await api.patch(`/notifications/${notif._id}/read`);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      if (notif.link) {
        navigate(notif.link);
      }
    } catch (err) {
      console.error('Error handling notification click:', err);
      if (notif.link) {
        navigate(notif.link);
      }
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-gray-800 no-underline hover:opacity-95 transition-opacity">
          <div className="bg-gradient-to-br from-teal-500 to-teal-700 p-2 rounded-xl flex items-center justify-center shadow-md shadow-teal-500/20">
            <Activity size={20} color="white" className="animate-pulse" />
          </div>
          <span className="bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent">DocReserv</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {user && (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-gray-500 hover:text-teal-600 transition-colors no-underline">
                Dashboard
              </Link>
              <Link to="/appointments/history" className="text-sm font-medium text-gray-500 hover:text-teal-600 transition-colors no-underline">
                Appointments
              </Link>
              <Link to="/prescriptions" className="text-sm font-medium text-gray-500 hover:text-teal-600 transition-colors no-underline">
                Prescriptions
              </Link>
              {user.role === 'doctor' && (
                <Link to="/availability" className="text-sm font-medium text-gray-500 hover:text-teal-600 transition-colors no-underline">
                  Availability
                </Link>
              )}
            </>
          )}
          <Link to="/doctors" className="text-sm font-medium text-gray-500 hover:text-teal-600 transition-colors no-underline">
            Find Doctors
          </Link>
          <Link to="/services" className="text-sm font-medium text-gray-500 hover:text-teal-600 transition-colors no-underline">
            Services
          </Link>
          <Link to="/about" className="text-sm font-medium text-gray-500 hover:text-teal-600 transition-colors no-underline">
            About
          </Link>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3 border-l border-gray-200 pl-6">
          {user ? (
            <>
              {/* Notification Bell Dropdown */}
              <div className="relative notification-container mr-2">
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-2 rounded-full text-gray-500 hover:text-teal-600 hover:bg-gray-100 transition-all border-0 bg-transparent cursor-pointer flex items-center justify-center focus:outline-none"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden py-1 transition-all transform scale-100 origin-top-right">
                    <div className="px-4 py-2 border-b border-gray-150 flex items-center justify-between bg-teal-50/50">
                      <span className="font-semibold text-xs text-gray-700">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-medium text-teal-600 hover:text-teal-700 bg-transparent border-0 cursor-pointer p-0"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-xs text-gray-400">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => handleNotifClick(notif)}
                            className={`px-4 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0 flex flex-col gap-0.5 text-left ${
                              !notif.isRead ? 'bg-teal-50/20' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-semibold ${!notif.isRead ? 'text-gray-800' : 'text-gray-600'}`}>
                                {notif.title}
                              </span>
                              {!notif.isRead && (
                                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 leading-normal margin-0">{notif.message}</p>
                            <span className="text-[9px] text-gray-400 mt-0.5">{formatTimeAgo(notif.createdAt)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

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

        {/* Mobile Toggle & Actions */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <div className="relative notification-container">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 rounded-full text-gray-500 hover:text-teal-600 hover:bg-gray-100 transition-colors border-0 bg-transparent cursor-pointer flex items-center justify-center"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden py-1 transition-all transform scale-100 origin-top-right">
                  <div className="px-4 py-2 border-b border-gray-150 flex items-center justify-between bg-teal-50/50">
                    <span className="font-semibold text-xs text-gray-700">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-medium text-teal-600 hover:text-teal-700 bg-transparent border-0 cursor-pointer p-0"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-gray-400">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => handleNotifClick(notif)}
                          className={`px-4 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0 flex flex-col gap-0.5 text-left ${
                            !notif.isRead ? 'bg-teal-50/20' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-semibold ${!notif.isRead ? 'text-gray-800' : 'text-gray-600'}`}>
                              {notif.title}
                            </span>
                            {!notif.isRead && (
                              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 leading-normal margin-0">{notif.message}</p>
                          <span className="text-[9px] text-gray-400 mt-0.5">{formatTimeAgo(notif.createdAt)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <button className="p-2 text-gray-700 border-0 bg-transparent cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-6 pb-4 bg-white border-t border-gray-100">
          <div className="flex flex-col gap-3 pt-3">
            {user && (
              <>
                <Link to="/dashboard" className="text-sm font-medium text-gray-500 hover:text-teal-600 no-underline"
                  onClick={() => setIsOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/appointments/history" className="text-sm font-medium text-gray-500 hover:text-teal-600 no-underline"
                  onClick={() => setIsOpen(false)}>
                  Appointments
                </Link>
                <Link to="/prescriptions" className="text-sm font-medium text-gray-500 hover:text-teal-600 no-underline"
                  onClick={() => setIsOpen(false)}>
                  Prescriptions
                </Link>
                {user.role === 'doctor' && (
                  <Link to="/availability" className="text-sm font-medium text-gray-500 hover:text-teal-600 no-underline"
                    onClick={() => setIsOpen(false)}>
                    Availability
                  </Link>
                )}
              </>
            )}
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
