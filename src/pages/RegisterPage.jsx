import React, { useState, useMemo } from 'react';
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
};

function Icon({ name, size = 24, style = {} }) {
  return (
    <span className="material-symbols-outlined" style={{ fontSize: size, ...style }}>
      {name}
    </span>
  );
}

// Common IANA timezones grouped for usability
const TIMEZONE_GROUPS = [
  {
    label: 'Americas',
    zones: [
      'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
      'America/Anchorage', 'America/Honolulu', 'America/Toronto', 'America/Vancouver',
      'America/Mexico_City', 'America/Sao_Paulo', 'America/Argentina/Buenos_Aires',
      'America/Bogota', 'America/Lima', 'America/Santiago',
    ],
  },
  {
    label: 'Europe',
    zones: [
      'Europe/London', 'Europe/Dublin', 'Europe/Lisbon',
      'Europe/Paris', 'Europe/Berlin', 'Europe/Amsterdam', 'Europe/Rome',
      'Europe/Madrid', 'Europe/Zurich', 'Europe/Warsaw', 'Europe/Stockholm',
      'Europe/Athens', 'Europe/Istanbul', 'Europe/Moscow',
    ],
  },
  {
    label: 'Africa',
    zones: [
      'Africa/Cairo', 'Africa/Johannesburg', 'Africa/Lagos', 'Africa/Nairobi',
      'Africa/Accra', 'Africa/Casablanca',
    ],
  },
  {
    label: 'Asia',
    zones: [
      'Asia/Dubai', 'Asia/Karachi', 'Asia/Kolkata', 'Asia/Dhaka',
      'Asia/Colombo', 'Asia/Bangkok', 'Asia/Ho_Chi_Minh', 'Asia/Jakarta',
      'Asia/Singapore', 'Asia/Kuala_Lumpur', 'Asia/Shanghai', 'Asia/Hong_Kong',
      'Asia/Taipei', 'Asia/Tokyo', 'Asia/Seoul', 'Asia/Vladivostok',
      'Asia/Riyadh', 'Asia/Tehran', 'Asia/Kabul', 'Asia/Tashkent',
      'Asia/Almaty', 'Asia/Yekaterinburg',
    ],
  },
  {
    label: 'Pacific',
    zones: [
      'Pacific/Auckland', 'Pacific/Fiji', 'Pacific/Guam',
      'Pacific/Honolulu', 'Pacific/Tahiti',
    ],
  },
  {
    label: 'Other',
    zones: ['UTC'],
  },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [timezone, setTimezone]     = useState('Asia/Kolkata');
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [showPass, setShowPass]     = useState(false);

  // Detect browser timezone as suggestion
  const detectedTimezone = useMemo(() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return null; }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPw) {
      return setError('Passwords do not match.');
    }
    if (password.length < 8) {
      return setError('Password must be at least 8 characters.');
    }

    setLoading(true);
    try {
      const data = await authApi.register({ email, password, timezone });
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
        className="min-h-screen flex items-center justify-center px-4 py-8"
        style={{ background: colors.surface, fontFamily: 'Inter, sans-serif' }}
      >
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
            <Link to="/" className="inline-flex items-center gap-2 mb-3 no-underline" style={{ color: colors.primary }}>
              <Icon name="eco" size={32} style={{ color: colors.primaryContainer }} />
              <span className="text-2xl font-bold">Evergreen Habit</span>
            </Link>
            <p style={{ color: colors.onSurfaceVariant }} className="text-sm">
              Start building habits that last.
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
            <h1 className="text-2xl font-semibold mb-6" style={{ color: colors.primary }}>
              Create account
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
                <label htmlFor="reg-email" className="text-sm font-semibold" style={{ color: colors.onBackground }}>
                  Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="rounded-lg px-4 py-2.5 focus:outline-none transition-all"
                  style={{ border: `1px solid ${colors.outlineVariant}`, background: colors.surface, color: colors.onBackground }}
                  onFocus={e => { e.target.style.borderColor = colors.primary; e.target.style.boxShadow = `0 0 0 1px ${colors.primary}`; }}
                  onBlur={e => { e.target.style.borderColor = colors.outlineVariant; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <label htmlFor="reg-password" className="text-sm font-semibold" style={{ color: colors.onBackground }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    className="w-full rounded-lg px-4 py-2.5 pr-12 focus:outline-none transition-all"
                    style={{ border: `1px solid ${colors.outlineVariant}`, background: colors.surface, color: colors.onBackground }}
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

              {/* Confirm password */}
              <div className="flex flex-col gap-1">
                <label htmlFor="reg-confirm" className="text-sm font-semibold" style={{ color: colors.onBackground }}>
                  Confirm Password
                </label>
                <input
                  id="reg-confirm"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="rounded-lg px-4 py-2.5 focus:outline-none transition-all"
                  style={{ border: `1px solid ${colors.outlineVariant}`, background: colors.surface, color: colors.onBackground }}
                  onFocus={e => { e.target.style.borderColor = colors.primary; e.target.style.boxShadow = `0 0 0 1px ${colors.primary}`; }}
                  onBlur={e => { e.target.style.borderColor = colors.outlineVariant; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Timezone */}
              <div className="flex flex-col gap-1">
                <label htmlFor="reg-timezone" className="text-sm font-semibold" style={{ color: colors.onBackground }}>
                  Your Timezone
                </label>

                {detectedTimezone && detectedTimezone !== timezone && (
                  <button
                    type="button"
                    onClick={() => setTimezone(detectedTimezone)}
                    className="text-xs text-left mb-1 hover:underline flex items-center gap-1"
                    style={{ color: colors.secondary }}
                  >
                    <Icon name="my_location" size={14} />
                    Use detected: {detectedTimezone}
                  </button>
                )}

                <div className="relative">
                  <select
                    id="reg-timezone"
                    value={timezone}
                    onChange={e => setTimezone(e.target.value)}
                    required
                    className="w-full appearance-none rounded-lg px-4 py-2.5 focus:outline-none transition-all cursor-pointer"
                    style={{ border: `1px solid ${colors.outlineVariant}`, background: colors.surface, color: colors.onBackground }}
                    onFocus={e => { e.target.style.borderColor = colors.primary; }}
                    onBlur={e => { e.target.style.borderColor = colors.outlineVariant; }}
                  >
                    {TIMEZONE_GROUPS.map(group => (
                      <optgroup key={group.label} label={group.label}>
                        {group.zones.map(tz => (
                          <option key={tz} value={tz}>{tz}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <Icon
                    name="expand_more"
                    size={20}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      pointerEvents: 'none', color: colors.onSurfaceVariant,
                    }}
                  />
                </div>

                <p className="text-xs mt-0.5" style={{ color: colors.onSurfaceVariant }}>
                  Streaks are calculated using midnight in this timezone.
                </p>
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
                    Creating account…
                  </>
                ) : (
                  <>
                    <Icon name="person_add" size={20} />
                    Create Account
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm" style={{ color: colors.onSurfaceVariant }}>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold hover:underline" style={{ color: colors.secondary }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
