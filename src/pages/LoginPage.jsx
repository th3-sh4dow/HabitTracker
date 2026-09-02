import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const colors = {
  primary: '#012d1d',
  onBackground: '#1a1c1a',
  surface: '#f9faf6',
  surfaceContainerLowest: '#ffffff',
  surfaceVariant: '#e2e3e0',
  outlineVariant: '#c1c8c2',
  outline: '#717973',
  primaryContainer: '#1b4332',
  onPrimary: '#ffffff',
  secondaryContainer: '#cce6d0',
  onSecondaryContainer: '#506856',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onSurfaceVariant: '#414844',
  secondary: '#4c6452',
  primaryFixed: '#c1ecd4',
};

function Icon({ name, size = 24, style = {} }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{ fontSize: size, ...style }}
    >
      {name}
    </span>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: colors.surface, fontFamily: 'Inter, sans-serif' }}
      >
        {/* Background grid pattern */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(27,67,50,0.04) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(27,67,50,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 mb-3 no-underline"
              style={{ color: colors.primary }}
            >
              <Icon name="eco" size={32} style={{ color: colors.primaryContainer }} />
              <span className="text-2xl font-bold">Evergreen Habit</span>
            </Link>
            <p style={{ color: colors.onSurfaceVariant }} className="text-sm">
              Track your habits. Build your streaks.
            </p>
          </div>

          {/* Card */}
          <div
            className="rounded-2xl p-8 border"
            style={{
              background: colors.surfaceContainerLowest,
              borderColor: colors.surfaceVariant,
              boxShadow: '0 8px 32px rgba(27,67,50,0.08)',
            }}
          >
            <h1
              className="text-2xl font-semibold mb-6"
              style={{ color: colors.primary }}
            >
              Welcome back
            </h1>

            {error && (
              <div
                className="mb-4 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
                style={{ background: colors.errorContainer, color: colors.error }}
              >
                <Icon name="error" size={18} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Email */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="login-email"
                  className="text-sm font-semibold"
                  style={{ color: colors.onBackground }}
                >
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="rounded-lg px-4 py-2.5 focus:outline-none transition-all"
                  style={{
                    border: `1px solid ${colors.outlineVariant}`,
                    background: colors.surface,
                    color: colors.onBackground,
                  }}
                  onFocus={e => { e.target.style.borderColor = colors.primary; e.target.style.boxShadow = `0 0 0 1px ${colors.primary}`; }}
                  onBlur={e => { e.target.style.borderColor = colors.outlineVariant; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="login-password"
                  className="text-sm font-semibold"
                  style={{ color: colors.onBackground }}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-lg px-4 py-2.5 pr-12 focus:outline-none transition-all"
                    style={{
                      border: `1px solid ${colors.outlineVariant}`,
                      background: colors.surface,
                      color: colors.onBackground,
                    }}
                    onFocus={e => { e.target.style.borderColor = colors.primary; e.target.style.boxShadow = `0 0 0 1px ${colors.primary}`; }}
                    onBlur={e => { e.target.style.borderColor = colors.outlineVariant; e.target.style.boxShadow = 'none'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: colors.outline }}
                  >
                    <Icon name={showPass ? 'visibility_off' : 'visibility'} size={20} />
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: colors.primaryContainer, color: colors.onPrimary }}
              >
                {loading ? (
                  <>
                    <span className="animate-spin material-symbols-outlined" style={{ fontSize: 20 }}>progress_activity</span>
                    Signing in…
                  </>
                ) : (
                  <>
                    <Icon name="login" size={20} />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm" style={{ color: colors.onSurfaceVariant }}>
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold hover:underline"
                style={{ color: colors.secondary }}
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
