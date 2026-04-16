import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Building2, Camera, Map, LayoutDashboard, User, LogOut, ShieldCheck
} from 'lucide-react';
import { avatarUrl } from '../utils/auth';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const loggedIn  = !!user;
  const role      = user?.role ?? null;
  const isGov     = role === 'GOV';
  const isCitizen = role === 'Citizen';

  const handleLogout = () => {
    logout();
    navigate(isGov ? '/login/authority' : '/login/citizen', { replace: true });
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to={isGov ? '/admin' : '/'} className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">CivicAI</span>
            {isGov && (
              <span className="hidden sm:inline-flex items-center gap-1 ml-2 px-2 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full">
                <ShieldCheck className="w-3 h-3" /> Admin
              </span>
            )}
            {!isGov && (
              <span className="hidden sm:inline-block text-slate-400 text-sm ml-1 font-medium">Platform</span>
            )}
          </Link>

          {/* Nav links — role-aware */}
          <div className="flex items-center gap-2">

            {/* GOV: Map View only */}
            {isGov && (
              <NavLink
                to="/map"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Map className="w-4 h-4" />
                <span className="hidden sm:inline">Map View</span>
              </NavLink>
            )}

            {/* Citizen: Report Issue + Map View */}
            {isCitizen && (
              <>
                <NavLink
                  to="/report"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Camera className="w-4 h-4" />
                  <span className="hidden sm:inline">Report Issue</span>
                </NavLink>
                <NavLink
                  to="/map"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Map className="w-4 h-4" />
                  <span className="hidden sm:inline">Map View</span>
                </NavLink>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </NavLink>
              </>
            )}

            {/* Guest: show map publicly + login links */}
            {!loggedIn && (
              <NavLink
                to="/map"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Map className="w-4 h-4" />
                <span className="hidden sm:inline">Map View</span>
              </NavLink>
            )}

            {/* Divider */}
            <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />

            {/* Authenticated user block */}
            {loggedIn ? (
              <div className="flex items-center gap-2">
                {/* Citizen: avatar → /profile */}
                {isCitizen && (
                  <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`
                    }
                  >
                    <img
                      src={user?.profilePicture || avatarUrl(user?.name || 'User')}
                      alt={user?.name || 'Profile'}
                      className="w-7 h-7 rounded-full border border-slate-200 bg-slate-100 object-cover"
                    />
                    <span className="hidden sm:inline max-w-[100px] truncate">
                      {user?.name?.split(' ')[0] || 'Profile'}
                    </span>
                  </NavLink>
                )}

                {/* GOV: shield badge with name */}
                {isGov && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 ring-1 ring-indigo-100 text-sm font-medium text-indigo-700">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="hidden sm:inline max-w-[100px] truncate">
                      {user?.name?.split(' ')[0] || 'Admin'}
                    </span>
                  </div>
                )}

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              /* Guest: Login link */
              <Link
                to="/login/citizen"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
}
