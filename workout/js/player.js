/*
 * Full-screen circuit player.
 *
 * Work and rest are told apart by paper tone and a single accent — clay for
 * work, sage for settled — rather than by a second palette. Same reason the
 * rest of the site has no third colour.
 */
import { exerciseById } from './exercises.js';
import { getCircuit, saveSettings } from './storage.js';
import { recordCompletion } from './schedule.js';
import { el, clear, fmtTime, estimateRepSeconds, beep } from './util.js';

let active = null; // { circuit, segments, i, remaining, paused, tick, wakeLock, root }

/* Flatten a circuit into a flat list of timed segments. */
export function buildSegments(circuit) {
  const segments = [];
  const rounds = Math.max(1, Number(circuit.rounds) || 1);

  for (let r = 1; r <= rounds; r++) {
    for (const item of circuit.items) {
      const ex = exerciseById(item.exerciseId);
      const name = ex ? ex.name : 'Unknown movement';
      const cue = ex && ex.cues && ex.cues.length ? ex.cues[0] : '';
      const seconds = item.mode === 'reps' ? estimateRepSeconds(item) : Number(item.work) || 40;
      const reps = item.mode === 'reps' ? `${item.reps || 8} reps` : null;
      const sides = item.perSide && ex && ex.unilateral ? ['Left', 'Right'] : [null];

      sides.forEach((side, si) => {
        segments.push({
          type: 'work',
          label: 'Work',
          move: side ? `${name} · ${side}` : name,
          cue,
          reps,
          seconds,
          round: r,
          rounds,
        });
        // Rest lands after the final side, not between them.
        const rest = Number(item.rest) || 0;
        if (rest > 0 && si === sides.length - 1) {
          segments.push({ type: 'rest', label: 'Rest', seconds: rest, round: r, rounds });
        }
      });
    }

    const between = Number(circuit.restBetweenRounds) || 0;
    if (between > 0 && r < rounds) {
      segments.push({
        type: 'rest',
        label: 'Round rest',
        seconds: between,
        round: r,
        rounds,
      });
    }
  }
  return segments;
}

export function startPlayer(id) {
  const circuit = getCircuit(id);
  if (!circuit || !circuit.items.length) {
    location.hash = '#/builder';
    return;
  }
  saveSettings({ lastCircuitId: id });
  stopPlayer();

  const segments = buildSegments(circuit);
  active = {
    circuit,
    segments,
    i: 0,
    remaining: segments[0].seconds,
    paused: false,
    tick: null,
    wakeLock: null,
    root: el('div', { class: 'player' }),
  };

  document.body.appendChild(active.root);
  document.body.classList.add('is-playing');
  requestWakeLock();

  render();
  active.tick = setInterval(onTick, 1000);
  document.addEventListener('keydown', onKey);
  beep(880, 180);
}

export function stopPlayer() {
  if (!active) return;
  clearInterval(active.tick);
  document.removeEventListener('keydown', onKey);
  releaseWakeLock();
  active.root.remove();
  document.body.classList.remove('is-playing');
  active = null;
}

/* ─── Ticking ──────────────────────────────────────────────────────────── */

function onTick() {
  if (!active || active.paused) return;
  active.remaining -= 1;

  if (active.remaining >= 1 && active.remaining <= 3) beep(660, 90);
  if (active.remaining <= 0) {
    beep(active.i + 1 >= active.segments.length ? 990 : 880, 200);
    go(1);
    return;
  }
  paintClock();
}

function go(delta) {
  if (!active) return;
  const next = active.i + delta;
  if (next >= active.segments.length) {
    finish();
    return;
  }
  active.i = Math.max(0, next);
  active.remaining = active.segments[active.i].seconds;
  render();
}

function togglePause() {
  if (!active) return;
  active.paused = !active.paused;
  if (!active.paused) requestWakeLock();
  render();
}

/*
 * Reaching the end counts as doing it, so it lands on the calendar — whether or
 * not it was scheduled. Quitting deliberately does not; that path goes straight
 * to leave().
 */
function finish() {
  beep(990, 400);
  const id = active ? active.circuit.id : null;
  if (id) recordCompletion(id);
  stopPlayer();
  location.hash = id ? '#/calendar' : '#/builder';
}

function leave() {
  const id = active ? active.circuit.id : null;
  stopPlayer();
  location.hash = id ? `#/builder/${id}` : '#/builder';
}

function onKey(e) {
  if (!active) return;
  if (e.key === ' ') {
    e.preventDefault();
    togglePause();
  } else if (e.key === 'ArrowRight') go(1);
  else if (e.key === 'ArrowLeft') go(-1);
  else if (e.key === 'Escape') leave();
}

/* ─── Rendering ────────────────────────────────────────────────────────── */

function render() {
  if (!active) return;
  const seg = active.segments[active.i];
  const { root } = active;

  root.className = `player is-${seg.type}${active.paused ? ' is-paused' : ''}`;
  clear(root);

  // Thick enough to read at a glance from across the room — a hairline is
  // invisible when you are mid-set and three metres away.
  const done = active.i / active.segments.length;
  root.appendChild(
    el('div', { class: 'player-progress', 'aria-hidden': 'true' }, [
      el('span', { style: `width:${(done * 100).toFixed(2)}%` }),
    ])
  );

  root.appendChild(
    el('div', { class: 'player-round' }, [
      el('span', { text: `Round ${seg.round} of ${seg.rounds}` }),
      el('span', { text: `${active.i + 1} / ${active.segments.length}` }),
    ])
  );

  // Resting, what you actually want on screen is the movement you are about to
  // do — so the heading and cue look ahead rather than repeating "Rest".
  const next = active.segments[active.i + 1];
  const ahead = seg.type === 'rest';
  const shown = ahead ? next : seg;

  root.appendChild(
    el('div', { class: 'player-stage' }, [
      el('p', { class: 'player-phase', text: seg.label }),
      el('h2', { class: 'player-move', text: shown ? shown.move : 'Finished' }),
      el('p', { class: 'player-clock', id: 'player-clock', text: fmtTime(active.remaining) }),
      el('p', {
        class: 'player-cue',
        text: shown ? [shown.reps, shown.cue].filter(Boolean).join(' — ') : '',
      }),
    ])
  );

  root.appendChild(
    el('p', {
      class: 'player-upnext',
      // During rest the heading is already the next movement; the slot stays so
      // the controls below it don't jump.
      text: ahead ? '' : next ? `Up next — ${next.move}` : 'Last one.',
    })
  );

  root.appendChild(
    el('div', { class: 'player-controls' }, [
      el('button', { class: 'btn btn-outline', type: 'button', text: 'Back', onclick: () => go(-1) }),
      el('button', {
        class: 'btn btn-primary',
        type: 'button',
        text: active.paused ? 'Resume' : 'Pause',
        onclick: togglePause,
      }),
      el('button', { class: 'btn btn-outline', type: 'button', text: 'Skip', onclick: () => go(1) }),
      el('button', { class: 'btn btn-ghost', type: 'button', text: 'Quit', onclick: leave }),
    ])
  );
}

function paintClock() {
  const clock = document.getElementById('player-clock');
  if (clock) clock.textContent = fmtTime(active.remaining);
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

// iOS drops the lock whenever the tab is backgrounded, so re-take it on return.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && active && !active.paused) {
    active.wakeLock = null;
    requestWakeLock();
  }
});
