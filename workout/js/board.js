/*
 * The board: the whole workout on one screen.
 *
 * Written for the case where the phone is propped up across the room — you set
 * it going and don't touch it again. Every movement is listed at once, so there
 * is nothing to step through, and the clock is large enough to read from a
 * distance. Tapping a movement strikes it through, which is optional; the
 * round counter is the only thing worth reaching for mid-set.
 *
 * The clock can be turned off entirely, which turns this into a plain list you
 * work down at your own pace.
 */
import { exerciseById } from './exercises.js';
import { AMRAP, TALLY, getCircuit } from './storage.js';
import {
  DONE,
  recordCompletion,
  ensureTodayEntry,
  getProgress,
  setProgress,
  setStatus,
} from './schedule.js';
import { el, clear, fmtTime, beep, sentenceCase } from './util.js';

let active = null; // { circuit, remaining, elapsed, rounds, paused, timed, done, entry, counts, tick, wakeLock, root }

export function startBoard(id) {
  const circuit = getCircuit(id);
  if (!circuit || !circuit.items.length) {
    location.hash = '#/builder';
    return;
  }
  stopBoard();

  // A tally is chipped away at across the day, so its counts have to outlive
  // the screen. They live on today's calendar entry, which is created now
  // rather than when you finish.
  const isTally = circuit.type === TALLY;
  const entry = isTally ? ensureTodayEntry(circuit.id) : null;

  active = {
    circuit,
    entry,
    counts: entry ? getProgress(entry.id) : {},
    // AMRAP counts down to zero; anything else counts up, since there is no
    // fixed end to run towards.
    remaining: circuit.type === AMRAP ? Number(circuit.duration) || 1200 : 0,
    elapsed: 0,
    rounds: 0,
    paused: false,
    // A tally has no clock to speak of — you are not racing it.
    timed: !isTally,
    done: new Set(),
    tick: null,
    wakeLock: null,
    root: el('div', { class: 'board' }),
  };

  document.body.appendChild(active.root);
  document.body.classList.add('is-playing');
  requestWakeLock();

  render();
  if (!isTally) {
    active.tick = setInterval(onTick, 1000);
    beep(880, 180);
  }
  document.addEventListener('keydown', onKey);
}

export function stopBoard() {
  if (!active) return;
  clearInterval(active.tick);
  document.removeEventListener('keydown', onKey);
  releaseWakeLock();
  active.root.remove();
  document.body.classList.remove('is-playing');
  active = null;
}

/* ─── Ticking ──────────────────────────────────────────────────────────── */

const isCountdown = () => active.circuit.type === AMRAP;
const isTally = () => active.circuit.type === TALLY;

function onTick() {
  if (!active || active.paused || !active.timed) return;

  active.elapsed += 1;
  if (!isCountdown()) {
    paintClock();
    return;
  }

  active.remaining -= 1;
  // A countdown that just stops is easy to miss from across the room, so the
  // last few seconds are called out.
  if (active.remaining > 0 && active.remaining <= 3) beep(660, 90);
  if (active.remaining <= 0) {
    beep(990, 400);
    finish();
    return;
  }
  paintClock();
}

function togglePause() {
  if (!active) return;
  active.paused = !active.paused;
  if (!active.paused) requestWakeLock();
  render();
}

function toggleTimer() {
  if (!active) return;
  active.timed = !active.timed;
  render();
}

function addRound() {
  if (!active) return;
  active.rounds += 1;
  // A finished lap starts over, so the strike-throughs clear with it.
  active.done.clear();
  beep(760, 120);
  render();
}

function dropRound() {
  if (!active || !active.rounds) return;
  active.rounds -= 1;
  render();
}

/**
 * Reaching the end counts as doing it; quitting does not. This lands on the
 * calendar whether or not the session was scheduled — a workout you decided on
 * there and then still happened.
 */
function finish() {
  const id = active ? active.circuit.id : null;
  if (id) recordCompletion(id);
  stopBoard();
  location.hash = id ? '#/calendar' : '#/builder';
}

/* ─── Tally counts ─────────────────────────────────────────────────────── */

const countFor = (i) => Number(active.counts[i]) || 0;
const targetFor = (item) => Number(item.reps) || 0;

function bump(i, by) {
  const item = active.circuit.items[i];
  const next = Math.max(0, Math.min(targetFor(item), countFor(i) + by));
  active.counts = { ...active.counts, [i]: next };
  setProgress(active.entry.id, i, next);
  if (by > 0) beep(next >= targetFor(item) ? 880 : 700, 80);

  // Everything hit means the day's work is done; the entry says so without
  // needing a separate press. It can be undone from the calendar.
  if (allDone()) setStatus(active.entry.id, DONE);
  render();
}

const allDone = () =>
  active.circuit.items.every((item, i) => countFor(i) >= targetFor(item));

function quit() {
  const id = active ? active.circuit.id : null;
  stopBoard();
  location.hash = id ? `#/builder/${id}` : '#/builder';
}

/* Stepping away from a tally is not quitting — the counts stay where they are. */
function leaveTally() {
  stopBoard();
  location.hash = '#/calendar';
}

function onKey(e) {
  if (!active) return;
  if (e.key === ' ') {
    e.preventDefault();
    togglePause();
  } else if (!isTally() && (e.key === 'ArrowRight' || e.key === 'Enter')) {
    e.preventDefault();
    addRound();
  } else if (!isTally() && e.key === 'ArrowLeft') {
    dropRound();
  } else if (e.key === 'Escape') {
    if (isTally()) leaveTally();
    else quit();
  }
}

/* ─── Rendering ────────────────────────────────────────────────────────── */

function render() {
  if (!active) return;
  const { root, circuit } = active;

  root.className = `board${active.paused ? ' is-paused' : ''}${active.timed ? '' : ' is-untimed'}${
    isTally() ? ' is-tally' : ''
  }`;
  clear(root);

  // A tally's progress bar tracks reps banked, not time spent.
  if (isTally()) {
    const target = circuit.items.reduce((n, item) => n + targetFor(item), 0) || 1;
    const banked = circuit.items.reduce((n, _, i) => n + countFor(i), 0);
    root.appendChild(
      el('div', { class: 'board-progress', 'aria-hidden': 'true' }, [
        el('span', { class: allDone() ? 'is-complete' : '', style: `width:${((banked / target) * 100).toFixed(2)}%` }),
      ])
    );
  }

  if (active.timed && isCountdown()) {
    const total = Number(circuit.duration) || 1;
    const gone = 1 - active.remaining / total;
    root.appendChild(
      el('div', { class: 'board-progress', 'aria-hidden': 'true' }, [
        el('span', { style: `width:${(Math.min(1, Math.max(0, gone)) * 100).toFixed(2)}%` }),
      ])
    );
  }

  root.appendChild(
    el('div', { class: 'board-head' }, [
      el('p', {
        class: 'board-kind',
        text: isTally()
          ? `Tally · ${circuit.name}`
          : circuit.type === AMRAP
            ? `AMRAP · ${Math.round((circuit.duration || 0) / 60)} min`
            : circuit.name,
      }),
      // A tally has no clock to hide.
      isTally()
        ? null
        : el('button', {
            class: 'btn btn-ghost btn-sm',
            type: 'button',
            text: active.timed ? 'Hide timer' : 'Show timer',
            onclick: toggleTimer,
          }),
    ])
  );

  if (active.timed) {
    root.appendChild(
      el('p', {
        class: 'board-clock',
        id: 'board-clock',
        text: fmtTime(isCountdown() ? active.remaining : active.elapsed),
      })
    );
  }

  if (isTally()) {
    const target = circuit.items.reduce((n, item) => n + targetFor(item), 0);
    const banked = circuit.items.reduce((n, _, i) => n + countFor(i), 0);
    root.appendChild(
      el('div', { class: `board-tally-head${allDone() ? ' is-complete' : ''}` }, [
        el('span', { class: 'board-tally-num', text: `${banked}` }),
        el('span', { class: 'board-tally-of', text: `of ${target} reps` }),
        allDone() ? el('span', { class: 'board-tally-flag', text: 'All done' }) : null,
      ])
    );
  } else {
  root.appendChild(
    el('div', { class: 'board-rounds' }, [
      el('button', {
        class: 'btn btn-ghost btn-nudge',
        type: 'button',
        text: '−',
        'aria-label': 'One fewer round',
        disabled: active.rounds ? null : 'disabled',
        onclick: dropRound,
      }),
      el('div', { class: 'board-rounds-count' }, [
        el('span', { class: 'board-rounds-num', text: String(active.rounds) }),
        el('span', { class: 'eyebrow', text: active.rounds === 1 ? 'Round done' : 'Rounds done' }),
      ]),
      el('button', {
        class: 'btn btn-primary board-round-add',
        type: 'button',
        text: '+ Round',
        onclick: addRound,
      }),
    ])
  );
  }

  root.appendChild(
    el(
      'ol',
      { class: 'board-list' },
      circuit.items.map((item, i) => movementRow(item, i))
    )
  );

  root.appendChild(
    el('div', { class: 'board-controls' }, [
      active.timed
        ? el('button', {
            class: 'btn btn-outline',
            type: 'button',
            text: active.paused ? 'Resume' : 'Pause',
            onclick: togglePause,
          })
        : null,
      el('button', {
        class: 'btn btn-outline',
        type: 'button',
        // A tally you walk away from mid-day is the normal case, not an
        // abandoned session — its counts are already saved.
        text: isTally() ? 'Done for now' : 'Finish',
        onclick: isTally() ? leaveTally : finish,
      }),
      isTally() ? null : el('button', { class: 'btn btn-ghost', type: 'button', text: 'Quit', onclick: quit }),
    ])
  );
}

function movementRow(item, i) {
  if (isTally()) return tallyRow(item, i);

  const ex = exerciseById(item.exerciseId);
  const name = ex ? ex.name : 'Unknown movement';
  const struck = active.done.has(i);

  // An AMRAP item is always reps; an interval item is reps or a stretch of time.
  const byReps = active.circuit.type === AMRAP || item.mode === 'reps';
  const amount = byReps ? String(item.reps || 10) : fmtTime(item.work || 40);

  // On an AMRAP board every line is reps, so saying so five times adds nothing.
  // An intervals board mixes reps and time, so there it earns its place.
  const unit = active.circuit.type === AMRAP ? null : byReps ? 'reps' : null;
  const note = [unit, item.perSide && ex && ex.unilateral ? 'each side' : null]
    .filter(Boolean)
    .join(' · ');

  return el(
    'li',
    { class: `board-item${struck ? ' is-done' : ''}` },
    [
      el(
        'button',
        {
          class: 'board-item-trigger',
          type: 'button',
          'aria-pressed': String(struck),
          'aria-label': `${name}, ${amount} ${note || ''}`.trim(),
          onclick: () => {
            if (struck) active.done.delete(i);
            else active.done.add(i);
            render();
          },
        },
        [
          el('span', { class: 'board-item-amount', text: amount }),
          el('span', { class: 'board-item-name' }, [
            el('span', { class: 'board-item-title', text: name }),
            note ? el('span', { class: 'board-item-note', text: sentenceCase(note) }) : null,
          ]),
        ]
      ),
    ]
  );
}

/* One row of a tally: what's banked, what's left, and two ways to add to it. */
function tallyRow(item, i) {
  const ex = exerciseById(item.exerciseId);
  const name = ex ? ex.name : 'Unknown movement';
  const target = targetFor(item);
  const count = countFor(i);
  const step = Number(item.step) || 10;
  const complete = count >= target;

  return el('li', { class: `board-item board-tally${complete ? ' is-done' : ''}` }, [
    el('div', { class: 'board-tally-row' }, [
      el('div', { class: 'board-tally-label' }, [
        el('span', { class: 'board-item-title', text: name }),
        el('span', { class: 'board-tally-count' }, [
          el('strong', { text: String(count) }),
          el('span', { text: ` / ${target}` }),
          item.perSide && ex && ex.unilateral
            ? el('span', { class: 'board-item-note', text: ' each side' })
            : null,
        ]),
      ]),
      el('div', { class: 'board-tally-actions' }, [
        el('button', {
          class: 'btn btn-ghost btn-nudge',
          type: 'button',
          text: '−',
          'aria-label': `One fewer ${name}`,
          disabled: count ? null : 'disabled',
          onclick: () => bump(i, -1),
        }),
        el('button', {
          class: 'btn btn-outline btn-sm',
          type: 'button',
          text: '+1',
          'aria-label': `One more ${name}`,
          disabled: complete ? 'disabled' : null,
          onclick: () => bump(i, 1),
        }),
        el('button', {
          class: 'btn btn-primary btn-sm',
          type: 'button',
          text: `+${step}`,
          'aria-label': `${step} more ${name}`,
          disabled: complete ? 'disabled' : null,
          onclick: () => bump(i, step),
        }),
      ]),
    ]),
    el('div', { class: 'board-tally-bar', 'aria-hidden': 'true' }, [
      el('span', { style: `width:${target ? Math.min(100, (count / target) * 100).toFixed(2) : 0}%` }),
    ]),
  ]);
}

function paintClock() {
  const clock = document.getElementById('board-clock');
  if (clock) clock.textContent = fmtTime(isCountdown() ? active.remaining : active.elapsed);
}

/* ─── Wake lock (best effort) ──────────────────────────────────────────── */

function requestWakeLock() {
  if (!active || active.wakeLock || !('wakeLock' in navigator)) return;
  navigator.wakeLock
    .request('screen')
    .then((lock) => {
      if (active) active.wakeLock = lock;
      else lock.release();
    })
    .catch(() => {});
}

function releaseWakeLock() {
  try {
    if (active && active.wakeLock) active.wakeLock.release();
  } catch (e) {
    /* already gone */
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && active && !active.paused) {
    active.wakeLock = null;
    requestWakeLock();
  }
});
