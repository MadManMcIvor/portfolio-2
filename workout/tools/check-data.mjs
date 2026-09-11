/*
 * Validates data/exercises.json and data/circuits.json. Zero dependencies:
 *
 *   node workout/tools/check-data.mjs
 *
 * Spec 001 asked for this and called it a nice-to-have. It became worth having
 * when spec 005 took the library to 93 movements and made `equipment` a closed
 * vocabulary — an id that isn't in the table silently disappears from the kit
 * filter, which is the sort of mistake nothing else would catch.
 *
 * The catalogue (spec 004) has the same failure mode and worse: a circuit
 * pointing at a movement that isn't there renders as "Unknown movement" and
 * runs anyway.
 */
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const app = join(here, '..');

const CATEGORIES = ['hinge', 'squat', 'press', 'pull', 'carry', 'rotation', 'lunge', 'core', 'full-body', 'cardio'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const MODES = ['time', 'reps'];

const data = JSON.parse(await readFile(join(app, 'data/exercises.json'), 'utf8'));

// Read the vocabulary out of equipment.js rather than duplicating it here: one
// list, and this check fails if the two ever drift.
const source = await readFile(join(app, 'js/equipment.js'), 'utf8');
const kinds = [...source.matchAll(/\{ id: '([^']+)', label:/g)].map((m) => m[1]);

const problems = [];
const seen = new Set();

for (const ex of data.exercises) {
  const at = ex.id || '(no id)';
  if (!ex.id) problems.push('An exercise has no id');
  if (seen.has(ex.id)) problems.push(`${at}: duplicate id`);
  seen.add(ex.id);

  if (!CATEGORIES.includes(ex.category)) problems.push(`${at}: unknown category "${ex.category}"`);
  if (!DIFFICULTIES.includes(ex.difficulty)) problems.push(`${at}: unknown difficulty "${ex.difficulty}"`);
  if (!MODES.includes(ex.defaultMode)) problems.push(`${at}: unknown defaultMode "${ex.defaultMode}"`);
  if (typeof ex.unilateral !== 'boolean') problems.push(`${at}: unilateral must be true or false`);

  if (!Array.isArray(ex.equipment) || !ex.equipment.length) {
    problems.push(`${at}: needs at least one kind of equipment`);
  } else {
    for (const kind of ex.equipment) {
      if (!kinds.includes(kind)) problems.push(`${at}: "${kind}" is not in the table in js/equipment.js`);
    }
  }

  if (!Array.isArray(ex.cues) || ex.cues.length < 2) problems.push(`${at}: wants at least two cues`);
  if (!ex.description) problems.push(`${at}: no description`);
}

/* ─── The catalogue ────────────────────────────────────────────────────── */

const TYPES = ['amrap', 'tally', 'intervals'];
const catalogue = JSON.parse(await readFile(join(app, 'data/circuits.json'), 'utf8'));
const byExerciseId = new Map(data.exercises.map((ex) => [ex.id, ex]));
const seenCircuits = new Set();

for (const c of catalogue.circuits) {
  const at = c.id || '(no id)';
  if (!c.id) problems.push('A circuit has no id');
  if (seenCircuits.has(c.id)) problems.push(`${at}: duplicate id`);
  seenCircuits.add(c.id);

  if (!c.name) problems.push(`${at}: no name`);
  if (!c.blurb) problems.push(`${at}: no blurb`);
  // A session has nothing to adopt — it is a name and a tick, and you would
  // write your own rather than take a copy of someone else's.
  if (!TYPES.includes(c.type)) problems.push(`${at}: unknown type "${c.type}"`);
  if (c.type === 'amrap' && !c.duration) problems.push(`${at}: an AMRAP needs a duration`);
  if (c.type === 'intervals' && !c.rounds) problems.push(`${at}: an intervals circuit needs rounds`);

  if (!Array.isArray(c.items) || !c.items.length) {
    problems.push(`${at}: has no movements`);
    continue;
  }

  for (const item of c.items) {
    const ex = byExerciseId.get(item.exerciseId);
    if (!ex) {
      problems.push(`${at}: "${item.exerciseId}" is not a movement in exercises.json`);
      continue;
    }
    // Claiming both sides of a movement that has no sides doubles its time
    // budget for nothing.
    if (item.perSide && !ex.unilateral) {
      problems.push(`${at}: "${item.exerciseId}" is not unilateral, so perSide does nothing`);
    }
    if (c.type === 'intervals' && item.mode === 'time' && !item.work) {
      problems.push(`${at}: "${item.exerciseId}" is timed but has no work`);
    }
    if ((c.type !== 'intervals' || item.mode === 'reps') && !item.reps) {
      problems.push(`${at}: "${item.exerciseId}" has no reps`);
    }
  }
}

if (problems.length) {
  console.error(`${problems.length} problem${problems.length === 1 ? '' : 's'}:`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

const used = new Set(data.exercises.flatMap((ex) => ex.equipment));
const unused = kinds.filter((kind) => !used.has(kind));

console.log(`exercises.json v${data.version}: ${data.exercises.length} movements, ${used.size} kinds of kit — all valid.`);
if (unused.length) console.log(`Nothing uses: ${unused.join(', ')} — a box you can tick that changes nothing.`);
console.log(`circuits.json v${catalogue.version}: ${catalogue.circuits.length} catalogue circuits — all valid.`);
