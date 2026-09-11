/*
 * Month grid plus a detail panel for the selected day.
 *
 * Status is carried by the design system's two colours and nothing else: sage
 * for done (settled), a clay outline for planned (still owed), and a plain
 * hairline for skipped. No red, no third colour.
 */
import { AMRAP, INTERVALS, TALLY, SESSION, getCircuits, getCircuit } from './storage.js';
import {
  PLANNED,
  DONE,
  SKIPPED,
  dateKey,
  keyToDate,
  todayKey,
  entriesForDate,
  entriesByDate,
  scheduleCircuit,
  setStatus,
  removeEntry,
  summarise,
  lifetimeStats,
} from './schedule.js';
import { el, clear, fmtTime, circuitSeconds } from './util.js';

/* Monday-first, to match how a week is read here. */
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Days in the grid: the whole month, padded out to full weeks. */
function monthGridDays(year, month) {
  const first = new Date(year, month, 1);
  // getDay() is Sunday-first; shift so Monday is 0.
  const lead = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - lead);

  const last = new Date(year, month + 1, 0);
  const trail = (7 - ((lead + last.getDate()) % 7)) % 7;
  const total = lead + last.getDate() + trail;

  return Array.from({ length: total }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}

function longDate(key) {
  const d = keyToDate(key);
  return `${WEEKDAYS[(d.getDay() + 6) % 7]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function renderCalendar(main) {
  const today = todayKey();
  let cursor = new Date(); // which month is on screen
  let selected = today;

  function repaint() {
    clear(main);
    main.appendChild(statsStrip());
    main.appendChild(monthSection());
    main.appendChild(daySection());
  }

  /* ─── Totals ─────────────────────────────────────────────────────────── */

  /* Three numbers, no chart. Enough to see whether the habit is holding
   * without turning the page into a dashboard. */
  function statsStrip() {
    const stats = lifetimeStats();
    const cells = [
      [stats.all, 'All time'],
      [stats.year, 'This year'],
      [stats.month, 'This month'],
    ];

    return el(
      'section',
      { class: 'stats', 'aria-label': 'Workouts done' },
      cells.map(([value, label]) =>
        el('div', { class: 'stat' }, [
          el('span', { class: 'stat-num', text: String(value) }),
          el('span', { class: 'eyebrow', text: label }),
        ])
      )
    );
  }

  /* ─── Month ──────────────────────────────────────────────────────────── */

  function monthSection() {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const days = monthGridDays(year, month);
    const marks = entriesByDate(dateKey(days[0]), dateKey(days[days.length - 1]));

    const step = (delta) => {
      cursor = new Date(year, month + delta, 1);
      repaint();
    };

    const grid = el('div', { class: 'cal-grid', role: 'grid', 'aria-label': `${MONTHS[month]} ${year}` });

    for (const label of WEEKDAYS) {
      grid.appendChild(el('div', { class: 'cal-weekday', role: 'columnheader', text: label }));
    }

    for (const day of days) {
      const key = dateKey(day);
      const entries = marks.get(key) || [];
      const outside = day.getMonth() !== month;

      const classes = ['cal-day'];
      if (outside) classes.push('is-outside');
      if (key === today) classes.push('is-today');
      if (key === selected) classes.push('is-selected');

      const cell = el(
        'button',
        {
          class: classes.join(' '),
          type: 'button',
          role: 'gridcell',
          'aria-label': `${longDate(key)}${entries.length ? `, ${statusSummary(entries)}` : ', nothing scheduled'}`,
          'aria-current': key === today ? 'date' : null,
          'aria-selected': String(key === selected),
          onclick: () => {
            selected = key;
            repaint();
          },
        },
        [el('span', { class: 'cal-day-num', text: String(day.getDate()) })]
      );

      if (entries.length) {
        cell.appendChild(
          el(
            'span',
            { class: 'cal-dots', 'aria-hidden': 'true' },
            // More than three in a day is vanishingly rare; cap so the cell holds.
            entries.slice(0, 3).map((e) => el('span', { class: `cal-dot is-${e.status}` }))
          )
        );
      }
      grid.appendChild(cell);
    }

    const counts = summarise(`${year}-${String(month + 1).padStart(2, '0')}-01`, `${year}-${String(month + 1).padStart(2, '0')}-31`);

    return el('section', { class: 'cal' }, [
      el('div', { class: 'cal-head' }, [
        el('button', {
          class: 'btn btn-ghost btn-nudge cal-step',
          type: 'button',
          text: '‹',
          'aria-label': 'Previous month',
          onclick: () => step(-1),
        }),
        el('h2', { class: 'cal-title', text: `${MONTHS[month]} ${year}` }),
        el('button', {
          class: 'btn btn-ghost btn-nudge cal-step',
          type: 'button',
          text: '›',
          'aria-label': 'Next month',
          onclick: () => step(1),
        }),
        el('button', {
          class: 'btn btn-outline btn-sm cal-today',
          type: 'button',
          text: 'Today',
          onclick: () => {
            cursor = new Date();
            selected = today;
            repaint();
          },
        }),
      ]),
      grid,
      el('p', {
        class: 'cal-summary',
        text: counts[DONE]
          ? `${counts[DONE]} done this month${counts[PLANNED] ? `, ${counts[PLANNED]} still planned` : ''}.`
          : counts[PLANNED]
            ? `${counts[PLANNED]} planned this month.`
            : 'Nothing scheduled this month yet.',
      }),
    ]);
  }

  function statusSummary(entries) {
    const done = entries.filter((e) => e.status === DONE).length;
    const parts = [];
    if (done) parts.push(`${done} done`);
    const planned = entries.filter((e) => e.status === PLANNED).length;
    if (planned) parts.push(`${planned} planned`);
    const skipped = entries.filter((e) => e.status === SKIPPED).length;
    if (skipped) parts.push(`${skipped} skipped`);
    return parts.join(', ');
  }

  /* ─── Selected day ───────────────────────────────────────────────────── */

  function daySection() {
    const entries = entriesForDate(selected);
    const circuits = getCircuits();

    const section = el('section', { class: 'cal-day-panel' }, [
      el('h2', { class: 'eyebrow', text: selected === today ? 'Today' : longDate(selected) }),
    ]);

    if (!entries.length) {
      section.appendChild(el('p', { class: 'empty', text: 'Nothing scheduled.' }));
    }

    for (const entry of entries) {
      section.appendChild(entryRow(entry));
    }

    if (!circuits.length) {
      section.appendChild(
        el('p', { class: 'meta cal-hint' }, [
          'No circuits yet — ',
          el('a', { href: '#/builder', text: 'build one' }),
          ', or pencil in a day below and decide later.',
        ])
      );
    }

    // Schedule something onto the selected day. "Any workout" is a slot for a
    // day you know you want to train without having decided what yet — whatever
    // you finish that day fills it in.
    const picker = el('select', { id: 'cal-pick', 'aria-label': 'What to schedule' }, [
      el('option', { value: '', text: 'Any workout' }),
      ...circuits.map((c) => el('option', { value: c.id, text: c.name })),
    ]);

    section.appendChild(
      el('div', { class: 'cal-add' }, [
        el('div', { class: 'field' }, [
          el('label', { for: 'cal-pick', text: 'Schedule' }),
          picker,
        ]),
        el('button', {
          class: 'btn btn-primary',
          type: 'button',
          text: 'Add',
          onclick: () => {
            scheduleCircuit(selected, picker.value || null);
            repaint();
          },
        }),
      ])
    );

    return section;
  }

  function entryRow(entry) {
    const open = !entry.circuitId;
    const circuit = open ? null : getCircuit(entry.circuitId);
    const name = open ? 'Any workout' : circuit ? circuit.name : 'Deleted circuit';
    const done = entry.status === DONE;
    const session = circuit && circuit.type === SESSION;

    const meta = open
      ? 'Undecided — finishing anything today fills this in.'
      : !circuit
        ? 'This circuit no longer exists.'
        : session
          ? circuit.duration
            ? `Session · ${Math.round(circuit.duration / 60)} min`
            : 'Session'
          : circuit.type === AMRAP
            ? `AMRAP · ${circuit.items.length} moves · ${Math.round((circuit.duration || 0) / 60)} min`
            : circuit.type === TALLY
              ? `Tally · ${circuit.items.reduce((n, i) => n + (Number(i.reps) || 0), 0)} reps`
              : `${circuit.items.length} moves · ${circuit.rounds} rounds · about ${fmtTime(circuitSeconds(circuit))}`;

    const actions = el('div', { class: 'cal-entry-actions' });

    // A session is not run by this app, so there is nothing to start — the only
    // thing it ever needs is a tick.
    if (circuit && !session && !done) {
      actions.appendChild(
        el('button', {
          class: 'btn btn-outline btn-sm',
          type: 'button',
          text: 'Start',
          disabled: circuit.items.length ? null : 'disabled',
          onclick: () => {
            location.hash = `${circuit.type === INTERVALS ? '#/play' : '#/board'}/${circuit.id}`;
          },
        })
      );
    }

    actions.appendChild(
      el('button', {
        class: `btn btn-sm ${done ? 'btn-ghost' : 'btn-primary'}`,
        type: 'button',
        text: done ? 'Undo' : 'Mark done',
        onclick: () => {
          setStatus(entry.id, done ? PLANNED : DONE);
          repaint();
        },
      })
    );

    if (!done) {
      actions.appendChild(
        el('button', {
          class: 'btn btn-ghost btn-sm',
          type: 'button',
          text: entry.status === SKIPPED ? 'Unskip' : 'Skip',
          onclick: () => {
            setStatus(entry.id, entry.status === SKIPPED ? PLANNED : SKIPPED);
            repaint();
          },
        })
      );
    }

    actions.appendChild(
      el('button', {
        class: 'btn btn-ghost btn-remove btn-sm',
        type: 'button',
        text: '×',
        'aria-label': `Remove ${name} from ${longDate(entry.date)}`,
        onclick: () => {
          removeEntry(entry.id);
          repaint();
        },
      })
    );

    return el('div', { class: `cal-entry is-${entry.status}${open ? ' is-open-slot' : ''}` }, [
      el('div', { class: 'cal-entry-main' }, [
        el('span', { class: `cal-entry-mark is-${entry.status}`, 'aria-hidden': 'true' }),
        el('div', {}, [
          el('h3', { text: name }),
          el('div', { class: 'meta', text: meta }),
        ]),
      ]),
      actions,
    ]);
  }

  repaint();
}
