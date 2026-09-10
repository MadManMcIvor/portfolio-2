/* Circuit builder: the list of saved circuits, and the editor for one. */
import { exerciseById } from './exercises.js';
import {
  AMRAP,
  INTERVALS,
  TALLY,
  getCircuits,
  getCircuit,
  saveCircuit,
  deleteCircuit,
  newCircuit,
} from './storage.js';
import { el, clear, fmtTime, circuitSeconds, amrapRoundSeconds } from './util.js';
import { renderExerciseList } from './library.js';

/* ─── Saved circuits ───────────────────────────────────────────────────── */

export function renderCircuitList(main) {
  clear(main);

  const circuits = getCircuits().sort((a, b) => (b.updated || '').localeCompare(a.updated || ''));

  main.appendChild(
    el('div', { class: 'page-head' }, [
      el('h2', { class: 'eyebrow', text: 'Saved circuits' }),
      el('button', {
        class: 'btn btn-primary btn-sm',
        type: 'button',
        text: 'New circuit',
        onclick: () => {
          const c = saveCircuit(newCircuit());
          location.hash = `#/builder/${c.id}`;
        },
      }),
    ])
  );

  if (!circuits.length) {
    main.appendChild(
      el('p', {
        class: 'empty',
        text: 'No circuits yet. Build a twenty-minute one to get started.',
      })
    );
    return;
  }

  for (const c of circuits) {
    const moves = (c.items || []).length;
    main.appendChild(
      el('div', { class: 'circuit-row' }, [
        el(
          'a',
          { class: 'circuit-row-main', href: `#/builder/${c.id}` },
          [
            el('h3', { text: c.name }),
            el('div', { class: 'meta', text: summaryLine(c) }),
          ]
        ),
        el('button', {
          class: 'btn btn-outline btn-sm',
          type: 'button',
          text: 'Start',
          disabled: moves ? null : 'disabled',
          onclick: () => {
            location.hash = `${c.type === INTERVALS ? '#/play' : '#/board'}/${c.id}`;
          },
        }),
        removeButton(`Delete ${c.name}`, () => {
          if (confirm(`Delete “${c.name}”?`)) {
            deleteCircuit(c.id);
            renderCircuitList(main);
          }
        }),
      ])
    );
  }
}

/** Two kinds of circuit, two ways of describing what one is. */
function summaryLine(c) {
  const moves = (c.items || []).length;
  const count = `${moves} ${moves === 1 ? 'move' : 'moves'}`;
  if (c.type === AMRAP) {
    return `AMRAP · ${count} · ${Math.round((c.duration || 0) / 60)} min`;
  }
  if (c.type === TALLY) {
    const total = (c.items || []).reduce((n, item) => n + (Number(item.reps) || 0), 0);
    return `Tally · ${count} · ${total} reps`;
  }
  return `${count} · ${c.rounds} rounds · about ${fmtTime(circuitSeconds(c))}`;
}

/* ─── One circuit ──────────────────────────────────────────────────────── */

export function renderCircuitEditor(main, id) {
  const circuit = getCircuit(id);
  if (!circuit) {
    location.hash = '#/builder';
    return;
  }

  let pickerOpen = false;
  let totalsEl = null;
  const persist = () => saveCircuit(circuit);

  function repaint() {
    clear(main);

    main.appendChild(
      el('div', { class: 'page-head' }, [
        el('a', { class: 'back-link', href: '#/builder', text: 'All circuits' }),
        el('a', { class: 'head-link', href: '#/calendar', text: 'Schedule it' }),
      ])
    );

    main.appendChild(
      field('Circuit name', () =>
        el('input', {
          type: 'text',
          value: circuit.name,
          oninput: (e) => {
            circuit.name = e.target.value;
            persist();
          },
        })
      )
    );

    main.appendChild(
      el('div', { class: 'field-row' }, [
        field('Kind', () => typeSelect()),
        circuit.type === AMRAP
          ? field('Minutes', () =>
              numberInput(Math.round(circuit.duration / 60), 1, 120, (v) => {
                circuit.duration = v * 60;
                persist();
                refreshTotals();
              })
            )
          : circuit.type === INTERVALS
            ? field('Rounds', () =>
                numberInput(circuit.rounds, 1, 20, (v) => {
                  circuit.rounds = v;
                  persist();
                  refreshTotals();
                })
              )
            : null,
      ])
    );

    // Rest between rounds is an intervals-only idea. An AMRAP is a single
    // unbroken block by definition — you rest when you need to.
    if (circuit.type === INTERVALS) {
      main.appendChild(
        el('div', { class: 'field-row' }, [
          field('Rest between rounds (s)', () =>
            numberInput(circuit.restBetweenRounds, 0, 600, (v) => {
              circuit.restBetweenRounds = v;
              persist();
              refreshTotals();
            })
          ),
        ])
      );
    }

    main.appendChild(
      el('p', {
        class: 'kind-note',
        text:
          circuit.type === AMRAP
            ? 'As many rounds as possible: work through the list, then start again, until the time is up.'
            : circuit.type === TALLY
              ? 'A total to reach by the end of the day, in whatever chunks suit. No clock, and no need to do it all at once.'
              : 'Each movement runs for its own set time, with rest in between, for a fixed number of rounds.',
      })
    );

    main.appendChild(el('h2', { class: 'eyebrow', text: 'Movements' }));

    if (!circuit.items.length) {
      main.appendChild(el('p', { class: 'empty', text: 'Nothing here yet — add a movement below.' }));
    }
    circuit.items.forEach((item, i) => main.appendChild(itemCard(item, i)));

    main.appendChild(
      el('div', { class: 'picker' }, [
        el('button', {
          class: 'btn btn-outline',
          type: 'button',
          text: pickerOpen ? 'Close' : 'Add movement',
          'aria-expanded': String(pickerOpen),
          onclick: () => {
            pickerOpen = !pickerOpen;
            repaint();
          },
        }),
        pickerOpen ? pickerList() : null,
      ])
    );

    main.appendChild(totalsBar());
  }

  function typeSelect() {
    return el(
      'select',
      {
        onchange: (e) => {
          circuit.type = e.target.value;
          // The two kinds keep different fields on their items, so switching
          // rebuilds them from each movement's own defaults rather than
          // leaving half-populated leftovers behind.
          circuit.items = circuit.items.map((item) => defaultItem(exerciseById(item.exerciseId) || { id: item.exerciseId }, circuit.type, item));
          persist();
          repaint();
        },
      },
      [
        el('option', { value: AMRAP, text: 'AMRAP', selected: circuit.type === AMRAP ? 'selected' : null }),
        el('option', { value: TALLY, text: 'Tally', selected: circuit.type === TALLY ? 'selected' : null }),
        el('option', { value: INTERVALS, text: 'Intervals', selected: circuit.type === INTERVALS ? 'selected' : null }),
      ]
    );
  }

  function pickerList() {
    const wrap = el('div', { class: 'picker-list' });
    renderExerciseList(wrap, {
      onAdd: (ex) => {
        circuit.items.push(defaultItem(ex, circuit.type));
        persist();
        pickerOpen = false;
        repaint();
      },
    });
    return wrap;
  }

  function itemCard(item, i) {
    const ex = exerciseById(item.exerciseId);
    const name = ex ? ex.name : `Unknown movement (${item.exerciseId})`;

    // An AMRAP movement is just "how many", so the card is one field rather
    // than the mode/work/rest set an interval needs.
    const controls = el(
      'div',
      { class: `item-controls${circuit.type === AMRAP ? ' is-simple' : ''}${circuit.type === TALLY ? ' is-pair' : ''}` },
      circuit.type === AMRAP
        ? [
            field('Reps', () =>
              numberInput(item.reps || 10, 1, 200, (v) => {
                item.reps = v;
                persist();
                refreshTotals();
              })
            ),
          ]
        : circuit.type === TALLY
          ? [
              field('Total reps', () =>
                numberInput(item.reps || 100, 1, 1000, (v) => {
                  item.reps = v;
                  persist();
                  refreshTotals();
                })
              ),
              field('Per set', () =>
                numberInput(item.step || 10, 1, 200, (v) => {
                  item.step = v;
                  persist();
                })
              ),
            ]
          : [
            field('Mode', () => modeSelect(item, repaint)),
            item.mode === 'reps'
              ? field('Reps', () =>
                  numberInput(item.reps || 8, 1, 100, (v) => {
                    item.reps = v;
                    persist();
                    refreshTotals();
                  })
                )
              : field('Work (s)', () =>
                  numberInput(item.work || 40, 5, 600, (v) => {
                    item.work = v;
                    persist();
                    refreshTotals();
                  })
                ),
            field('Rest (s)', () =>
              numberInput(item.rest != null ? item.rest : 20, 0, 600, (v) => {
                item.rest = v;
                persist();
                refreshTotals();
              })
            ),
          ]
    );

    if (ex && ex.unilateral) {
      const box = el('input', { type: 'checkbox' });
      box.checked = !!item.perSide;
      box.addEventListener('change', () => {
        item.perSide = box.checked;
        persist();
        refreshTotals();
      });
      controls.appendChild(
        el('label', { class: 'checkbox' }, [box, 'Both sides — counts the work twice'])
      );
    }

    return el('div', { class: 'item-card' }, [
      el('div', { class: 'item-head' }, [
        el('div', { class: 'reorder' }, [
          el('button', {
            class: 'btn btn-ghost btn-nudge',
            type: 'button',
            text: '↑',
            'aria-label': `Move ${name} up`,
            disabled: i === 0 ? 'disabled' : null,
            onclick: () => move(i, -1),
          }),
          el('button', {
            class: 'btn btn-ghost btn-nudge',
            type: 'button',
            text: '↓',
            'aria-label': `Move ${name} down`,
            disabled: i === circuit.items.length - 1 ? 'disabled' : null,
            onclick: () => move(i, 1),
          }),
        ]),
        el('h3', { text: name }),
        removeButton(`Remove ${name}`, () => {
          circuit.items.splice(i, 1);
          persist();
          repaint();
        }),
      ]),
      controls,
    ]);
  }

  function move(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= circuit.items.length) return;
    [circuit.items[i], circuit.items[j]] = [circuit.items[j], circuit.items[i]];
    persist();
    repaint();
  }

  function totalsBar() {
    totalsEl = el('div', { class: 'totals' });
    refreshTotals();
    return totalsEl;
  }

  function refreshTotals() {
    if (!totalsEl) return;
    clear(totalsEl);
    const lap = circuit.type === AMRAP ? amrapRoundSeconds(circuit) : 0;
    const tallyTotal = circuit.items.reduce((n, item) => n + (Number(item.reps) || 0), 0);

    totalsEl.appendChild(
      el('div', { class: 'totals-estimate' }, [
        el('span', {
          class: 'eyebrow',
          text: circuit.type === AMRAP ? 'For' : circuit.type === TALLY ? 'To do' : 'Estimated',
        }),
        el('span', {
          class: 'totals-time',
          text: circuit.type === TALLY ? String(tallyTotal) : fmtTime(circuitSeconds(circuit)),
        }),
        circuit.type === TALLY
          ? el('span', { class: 'meta', text: 'reps across the day' })
          : lap
            ? el('span', { class: 'meta', text: `roughly ${fmtTime(lap)} a lap` })
            : null,
      ])
    );
    totalsEl.appendChild(
      el('button', {
        class: 'btn btn-primary',
        type: 'button',
        text: 'Start',
        disabled: circuit.items.length ? null : 'disabled',
        onclick: () => {
          persist();
          location.hash = `${circuit.type === INTERVALS ? '#/play' : '#/board'}/${circuit.id}`;
        },
      })
    );
  }

  repaint();
}

/* ─── Small builders ───────────────────────────────────────────────────── */

function defaultItem(ex, type, existing = {}) {
  if (type === AMRAP) {
    return {
      exerciseId: ex.id,
      reps: existing.reps || 10,
      perSide: !!existing.perSide,
    };
  }
  if (type === TALLY) {
    return {
      exerciseId: ex.id,
      // A tally is a day's worth, so it starts an order of magnitude higher
      // than a single AMRAP set.
      reps: existing.reps || 100,
      step: existing.step || 10,
      perSide: !!existing.perSide,
    };
  }
  const mode = existing.mode || (ex.defaultMode === 'reps' ? 'reps' : 'time');
  return {
    exerciseId: ex.id,
    mode,
    rest: existing.rest != null ? existing.rest : 20,
    perSide: !!existing.perSide,
    ...(mode === 'reps' ? { reps: existing.reps || 8 } : { work: existing.work || 40 }),
  };
}

/* Never red, per the design system — a quiet remove that warms on hover. */
function removeButton(label, onClick) {
  return el('button', {
    class: 'btn btn-ghost btn-remove',
    type: 'button',
    text: '×',
    'aria-label': label,
    onclick: onClick,
  });
}

function modeSelect(item, onChange) {
  return el(
    'select',
    {
      onchange: (e) => {
        item.mode = e.target.value;
        if (item.mode === 'reps' && item.reps == null) item.reps = 8;
        if (item.mode === 'time' && item.work == null) item.work = 40;
        onChange();
      },
    },
    [
      el('option', { value: 'time', text: 'Timed', selected: item.mode === 'time' ? 'selected' : null }),
      el('option', { value: 'reps', text: 'Reps', selected: item.mode === 'reps' ? 'selected' : null }),
    ]
  );
}

function numberInput(value, min, max, onChange) {
  const input = el('input', { type: 'number', value, min, max, inputmode: 'numeric' });
  input.addEventListener('change', () => {
    const v = Math.max(min, Math.min(max, Math.round(Number(input.value) || min)));
    input.value = v;
    onChange(v);
  });
  return input;
}

/* Labels are wired to their control by id so tapping the label focuses it. */
let fieldSeq = 0;
function field(label, build) {
  const id = `f${++fieldSeq}`;
  const control = build();
  control.setAttribute('id', id);
  return el('div', { class: 'field' }, [el('label', { for: id, text: label }), control]);
}
