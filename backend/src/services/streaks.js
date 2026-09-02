function previousDay(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function computeStreaks(localDates, todayLocalDate) {
  if (!localDates || localDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const sorted = [...new Set(localDates)].sort();

  let longestStreak = 1;
  let runLength = 1;

  for (let i = 1; i < sorted.length; i++) {
    const expected = previousDay(sorted[i]);
    if (sorted[i - 1] === expected) {
      runLength++;
      if (runLength > longestStreak) longestStreak = runLength;
    } else {
      runLength = 1;
    }
  }

  const dateSet = new Set(sorted);
  const yesterdayLocalDate = previousDay(todayLocalDate);

  let anchor;
  if (dateSet.has(todayLocalDate)) {
    anchor = todayLocalDate;
  } else if (dateSet.has(yesterdayLocalDate)) {
    anchor = yesterdayLocalDate;
  } else {
    return { currentStreak: 0, longestStreak };
  }

  let currentStreak = 0;
  let cursor = anchor;

  while (dateSet.has(cursor)) {
    currentStreak++;
    cursor = previousDay(cursor);
  }

  return { currentStreak, longestStreak };
}

export function toLocalDateString(utcDate, timezone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(utcDate);

  const year  = parts.find(p => p.type === 'year').value;
  const month = parts.find(p => p.type === 'month').value;
  const day   = parts.find(p => p.type === 'day').value;

  return `${year}-${month}-${day}`;
}

export function todayInTimezone(timezone) {
  return toLocalDateString(new Date(), timezone);
}

export function isValidLocalDate(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr + 'T00:00:00Z');
  return !isNaN(d.getTime());
}

