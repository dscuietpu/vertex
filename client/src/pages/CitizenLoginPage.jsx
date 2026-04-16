import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function CitizenLoginPage() {
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    // TODO: integrate with auth API
    setTimeout(() => {
      setLoading(false);
      setError('Authentication not yet configured. Please connect your auth backend.');
    }, 1200);
  };

  return (
    <div className="auth-page">
      {/* Left panel – illustration */}
      <div className="auth-panel auth-panel--left auth-panel--citizen">
        <div className="auth-panel__overlay" />
        <div className="auth-panel__content">
          <Link to="/" className="auth-panel__logo">
            <span>🏙️</span> CivicAI
          </Link>
          <img
            src="/images/citizen-login.png"
            alt="Citizen reporting civic issues on smartphone"
            className="auth-panel__illustration"
          />
          <div className="auth-panel__tagline">
            <h2>Your voice shapes your city.</h2>
            <p>Join thousands of citizens driving change with AI-powered complaint management.</p>
          </div>
          <div className="auth-panel__stats">
            <div className="auth-panel__stat">
              <span className="auth-panel__stat-num">12K+</span>
              <span className="auth-panel__stat-label">Issues Resolved</span>
            </div>
            <div className="auth-panel__stat">
              <span className="auth-panel__stat-num">48</span>
              <span className="auth-panel__stat-label">Cities</span>
            </div>
            <div className="auth-panel__stat">
              <span className="auth-panel__stat-num">94%</span>
              <span className="auth-panel__stat-label">Satisfaction</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="auth-panel auth-panel--right">
        <div className="auth-form-container">
          {/* Mobile logo */}
          <Link to="/" className="auth-mobile-logo">
            <span>🏙️</span> CivicAI
          </Link>

          <div className="auth-form-header">
            <div className="auth-form-icon auth-form-icon--citizen">👤</div>
            <h1 className="auth-form-title">Citizen Login</h1>
            <p className="auth-form-subtitle">Sign in to report and track civic issues</p>
          </div>

          {error && (
            <div className="auth-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" id="citizen-login-form">
            <div className="auth-field">
              <label htmlFor="citizen-email" className="auth-label">Email Address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">📧</span>
                <input
                  id="citizen-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="auth-input"
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="citizen-password" className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>
                <input
                  id="citizen-password"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  className="auth-input"
                />
              </div>
            </div>

            <div className="auth-form-row">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  name="remember"
                  id="citizen-remember"
                  checked={form.remember}
                  onChange={handleChange}
                  className="auth-checkbox"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="auth-forgot">Forgot Password?</Link>
            </div>

            <button
              type="submit"
              id="citizen-login-btn"
              disabled={loading}
              className="auth-submit-btn auth-submit-btn--citizen"
            >
              {loading ? (
                <span className="auth-spinner">
                  <span className="auth-spinner__dot" />
                  <span className="auth-spinner__dot" />
                  <span className="auth-spinner__dot" />
                </span>
              ) : (
                <>🔑 Login</>
              )}
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <div className="auth-alt-actions">
            <Link to="/register" className="auth-register-btn" id="citizen-register-btn">
              ✍️ Create an Account
            </Link>
          </div>

          <div className="auth-switch-link">
            Are you a government official?{' '}
            <Link to="/login/authority" className="auth-switch-anchor">
              Login as Authority →
            </Link>
          </div>

          <div className="auth-back-link">
            <Link to="/" className="auth-back">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
