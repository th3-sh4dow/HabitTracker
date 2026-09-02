import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const colors = {
  primary: "#012d1d",
  onBackground: "#1a1c1a",
  outline: "#717973",
  surface: "#f9faf6",
  surfaceVariant: "#e2e3e0",
  secondaryContainer: "#cce6d0",
  onSecondaryContainer: "#506856",
  onSurfaceVariant: "#414844",
  primaryContainer: "#1b4332",
  onPrimary: "#ffffff",
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

const NAV_ITEMS = [
  { name: "Dashboard", icon: "dashboard",     path: "/dashboard" },
  { name: "New Habit", icon: "event_repeat",  path: "/create"    },
  { name: "Settings",  icon: "settings",      path: "/setting"   },
];

export default function SideNav() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();

  const initials = user?.email?.[0]?.toUpperCase() ?? 'U';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav
      className="hidden md:flex flex-col h-screen w-64 left-0 sticky top-0 p-4 gap-6 flex-shrink-0 z-50"
      style={{ background: colors.surface, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
    >
      {/* Logo */}
      <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2 no-underline">
        <Icon name="eco" size={26} style={{ color: colors.primaryContainer }} />
        <span className="font-bold text-xl" style={{ color: colors.primary }}>
          Evergreen Habit
        </span>
      </Link>

      {/* Navigation */}
      <div className="flex flex-col gap-2 flex-grow mt-4">
        {NAV_ITEMS.map(item => {
          const active = location.pathname === item.path ||
            (item.path === '/dashboard' && location.pathname === '/');
          return (
            <Link
              key={item.name}
              to={item.path}
              className="flex items-center gap-4 rounded-lg px-4 py-2 transition-all text-left no-underline"
              style={{
                background: active ? colors.secondaryContainer : "transparent",
                color: active ? colors.onSecondaryContainer : colors.onSurfaceVariant,
                fontWeight: active ? 700 : 400,
                textDecoration: 'none',
              }}
            >
              <Icon name={item.icon} fill={active} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom */}
      <div className="mt-auto flex flex-col gap-4">
        {/* User info */}
        <div
          className="flex items-center gap-4 px-4 py-3 border-t pt-4"
          style={{ borderColor: colors.surfaceVariant }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: colors.primaryContainer, color: colors.onPrimary }}
          >
            {initials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold truncate">{user?.email ?? 'Loading…'}</span>
            <span className="text-xs truncate" style={{ color: colors.onSurfaceVariant }}>
              {user?.timezone ?? ''}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-2 rounded-lg transition-all hover:bg-gray-100"
          style={{ color: colors.onSurfaceVariant }}
        >
          <Icon name="logout" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}