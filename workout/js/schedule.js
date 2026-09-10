/*
 * The calendar's storage: which circuit is planned for which day, and whether
 * it actually happened. See docs/specs/003-scheduling.md.
 *
 * Dates are plain 'YYYY-MM-DD' strings in local time, never Date objects or
 * ISO timestamps — a workout belongs to the day you did it, and UTC would move
 * an evening session into tomorrow.
 */

const KEY = 'kb.schedule';

export const PLANNED = 'planned';
export const DONE = 'done';
export const SKIPPED = 'skipped';

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (e) {
    console.warn('schedule read failed', e);
    return [];
  }
}

function write(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('schedule write failed', e);
  }
}

function uuid() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ─── Date keys ────────────────────────────────────────────────────────── */

/** Date -> 'YYYY-MM-DD' in local time. */
export function dateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** 'YYYY-MM-DD' -> Date at local midnight. */
export function keyToDate(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export const todayKey = () => dateKey(new Date());

/* ─── Entries ──────────────────────────────────────────────────────────── */

export function getEntries() {
  return read();
}

/** Replaces the whole set — used by the import in transfer.js. */
export function replaceEntries(list) {
  write(Array.isArray(list) ? list : []);
}

/** Everything planned for one day, oldest first. */
export function entriesForDate(key) {
  return read()
    .filter((e) => e.date === key)
    .sort((a, b) => (a.created || '').localeCompare(b.created || ''));
}

/** Entries in a date range, keyed by date — what the month grid draws from. */
export function entriesByDate(fromKey, toKey) {
  const map = new Map();
  for (const entry of read()) {
    if (entry.date < fromKey || entry.date > toKey) continue;
    if (!map.has(entry.date)) map.set(entry.date, []);
    map.get(entry.date).push(entry);
  }
  return map;
}

/**
 * Puts a circuit on a day. A null `circuitId` is an "any workout" slot — you
 * know you want to train on Tuesday without having decided what yet. Finishing
 * anything that day fills it in.
 */
export function scheduleCircuit(dateKeyStr, circuitId = null) {
  const list = read();
  const entry = {
    id: uuid(),
    date: dateKeyStr,
    circuitId: circuitId || null,
    status: PLANNED,
    created: new Date().toISOString(),
    completedAt: null,
  };
  list.push(entry);
  write(list);
  return entry;
}

export function setStatus(id, status) {
  const list = read();
  const entry = list.find((e) => e.id === id);
  if (!entry) return null;
  entry.status = status;
  entry.completedAt = status === DONE ? new Date().toISOString() : null;
  write(list);
  return entry;
}

export function removeEntry(id) {
  write(read().filter((e) => e.id !== id));
}

/** Dropping a circuit takes its scheduled days with it. */
export function removeEntriesForCircuit(circuitId) {
  write(read().filter((e) => e.circuitId !== circuitId));
}

/**
 * Records that a circuit was finished today. Called when a session reaches its
 * end, so a workout lands on the calendar without a second step — including
 * when nothing was scheduled at all, which is the common case for a session you
 * decided on there and then.
 *
 * In order of preference it will:
 *   1. tick off a planned entry for this exact circuit,
 *   2. fill in an open "any workout" slot, binding it to what you actually did,
 *   3. failing both, add a new entry for today, already done.
 */
export function recordCompletion(circuitId) {
  const today = todayKey();
  const list = read();
  const now = new Date().toISOString();

  const entry =
    list.find((e) => e.date === today && e.circuitId === circuitId && e.status === PLANNED) ||
    list.find((e) => e.date === today && !e.circuitId && e.status === PLANNED);

  if (entry) {
    entry.circuitId = circuitId;
    entry.status = DONE;
    entry.completedAt = now;
    write(list);
    return entry;
  }

  const fresh = {
    id: uuid(),
    date: today,
    circuitId,
    status: DONE,
    created: now,
    completedAt: now,
  };
  list.push(fresh);
  write(list);
  return fresh;
}

/**
 * Finds — or starts — today's entry for a circuit. A tally circuit is a day-long
 * thing you chip away at, so it needs somewhere durable to keep its running
 * counts from the moment you open it, not only once you finish.
 */
export function ensureTodayEntry(circuitId) {
  const today = todayKey();
  const existing = read().find((e) => e.date === today && e.circuitId === circuitId);
  return existing || scheduleCircuit(today, circuitId);
}

/**
 * Running counts for a tally session, keyed by the item's position in the
 * circuit — by position rather than exercise id, so a circuit listing the same
 * movement twice keeps two separate totals.
 */
export function setProgress(entryId, index, count) {
  const list = read();
  const entry = list.find((e) => e.id === entryId);
  if (!entry) return null;
  entry.progress = { ...(entry.progress || {}), [index]: Math.max(0, count) };
  write(list);
  return entry;
}

export function getProgress(entryId) {
  const entry = read().find((e) => e.id === entryId);
  return (entry && entry.progress) || {};
}

/**
 * How many workouts have actually been done — all time, this year, this month.
 * Counts only `done`: a plan you didn't keep isn't a workout.
 */
export function lifetimeStats() {
  const now = new Date();
  const year = `${now.getFullYear()}-`;
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-`;

  const done = read().filter((e) => e.status === DONE);
  return {
    all: done.length,
    year: done.filter((e) => e.date.startsWith(year)).length,
    month: done.filter((e) => e.date.startsWith(month)).length,
  };
}

/** Done / planned / skipped counts across a date range, for the month summary. */
export function summarise(fromKey, toKey) {
  const counts = { [DONE]: 0, [PLANNED]: 0, [SKIPPED]: 0 };
  for (const entry of read()) {
    if (entry.date < fromKey || entry.date > toKey) continue;
    if (counts[entry.status] !== undefined) counts[entry.status] += 1;
  }
  return counts;
}
