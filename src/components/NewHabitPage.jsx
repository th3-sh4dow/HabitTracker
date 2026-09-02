import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import SideNav from "./SideNav";
import { habitsApi, checkinsApi } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

// Design tokens
const colors = {
  primary: "#012d1d",
  onBackground: "#1a1c1a",
  outline: "#717973",
  onSecondary: "#ffffff",
  primaryFixed: "#c1ecd4",
  onSurfaceVariant: "#414844",
  surfaceContainer: "#eeeeeb",
  surfaceContainerLow: "#f3f4f1",
  outlineVariant: "#c1c8c2",
  surface: "#f9faf6",
  surfaceBright: "#f9faf6",
  background: "#f9faf6",
  surfaceContainerHigh: "#e8e8e5",
  surfaceContainerLowest: "#ffffff",
  onPrimary: "#ffffff",
  onPrimaryFixedVariant: "#274e3d",
  primaryContainer: "#1b4332",
  onSecondaryContainer: "#506856",
  secondaryContainer: "#cce6d0",
  secondary: "#4c6452",
  surfaceVariant: "#e2e3e0",
  error: "#ba1a1a",
  errorContainer: "#ffdad6",
  borderMint: "#d8f3dc",
  cancelBg: "#d8f3dc",
};

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
    <header className="mb-8 flex justify-between items-center md:hidden">
      <Link to="/dashboard" className="font-bold text-xl no-underline flex items-center gap-2" style={{ color: colors.primary }}>
        <Icon name="eco" size={24} style={{ color: colors.primaryContainer }} />
        <span>Evergreen Habit</span>
      </Link>
    </header>
  );
}

function buildCalendar(timezone) {
  // Get today in the user's timezone
  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date());
  const [ty, tm] = todayStr.split('-').map(Number);

  // First day of current month
  const firstDay = new Date(Date.UTC(ty, tm - 1, 1));
  // Pad with previous month days so grid starts on Sunday
  const startDow = firstDay.getUTCDay(); // 0=Sun

  const days = [];

  // Previous month trailing days (muted)
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(ty, tm - 1, -i));
    days.push({ dateStr: d.toISOString().slice(0, 10), state: 'muted' });
  }

  // Current month days
  const daysInMonth = new Date(Date.UTC(ty, tm, 0)).getUTCDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${ty}-${String(tm).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    days.push({ dateStr, state: dateStr <= todayStr ? 'selectable' : 'future' });
  }

  return { days, todayStr };
}

export default function NewHabitPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const timezone = user?.timezone ?? 'UTC';

  const [name, setName]                   = useState('');
  const [description, setDescription]     = useState('');
  const [selectedDates, setSelectedDates] = useState(new Set());
  const [showFutureError, setShowFutureError] = useState(false);
  const [saving, setSaving]               = useState(false);
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState(false);

  const { days, todayStr } = useMemo(() => buildCalendar(timezone), [timezone]);

  // Get month display label
  const [currentYear, currentMonth] = todayStr.split('-').map(Number);
  const monthLabel = new Date(currentYear, currentMonth - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  const toggleDay = (day) => {
    if (day.state === 'future') {
      setShowFutureError(true);
      setTimeout(() => setShowFutureError(false), 3000);
      return;
    }
    if (day.state === 'muted') return;

    setSelectedDates(prev => {
      const next = new Set(prev);
      if (next.has(day.dateStr)) next.delete(day.dateStr);
      else next.add(day.dateStr);
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Habit name is required.');
    setError('');
    setSaving(true);

    try {
      // 1. Create the habit
      const { habit } = await habitsApi.create({ name: name.trim(), description: description.trim() || undefined });

      // 2. Backfill selected dates (sorted ascending so streaks compute correctly)
      const sortedDates = [...selectedDates].sort();
      for (const localDate of sortedDates) {
        try {
          await checkinsApi.create(habit.id, { localDate });
        } catch {
          // Skip silently — backfill is best-effort; server validates dates
        }
      }

      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      setError(err.message || 'Failed to create habit.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="flex min-h-screen"
      style={{ background: colors.background, color: colors.onBackground, fontFamily: "Inter, sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      <SideNav />

      <main className="flex-grow p-6 md:p-10 max-w-[1200px] mx-auto w-full">
        <MobileHeader />

        <div className="max-w-2xl mx-auto">
          {/* Back link */}
          <div className="mb-6">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ color: colors.secondary }}
            >
              <Icon name="arrow_back" size={16} />
              Back to Dashboard
            </Link>
          </div>

          <h2 className="font-semibold mb-10" style={{ color: colors.primary, fontSize: 32, lineHeight: "40px" }}>
            Create New Habit
          </h2>

          {success && (
            <div
              className="mb-6 px-4 py-3 rounded-lg text-sm font-semibold flex items-center gap-2"
              style={{ background: colors.secondaryContainer, color: colors.primary }}
            >
              <Icon name="check_circle" size={18} />
              Habit created! Redirecting to dashboard…
            </div>
          )}

          {error && (
            <div
              className="mb-6 px-4 py-3 rounded-lg text-sm font-semibold flex items-center gap-2"
              style={{ background: colors.errorContainer, color: colors.error }}
            >
              <Icon name="error" size={18} />
              {error}
            </div>
          )}

          <form
            className="p-6 md:p-10 rounded-xl flex flex-col gap-6"
            style={{
              background: colors.surfaceContainerLowest,
              boxShadow: "0px 4px 12px rgba(27,67,50,0.05)",
              border: `1px solid ${colors.surfaceVariant}`,
            }}
            onSubmit={handleSubmit}
          >
            {/* Habit Name */}
            <div>
              <label htmlFor="habit-name" className="block text-sm font-semibold mb-1" style={{ color: colors.onBackground }}>
                Habit Name *
              </label>
              <input
                id="habit-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Morning Meditation"
                required
                className="w-full rounded-lg px-4 py-2 focus:outline-none transition-colors"
                style={{ background: colors.surfaceBright, border: `1px solid ${colors.borderMint}`, color: colors.onBackground }}
                onFocus={e => { e.target.style.borderColor = colors.primary; e.target.style.boxShadow = `0 0 0 1px ${colors.primary}`; }}
                onBlur={e => { e.target.style.borderColor = colors.borderMint; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="habit-desc" className="block text-sm font-semibold mb-1" style={{ color: colors.onBackground }}>
                Description (optional)
              </label>
              <textarea
                id="habit-desc"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What does this habit involve?"
                rows={2}
                className="w-full rounded-lg px-4 py-2 focus:outline-none transition-colors resize-none"
                style={{ background: colors.surfaceBright, border: `1px solid ${colors.borderMint}`, color: colors.onBackground }}
                onFocus={e => { e.target.style.borderColor = colors.primary; e.target.style.boxShadow = `0 0 0 1px ${colors.primary}`; }}
                onBlur={e => { e.target.style.borderColor = colors.borderMint; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <hr style={{ borderColor: colors.surfaceVariant }} className="my-2" />

            {/* Backfill Calendar */}
            <div>
              <div className="mb-4">
                <h3 className="font-semibold mb-1" style={{ color: colors.primary, fontSize: 22 }}>
                  Backfill Past Progress
                </h3>
                <p style={{ color: colors.onSurfaceVariant, fontSize: 14 }}>
                  Select past dates to mark as already completed. Today in your timezone ({timezone}): <strong>{todayStr}</strong>
                </p>
              </div>

              <div
                className="p-4 rounded-lg"
                style={{ background: colors.surface, border: `1px solid ${colors.surfaceVariant}` }}
              >
                {/* Month label */}
                <div className="text-center font-semibold mb-3" style={{ color: colors.primary }}>
                  {monthLabel}
                </div>

                {/* Day of week headers */}
                <div
                  className="grid grid-cols-7 gap-1 text-center mb-2 text-xs font-semibold"
                  style={{ color: colors.outline }}
                >
                  {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d}>{d}</div>)}
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {days.map((day, i) => {
                    const isSelected = selectedDates.has(day.dateStr);
                    const isFuture   = day.state === 'future';
                    const isMuted    = day.state === 'muted';
                    const dayNum     = parseInt(day.dateStr.split('-')[2], 10);

                    return (
                      <div
                        key={i}
                        onClick={() => toggleDay(day)}
                        title={isFuture ? 'Cannot select future dates' : day.dateStr}
                        className="py-1 rounded-full transition-colors text-sm"
                        style={{
                          color: isMuted || isFuture ? colors.outlineVariant : colors.onBackground,
                          background: isSelected ? colors.primary : 'transparent',
                          cursor: isFuture ? 'not-allowed' : isMuted ? 'default' : 'pointer',
                        }}
                        onMouseEnter={e => { if (!isSelected && !isMuted && !isFuture) e.currentTarget.style.background = colors.surfaceContainerHigh; }}
                        onMouseLeave={e => { if (!isSelected && !isMuted && !isFuture) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <span style={{ color: isSelected ? colors.onPrimary : undefined }}>{dayNum}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedDates.size > 0 && (
                <p className="text-sm mt-2 flex items-center gap-1" style={{ color: colors.secondary }}>
                  <Icon name="check_circle" size={16} />
                  {selectedDates.size} date{selectedDates.size > 1 ? 's' : ''} selected for backfill
                </p>
              )}

              {showFutureError && (
                <p className="text-sm mt-2 flex items-center gap-1" style={{ color: colors.error }}>
                  <Icon name="error" size={16} />
                  Cannot backfill progress for future dates.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 mt-2">
              <Link
                to="/dashboard"
                className="px-6 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ background: colors.cancelBg, color: colors.primary }}
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
                style={{ background: colors.primaryContainer, color: colors.onPrimary, boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }}
              >
                {saving ? (
                  <>
                    <span className="animate-spin material-symbols-outlined" style={{ fontSize: 16 }}>progress_activity</span>
                    Saving…
                  </>
                ) : (
                  <>
                    <Icon name="save" size={16} />
                    Save Habit
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}