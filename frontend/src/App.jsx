import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorsList from './pages/DoctorsList';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import './AppPages.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="loadingContainer py-20 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return children;
};

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="homeSection">
      <h1 className="heroTitle">
        Healthcare <span className="heroPrimary">Simplified</span>.
      </h1>
      <p className="heroSubtitle">
        Connect with the best doctors and book your appointments in just a few clicks. Your health is our priority.
      </p>
      <div className="heroActions">
        <button onClick={() => navigate('/doctors')} className="heroBtnPrimary">Find a Doctor</button>
        <button onClick={() => navigate('/doctors')} className="heroBtnOutline">Learn More</button>
      </div>
    </div>
  );
};

const DashboardSelector = () => {
  const { user } = useAuth();
  if (user?.role === 'doctor') {
    return <DoctorDashboard />;
  }
  return <PatientDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/doctors" element={<DoctorsList />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardSelector />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
