import React from "react";
import { Link, useLocation } from "react-router-dom";

const colors = {
  primary: "#012d1d",
  surface: "#f9faf6",
  surfaceVariant: "#e2e3e0",
  onSurfaceVariant: "#414844",
};

function Icon({ name, fill = false, size = 24 }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{ fontVariationSettings: fill ? "'FILL' 1" : "'FILL' 0", fontSize: size }}
    >
      {name}
    </span>
  );
}

const NAV_ITEMS = [
  { name: "Dashboard", icon: "dashboard",  path: "/dashboard" },
  { name: "New Habit", icon: "event_repeat", path: "/create"  },
  { name: "Settings",  icon: "settings",   path: "/setting"   },
];

export default function MobileNavigation() {
  const location = useLocation();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 w-full flex justify-around p-2 z-50 border-t"
      style={{ background: colors.surface, borderColor: colors.surfaceVariant }}
    >
      {NAV_ITEMS.map(item => {
        const active = location.pathname === item.path;
        return (
          <Link
            key={item.name}
            to={item.path}
            className="flex flex-col items-center justify-center px-4 py-2 rounded-lg transition-all active:scale-95 no-underline"
            style={{
              color: active ? colors.primary : colors.onSurfaceVariant,
              textDecoration: 'none',
            }}
          >
            <Icon name={item.icon} fill={active} />
            <span className="text-xs font-semibold mt-1">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}