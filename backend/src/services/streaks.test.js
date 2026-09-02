/**
 * Unit tests for the streak computation service.
 * Run with: node src/services/streaks.test.js
 */

import { computeStreaks, toLocalDateString, todayInTimezone, isValidLocalDate } from './streaks.js';

let passed = 0;
let failed = 0;

function assert(description, condition) {
  if (condition) {
    console.log(`  ✅ ${description}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${description}`);
    failed++;
  }
}

function assertEqual(description, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    console.log(`  ✅ ${description}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${description}`);
    console.error(`     expected: ${JSON.stringify(expected)}`);
    console.error(`     actual:   ${JSON.stringify(actual)}`);
    failed++;
  }
}

// ─── computeStreaks ───────────────────────────────────────────────────────────

console.log('\n📊 computeStreaks');

// Empty input
assertEqual(
  'empty dates → {0,0}',
  computeStreaks([], '2026-03-12'),
  { currentStreak: 0, longestStreak: 0 }
);

// Single date = today
assertEqual(
  'single date = today → {1,1}',
  computeStreaks(['2026-03-12'], '2026-03-12'),
  { currentStreak: 1, longestStreak: 1 }
);

// Single date = yesterday (streak still alive)
assertEqual(
  'single date = yesterday → currentStreak=1',
  computeStreaks(['2026-03-11'], '2026-03-12'),
  { currentStreak: 1, longestStreak: 1 }
);

// Gap of 2 days — streak broken
assertEqual(
  'gap of 2 days breaks streak',
  computeStreaks(['2026-03-10', '2026-03-12'], '2026-03-12'),
  { currentStreak: 1, longestStreak: 1 }
);

// The worked example from the assignment (Asia/Kolkata)
// A: 2026-03-10, B: 2026-03-11, C: 2026-03-12 (D is duplicate of C)
assertEqual(
  'worked example: A=03-10, B=03-11, C=03-12 → streak=3',
  computeStreaks(['2026-03-10', '2026-03-11', '2026-03-12'], '2026-03-12'),
  { currentStreak: 3, longestStreak: 3 }
);

// Duplicate local dates are deduplicated
assertEqual(
  'duplicate localDate is deduplicated (same result)',
  computeStreaks(['2026-03-10', '2026-03-11', '2026-03-12', '2026-03-12'], '2026-03-12'),
  { currentStreak: 3, longestStreak: 3 }
);

// Backfill: older dates increase longest streak
assertEqual(
  'backfill extends longestStreak',
  computeStreaks([
    '2026-02-01','2026-02-02','2026-02-03','2026-02-04','2026-02-05',
    '2026-03-11','2026-03-12'
  ], '2026-03-12'),
  { currentStreak: 2, longestStreak: 5 }
);

// Neither today nor yesterday → currentStreak=0
assertEqual(
  'no check-in today or yesterday → currentStreak=0',
  computeStreaks(['2026-03-10', '2026-03-11'], '2026-03-13'),
  { currentStreak: 0, longestStreak: 2 }
);

// Unsorted input is handled correctly
assertEqual(
  'unsorted input is sorted internally',
  computeStreaks(['2026-03-12', '2026-03-10', '2026-03-11'], '2026-03-12'),
  { currentStreak: 3, longestStreak: 3 }
);

// Long streak
{
  const dates = [];
  for (let i = 1; i <= 30; i++) {
    dates.push(`2026-01-${String(i).padStart(2, '0')}`);
  }
  const result = computeStreaks(dates, '2026-01-30');
  assertEqual('30-day streak → {30,30}', result, { currentStreak: 30, longestStreak: 30 });
}

// ─── toLocalDateString ────────────────────────────────────────────────────────
console.log('\n🕐 toLocalDateString');

// Asia/Kolkata is UTC+5:30
// 2026-03-10T14:30Z → local 2026-03-10 20:00 → date "2026-03-10"
assertEqual(
  '2026-03-10T14:30Z → Asia/Kolkata → 2026-03-10',
  toLocalDateString(new Date('2026-03-10T14:30:00Z'), 'Asia/Kolkata'),
  '2026-03-10'
);

// 2026-03-11T21:30Z → local 2026-03-12 03:00 → date "2026-03-12"  (Check-in C from the example)
assertEqual(
  '2026-03-11T21:30Z → Asia/Kolkata → 2026-03-12',
  toLocalDateString(new Date('2026-03-11T21:30:00Z'), 'Asia/Kolkata'),
  '2026-03-12'
);

// UTC midnight stays UTC
assertEqual(
  '2026-03-10T00:00Z → UTC → 2026-03-10',
  toLocalDateString(new Date('2026-03-10T00:00:00Z'), 'UTC'),
  '2026-03-10'
);

// America/New_York (UTC-5 in March, EST)
// 2026-03-11T02:00Z → local 2026-03-10 21:00 EST → date "2026-03-10"
assertEqual(
  '2026-03-11T02:00Z → America/New_York → 2026-03-10',
  toLocalDateString(new Date('2026-03-11T02:00:00Z'), 'America/New_York'),
  '2026-03-10'
);

// ─── isValidLocalDate ─────────────────────────────────────────────────────────
console.log('\n📅 isValidLocalDate');
assert('2026-03-10 is valid', isValidLocalDate('2026-03-10'));
assert('2026-02-28 is valid', isValidLocalDate('2026-02-28'));
assert('"not-a-date" is invalid', !isValidLocalDate('not-a-date'));
assert('"2026-13-01" is invalid', !isValidLocalDate('2026-13-01'));
assert('"20260310" is invalid (no dashes)', !isValidLocalDate('20260310'));

// ─── Summary ─────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
