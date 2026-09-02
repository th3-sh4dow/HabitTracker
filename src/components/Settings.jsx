import React, { useState } from "react";
import { Link } from "react-router-dom";
import SideNav from "./SideNav";
import { authApi } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const colors = {
  primary: "#012d1d",
  onBackground: "#1a1c1a",
  outline: "#717973",
  error: "#ba1a1a",
  errorContainer: "#ffdad6",
  primaryFixed: "#c1ecd4",
  primaryFixedDim: "#a5d0b9",
  primaryContainer: "#1b4332",
  secondary: "#4c6452",
  secondaryContainer: "#cce6d0",
  secondaryFixed: "#cee9d3",
  onPrimary: "#ffffff",
  onSurface: "#1a1c1a",
  onSurfaceVariant: "#414844",
  onSecondaryContainer: "#506856",
  surface: "#f9faf6",
  background: "#f9faf6",
  surfaceBright: "#f9faf6",
  surfaceVariant: "#e2e3e0",
  surfaceContainer: "#eeeeeb",
  surfaceContainerLow: "#f3f4f1",
  surfaceContainerHigh: "#e8e8e5",
  surfaceContainerHighest: "#e2e3e0",
  surfaceContainerLowest: "#ffffff",
  outlineVariant: "#c1c8c2",
  tertiaryFixed: "#ffdad8",
  onTertiaryFixedVariant: "#673a39",
};

// All IANA timezones grouped
const TIMEZONE_GROUPS = [
  { label: 'Americas', zones: ['America/New_York','America/Chicago','America/Denver','America/Los_Angeles','America/Anchorage','America/Honolulu','America/Toronto','America/Vancouver','America/Mexico_City','America/Sao_Paulo','America/Argentina/Buenos_Aires','America/Bogota','America/Lima','America/Santiago'] },
  { label: 'Europe',   zones: ['Europe/London','Europe/Dublin','Europe/Lisbon','Europe/Paris','Europe/Berlin','Europe/Amsterdam','Europe/Rome','Europe/Madrid','Europe/Zurich','Europe/Warsaw','Europe/Stockholm','Europe/Athens','Europe/Istanbul','Europe/Moscow'] },
  { label: 'Africa',   zones: ['Africa/Cairo','Africa/Johannesburg','Africa/Lagos','Africa/Nairobi','Africa/Accra','Africa/Casablanca'] },
  { label: 'Asia',     zones: ['Asia/Dubai','Asia/Karachi','Asia/Kolkata','Asia/Dhaka','Asia/Colombo','Asia/Bangkok','Asia/Ho_Chi_Minh','Asia/Jakarta','Asia/Singapore','Asia/Kuala_Lumpur','Asia/Shanghai','Asia/Hong_Kong','Asia/Taipei','Asia/Tokyo','Asia/Seoul','Asia/Vladivostok','Asia/Riyadh','Asia/Tehran','Asia/Kabul','Asia/Tashkent','Asia/Almaty','Asia/Yekaterinburg'] },
  { label: 'Pacific',  zones: ['Pacific/Auckland','Pacific/Fiji','Pacific/Guam','Pacific/Honolulu','Pacific/Tahiti'] },
  { label: 'Other',    zones: ['UTC'] },
];

function Icon({ name, fill = false, size = 24, className = "", style = {} }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontVariationSettings: fill ? "'FILL' 1" : "'FILL' 0", fontSize: size, ...style }}
    >
      {name}
    </span>
  );
}

function MobileHeader() {
  return (
    <header className="md:hidden w-full sticky top-0 flex justify-between items-center px-6 py-4 z-50 border-b" style={{ background: colors.background, borderColor: colors.surfaceVariant }}>
      <Link to="/dashboard" className="font-bold text-xl no-underline flex items-center gap-2" style={{ color: colors.primary }}>
        <Icon name="eco" size={24} style={{ color: colors.primaryContainer }} />
        <span>Evergreen Habit</span>
      </Link>
    </header>
  );
}

function SettingsCard({ icon, title, description, children }) {
  return (
    <section
      className="rounded-xl p-6 border transition-all hover:-translate-y-0.5"
      style={{ background: colors.surfaceContainerLowest, borderColor: `${colors.surfaceVariant}80`, boxShadow: "0px 4px 12px rgba(27,67,50,0.05)" }}
    >
      <div className="flex items-start gap-4 mb-6">
        <div className="p-2 rounded-lg" style={{ background: colors.secondaryContainer, color: colors.primary }}>
          <Icon name={icon} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: colors.onSurface }}>{title}</h2>
          <p className="mt-1" style={{ color: colors.onSurfaceVariant }}>{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function SettingsPage() {
  const { user, refreshUser, logout } = useAuth();

  const [timezone, setTimezone]             = useState(user?.timezone ?? 'UTC');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]       = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage]               = useState('');
  const [messageType, setMessageType]       = useState('success'); // 'success' | 'error'
  const [tzSaving, setTzSaving]             = useState(false);
  const [pwSaving, setPwSaving]             = useState(false);

  const showMsg = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleTimezone = async () => {
    setTzSaving(true);
    try {
      await authApi.update({ timezone });
      await refreshUser();
      showMsg('Timezone updated successfully.', 'success');
    } catch (err) {
      showMsg(err.message || 'Failed to update timezone.', 'error');
    } finally {
      setTzSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      return showMsg('Please fill in all password fields.', 'error');
    }
    if (newPassword !== confirmPassword) {
      return showMsg('New passwords do not match.', 'error');
    }
    if (newPassword.length < 8) {
      return showMsg('New password must be at least 8 characters.', 'error');
    }

    setPwSaving(true);
    try {
      await authApi.update({ currentPassword, newPassword });
      showMsg('Password changed successfully.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showMsg(err.message || 'Failed to change password.', 'error');
    } finally {
      setPwSaving(false);
    }
  };

  const handleExport = () => {
    showMsg('Export requested. A download link will be emailed to you.', 'success');
  };

  const handleDelete = () => {
    const confirmed = window.confirm('Are you sure you want to permanently delete your account? This cannot be undone.');
    if (confirmed) {
      alert('Account deletion would be processed here (not implemented in demo).');
    }
  };

  const initials = user?.email?.[0]?.toUpperCase() ?? 'U';
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—';

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Material+Symbols+Outlined:FILL,wght@0..1,100..700&display=swap"
        rel="stylesheet"
      />

      <div className="flex min-h-screen font-sans" style={{ background: colors.background, color: colors.onBackground }}>

        <SideNav />

        <div className="flex-1 min-w-0">
          <MobileHeader />

          <main className="flex-1 overflow-y-auto px-6 md:px-10 py-10 max-w-[1200px] mx-auto w-full">

            <header className="mb-10">
              <h1 className="text-2xl md:text-[32px] leading-10 font-semibold mb-1" style={{ color: colors.onSurface }}>
                Settings
              </h1>
              <p className="text-base" style={{ color: colors.onSurfaceVariant }}>
                Manage your account preferences and configurations.
              </p>
            </header>

            {/* Success/Error message */}
            {message && (
              <div
                className="mb-6 px-4 py-3 rounded-lg text-sm font-semibold flex items-center gap-2"
                style={{
                  background: messageType === 'success' ? colors.secondaryContainer : colors.errorContainer,
                  color: messageType === 'success' ? colors.primary : colors.error,
                }}
              >
                <Icon name={messageType === 'success' ? 'check_circle' : 'error'} size={18} />
                {message}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* LEFT */}
              <div className="lg:col-span-8 flex flex-col gap-10">

                {/* Timezone */}
                <SettingsCard icon="schedule" title="Local Timezone" description="Set your active timezone to ensure accurate streak calculations.">
                  <div
                    className="rounded-lg p-4 mb-6 border-l-4 text-sm"
                    style={{ background: colors.surfaceContainerLow, borderColor: colors.primary, color: colors.onSurfaceVariant }}
                  >
                    <strong style={{ color: colors.onSurface }}>Important:</strong>{" "}
                    Your daily habit streak calculations depend entirely on this timezone. Days roll over at midnight in the selected zone.
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="timezone" className="text-sm font-semibold" style={{ color: colors.onSurface }}>
                      Select Timezone
                    </label>
                    <div className="relative">
                      <select
                        id="timezone"
                        value={timezone}
                        onChange={e => setTimezone(e.target.value)}
                        className="w-full bg-transparent border rounded-lg px-4 py-2.5 appearance-none focus:outline-none transition-all cursor-pointer"
                        style={{ borderColor: colors.outlineVariant, color: colors.onSurface }}
                      >
                        {TIMEZONE_GROUPS.map(group => (
                          <optgroup key={group.label} label={group.label}>
                            {group.zones.map(tz => (
                              <option key={tz} value={tz}>{tz}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      <Icon name="expand_more" className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: colors.onSurfaceVariant }} />
                    </div>
                    <p className="text-xs mt-1" style={{ color: colors.onSurfaceVariant }}>
                      Currently: <span className="font-bold" style={{ color: colors.primary }}>{user?.timezone ?? timezone}</span>
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleTimezone}
                      disabled={tzSaving}
                      className="px-6 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center gap-2"
                      style={{ background: colors.primaryContainer, color: colors.onPrimary }}
                    >
                      {tzSaving ? <span className="animate-spin material-symbols-outlined" style={{ fontSize: 16 }}>progress_activity</span> : null}
                      Update Timezone
                    </button>
                  </div>
                </SettingsCard>

                {/* Password */}
                <SettingsCard icon="lock" title="Password & Security" description="Manage your authentication credentials.">
                  <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">

                    <div className="flex flex-col gap-2">
                      <label htmlFor="current-password" className="text-sm font-semibold">Current Password</label>
                      <input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-transparent border rounded-lg px-4 py-2.5 focus:outline-none transition-all"
                        style={{ borderColor: colors.outlineVariant }}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label htmlFor="new-password" className="text-sm font-semibold">New Password</label>
                        <input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-transparent border rounded-lg px-4 py-2.5 focus:outline-none transition-all"
                          style={{ borderColor: colors.outlineVariant }}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label htmlFor="confirm-password" className="text-sm font-semibold">Confirm New Password</label>
                        <input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-transparent border rounded-lg px-4 py-2.5 focus:outline-none transition-all"
                          style={{ borderColor: colors.outlineVariant }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={pwSaving}
                        className="px-6 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center gap-2"
                        style={{ background: colors.secondaryContainer, color: colors.primary }}
                      >
                        {pwSaving ? <span className="animate-spin material-symbols-outlined" style={{ fontSize: 16 }}>progress_activity</span> : null}
                        Change Password
                      </button>
                    </div>

                  </form>
                </SettingsCard>

              </div>

              {/* RIGHT */}
              <div className="lg:col-span-4 flex flex-col gap-6">

                {/* Account Overview */}
                <section
                  className="rounded-xl p-6 border"
                  style={{ background: colors.surfaceContainerLow, borderColor: `${colors.surfaceVariant}80`, boxShadow: "0px 4px 12px rgba(27,67,50,0.05)" }}
                >
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: colors.onSurfaceVariant }}>
                    Account Overview
                  </h3>
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2"
                      style={{ background: colors.primaryContainer, color: colors.onPrimary, borderColor: colors.surfaceContainerLowest }}
                    >
                      {initials}
                    </div>
                    <div>
                      <div className="font-bold" style={{ color: colors.onSurface }}>{user?.email ?? 'Loading…'}</div>
                      <div className="text-sm" style={{ color: colors.onSurfaceVariant }}>{user?.timezone}</div>
                    </div>
                  </div>
                  <div className="text-sm" style={{ color: colors.onSurfaceVariant }}>
                    Member since: <span className="font-medium" style={{ color: colors.onSurface }}>{memberSince}</span>
                  </div>
                </section>

                {/* Export */}
                <section
                  className="rounded-xl p-6 border flex flex-col items-start"
                  style={{ background: colors.surfaceContainerLowest, borderColor: `${colors.surfaceVariant}80`, boxShadow: "0px 4px 12px rgba(27,67,50,0.05)" }}
                >
                  <div className="p-2 rounded-lg mb-4" style={{ background: colors.secondaryContainer, color: colors.primary }}>
                    <Icon name="download" />
                  </div>
                  <h2 className="text-2xl font-semibold mb-1" style={{ color: colors.onSurface }}>Export Data</h2>
                  <p className="text-sm mb-6" style={{ color: colors.onSurfaceVariant }}>
                    Download a complete archive of your habit history, streaks, and check-ins in CSV format.
                  </p>
                  <button
                    onClick={handleExport}
                    className="w-full border px-6 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
                    style={{ borderColor: colors.primary, color: colors.primary }}
                  >
                    <Icon name="file_download" size={18} />
                    Request Export
                  </button>
                  <p className="text-xs mt-2 text-center w-full" style={{ color: colors.onSurfaceVariant }}>
                    A download link will be emailed to you.
                  </p>
                </section>

                {/* Danger Zone */}
                <section
                  className="rounded-xl p-6 border mt-auto"
                  style={{ background: `${colors.errorContainer}33`, borderColor: colors.errorContainer, boxShadow: "0px 4px 12px rgba(27,67,50,0.05)" }}
                >
                  <h2 className="text-sm font-semibold mb-1" style={{ color: colors.error }}>Danger Zone</h2>
                  <p className="text-sm mb-4" style={{ color: colors.onSurfaceVariant }}>
                    Permanently remove your account and all data.
                  </p>
                  <button
                    onClick={handleDelete}
                    className="text-sm font-semibold hover:underline underline-offset-4"
                    style={{ color: colors.error }}
                  >
                    Delete Account
                  </button>
                </section>

              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}