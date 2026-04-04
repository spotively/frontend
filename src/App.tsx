import { BrowserRouter as Router, Routes, Route, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from './components/Layout';
import Hero from './pages/Hero';
import Dashboard from './pages/Dashboard';
import Generator from './pages/Generator';

function AuthHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get('status');

  useEffect(() => {
    if (status === 'success') {
      navigate('/dashboard', { replace: true });
    }
  }, [status, navigate]);

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
