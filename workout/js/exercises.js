/*
 * The exercise library. `data/exercises.json` is the source of truth; it is
 * fetched once at startup, so the app has to be served over http rather than
 * opened from disk.
 */

let all = [];
let byId = new Map();

export async function loadExercises(url = './data/exercises.json') {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`exercises.json: ${res.status} ${res.statusText}`);
  const data = await res.json();
  all = data.exercises || [];
  byId = new Map(all.map((ex) => [ex.id, ex]));
  return all;
}

export const exercises = () => all.slice();

export const exerciseById = (id) => byId.get(id) || null;

export function categories() {
  return [...new Set(all.map((ex) => ex.category))].sort();
}

export function equipmentKinds() {
  return [...new Set(all.flatMap((ex) => ex.equipment))].sort();
}

export function difficulties() {
  const order = ['beginner', 'intermediate', 'advanced'];
  return [...new Set(all.map((ex) => ex.difficulty))].sort(
    (a, b) => order.indexOf(a) - order.indexOf(b)
  );
}
