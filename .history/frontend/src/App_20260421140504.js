import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import TopNavbar from './components/TopNavbar';
import BackButton from './components/BackButton';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import PasswordAnalyzer from './pages/PasswordAnalyzer';
import WebsiteScanner from './pages/WebsiteScanner';
import PhishingDetector from './pages/PhishingDetector';
import DomainIntelligence from './pages/DomainIntelligence';
import BreachChecker from './pages/BreachChecker';
import IPAnalyzer from './pages/IPAnalyzer';
import EmailAnalyzer from './pages/EmailAnalyzer';
import RiskDashboard from './pages/RiskDashboard';
import History from './pages/History';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Main App Layout for authenticated pages
const AppLayout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 1024);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen relative" style={{ backgroundImage: "url('/bg.png')", backgroundAttachment: 'fixed', backgroundSize: 'cover' }}>
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      
      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${isOpen ? 'lg:pl-80' : 'pl-0'}`}>
        <TopNavbar toggleSidebar={() => setIsOpen(!isOpen)} />
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex-1 overflow-auto">
          {/* Automatically inject back button on non-dashboard route */}
          {location.pathname !== '/dashboard' && <BackButton />}
          {children}
        </div>
      </main>
    </div>
  );
};

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen text-slate-100" style={{ backgroundImage: "url('/bg.png')", backgroundAttachment: 'fixed', backgroundSize: 'cover' }}>
      <Navbar />
      <main className="pt-24">{children}</main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicLayout>
                <Home />
              </PublicLayout>
            }
          />
          <Route
            path="/login"
            element={
              <PublicLayout>
                <Login />
              </PublicLayout>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicLayout>
                <Signup />
              </PublicLayout>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/password"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PasswordAnalyzer />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/website"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <WebsiteScanner />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/phishing"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PhishingDetector />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/domain"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DomainIntelligence />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/breach"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <BreachChecker />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ip"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <IPAnalyzer />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/email"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <EmailAnalyzer />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/risk"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <RiskDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <History />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Redirects */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
