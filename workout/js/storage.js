/* localStorage-backed persistence. See docs/specs/002-web-app.md. */
import { removeEntriesForCircuit } from './schedule.js';

const CIRCUITS_KEY = 'kb.circuits';
const SETTINGS_KEY = 'kb.settings';

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn('storage read failed for', key, e);
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn('storage write failed for', key, e);
    return false;
  }
}

export function uuid() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getCircuits() {
  const list = read(CIRCUITS_KEY, []);
  return Array.isArray(list) ? list.map(withDefaults) : [];
}

export function getCircuit(id) {
  return getCircuits().find((c) => c.id === id) || null;
}

/** Replaces the whole set — used by the import in transfer.js. */
export function replaceCircuits(list) {
  write(CIRCUITS_KEY, list);
}

export function saveCircuit(circuit) {
  const list = getCircuits();
  const now = new Date().toISOString();
  const idx = list.findIndex((c) => c.id === circuit.id);

  circuit.updated = now;
  if (idx === -1) {
    circuit.id = circuit.id || uuid();
    circuit.created = circuit.created || now;
    list.push(circuit);
  } else {
    list[idx] = circuit;
  }
  write(CIRCUITS_KEY, list);
  return circuit;
}

export function deleteCircuit(id) {
  write(
    CIRCUITS_KEY,
    getCircuits().filter((c) => c.id !== id)
  );
  // A scheduled day pointing at a circuit that no longer exists is just debris.
  removeEntriesForCircuit(id);
}

export const INTERVALS = 'intervals';
export const AMRAP = 'amrap';
export const TALLY = 'tally';

/*
 * AMRAP is the default because it is the shape most sessions here take: a short
 * list of movements with rep counts, looped for a fixed stretch of time. An
 * interval circuit is the older shape — each movement timed, with rest between.
 */
export function newCircuit(type = AMRAP) {
  const now = new Date().toISOString();
  return {
    id: uuid(),
    name: 'New circuit',
    type,
    created: now,
    updated: now,
    // Used by intervals circuits.
    rounds: 3,
    restBetweenRounds: 60,
    // Used by AMRAP circuits: how long you keep going for. A tally circuit has
    // no duration at all — it is a total to reach by the end of the day.
    duration: 20 * 60,
    items: [],
  };
}

/*
 * Circuits saved before the AMRAP work have no `type` and no `duration`. Rather
 * than migrate the stored data, fill the gaps on read — nothing is rewritten
 * until you next edit the circuit.
 */
function withDefaults(circuit) {
  if (!circuit) return circuit;
  return {
    ...circuit,
    type: circuit.type || INTERVALS,
    duration: circuit.duration || 20 * 60,
    items: circuit.items || [],
  };
}

export function getSettings() {
  const s = read(SETTINGS_KEY, {});
  return {
    beeps: s.beeps !== false,
    lastCircuitId: s.lastCircuitId || null,
  };
}

export function saveSettings(patch) {
  const s = { ...getSettings(), ...patch };
  write(SETTINGS_KEY, s);
  return s;
}
