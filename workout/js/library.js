/* Library view, plus the reusable exercise picker the builder uses. */
import { exercises, categories, difficulties, equipmentKinds } from './exercises.js';
import { isFavourite, toggleFavourite, getFavourites } from './favourites.js';
import { EQUIPMENT, canDo, equipmentLabel, getKit, hasKit } from './equipment.js';
import { el, clear, sentenceCase } from './util.js';

const LEVELS = ['beginner', 'intermediate', 'advanced'];

/* Labels are written to read on their own — a bare "Name" in a dropdown tells
 * you nothing about what it is doing. */
const SORTS = {
  name: { label: 'Sorted A–Z', compare: (a, b) => a.name.localeCompare(b.name) },
  pattern: {
    label: 'Sorted by pattern',
    compare: (a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name),
  },
  level: {
    label: 'Sorted by difficulty',
    compare: (a, b) =>
      LEVELS.indexOf(a.difficulty) - LEVELS.indexOf(b.difficulty) || a.name.localeCompare(b.name),
  },
};

/*
 * `scope` is your kit or everything; `kind` is one specific piece of equipment.
 * Scope starts on your kit as soon as you have told the app what you have —
 * and on everything until then, since hiding half the library before being
 * told anything would be the wrong way round.
 */
export const defaultFilters = () => ({
  q: '',
  scope: hasKit() ? 'mine' : 'all',
  kind: '',
  cat: '',
  diff: '',
  sort: 'name',
  starred: false,
});

function matches(ex, { q, scope, kind, cat, diff, starred }, favourites, kit) {
  if (starred && !favourites.has(ex.id)) return false;
  // Every piece has to be there: a dumbbell bench press needs the bench *and*
  // the dumbbells, and having one of the two doesn't get you the movement.
  if (scope === 'mine' && !canDo(ex, kit)) return false;
  if (kind && !ex.equipment.includes(kind)) return false;
  if (cat && ex.category !== cat) return false;
  if (diff && ex.difficulty !== diff) return false;
  if (!q) return true;

  const hay = [
    ex.name,
    ...(ex.aliases || []),
    ...(ex.tags || []),
    ex.category,
    ...ex.equipment.map(equipmentLabel),
  ]
    .join(' ')
    .toLowerCase();
  return hay.includes(q.toLowerCase());
}

/* ─── Filter bar ───────────────────────────────────────────────────────── */

function select(values, current, allLabel, onChange, label) {
  return el(
    'select',
    { 'aria-label': label, onchange: (e) => onChange(e.target.value) },
    values.map((v) =>
      el('option', {
        value: v,
        text: v === '' ? allLabel : sentenceCase(v),
        selected: v === current ? 'selected' : null,
      })
    )
  );
}

/*
 * Your kit or everything. Two options, and it stays two however long the
 * equipment table gets — the specific-kind filter is a dropdown below.
 *
 * The buttons update their own pressed state rather than being re-rendered:
 * a repaint would rebuild the search box alongside them and take the caret
 * with it mid-word.
 */
function scopeToggle(state, onChange) {
  const options = [
    ['mine', 'My kit'],
    ['all', 'Everything'],
  ];
  const buttons = [];

  function sync() {
    for (const [value, button] of buttons) {
      const on = state.scope === value;
      button.classList.toggle('is-active', on);
      button.setAttribute('aria-pressed', String(on));
    }
  }

  const group = el('div', { class: 'segmented', role: 'group', 'aria-label': 'Filter by equipment' });

  for (const [value, label] of options) {
    const button = el('button', {
      class: 'segmented-option',
      type: 'button',
      text: label,
      onclick: () => {
        state.scope = value;
        sync();
        onChange();
      },
    });
    buttons.push([value, button]);
    group.appendChild(button);
  }

  sync();
  return { node: group, sync };
}

/* Same reasoning as the segmented control: it restyles itself in place. */
function starFilter(state, onChange) {
  const button = el('button', {
    class: 'btn btn-icon star-filter',
    type: 'button',
    title: 'Show only starred movements',
    'aria-label': 'Show only starred movements',
  });

  function sync() {
    button.classList.toggle('is-on', state.starred);
    button.setAttribute('aria-pressed', String(state.starred));
    button.textContent = state.starred ? '★' : '☆';
  }

  button.addEventListener('click', () => {
    state.starred = !state.starred;
    sync();
    onChange();
  });

  sync();
  return button;
}

/* The kinds that actually appear in the data, in the table's order rather than
 * alphabetically — "Bodyweight, Kettlebell, …, Bike, Pool" groups the way the
 * settings list does. */
function kindOptions() {
  const present = new Set(equipmentKinds());
  return EQUIPMENT.filter((kind) => present.has(kind.id));
}

function kindSelect(state, onChange, syncScope) {
  return el(
    'select',
    {
      'aria-label': 'Filter by a kind of equipment',
      onchange: (e) => {
        state.kind = e.target.value;
        // Asking for a kind you don't have, while filtered to your kit, would
        // return nothing with no visible reason why. Widen the scope instead.
        if (state.kind && state.scope === 'mine' && !(getKit() || []).includes(state.kind)) {
          state.scope = 'all';
          syncScope();
        }
        onChange();
      },
    },
    [
      el('option', { value: '', text: 'All kit', selected: state.kind === '' ? 'selected' : null }),
      ...kindOptions().map((kind) =>
        el('option', {
          value: kind.id,
          text: kind.label,
          selected: kind.id === state.kind ? 'selected' : null,
        })
      ),
    ]
  );
}

function filterBar(state, onChange) {
  // Until you have said what you have, "My kit" would filter against nothing,
  // so the control stays out of the way and the count line offers the way in.
  const scope = hasKit() ? scopeToggle(state, onChange) : null;
  const syncScope = scope ? scope.sync : () => {};

  const node = el('div', { class: 'filters' }, [
    // The star rides with the search box rather than sitting on a row of its
    // own: it is a one-button filter, and alone on a line it reads as a
    // leftover.
    el('div', { class: 'filter-search' }, [
      el('input', {
        class: 'search',
        type: 'search',
        placeholder: 'Search movements',
        'aria-label': 'Search movements',
        value: state.q,
        oninput: (e) => {
          state.q = e.target.value;
          onChange();
        },
      }),
      starFilter(state, onChange),
    ]),
    // The link sits with the control it changes: settings is a place nobody
    // visits on spec, and "why can't I see the bench press" is a question you
    // ask here, not there.
    el('div', { class: 'filter-scope' }, [
      scope ? scope.node : null,
      el('a', {
        class: 'kit-link',
        href: '#/settings',
        text: scope ? 'Edit kit' : 'Filter by the kit you have',
      }),
    ]),
    el('div', { class: 'filter-row' }, [
      kindSelect(state, onChange, syncScope),
      select(['', ...categories()], state.cat, 'All patterns', (v) => {
        state.cat = v;
        onChange();
      }, 'Filter by pattern'),
      select(['', ...difficulties()], state.diff, 'All levels', (v) => {
        state.diff = v;
        onChange();
      }, 'Filter by difficulty'),
      el(
        'select',
        {
          'aria-label': 'Sort movements',
          onchange: (e) => {
            state.sort = e.target.value;
            onChange();
          },
        },
        Object.entries(SORTS).map(([value, { label }]) =>
          el('option', { value, text: label, selected: value === state.sort ? 'selected' : null })
        )
      ),
    ]),
  ]);

  return { node, syncScope };
}

/* ─── Card ─────────────────────────────────────────────────────────────── */

/*
 * Difficulty as three rising bars rather than a word. It lives in the opened
 * detail rather than on the card face: on a card it wrapped onto a line of its
 * own, and a second line on every card costs more than the difficulty is worth
 * at a glance. Bars rather than dots on purpose — a row of equal dots reads as
 * an overflow menu.
 */
function levelMeter(difficulty) {
  const filled = LEVELS.indexOf(difficulty) + 1;
  return el(
    'span',
    { class: 'level', role: 'img', 'aria-label': sentenceCase(difficulty) },
    LEVELS.map((_, i) => el('span', { class: `level-bar${i < filled ? ' is-on' : ''}` }))
  );
}

/* Chips are told apart by fill, not by colour: the movement pattern is solid,
 * everything else is outlined. */
function chips(ex) {
  const row = el('div', { class: 'chips' }, [
    el('span', { class: 'chip chip-solid', text: sentenceCase(ex.category) }),
    ...ex.equipment.map((kit) => el('span', { class: 'chip chip-outline', text: equipmentLabel(kit) })),
  ]);
  if (ex.unilateral) {
    row.appendChild(el('span', { class: 'chip chip-outline', text: 'Per side' }));
  }
  return row;
}

function exerciseCard(ex, { onAdd, onOpen, selected, onStar } = {}) {
  const body = [el('div', { class: 'ex-card-head' }, [el('h3', { text: ex.name })]), chips(ex)];

  // Selected is a border, not a layout change: opening a card used to make it
  // span the grid, which reshuffled every card after it and pushed the thing
  // you had just tapped off the screen.
  const card = el('article', { class: `ex-card${selected ? ' is-selected' : ''}` });

  const star = el('button', { class: 'star', type: 'button' });
  function syncStar() {
    const on = isFavourite(ex.id);
    star.classList.toggle('is-on', on);
    star.textContent = on ? '★' : '☆';
    star.setAttribute('aria-pressed', String(on));
    star.setAttribute('aria-label', `${on ? 'Unstar' : 'Star'} ${ex.name}`);
  }
  star.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFavourite(ex.id);
    syncStar();
    if (onStar) onStar(ex);
  });
  syncStar();
  card.appendChild(star);

  if (onOpen) {
    card.appendChild(
      el(
        'button',
        {
          class: 'ex-card-trigger',
          type: 'button',
          'aria-pressed': String(!!selected),
          onclick: () => onOpen(ex),
        },
        body
      )
    );
  } else {
    card.appendChild(el('div', { class: 'ex-card-trigger' }, body));
  }

  if (onAdd) {
    card.appendChild(
      el('button', {
        class: 'btn btn-outline btn-sm ex-card-add',
        type: 'button',
        text: 'Add',
        'aria-label': `Add ${ex.name}`,
        onclick: () => onAdd(ex),
      })
    );
  }

  return card;
}

/** Toggles a rendered card's selected look without rebuilding it. */
function markSelected(card, on) {
  card.classList.toggle('is-selected', on);
  const trigger = card.querySelector('.ex-card-trigger');
  if (trigger) trigger.setAttribute('aria-pressed', String(on));
}

export function exerciseDetail(ex) {
  return el('div', { class: 'ex-detail' }, [
    el('p', { class: 'ex-level' }, [
      levelMeter(ex.difficulty),
      el('span', { text: sentenceCase(ex.difficulty) }),
    ]),
    ex.aliases && ex.aliases.length
      ? el('p', { class: 'ex-aka', text: `Also known as ${ex.aliases.join(', ')}.` })
      : null,
    el('p', { class: 'ex-description', text: ex.description }),
    el('h4', { class: 'eyebrow', text: 'Cues' }),
    el(
      'ul',
      { class: 'cues' },
      (ex.cues || []).map((c) => el('li', { text: c }))
    ),
    el('h4', { class: 'eyebrow', text: 'Targets' }),
    el(
      'div',
      { class: 'chips' },
      (ex.primaryMuscles || []).map((m) => el('span', { class: 'chip chip-outline', text: sentenceCase(m) }))
    ),
    (ex.tags || []).length
      ? el('div', { class: 'chips ex-tags' }, ex.tags.map((t) => el('span', { class: 'chip chip-quiet', text: sentenceCase(t) })))
      : null,
    el('p', { class: 'meta ex-mode', text: `Defaults to ${ex.defaultMode === 'reps' ? 'reps' : 'a timed interval'}.` }),
  ]);
}

/* ─── Lists ────────────────────────────────────────────────────────────── */

/**
 * Renders a filterable grid into `container`.
 * opts: { onAdd(ex), onOpen(ex), openId, state }
 */
export function renderExerciseList(container, opts = {}) {
  const state = opts.state || defaultFilters();
  clear(container);

  const grid = el('div', { class: 'ex-grid' });
  const count = el('p', { class: 'ex-count' });

  // Rendered cards by exercise id, so a change of selection can be a class
  // toggle rather than a rebuild.
  let cards = new Map();
  let selectedId = opts.openId || null;

  /*
   * Says why you are seeing a subset, not just that you are — "38 of 93" with
   * no reason given is the sort of thing you end up staring at. No link: the
   * way to your kit is the gear in the top bar, not a call to action wedged
   * into a line of metadata.
   */
  function paintCount(shown, total) {
    if (!shown) {
      count.textContent = '';
      return;
    }
    if (shown === total) {
      count.textContent = `${total} movements`;
      return;
    }
    count.textContent =
      state.scope === 'mine'
        ? `${shown} of ${total} movements, filtered to your kit`
        : `${shown} of ${total} movements`;
  }

  function paint() {
    clear(grid);
    cards = new Map();

    const favourites = new Set(getFavourites());
    const kit = getKit();
    const rows = exercises()
      .filter((ex) => matches(ex, state, favourites, kit))
      .sort(SORTS[state.sort].compare);

    paintCount(rows.length, exercises().length);

    if (!rows.length) {
      grid.appendChild(emptyState());
      return;
    }

    for (const ex of rows) {
      const card = exerciseCard(ex, {
        onAdd: opts.onAdd,
        onOpen: opts.onOpen,
        // Starring only changes what is on screen when the list is filtered to
        // starred movements; otherwise the card has already updated itself.
        onStar: () => {
          if (state.starred) paint();
        },
        selected: selectedId === ex.id,
      });
      cards.set(ex.id, card);
      grid.appendChild(card);
    }
  }

  /*
   * Moves the selection without touching the DOM's structure. Rebuilding the
   * grid here would destroy every card, which drops the browser's scroll anchor
   * and lurches the page — visible from anywhere except the very top.
   */
  function syncSelection(id) {
    selectedId = id;
    for (const [exerciseId, card] of cards) markSelected(card, exerciseId === id);
  }

  /* Filtered to your kit and nothing matched: a dead end unless it says so and
   * offers the way out. */
  function emptyState() {
    if (state.starred) {
      return el('p', {
        class: 'empty',
        text: 'Nothing starred yet — tap a star to keep a movement close to hand.',
      });
    }
    if (state.scope === 'mine') {
      return el('div', { class: 'empty' }, [
        el('p', { text: 'Nothing here works with the kit you have.' }),
        el('button', {
          class: 'btn btn-outline btn-sm',
          type: 'button',
          text: 'Show everything',
          onclick: () => {
            state.scope = 'all';
            bar.syncScope();
            paint();
          },
        }),
      ]);
    }
    return el('p', { class: 'empty', text: 'No movements match those filters.' });
  }

  const bar = filterBar(state, paint);
  container.appendChild(bar.node);
  container.appendChild(count);
  container.appendChild(grid);
  paint();
  return { state, paint, syncSelection };
}

/*
 * The Library tab: the grid on the left, the selected movement's detail beside
 * it. On a wide screen the detail is a column that sits still while you browse;
 * on a phone the same element becomes a sheet over the bottom of the screen.
 * Either way the grid itself never moves, which was the whole problem with
 * expanding a card in place.
 */
export function renderLibrary(main) {
  clear(main);
  let openId = null;

  const listContainer = el('div', { class: 'library-list' });
  const panel = el('aside', { class: 'ex-panel', 'aria-label': 'Movement detail' });
  const backdrop = el('div', { class: 'ex-panel-backdrop', hidden: true, onclick: () => close() });

  // Held across repaints so opening a movement doesn't reset the filters.
  const state = defaultFilters();

  function close() {
    openId = null;
    list.syncSelection(null);
    paintPanel();
  }

  function paintPanel() {
    clear(panel);
    const ex = openId ? exercises().find((e) => e.id === openId) : null;

    panel.classList.toggle('is-open', !!ex);
    backdrop.hidden = !ex;

    if (!ex) {
      panel.appendChild(
        el('p', { class: 'ex-panel-empty', text: 'Pick a movement to see its cues.' })
      );
      return;
    }

    panel.appendChild(
      el('div', { class: 'ex-panel-head' }, [
        el('h2', { class: 'ex-panel-title', text: ex.name }),
        el('button', {
          class: 'btn btn-ghost ex-panel-close',
          type: 'button',
          text: '×',
          'aria-label': 'Close',
          onclick: close,
        }),
      ])
    );
    panel.appendChild(exerciseDetail(ex));
  }

  // Built once. Changing the selection afterwards only moves a border and
  // swaps the panel's contents — the grid is never rebuilt, so the page stays
  // exactly where you left it.
  const list = renderExerciseList(listContainer, {
    openId,
    state,
    onOpen: (ex) => {
      openId = openId === ex.id ? null : ex.id;
      list.syncSelection(openId);
      paintPanel();
    },
  });

  // Escape closes the sheet. The listener retires itself once the view is gone,
  // since the router replaces the whole subtree without telling us.
  function onKey(e) {
    if (!document.body.contains(panel)) {
      document.removeEventListener('keydown', onKey);
      return;
    }
    if (e.key === 'Escape' && openId) close();
  }
  document.addEventListener('keydown', onKey);

  main.appendChild(el('div', { class: 'library' }, [listContainer, panel]));
  main.appendChild(backdrop);
  paintPanel();
}
