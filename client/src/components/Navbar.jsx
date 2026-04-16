import { NavLink } from 'react-router-dom';

const links = [
  { to: '/report', label: '📸 Report Issue' },
  { to: '/map', label: '🗺️ Map View' },
  { to: '/admin', label: '⚙️ Admin' },
];

export default function Navbar() {
  return (
    <nav className="bg-blue-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏙️</span>
            <span className="text-xl font-bold tracking-tight">CivicAI</span>
            <span className="hidden sm:block text-blue-200 text-sm ml-1">Smart City Reporter</span>
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-900 text-white'
                      : 'text-blue-100 hover:bg-blue-600 hover:text-white'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
