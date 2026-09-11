/*
 * The equipment vocabulary, and which of it you can actually get to.
 * See docs/specs/005-kit-and-a-wider-library.md.
 *
 * The table is the source of truth and `data/exercises.json` validates against
 * it, rather than the other way round: the vocabulary used to be whatever
 * strings happened to appear in the data, labelled by `sentenceCase()`, which
 * renders 'pull-up-bar' as 'Pull-up-bar' and cannot group anything.
 *
 * "Kit" is shorthand for access, not ownership — a pool at the gym you go to
 * counts, a bike in the shed you never ride does not.
 */

const KEY = 'kb.kit';

/* Group is only there to shape the settings list. Nothing filters on it. */
export const EQUIPMENT = [
  { id: 'bodyweight', label: 'Bodyweight', group: 'Always' },

  { id: 'pull-up-bar', label: 'Pull-up bar', group: 'Equipment' },
  { id: 'bench', label: 'Bench', group: 'Equipment' },
  { id: 'box', label: 'Box or step', group: 'Equipment' },
  { id: 'resistance-band', label: 'Resistance band', group: 'Equipment' },
  { id: 'jump-rope', label: 'Skipping rope', group: 'Equipment' },

  { id: 'kettlebell', label: 'Kettlebell', group: 'Weights' },
  { id: 'dumbbell', label: 'Dumbbells', group: 'Weights' },
  { id: 'barbell', label: 'Barbell', group: 'Weights' },

  { id: 'stationary-bike', label: 'Stationary bike', group: 'Machines' },
  { id: 'rower', label: 'Rowing machine', group: 'Machines' },
  { id: 'elliptical', label: 'Cross trainer', group: 'Machines' },
  { id: 'stair-machine', label: 'Stair machine', group: 'Machines' },
  { id: 'treadmill', label: 'Treadmill', group: 'Machines' },

  { id: 'bike', label: 'Bike', group: 'Outdoors' },
  { id: 'pool', label: 'Pool', group: 'Outdoors' },
];

/*
 * You always have your body. It is in the table so that matching has nothing
 * special-cased about it, not so that it can be turned off.
 */
export const ALWAYS = 'bodyweight';

const byId = new Map(EQUIPMENT.map((kind) => [kind.id, kind]));

export const equipmentIds = () => EQUIPMENT.map((kind) => kind.id);

/** Falls back to the raw id, so an unknown kind is visible rather than blank. */
export function equipmentLabel(id) {
  const kind = byId.get(id);
  return kind ? kind.label : String(id);
}

/** The table as [{ group, kinds }], in table order — what settings renders. */
export function equipmentGroups() {
  const groups = [];
  for (const kind of EQUIPMENT) {
    const last = groups[groups.length - 1];
    if (last && last.group === kind.group) last.kinds.push(kind);
    else groups.push({ group: kind.group, kinds: [kind] });
  }
  return groups;
}

/* ─── Your kit ─────────────────────────────────────────────────────────── */

/**
 * The stored list, or null if you have never said. Unset is not the same as
 * empty: an app that hides half its library before being told anything is
 * broken, so unset means show everything.
 */
export function getKit() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list.filter((id) => byId.has(id)) : null;
  } catch (e) {
    console.warn('kit read failed', e);
    return null;
  }
}

export const hasKit = () => getKit() !== null;

export function setKit(list) {
  const kit = [...new Set([ALWAYS, ...(Array.isArray(list) ? list : [])])].filter((id) =>
    byId.has(id)
  );
  try {
    localStorage.setItem(KEY, JSON.stringify(kit));
  } catch (e) {
    console.warn('kit write failed', e);
  }
  return kit;
}

/** Clears the answer entirely — back to "never said", not "have nothing". */
export function clearKit() {
  try {
    localStorage.removeItem(KEY);
  } catch (e) {
    console.warn('kit clear failed', e);
  }
}

/**
 * Whether a movement is one you could do today. Every piece has to be there —
 * a dumbbell bench press needs the bench *and* the dumbbells, and having one
 * of the two doesn't get you the movement.
 */
export function canDo(ex, kit = getKit()) {
  if (!kit) return true;
  const owned = new Set([...kit, ALWAYS]);
  return (ex.equipment || []).every((id) => owned.has(id));
}
