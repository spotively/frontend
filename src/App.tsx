import { BrowserRouter as Router, Routes, Route, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from './components/Layout';
import Hero from './pages/Hero';
import Dashboard from './pages/Dashboard';
import Generator from './pages/Generator';

function AuthHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    
    // Check for "success" status in either query params or hash
    const isSuccess = searchParams.get('status') === 'success' || hashParams.get('status') === 'success';

    // Extraction helper for any spotify tokens in the hash
    if (hash) {
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (accessToken) {
        localStorage.setItem('spotify_access', accessToken);
        if (refreshToken) {
          localStorage.setItem('spotify_refresh', refreshToken);
        }
        
        // Clear tokens from the URL once stored
        window.history.replaceState(null, '', window.location.pathname + (isSuccess ? '?status=success' : ''));
      }
    }

    if (isSuccess) {
      navigate('/dashboard', { replace: true });
    }
  }, [searchParams, navigate]);

  return null;
}

function App() {
  return (
    <Router>
      <Layout>
        <AuthHandler />
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/generate" element={<Generator />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
