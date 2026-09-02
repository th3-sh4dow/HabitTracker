import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import SideNav from "./SideNav";
import MobileNavigation from "./MobileNavigation";
import { habitsApi, checkinsApi } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const colors = {
  primary: "#012d1d",
  onBackground: "#1a1c1a",
  outline: "#717973",
  tertiaryFixedDim: "#f5b7b4",
  errorContainer: "#ffdad6",
  onSecondary: "#ffffff",
  onSecondaryFixed: "#092012",
  primaryFixed: "#c1ecd4",
  primaryFixedDim: "#a5d0b9",
  onSurfaceVariant: "#414844",
  tertiaryContainer: "#5a302f",
  secondary: "#4c6452",
  error: "#ba1a1a",
  surfaceContainer: "#eeeeeb",
  surfaceContainerLow: "#f3f4f1",
  surfaceContainerHigh: "#e8e8e5",
  surfaceContainerHighest: "#e2e3e0",
  surfaceContainerLowest: "#ffffff",
  surface: "#f9faf6",
  background: "#f9faf6",
  surfaceBright: "#f9faf6",
  surfaceDim: "#dadad7",
  surfaceVariant: "#e2e3e0",
  secondaryFixed: "#cee9d3",
  secondaryFixedDim: "#b3cdb7",
  secondaryContainer: "#cce6d0",
  primaryContainer: "#1b4332",
  onPrimary: "#ffffff",
  onPrimaryFixed: "#002114",
  onPrimaryFixedVariant: "#274e3d",
  onPrimaryContainer: "#86af99",
  onSecondaryContainer: "#506856",
  onSecondaryFixedVariant: "#354c3b",
  tertiaryFixed: "#ffdad8",
  onTertiary: "#ffffff",
  onTertiaryFixed: "#331111",
  onTertiaryFixedVariant: "#673a39",
  onTertiaryContainer: "#d29895",
  onSurface: "#1a1c1a",
  outlineVariant: "#c1c8c2",
  inverseSurface: "#2f312f",
  inverseOnSurface: "#f0f1ee",
  inversePrimary: "#a5d0b9",
  surfaceTint: "#3f6653",
};

const CATEGORY_STYLES = [
  { bg: colors.secondaryFixed, color: colors.onSecondaryFixedVariant, label: "Health" },
  { bg: colors.tertiaryFixed,  color: colors.onTertiaryFixedVariant,  label: "Learning" },
  { bg: colors.primaryFixedDim, color: colors.onPrimaryFixed,          label: "Mindfulness" },
  { bg: colors.primaryFixed,   color: colors.onPrimaryFixedVariant,   label: "Wellness" },
];

function Icon({ name, fill = false, size = 24, className = "", style = {} }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontVariationSettings: fill ? "'FILL' 1" : "'FILL' 0",
        fontSize: size,
        ...style,
      }}
    >
      {name}
    </span>
  );
}

function MobileHeader({ user }) {
  const initials = user?.email?.[0]?.toUpperCase() ?? 'U';
  return (
    <header
      className="md:hidden flex justify-between items-center px-6 py-4 sticky top-0 z-50 border-b"
      style={{ background: colors.background, borderColor: colors.surfaceVariant }}
    >
      <Link to="/dashboard" className="font-bold text-xl no-underline flex items-center gap-2" style={{ color: colors.primary }}>
        <Icon name="eco" size={24} style={{ color: colors.primaryContainer }} />
        <span>Evergreen</span>
      </Link>
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
          style={{ background: colors.primaryContainer, color: colors.onPrimary }}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}

function SummaryCard({ icon, value, label, iconBackground }) {
  return (
    <div
      className="rounded-xl p-6 border transition-all hover:-translate-y-0.5"
      style={{
        background: colors.surfaceContainerLowest,
        borderColor: colors.surfaceVariant,
        boxShadow: "0px 4px 12px rgba(27,67,50,0.05)",
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 rounded-lg" style={{ background: iconBackground, color: colors.primaryContainer }}>
          <Icon name={icon} />
        </div>
      </div>
      <p className="text-5xl font-bold mb-1" style={{ color: colors.primary }}>{value}</p>
      <p className="text-sm font-semibold tracking-wide" style={{ color: colors.onSurfaceVariant }}>{label}</p>
    </div>
  );
}

function RecentActivityCard({ habits }) {
  const navigate = useNavigate();
  const recentCheckins = habits
    .filter(h => h.checkedInToday)
    .slice(0, 3);

  return (
    <div
      className="rounded-xl p-6 border flex flex-col justify-between"
      style={{ background: colors.surfaceContainerLow, borderColor: colors.surfaceVariant }}
    >
      <div>
        <h3 className="text-sm font-semibold tracking-wider uppercase mb-4" style={{ color: colors.onSurfaceVariant }}>
          Recent Activity
        </h3>
        {recentCheckins.length === 0 ? (
          <p className="text-sm" style={{ color: colors.onSurfaceVariant }}>
            No check-ins yet today. Start tracking!
          </p>
        ) : (
          <ul className="space-y-2">
            {recentCheckins.map(h => (
              <li key={h.id} className="flex items-center gap-2 text-sm" style={{ color: colors.onSurface }}>
                <Icon name="check_circle" size={18} style={{ color: colors.primary }} />
                Completed "{h.name}"
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        onClick={() => navigate('/create')}
        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold hover:opacity-80 transition-opacity"
        style={{ color: colors.secondary }}
      >
        Add New Habit
        <Icon name="arrow_forward" size={16} />
      </button>
    </div>
  );
}

function WeekProgress({ recentDays }) {
  return (
    <div className="flex gap-1 mt-4">
      {recentDays.map((day, index) => {
        if (day.completed) {
          return (
            <div
              key={index}
              title={day.date}
              className="w-8 h-8 rounded flex items-center justify-center"
              style={{ background: colors.primaryContainer, color: colors.onPrimary }}
            >
              <Icon name="check" size={16} />
            </div>
          );
        }
        if (day.isToday) {
          return (
            <div
              key={index}
              title={day.date + " (today)"}
              className="w-8 h-8 rounded border-2"
              style={{ borderColor: colors.primary }}
            />
          );
        }
        return (
          <div
            key={index}
            title={day.date}
            className="w-8 h-8 rounded"
            style={{ background: colors.secondaryFixed }}
          />
        );
      })}
    </div>
  );
}

function HabitCard({ habit, catStyle, onCheckIn, checkingIn, error }) {
  return (
    <div
      className="rounded-xl p-4 border flex flex-col md:flex-row gap-4 items-start md:items-center justify-between transition-all hover:-translate-y-0.5"
      style={{
        background: colors.surfaceContainerLowest,
        borderColor: colors.surfaceVariant,
        boxShadow: "0px 4px 12px rgba(27,67,50,0.05)",
      }}
    >
      <div className="flex-1 w-full min-w-0">
        <div className="flex justify-between items-start mb-2">
          <div className="min-w-0">
            <span
              className="inline-block text-xs font-semibold px-2 py-1 rounded-full mb-1"
              style={{ background: catStyle.bg, color: catStyle.color }}
            >
              {catStyle.label}
            </span>
            <h3
              className="text-xl font-semibold leading-tight truncate"
              style={{ color: colors.primary }}
            >
              {habit.name}
            </h3>
            {habit.description && (
              <p className="text-sm mt-0.5 truncate" style={{ color: colors.onSurfaceVariant }}>
                {habit.description}
              </p>
            )}
          </div>

          <div className="text-right ml-4 flex-shrink-0">
            <div
              className="text-xl font-bold flex items-center justify-end gap-1"
              style={{ color: habit.currentStreak === 0 ? colors.outline : colors.primary }}
            >
              {habit.currentStreak}
              <Icon
                name="local_fire_department"
                fill={habit.currentStreak > 0}
                style={{ color: habit.currentStreak > 0 ? colors.secondary : colors.outline }}
              />
            </div>
            <span className="text-xs" style={{ color: colors.onSurfaceVariant }}>
              Best: {habit.longestStreak}
            </span>
          </div>
        </div>

        <WeekProgress recentDays={habit.recentDays} />

        {error && (
          <p className="text-xs mt-2 flex items-center gap-1" style={{ color: colors.error }}>
            <Icon name="error" size={14} />
            {error}
          </p>
        )}
      </div>

      {habit.checkedInToday ? (
        <button
          disabled
          className="h-12 w-full md:w-28 rounded-lg font-semibold flex items-center justify-center gap-1 flex-shrink-0 cursor-not-allowed text-sm"
          style={{
            background: colors.surfaceContainerLow,
            color: colors.onSurfaceVariant,
            border: `1px solid ${colors.outlineVariant}`,
          }}
        >
          <Icon name="done_all" size={18} />
          Done
        </button>
      ) : (
        <button
          onClick={onCheckIn}
          disabled={checkingIn}
          className="h-12 w-full md:w-28 rounded-lg font-semibold flex items-center justify-center gap-1 shadow-sm flex-shrink-0 transition-all active:scale-95 hover:opacity-90 disabled:opacity-60 text-sm"
          style={{ background: colors.primaryContainer, color: colors.onPrimary }}
        >
          {checkingIn ? (
            <span className="animate-spin material-symbols-outlined" style={{ fontSize: 18 }}>progress_activity</span>
          ) : (
            <Icon name="done" size={18} />
          )}
          Check-in
        </button>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activePage, setActivePage] = useState("Dashboard");
  const [habits, setHabits]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [checkingIn, setCheckingIn] = useState({});
  const [checkinErrors, setCheckinErrors] = useState({});

  const loadHabits = useCallback(async () => {
    try {
      const data = await habitsApi.list();
      setHabits(data.habits);
      setFetchError("");
    } catch (err) {
      setFetchError(err.message || "Failed to load habits.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadHabits(); }, [loadHabits]);

  // Check in for today
  const handleCheckIn = async (habitId) => {
    setCheckingIn(prev => ({ ...prev, [habitId]: true }));
    setCheckinErrors(prev => ({ ...prev, [habitId]: "" }));
    try {
      await checkinsApi.create(habitId, {});
      // Refresh habit list to get updated streaks from server
      await loadHabits();
    } catch (err) {
      setCheckinErrors(prev => ({ ...prev, [habitId]: err.message }));
    } finally {
      setCheckingIn(prev => ({ ...prev, [habitId]: false }));
    }
  };

  // Stats
  const activeCount   = habits.length;
  const doneToday     = habits.filter(h => h.checkedInToday).length;
  const completionPct = activeCount > 0 ? Math.round((doneToday / activeCount) * 100) : 0;

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      <div
        className="flex min-h-screen"
        style={{ background: colors.background, color: colors.onBackground, fontFamily: "Inter, sans-serif" }}
      >
        <SideNav activePage={activePage} setActivePage={setActivePage} />

        <div className="flex-1 min-w-0">
          <MobileHeader user={user} />

          <main
            className="flex-1 flex flex-col max-w-[1200px] mx-auto w-full pb-24 md:pb-10 relative"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(27,67,50,0.03) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(27,67,50,0.03) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          >
            <div className="p-6 md:p-10 flex flex-col gap-10">

              {/* Page Header */}
              <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                  <h1
                    className="text-2xl md:text-[32px] leading-10 font-semibold mb-1"
                    style={{ color: colors.primary }}
                  >
                    Today's Overview
                  </h1>
                  <p className="text-base flex items-center gap-2" style={{ color: colors.onSurfaceVariant }}>
                    <Icon name="schedule" size={18} />
                    {user?.timezone ?? 'UTC'}
                  </p>
                </div>

                {/* Global streak indicator */}
                <div className="text-right hidden md:block">
                  <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: colors.onSurfaceVariant }}>
                    Done Today
                  </p>
                  <p className="text-5xl font-bold flex items-center justify-end gap-2" style={{ color: colors.primary }}>
                    {doneToday}
                    <Icon name="local_fire_department" fill size={40} style={{ color: colors.primary }} />
                  </p>
                </div>
              </header>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <SummaryCard
                  icon="checklist"
                  value={String(activeCount)}
                  label="Active Habits"
                  iconBackground={colors.secondaryFixed}
                />
                <SummaryCard
                  icon="analytics"
                  value={`${completionPct}%`}
                  label="Completion Today"
                  iconBackground={colors.primaryFixed}
                />
                <RecentActivityCard habits={habits} />
              </div>

              {/* Habits List */}
              <section className="mt-2">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold" style={{ color: colors.primary }}>
                    Your Habits
                  </h2>
                  <Link
                    to="/create"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
                    style={{ background: colors.primaryContainer, color: colors.onPrimary }}
                  >
                    <Icon name="add" size={18} />
                    New Habit
                  </Link>
                </div>

                {loading && (
                  <div className="flex items-center justify-center py-16" style={{ color: colors.onSurfaceVariant }}>
                    <span className="animate-spin material-symbols-outlined" style={{ fontSize: 32 }}>progress_activity</span>
                  </div>
                )}

                {fetchError && !loading && (
                  <div
                    className="rounded-xl p-6 border text-center"
                    style={{ background: "#ffdad633", borderColor: "#ffdad6", color: colors.error }}
                  >
                    <Icon name="error" size={24} />
                    <p className="mt-2 font-semibold">{fetchError}</p>
                    <button
                      onClick={loadHabits}
                      className="mt-4 text-sm underline"
                      style={{ color: colors.secondary }}
                    >
                      Try again
                    </button>
                  </div>
                )}

                {!loading && !fetchError && habits.length === 0 && (
                  <div
                    className="rounded-xl p-12 border text-center flex flex-col items-center gap-4"
                    style={{ background: colors.surfaceContainerLowest, borderColor: colors.surfaceVariant, borderStyle: "dashed" }}
                  >
                    <Icon name="event_repeat" size={48} style={{ color: colors.primaryFixedDim }} />
                    <div>
                      <p className="font-semibold text-lg" style={{ color: colors.primary }}>No habits yet</p>
                      <p className="text-sm mt-1" style={{ color: colors.onSurfaceVariant }}>
                        Create your first habit and start building your streak!
                      </p>
                    </div>
                    <Link
                      to="/create"
                      className="px-6 py-2.5 rounded-lg font-semibold text-sm transition-all hover:opacity-90"
                      style={{ background: colors.primaryContainer, color: colors.onPrimary }}
                    >
                      Create First Habit
                    </Link>
                  </div>
                )}

                {!loading && !fetchError && habits.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {habits.map((habit, idx) => (
                      <HabitCard
                        key={habit.id}
                        habit={habit}
                        catStyle={CATEGORY_STYLES[idx % CATEGORY_STYLES.length]}
                        onCheckIn={() => handleCheckIn(habit.id)}
                        checkingIn={!!checkingIn[habit.id]}
                        error={checkinErrors[habit.id]}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          </main>

          <MobileNavigation activePage={activePage} setActivePage={setActivePage} />
        </div>
      </div>
    </>
  );
}