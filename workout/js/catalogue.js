/*
 * A shelf of ready-made circuits to look through and adopt.
 * See docs/specs/004-circuit-catalogue.md.
 *
 * The empty state used to be "New circuit" and a blank list of movements, which
 * asks you to already know what a good twenty minutes looks like. These are the
 * answer to that, and adopting one takes a copy: from that moment it is yours,
 * and nothing here can reach it again.
 */
import { exerciseById } from './exercises.js';
import { AMRAP, TALLY, INTERVALS, saveCircuit, uuid } from './storage.js';
import { ALWAYS, equipmentLabel, getKit } from './equipment.js';
import { el, clear, fmtTime, circuitSeconds, repsLabel } from './util.js';

/*
 * Fetched on first visit rather than at startup: most sessions never open the
 * catalogue, and the app already waits on one JSON file before it can paint.
 */
let circuits = null;

export async function loadCatalogue(url = './data/circuits.json') {
  if (circuits) return circuits;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`circuits.json: ${res.status} ${res.statusText}`);
  const data = await res.json();
  circuits = data.circuits || [];
  return circuits;
}

/* ─── Reading one ──────────────────────────────────────────────────────── */

/** Every kind of kit a circuit needs, in the order its movements ask for it. */
function kitFor(circuit) {
  const kinds = [];
  for (const item of circuit.items || []) {
    const ex = exerciseById(item.exerciseId);
    for (const kind of (ex && ex.equipment) || []) {
      if (!kinds.includes(kind)) kinds.push(kind);
    }
  }
  return kinds;
}

/*
 * The kit it needs that you haven't got. Named as kit rather than as the four
 * movements that use it: "you haven't got a kettlebell" is the actionable
 * version, and the chips above already say what the circuit is made of.
 * Empty when you have never said what you have.
 */
function missingKitFor(circuit) {
  const kit = getKit();
  if (!kit) return [];
  const owned = new Set([...kit, ALWAYS]);
  return kitFor(circuit).filter((kind) => !owned.has(kind));
}

function summaryLine(c) {
  const moves = (c.items || []).length;
  const count = `${moves} ${moves === 1 ? 'move' : 'moves'}`;
  if (c.type === AMRAP) return `AMRAP · ${count} · ${Math.round((c.duration || 0) / 60)} min`;
  if (c.type === TALLY) {
    const total = (c.items || []).reduce((n, item) => n + (Number(item.reps) || 0), 0);
    return `Tally · ${count} · ${total} reps`;
  }
  return `Intervals · ${count} · ${c.rounds} rounds · about ${fmtTime(circuitSeconds(c))}`;
}

/* What you are actually signing up for, on one line. Without this you are
 * adopting on the strength of a name and a blurb. */
function movementLine(c) {
  return (c.items || [])
    .map((item) => {
      const ex = exerciseById(item.exerciseId);
      const name = ex ? ex.name : 'Unknown movement';
      const amount =
        c.type === INTERVALS && item.mode !== 'reps' ? fmtTime(item.work || 0) : repsLabel(item);
      return `${name} ${amount}${item.perSide && ex && ex.unilateral ? ' each side' : ''}`;
    })
    .join(' · ');
}

/* ─── Adopting ─────────────────────────────────────────────────────────── */

/**
 * Takes a copy. A fresh id and no `blurb`, so adopting the same circuit twice
 * gives two independent circuits rather than one that collides with itself, and
 * so nothing in your own list carries marketing copy about itself.
 */
export function adopt(circuit) {
  const { blurb, ...rest } = circuit;
  return saveCircuit({
    ...structuredClone(rest),
    id: uuid(),
    created: null,
    updated: null,
  });
}

/* ─── View ─────────────────────────────────────────────────────────────── */

export function renderCatalogue(main) {
  clear(main);
  main.appendChild(tabs('catalogue'));

  const list = el('div', { class: 'catalogue' });
  main.appendChild(list);
  list.appendChild(el('p', { class: 'empty', text: 'Loading…' }));

  loadCatalogue().then(
    (all) => {
      clear(list);
      list.appendChild(
        el('p', {
          class: 'lead',
          text: 'Ready-made circuits to take a copy of. Adopting one puts it in your circuits, where it is yours to change — editing your copy never touches this list.',
        })
      );
      for (const circuit of all) list.appendChild(card(circuit));
    },
    (err) => {
      console.error(err);
      clear(list);
      list.appendChild(el('p', { class: 'empty', text: 'Could not load the catalogue.' }));
    }
  );
}

function card(circuit) {
  const missing = missingKitFor(circuit);

  return el('article', { class: 'cat-card' }, [
    el('div', { class: 'cat-head' }, [
      el('div', { class: 'cat-title' }, [
        el('h3', { text: circuit.name }),
        el('div', { class: 'meta', text: summaryLine(circuit) }),
      ]),
      el('button', {
        class: 'btn btn-primary btn-sm',
        type: 'button',
        text: 'Adopt',
        'aria-label': `Adopt ${circuit.name}`,
        onclick: () => {
          const mine = adopt(circuit);
          location.hash = `#/builder/${mine.id}`;
        },
      }),
    ]),
    el('p', { class: 'cat-blurb', text: circuit.blurb }),
    el(
      'div',
      { class: 'chips' },
      kitFor(circuit).map((kind) => el('span', { class: 'chip chip-outline', text: equipmentLabel(kind) }))
    ),
    el('p', { class: 'cat-moves', text: movementLine(circuit) }),
    // Said plainly rather than by hiding the circuit: the catalogue is worth
    // reading through even when you can't run all of it today, and a swap is
    // usually one edit away.
    missing.length
      ? el('p', { class: 'cat-missing' }, [
          `Needs kit you haven't got — ${missing.map(equipmentLabel).join(', ')}. `,
          el('a', { href: '#/settings', text: 'Edit kit' }),
        ])
      : null,
  ]);
}

/*
 * Yours and the catalogue are two views of one idea, so they share a control
 * rather than becoming a fourth thing in the top bar — a phone has no room for
 * one. Each keeps its own hash, so the back button and a bookmark both work.
 */
export function tabs(current) {
  const options = [
    ['yours', 'Yours', '#/builder'],
    ['catalogue', 'Catalogue', '#/catalogue'],
  ];

  return el(
    'div',
    { class: 'segmented', role: 'group', 'aria-label': 'Which circuits' },
    options.map(([id, label, hash]) =>
      el('button', {
        class: `segmented-option${id === current ? ' is-active' : ''}`,
        type: 'button',
        text: label,
        'aria-pressed': String(id === current),
        onclick: () => {
          if (id !== current) location.hash = hash;
        },
      })
    )
  );
}
