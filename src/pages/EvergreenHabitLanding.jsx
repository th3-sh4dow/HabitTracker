import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import HabitHeatmap from "../components/HabitHeatmap";

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
  background: "#f9faf6",
  surfaceContainerHigh: "#e8e8e5",
  onPrimary: "#ffffff",
  onPrimaryFixedVariant: "#274e3d",
  primaryContainer: "#1b4332",
  onSecondaryContainer: "#506856",
  secondaryContainer: "#cce6d0",
  secondary: "#4c6452",
};

const cardShadow = "0px 4px 12px rgba(27,67,50,0.05)";
const cardShadowHover = "0px 8px 20px rgba(27,67,50,0.08)";

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

function TopNav() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header
      className="w-full top-0 sticky z-50 py-4 px-6 flex justify-between items-center max-w-[1200px] mx-auto"
      style={{ background: colors.background }}
    >
      <Link
        to="/"
        className="flex items-center gap-2 font-bold text-xl no-underline"
        style={{ color: colors.primary, fontFamily: "Inter" }}
      >
        <Icon name="eco" fill style={{ color: colors.primaryContainer }} />
        Evergreen Habit
      </Link>
      <nav className="flex gap-4 md:gap-6 items-center">
        <a
          href="#features"
          className="transition-colors text-sm md:text-base hidden sm:inline-block"
          style={{ color: colors.onSurfaceVariant }}
        >
          Features
        </a>
        <a
          href="#how-it-works"
          className="transition-colors text-sm md:text-base hidden sm:inline-block"
          style={{ color: colors.onSurfaceVariant }}
        >
          How it Works
        </a>
        {user ? (
          <button
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all hover:opacity-90 active:scale-95 flex items-center gap-1.5"
            style={{ background: colors.primaryContainer, color: colors.onPrimary }}
          >
            <span>Dashboard</span>
            <Icon name="arrow_forward" size={16} />
          </button>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all hover:opacity-90 active:scale-95"
            style={{ background: colors.primaryContainer, color: colors.onPrimary }}
          >
            Sign In
          </button>
        )}
      </nav>
    </header>
  );
}

function Hero() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="max-w-[1200px] mx-auto px-6 py-12 md:py-20 flex flex-col md:flex-row items-center gap-10">
      <div className="flex-1 space-y-6">
        <h1
          className="max-w-2xl font-bold"
          style={{
            color: colors.primary,
            fontSize: "clamp(32px, 5vw, 48px)",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            fontFamily: "Inter",
          }}
        >
          Master your habits, master your life.
        </h1>
        <p
          className="max-w-xl"
          style={{ color: colors.onSurfaceVariant, fontSize: 18, lineHeight: "28px" }}
        >
          A distraction-free environment to cultivate long-term routines. Built
          for persistence, quiet productivity, and structural consistency.
        </p>
        <div className="flex flex-wrap gap-4 pt-2">
          <button
            onClick={() => navigate(user ? '/dashboard' : '/register')}
            className="px-7 py-3 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
            style={{
              background: colors.primaryContainer,
              color: colors.onPrimary,
              boxShadow: cardShadow,
            }}
          >
            {user ? 'Open Dashboard' : 'Get Started for Free'}
          </button>
          <button
            onClick={() => navigate(user ? '/dashboard' : '/login')}
            className="px-7 py-3 rounded-lg text-sm font-semibold tracking-wide transition-all hover:opacity-90 active:scale-95"
            style={{ background: colors.secondaryContainer, color: colors.onSecondaryContainer }}
          >
            View Demo
          </button>
        </div>
      </div>
      <div
        className="flex-1 relative w-full h-[400px] rounded-xl overflow-hidden flex items-center justify-center"
        style={{ boxShadow: cardShadowHover }}
      >
        <HabitHeatmap />
      </div>
    </section>
  );
}

function FeatureIconBadge({ name }) {
  return (
    <div
      className="w-12 h-12 flex items-center justify-center rounded-lg mb-4"
      style={{ background: colors.secondaryContainer, color: colors.onSecondaryContainer }}
    >
      <Icon name={name} fill />
    </div>
  );
}

function Features() {
  return (
    <section
      id="features"
      className="py-16 md:py-20"
      style={{ background: colors.surfaceContainerLow }}
    >
      <div className="max-w-[1200px] mx-auto px-6 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2
            className="font-semibold"
            style={{ color: colors.primary, fontSize: 32, lineHeight: "40px", letterSpacing: "-0.01em" }}
          >
            Everything you need, nothing you don't.
          </h2>
          <p style={{ color: colors.onSurfaceVariant }}>
            Designed with a minimalist card-based architecture to reduce the
            anxiety of a long to-do list.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="how-it-works">
          {/* Timezone Tracking */}
          <div
            className="rounded-xl p-6 md:col-span-2 flex flex-col justify-between transition-shadow"
            style={{ background: colors.surface, boxShadow: cardShadow }}
          >
            <div className="space-y-2 mb-6">
              <FeatureIconBadge name="public" />
              <h3 className="font-semibold text-2xl" style={{ color: colors.primary }}>
                Timezone-Aware Tracking
              </h3>
              <p style={{ color: colors.onSurfaceVariant }}>
                Travel often? Your habits travel with you. Evergreen perfectly
                adjusts to your local time so your streaks are never unfairly
                broken.
              </p>
            </div>
            <div
              className="h-32 rounded-lg relative overflow-hidden flex items-end px-4 pb-4"
              style={{ background: colors.surfaceContainerLow }}
            >
              <div className="w-full flex justify-between items-end h-full pt-4">
                <div className="w-8 rounded-t-sm h-1/3" style={{ background: colors.secondaryContainer }} />
                <div className="w-8 rounded-t-sm h-1/2" style={{ background: colors.secondaryContainer }} />
                <div className="w-8 rounded-t-sm h-3/4" style={{ background: colors.primary }} />
                <div className="w-8 rounded-t-sm h-full" style={{ background: colors.primaryContainer }} />
                <div className="w-8 rounded-t-sm h-1/4" style={{ background: colors.secondaryContainer }} />
              </div>
            </div>
          </div>

          {/* Streaks */}
          <div
            className="rounded-xl p-6 transition-shadow"
            style={{ background: colors.surface, boxShadow: cardShadow }}
          >
            <FeatureIconBadge name="local_fire_department" />
            <h3 className="font-semibold text-2xl mb-2" style={{ color: colors.primary }}>
              Streak Visualization
            </h3>
            <p className="mb-4" style={{ color: colors.onSurfaceVariant }}>
              Watch your consistency grow over time with beautiful heatmap
              data grids.
            </p>
            <div
              className="flex items-center gap-1 font-bold mt-auto"
              style={{ color: colors.primary, fontSize: 20 }}
            >
              <Icon name="local_fire_department" fill style={{ color: colors.primary }} />
              42 Day Streak
            </div>
          </div>

          {/* Backfilling */}
          <div
            className="rounded-xl p-6 transition-shadow"
            style={{ background: colors.surface, boxShadow: cardShadow }}
          >
            <FeatureIconBadge name="history" />
            <h3 className="font-semibold text-2xl mb-2" style={{ color: colors.primary }}>
              Easy Backfilling
            </h3>
            <p style={{ color: colors.onSurfaceVariant }}>
              Forgot to log yesterday? No problem. Easily backfill data
              without punitive measures.
            </p>
          </div>

          {/* Quiet Productivity */}
          <div
            className="rounded-xl p-6 md:col-span-2 flex items-center gap-6 transition-shadow"
            style={{ background: colors.surface, boxShadow: cardShadow }}
          >
            <div className="flex-1 space-y-2">
              <FeatureIconBadge name="spa" />
              <h3 className="font-semibold text-2xl" style={{ color: colors.primary }}>
                Quiet Productivity
              </h3>
              <p style={{ color: colors.onSurfaceVariant }}>
                No gamified clutter. Just generous whitespace, a calming
                forest green palette, and clean architecture.
              </p>
            </div>
            <div
              className="flex-1 h-32 rounded-lg p-4 hidden sm:block"
              style={{ background: colors.surfaceContainerLow }}
            >
              <div
                className="rounded-lg p-2 flex items-center justify-between"
                style={{ background: colors.surface, boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}
              >
                <span className="text-sm font-semibold" style={{ color: colors.primary }}>
                  Morning Meditation
                </span>
                <div
                  className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                  style={{ borderColor: colors.primaryContainer }}
                >
                  <Icon name="check" size={16} style={{ color: colors.primaryContainer }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="max-w-[1200px] mx-auto px-6 py-16 md:py-28 text-center space-y-6">
      <h2
        className="max-w-3xl mx-auto font-bold"
        style={{ color: colors.primary, fontSize: "clamp(32px, 4vw, 48px)", lineHeight: 1.2, letterSpacing: "-0.02em" }}
      >
        Start building persistent routines today.
      </h2>
      <p className="max-w-xl mx-auto" style={{ color: colors.onSurfaceVariant, fontSize: 18, lineHeight: "28px" }}>
        Join thousands of individuals cultivating long-term habits in a
        distraction-free environment.
      </p>
      <button
        onClick={() => navigate(user ? '/dashboard' : '/register')}
        className="px-8 py-3 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200 hover:-translate-y-0.5 active:scale-95 mt-4"
        style={{ background: colors.primaryContainer, color: colors.onPrimary, boxShadow: cardShadow }}
      >
        {user ? 'Go to Dashboard' : 'Create Free Account'}
      </button>
    </section>
  );
}

function Footer() {
  return (
    <footer
      className="w-full py-10 px-6 flex flex-col md:flex-row justify-between items-center max-w-[1200px] mx-auto mt-auto gap-4"
      style={{ background: colors.surfaceContainerLow }}
    >
      <Link
        to="/"
        className="flex items-center gap-2 font-bold text-xl no-underline"
        style={{ color: colors.primary }}
      >
        <Icon name="eco" style={{ color: colors.primaryContainer }} />
        Evergreen Habit
      </Link>
      <div className="flex gap-6 text-sm font-semibold">
        <a href="#features" className="transition-colors hover:underline" style={{ color: colors.onSurfaceVariant }}>
          Features
        </a>
        <a href="#how-it-works" className="transition-colors hover:underline" style={{ color: colors.onSurfaceVariant }}>
          How it Works
        </a>
        <Link to="/login" className="transition-colors hover:underline" style={{ color: colors.onSurfaceVariant }}>
          Login
        </Link>
      </div>
      <div className="text-sm font-semibold" style={{ color: colors.secondary }}>
        © {new Date().getFullYear()} Evergreen Habit. Built for persistence.
      </div>
    </footer>
  );
}

export default function EvergreenHabitLanding() {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
      <div
        className="flex h-screen overflow-hidden"
        style={{
          background: colors.background,
          color: colors.onBackground,
          fontFamily: "Inter, sans-serif",
        }}
      >
        <main className="flex-1 overflow-y-auto scroll-smooth">
          <TopNav />
          <Hero />
          <Features />
          <CTA />
          <Footer />
        </main>
      </div>
    </>
  );
}