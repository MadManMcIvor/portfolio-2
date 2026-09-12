/* Circuit builder: the list of saved circuits, and the editor for one. */
import { exerciseById } from './exercises.js';
import {
  AMRAP,
  INTERVALS,
  TALLY,
  SESSION,
  getCircuits,
  getCircuit,
  saveCircuit,
  duplicateCircuit,
  deleteCircuit,
  newCircuit,
} from './storage.js';
import { el, clear, fmtTime, circuitSeconds, amrapRoundSeconds, repsLabel } from './util.js';
import { renderExerciseList, openExerciseSheet } from './library.js';
import { tabs } from './catalogue.js';
import { movesDisclosure } from './movesList.js';

/* ─── Saved circuits ───────────────────────────────────────────────────── */

export function renderCircuitList(main) {
  clear(main);

  const circuits = getCircuits().sort((a, b) => (b.updated || '').localeCompare(a.updated || ''));

  main.appendChild(tabs('yours'));

  main.appendChild(
    el('div', { class: 'page-head' }, [
      el('h2', { class: 'eyebrow', text: 'Your circuits' }),
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

  // Starting from nothing means already knowing what a good twenty minutes
  // looks like, so the empty state points at the shelf rather than the blank
  // page beside it.
  if (!circuits.length) {
    main.appendChild(
      el('div', { class: 'empty' }, [
        el('p', { text: 'No circuits yet. Build one from scratch, or take a copy of a ready-made one.' }),
        el('button', {
          class: 'btn btn-outline btn-sm',
          type: 'button',
          text: 'Browse the catalogue',
          onclick: () => {
            location.hash = '#/catalogue';
          },
        }),
      ])
    );
    return;
  }

  for (const c of circuits) {
    const moves = (c.items || []).length;
    main.appendChild(
      el('div', { class: 'circuit-row' }, [
        el('div', { class: 'circuit-row-top' }, [
          el(
            'a',
            { class: 'circuit-row-main', href: `#/builder/${c.id}` },
            [
              el('h3', { text: c.name }),
              el('div', { class: 'meta', text: summaryLine(c) }),
            ]
          ),
          // A session has nothing to run, so it gets no Start — you tick it off
          // on the calendar and that is the whole of it.
          c.type === SESSION
            ? null
            : el('button', {
                class: 'btn btn-outline btn-sm',
                type: 'button',
                text: 'Start',
                disabled: moves ? null : 'disabled',
                onclick: () => {
                  location.hash = `${c.type === INTERVALS ? '#/play' : '#/board'}/${c.id}`;
                },
              }),
          rowMenu(`More for ${c.name}`, [
            {
              text: 'Duplicate',
              onClick: () => {
                const copy = duplicateCircuit(c);
                location.hash = `#/builder/${copy.id}`;
              },
            },
          ]),
          removeButton(`Delete ${c.name}`, () => {
            if (confirm(`Delete “${c.name}”?`)) {
              deleteCircuit(c.id);
              renderCircuitList(main);
            }
          }),
        ]),
        // What it actually is, without opening it — a saved circuit used to
        // mean a name and a guess until you tapped into edit mode to check.
        movesDisclosure(c),
      ])
    );
  }
}

/*
 * A small popover for an action that doesn't earn a permanent button on every
 * row. Closes on an outside click, Escape, or picking something.
 */
function rowMenu(label, items) {
  const wrap = el('div', { class: 'row-menu' });
  const toggle = el('button', {
    class: 'btn btn-ghost btn-icon row-menu-toggle',
    type: 'button',
    text: '⋮',
    'aria-haspopup': 'true',
    'aria-expanded': 'false',
    'aria-label': label,
  });
  const list = el('div', { class: 'row-menu-list', role: 'menu', hidden: true });

  function close() {
    list.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', onDocClick, true);
    document.removeEventListener('keydown', onKey);
  }

  function onDocClick(e) {
    if (!wrap.contains(e.target)) close();
  }

  function onKey(e) {
    if (e.key === 'Escape') close();
  }

  toggle.addEventListener('click', () => {
    if (!list.hidden) {
      close();
      return;
    }
    list.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    document.addEventListener('click', onDocClick, true);
    document.addEventListener('keydown', onKey);
  });

  for (const { text, onClick } of items) {
    list.appendChild(
      el('button', {
        class: 'row-menu-item',
        type: 'button',
        role: 'menuitem',
        text,
        onclick: () => {
          close();
          onClick();
        },
      })
    );
  }

  wrap.appendChild(toggle);
  wrap.appendChild(list);
  return wrap;
}

/** Each kind of circuit has its own way of saying what it is. */
function summaryLine(c) {
  const moves = (c.items || []).length;
  const count = `${moves} ${moves === 1 ? 'move' : 'moves'}`;
  if (c.type === SESSION) {
    const mins = Math.round((c.duration || 0) / 60);
    return mins ? `Session · ${mins} min` : 'Session';
  }
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
  // Indexes with their card opened by hand rather than by having something
  // worth showing. Keyed by position, so reordering can occasionally carry the
  // open state to the wrong card — a cosmetic slip in state that is rebuilt
  // fresh on every visit anyway.
  const expandedIndexes = new Set();
  const persist = () => saveCircuit(circuit);

  function repaint() {
    clear(main);
    totalsEl = null;

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
            : circuit.type === SESSION
              ? // Optional, and never required: it makes "how much did I do this
                // month" answerable later without asking anything of you now.
                field('Minutes', () =>
                  optionalNumberInput(Math.round((circuit.duration || 0) / 60), 1, 600, 'Optional', (v) => {
                    circuit.duration = v * 60;
                    persist();
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
              : circuit.type === SESSION
                ? 'Something you do elsewhere — a class, a swim, a walk. No movements and no clock: put it on a day and tick it off.'
                : 'Each movement runs for its own set time, with rest in between, for a fixed number of rounds.',
      })
    );

    // A session has no movements by definition, so the whole apparatus below —
    // the list, the picker, the running estimate — has nothing to say about it.
    if (circuit.type === SESSION) {
      main.appendChild(
        el('button', {
          class: 'btn btn-primary session-schedule',
          type: 'button',
          text: 'Put it on a day',
          onclick: () => {
            location.hash = '#/calendar';
          },
        })
      );
      return;
    }

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
          // The kinds keep different fields on their items, so switching
          // rebuilds them from each movement's own defaults rather than
          // leaving half-populated leftovers behind. A session keeps its list
          // untouched instead: it simply stops showing one, and switching back
          // finds the movements where you left them.
          if (circuit.type !== SESSION) {
            circuit.items = circuit.items.map((item) => defaultItem(exerciseById(item.exerciseId) || { id: item.exerciseId }, circuit.type, item));
          }
          persist();
          repaint();
        },
      },
      [
        el('option', { value: AMRAP, text: 'AMRAP', selected: circuit.type === AMRAP ? 'selected' : null }),
        el('option', { value: TALLY, text: 'Tally', selected: circuit.type === TALLY ? 'selected' : null }),
        el('option', { value: INTERVALS, text: 'Intervals', selected: circuit.type === INTERVALS ? 'selected' : null }),
        el('option', { value: SESSION, text: 'Session', selected: circuit.type === SESSION ? 'selected' : null }),
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
      onInfo: openExerciseSheet,
    });
    return wrap;
  }

  /*
   * A rep count, and the two ways it stops being a single number: an upper
   * bound turns it into a range, and "to failure" replaces the number with an
   * instruction. The range box stays empty unless you want one, so the ordinary
   * case is still one field with one number in it. `onChange` also refreshes
   * the collapsed headline, which reads off the same value.
   */
  function repFields(item, min, max, fallback, onChange) {
    if (item.toFailure) return [];
    return [
      field('Reps', () =>
        numberInput(item.reps || fallback, min, max, (v) => {
          item.reps = v;
          persist();
          refreshTotals();
          onChange();
        })
      ),
      field('Up to', () =>
        optionalNumberInput(item.repsMax, min, max, 'Optional', (v) => {
          item.repsMax = v || null;
          persist();
          refreshTotals();
          onChange();
        })
      ),
    ];
  }

  function checkbox(label, checked, onChange) {
    const box = el('input', { type: 'checkbox' });
    box.checked = checked;
    box.addEventListener('change', () => onChange(box.checked));
    return el('label', { class: 'checkbox' }, [box, label]);
  }

  /*
   * A card fully open for every movement was the whole problem: it left room
   * for two on a phone before scrolling. Each one now shows just its headline
   * number, and opens for the rest — automatically for anything already
   * carrying a range, a to-failure flag, a claimed side or a chosen chunk size,
   * since that is worth seeing without a tap; otherwise on request.
   */
  function hasCustomSecondary(item) {
    if (circuit.type === TALLY) return item.step != null;
    return !!(item.toFailure || item.repsMax || item.perSide);
  }

  /** The one number a collapsed card still needs to say. */
  function headlineFor(item, ex) {
    const eachSide = item.perSide && ex && ex.unilateral ? ' each side' : '';
    if (circuit.type === TALLY) {
      const perSet = item.step ? ` · +${item.step}` : '';
      return `${item.reps || 0} reps${perSet}${eachSide}`;
    }
    if (circuit.type !== AMRAP && item.mode !== 'reps') {
      return `${item.work || 40}s${eachSide}`;
    }
    const label = repsLabel(item);
    return `${label}${item.toFailure ? '' : ' reps'}${eachSide}`;
  }

  function itemCard(item, i) {
    const ex = exerciseById(item.exerciseId);
    const name = ex ? ex.name : `Unknown movement (${item.exerciseId})`;
    const byReps = circuit.type === AMRAP || item.mode === 'reps';

    const amount = el('button', {
      class: 'item-amount',
      type: 'button',
      'aria-label': `Edit ${name}`,
    });
    const refreshAmount = () => {
      amount.textContent = headlineFor(item, ex);
    };

    // An AMRAP movement is just "how many", so the card is one field rather
    // than the mode/work/rest set an interval needs.
    const controls = el(
      'div',
      { class: `item-controls${circuit.type === AMRAP ? ' is-simple' : ''}${circuit.type === TALLY ? ' is-pair' : ''}` },
      circuit.type === AMRAP
        ? repFields(item, 1, 200, 10, refreshAmount)
        : circuit.type === TALLY
          ? [
              field('Total reps', () =>
                numberInput(item.reps || 100, 1, 1000, (v) => {
                  item.reps = v;
                  persist();
                  refreshTotals();
                  refreshAmount();
                })
              ),
              // Blank is a real answer: it means you have not decided on a chunk
              // size, and the board lets you bank whatever you actually did —
              // 40, then 40, then 20.
              field('Per set', () =>
                optionalNumberInput(item.step, 1, 200, 'Any', (v) => {
                  item.step = v || null;
                  persist();
                  refreshAmount();
                })
              ),
            ]
          : [
            field('Mode', () => modeSelect(item, repaint)),
            ...(item.mode === 'reps'
              ? repFields(item, 1, 100, 8, refreshAmount)
              : [
                  field('Work (s)', () =>
                    numberInput(item.work || 40, 5, 600, (v) => {
                      item.work = v;
                      persist();
                      refreshTotals();
                      refreshAmount();
                    })
                  ),
                ]),
            field('Rest (s)', () =>
              numberInput(item.rest != null ? item.rest : 20, 0, 600, (v) => {
                item.rest = v;
                persist();
                refreshTotals();
              })
            ),
          ]
    );

    // A tally is a total for the day, which is a number by definition — there is
    // no failing at it, and no range to give.
    if (byReps && circuit.type !== TALLY) {
      controls.appendChild(
        checkbox('To failure — as many as you have', !!item.toFailure, (on) => {
          item.toFailure = on;
          persist();
          repaint();
        })
      );
    }

    if (ex && ex.unilateral) {
      controls.appendChild(
        checkbox('Both sides — counts the work twice', !!item.perSide, (on) => {
          item.perSide = on;
          persist();
          refreshTotals();
          refreshAmount();
        })
      );
    }

    refreshAmount();

    const expanded = expandedIndexes.has(i) || hasCustomSecondary(item);
    controls.hidden = !expanded;
    amount.setAttribute('aria-expanded', String(expanded));

    amount.addEventListener('click', () => {
      const open = !controls.hidden;
      if (open) expandedIndexes.delete(i);
      else expandedIndexes.add(i);
      controls.hidden = open;
      amount.setAttribute('aria-expanded', String(!open));
    });

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
        el('h3', { text: name, title: name }),
        amount,
        // Checking what a movement actually is shouldn't mean leaving the
        // circuit you are halfway through building.
        ex
          ? el('button', {
              class: 'ex-info',
              type: 'button',
              text: 'i',
              title: `What is ${name}?`,
              'aria-label': `What is ${name}?`,
              onclick: () => openExerciseSheet(ex),
            })
          : null,
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
      repsMax: existing.repsMax || null,
      toFailure: !!existing.toFailure,
      perSide: !!existing.perSide,
    };
  }
  if (type === TALLY) {
    return {
      exerciseId: ex.id,
      // A tally is a day's worth, so it starts an order of magnitude higher
      // than a single AMRAP set.
      reps: existing.reps || 100,
      step: existing.step || null,
      perSide: !!existing.perSide,
    };
  }
  const mode = existing.mode || (ex.defaultMode === 'reps' ? 'reps' : 'time');
  return {
    exerciseId: ex.id,
    mode,
    rest: existing.rest != null ? existing.rest : 20,
    perSide: !!existing.perSide,
    ...(mode === 'reps'
      ? {
          reps: existing.reps || 8,
          repsMax: existing.repsMax || null,
          toFailure: !!existing.toFailure,
        }
      : { work: existing.work || 40 }),
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

/*
 * A number you are allowed to leave alone. Unset shows as an empty field with a
 * hint in it, not as a 0 you have to clear before you can type — and clearing it
 * again is how you say "no answer", which reads back as 0.
 */
function optionalNumberInput(value, min, max, placeholder, onChange) {
  const input = el('input', {
    type: 'number',
    value: value || '',
    min,
    max,
    placeholder,
    inputmode: 'numeric',
  });
  input.addEventListener('change', () => {
    if (!input.value.trim()) {
      onChange(0);
      return;
    }
    const v = Math.max(min, Math.min(max, Math.round(Number(input.value) || min)));
    input.value = v;
    onChange(v);
  });
  return input;
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
