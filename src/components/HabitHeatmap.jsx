import React from "react";

// Design tokens (consistent with the Evergreen Habit palette)
const colors = {
  primary: "#012d1d",
  onSurfaceVariant: "#414844",
  outlineVariant: "#c1c8c2",
  surface: "#ffffff",
  surfaceContainerLow: "#f3f4f1",
};

// Intensity scale, lightest (no activity) -> darkest (fully consistent)
const intensityScale = [
  "#eef2ef", // 0 - none
  "#cfe8d8", // 1 - light
  "#9ed3b6", // 2 - medium
  "#5fa885", // 3 - strong
  "#2f6e50", // 4 - very strong
];

const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const habits = [
  { name: "Morning Run", values: [3, 4, 2, 4, 3, 4, 1] },
  { name: "Meditate", values: [2, 3, 4, 3, 4, 4, 2] },
  { name: "Read 20 mins", values: [4, 4, 3, 4, 4, 3, 4] },
  { name: "Write Code", values: [1, 2, 4, 4, 3, 4, 0] },
  { name: "Drink 3L Water", values: [3, 4, 4, 4, 4, 4, 3] },
  { name: "Tidy Desk", values: [2, 1, 3, 4, 2, 4, 1] },
];

function Cell({ level }) {
  return (
    <div
      className="w-full aspect-square rounded-md"
      style={{ background: intensityScale[level] }}
    />
  );
}

export default function HabitHeatmap() {
  return (
    <div
      className="rounded-xl p-6 w-full max-w-xl h-[400px]"
      style={{
        background: colors.surface,
        boxShadow: "0px 4px 12px rgba(27,67,50,0.05)",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="font-semibold text-lg" style={{ color: colors.primary }}>
          Habit Heatmap
        </h3>
        <p className="text-sm" style={{ color: colors.onSurfaceVariant }}>
          Your Consistency Grid - October 2023
        </p>
      </div>

      {/* Grid */}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: "110px repeat(7, 1fr)" }}
      >
        {/* Column headers */}
        <div className="text-xs font-semibold" style={{ color: colors.onSurfaceVariant }}>
          Habits
        </div>
        {days.map((day) => (
          <div
            key={day}
            className="text-xs font-semibold text-center"
            style={{ color: colors.onSurfaceVariant }}
          >
            {day}
          </div>
        ))}

        {/* Rows */}
        {habits.map((habit) => (
          <React.Fragment key={habit.name}>
            <div
              className="text-sm flex items-center"
              style={{ color: colors.primary }}
            >
              {habit.name}
            </div>
            {habit.values.map((level, i) => (
              <Cell key={i} level={level} />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}