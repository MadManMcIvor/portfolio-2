/*
 * A circuit's movements, collapsed to one line with a disclosure into the
 * detail. Shared between the catalogue (js/catalogue.js) and your own circuits
 * (js/builder.js) — both show a circuit you are looking at rather than editing,
 * and both want a way to see what it actually is without opening it.
 */
import { exerciseById } from './exercises.js';
import { INTERVALS } from './storage.js';
import { el, fmtTime, repsLabel } from './util.js';
import { openExerciseSheet } from './library.js';

/* What a circuit is actually made of. Without this you are judging it on a
 * name alone — the collapsed line and the expanded rows both read off it, so
 * the two never drift apart. */
export function movementParts(circuit) {
  return (circuit.items || []).map((item) => {
    const ex = exerciseById(item.exerciseId);
    const name = ex ? ex.name : 'Unknown movement';
    const amount =
      circuit.type === INTERVALS && item.mode !== 'reps' ? fmtTime(item.work || 0) : repsLabel(item);
    const eachSide = !!(item.perSide && ex && ex.unilateral);
    return { ex, name, amount, eachSide };
  });
}

/*
 * The movements, collapsed to one line by default and opening into a row per
 * movement with its own "what is this?". Null for a circuit with nothing to
 * show — a session, or one still empty.
 */
export function movesDisclosure(circuit) {
  const parts = movementParts(circuit);
  if (!parts.length) return null;

  const toggle = el('button', {
    class: 'moves-toggle',
    type: 'button',
    'aria-expanded': 'false',
    text: parts.map((p) => `${p.name} ${p.amount}${p.eachSide ? ' each side' : ''}`).join(' · '),
  });

  const list = el(
    'ol',
    { class: 'move-list', hidden: true },
    parts.map((p) =>
      el('li', { class: 'move-row' }, [
        el('span', { class: 'move-name', text: p.name }),
        el('span', { class: 'move-amount', text: `${p.amount}${p.eachSide ? ' each side' : ''}` }),
        p.ex
          ? el('button', {
              class: 'ex-info',
              type: 'button',
              text: 'i',
              title: `What is ${p.name}?`,
              'aria-label': `What is ${p.name}?`,
              onclick: () => openExerciseSheet(p.ex),
            })
          : null,
      ])
    )
  );

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    list.hidden = open;
  });

  return el('div', { class: 'moves' }, [toggle, list]);
}
