import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return children;
};

const Home = () => (
  <div className="container animate-fade-in" style={{ paddingTop: '80px', textAlign: 'center' }}>
    <h1 style={{ fontSize: '4rem', marginBottom: '16px', lineHeight: 1.1 }}>
      Healthcare <span style={{ color: 'var(--primary)' }}>Simplified</span>.
    </h1>
    <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
      Connect with the best doctors and book your appointments in just a few clicks. Your health is our priority.
    </p>
    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
      <button className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>Find a Doctor</button>
      <button className="btn btn-outline" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>Learn More</button>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  return (
    <div className="container animate-fade-in" style={{ paddingTop: '40px' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '24px' }}>Welcome back, {user?.name}!</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Upcoming Appointments</h3>
          <p style={{ color: 'var(--text-muted)' }}>You have no scheduled appointments yet.</p>
        </div>
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Health Stats</h3>
          <p style={{ color: 'var(--text-muted)' }}>Everything looks great today! Keep it up.</p>
        </div>
      </div>
    </div>
  );
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
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
