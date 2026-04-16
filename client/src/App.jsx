import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import UploadPage from './pages/UploadPage';
import MapPage from './pages/MapPage';
import AdminPage from './pages/AdminPage';
import CitizenLoginPage from './pages/CitizenLoginPage';
import AuthorityLoginPage from './pages/AuthorityLoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import CitizenDashboard from './pages/CitizenDashboard';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Public pages — no shared Navbar */}
        <Route path="/"                element={<LandingPage />} />
        <Route path="/login/citizen"   element={<CitizenLoginPage />} />
        <Route path="/login/authority" element={<AuthorityLoginPage />} />
        <Route path="/register"        element={<RegisterPage />} />

        {/* App pages — shared Navbar */}
        <Route
          path="/*"
          element={
            <div className="min-h-screen bg-slate-50 flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Routes>

                  {/* ── Citizen-only pages ── */}
                  <Route
                    path="/report"
                    element={
                      <ProtectedRoute requiredRole="Citizen">
                        <UploadPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/map" element={<MapPage />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute requiredRole="Citizen">
                        <CitizenDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute requiredRole="Citizen">
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* ── GOV / Admin-only page ── */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute
                        requiredRole="GOV"
                        redirectTo="/login/authority"
                      >
                        <AdminPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch-all — send to home */}
                  <Route path="*" element={<Navigate to="/" replace />} />

                </Routes>
              </main>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  );
}
