import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import UploadPage from './pages/UploadPage';
import MapPage from './pages/MapPage';
import AdminPage from './pages/AdminPage';
import CitizenLoginPage from './pages/CitizenLoginPage';
import AuthorityLoginPage from './pages/AuthorityLoginPage';
import RegisterPage from './pages/RegisterPage';
import Navbar from './components/Navbar';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public landing + auth pages (no shared Navbar) */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login/citizen" element={<CitizenLoginPage />} />
        <Route path="/login/authority" element={<AuthorityLoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* App pages (with Navbar) */}
        <Route
          path="/*"
          element={
            <div className="min-h-screen bg-slate-50 flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/report" element={<UploadPage />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                </Routes>
              </main>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
