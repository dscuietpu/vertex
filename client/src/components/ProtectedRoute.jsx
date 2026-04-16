import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../utils/auth';

/**
 * ProtectedRoute — guards a route by authentication and optionally by role.
 *
 * Props:
 *   children     — the page component to render
 *   requiredRole — 'Citizen' | 'GOV' | undefined (any authenticated user)
 *   redirectTo   — where to send unauthenticated visitors (default: /login/citizen)
 */
export default function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/login/citizen',
}) {
  // Not logged in at all
  if (!isAuthenticated()) {
    return <Navigate to={redirectTo} replace />;
  }

  // Logged in but wrong role
  if (requiredRole && getUserRole() !== requiredRole) {
    // GOV trying to reach a citizen page → send to admin
    if (getUserRole() === 'GOV') {
      return <Navigate to="/admin" replace />;
    }
    // Citizen trying to reach admin → send to profile
    return <Navigate to="/profile" replace />;
  }

  return children;
}
