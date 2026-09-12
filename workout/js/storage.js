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

/**
 * A copy with a fresh id and its own timestamps — editing one never touches
 * the other. Named "… copy" since, unlike adopting from the catalogue, this
 * can leave two circuits with the same name in your own list otherwise.
 */
export function duplicateCircuit(circuit) {
  return saveCircuit({
    ...structuredClone(circuit),
    id: uuid(),
    name: `${circuit.name} copy`,
    created: null,
    updated: null,
  });
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
export const SESSION = 'session';

/*
 * AMRAP is the default because it is the shape most sessions here take: a short
 * list of movements with rep counts, looped for a fixed stretch of time. An
 * interval circuit is the older shape — each movement timed, with rest between.
 *
 * A `session` is the odd one out: a class, a swim, a walk — something this app
 * doesn't run. It has no movements and no clock, so the only question it ever
 * asks is whether you did it.
 */
export function newCircuit(type = AMRAP) {
  const now = new Date().toISOString();
  return {
    id: uuid(),
    name: type === SESSION ? 'New session' : 'New circuit',
    type,
    created: now,
    updated: now,
    // Used by intervals circuits.
    rounds: 3,
    restBetweenRounds: 60,
    // Used by AMRAP circuits: how long you keep going for. A tally circuit has
    // no duration at all — it is a total to reach by the end of the day. A
    // session's is optional, and starts unset.
    duration: type === SESSION ? 0 : 20 * 60,
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
  const type = circuit.type || INTERVALS;
  return {
    ...circuit,
    type,
    // A session's minutes are optional, so an unset one has to survive the
    // round trip rather than being filled in with a default it never had.
    duration: circuit.duration || (type === SESSION ? 0 : 20 * 60),
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
