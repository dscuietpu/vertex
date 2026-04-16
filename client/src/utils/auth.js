/**
 * Auth utility helpers — used by ProfilePage, Navbar, and ProtectedRoute.
 * All state lives in localStorage so it survives page refreshes.
 */

/** Returns the parsed user object stored after login/register, or null. */
export function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Returns the role string ('Citizen' | 'GOV') or null if not logged in. */
export function getUserRole() {
  return getStoredUser()?.role ?? null;
}

/** Returns the JWT token stored after login/register, or null. */
export function getToken() {
  return localStorage.getItem('token') || null;
}

/** Returns true when a valid (non-expired) token exists. */
export function isAuthenticated() {
  const token = getToken();
  if (!token) return false;
  try {
    // Decode payload (no verification — server validates on protected routes)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

/** Clears all auth state from localStorage (logout). */
export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

/**
 * Generates a deterministic Citizen ID from a MongoDB ObjectId string.
 * Format: CID-XXXXXX (last 6 hex chars, uppercased).
 */
export function formatCitizenId(mongoId = '') {
  return `CID-${mongoId.slice(-6).toUpperCase()}`;
}

/**
 * Returns an avatar URL from DiceBear seeded with the user's name.
 */
export function avatarUrl(name = 'User') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="35" r="22" fill="#9ca3af"/><rect x="18" y="64" width="64" height="32" rx="16" fill="#9ca3af"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
