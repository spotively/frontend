import { BrowserRouter as Router, Routes, Route, useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { useEffect, type ReactNode } from 'react';
import { Layout } from './components/Layout';
import { Footer } from './components/Footer';
import Hero from './pages/Hero';
import Dashboard from './pages/Dashboard';
import Generator from './pages/Generator';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

// Helper to check if user is authenticated
const isAuthenticated = () => !!localStorage.getItem('spotify_access');

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

function ProtectedRoute({ children }: { children: ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  // If already logged in and visiting landing, redirect to dashboard
  if (isAuthenticated() && window.location.pathname === '/') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <AuthHandler />
      <Routes>
        {/* Landing & Legal Pages - Includes Footer */}
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <Hero />
              <Footer />
            </PublicRoute>
          } 
        />
        <Route 
          path="/terms" 
          element={
            <>
              <Terms />
              <Footer />
            </>
          } 
        />
        <Route 
          path="/privacy" 
          element={
            <>
              <Privacy />
              <Footer />
            </>
          } 
        />

        {/* App Shell - Protected pages (No Footer) */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/generate" 
          element={
            <ProtectedRoute>
              <Layout>
                <Generator />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Catch all - redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
