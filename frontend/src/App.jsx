import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import DiksuchAI from './components/DiksuchAI';
import { useAuthStore } from './store/authStore';
import { Button } from './components/ui/Button';

// Scroll to top component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Conditional AI Chatbot wrapper
const ConditionalDiksuchAI = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  // Don't show global chatbot on project details page, project builder, or diksuchi-ai page
  const hideOnRoutes = ['/projects/', '/project-builder', '/diksuchi-ai']; // Partial match for detail pages
  const shouldHide = hideOnRoutes.some(route => location.pathname.includes(route));

  if (!isAuthenticated || shouldHide) return null;

  return <DiksuchAI />;
};

// Conditional Footer wrapper
const ConditionalFooter = () => {
  const location = useLocation();

  // Don't show footer on project details page, project builder, or diksuchi-ai page
  const hideOnRoutes = ['/project/', '/project-builder', '/diksuchi-ai'];
  const shouldHide = hideOnRoutes.some(route => location.pathname.includes(route));

  if (shouldHide) return null;

  return <Footer />;
};

// Pages
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Callback from './pages/Callback';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CreatorUpload from './pages/CreatorUpload';
import CreatorDashboard from './pages/CreatorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BulkUpload from './pages/BulkUpload';
import ProjectBuilder from './pages/ProjectBuilder';
import ProjectBuilderDashboard from './pages/ProjectBuilderDashboard';
import DiksuchAIPage from './pages/DiksuchAI';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import RefundPolicy from './pages/RefundPolicy';
import Support from './pages/Support';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { initAuth } = useAuthStore();

  // Initialize auth state on app mount
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ScrollToTop />
      <div className="min-h-screen flex flex-col overflow-x-hidden w-full">
        <Navbar />
        <ErrorBoundary>
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/project/:id" element={<ProjectDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/callback" element={<Callback />} />
              <Route path="/login/callback" element={<Callback />} />

              {/* Legal Pages */}
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-conditions" element={<TermsConditions />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/support" element={<Support />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/creator/upload"
                element={
                  <ProtectedRoute roles={['creator', 'admin']}>
                    <CreatorUpload />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/creator/dashboard"
                element={
                  <ProtectedRoute roles={['creator', 'admin']}>
                    <CreatorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/bulk-upload"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <BulkUpload />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/project-builder"
                element={
                  <ProtectedRoute>
                    <ProjectBuilder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/project-builder/:id"
                element={
                  <ProtectedRoute>
                    <ProjectBuilderDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/diksuchi-ai"
                element={
                  <ProtectedRoute>
                    <DiksuchAIPage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all route for 404 */}
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
                  <div className="text-center px-4">
                    <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Page not found</p>
                    <Link to="/">
                      <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white">
                        Go Home
                      </Button>
                    </Link>
                  </div>
                </div>
              } />
            </Routes>
          </main>
        </ErrorBoundary>
        <ConditionalFooter />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
              style: {
                border: '1px solid #10b981',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
            loading: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
          }}
        />

        {/* AI Chatbot - Conditional based on route */}
        <ConditionalDiksuchAI />
      </div>
    </Router>
  );
}

export default App;

