/*
 * Export and import everything as a block of JSON text.
 *
 * This exists because of a specific iOS quirk: a web app added to the home
 * screen gets its own storage, separate from Safari's. Circuits built in one
 * are invisible to the other, and since localStorage is the whole database,
 * copying text between them is the only way across. It doubles as a backup —
 * clearing site data would otherwise take everything with it.
 *
 * Text rather than a file download, deliberately: the installed app's webview
 * makes downloads awkward, and copy-paste works everywhere.
 */
import { getCircuits, replaceCircuits } from './storage.js';
import { getEntries, replaceEntries } from './schedule.js';
import { getFavourites, replaceFavourites } from './favourites.js';
import { el, clear } from './util.js';

const FORMAT = 'workout-export';
const VERSION = 1;

export function exportData() {
  return {
    format: FORMAT,
    version: VERSION,
    exported: new Date().toISOString(),
    circuits: getCircuits(),
    schedule: getEntries(),
    favourites: getFavourites(),
  };
}

export const exportText = () => JSON.stringify(exportData(), null, 2);

/**
 * Reads an export back in. Throws with a readable message rather than letting a
 * JSON error surface — this is a box you paste into, so bad input is expected.
 *
 * @param mode 'replace' wipes what's here first; 'merge' keeps both, skipping
 *             anything whose id already exists.
 */
export function importText(text, mode = 'merge') {
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error("That doesn't look like JSON. Paste the whole export, including the braces.");
  }

  if (!data || typeof data !== 'object' || data.format !== FORMAT) {
    throw new Error('That JSON is not a workout export.');
  }
  if (!Array.isArray(data.circuits)) {
    throw new Error('That export has no circuits in it.');
  }

  const circuits = data.circuits;
  const schedule = Array.isArray(data.schedule) ? data.schedule : [];
  const favourites = Array.isArray(data.favourites) ? data.favourites : [];

  if (mode === 'replace') {
    replaceCircuits(circuits);
    replaceEntries(schedule);
    replaceFavourites(favourites);
    return { circuits: circuits.length, schedule: schedule.length, favourites: favourites.length };
  }

  // Merging keys off ids, so importing the same export twice is a no-op rather
  // than a pile of duplicates.
  const existingCircuits = new Set(getCircuits().map((c) => c.id));
  const newCircuits = circuits.filter((c) => c && c.id && !existingCircuits.has(c.id));

  const existingEntries = new Set(getEntries().map((e) => e.id));
  const newEntries = schedule.filter((e) => e && e.id && !existingEntries.has(e.id));

  const mergedFavourites = [...new Set([...getFavourites(), ...favourites])];

  replaceCircuits([...getCircuits(), ...newCircuits]);
  replaceEntries([...getEntries(), ...newEntries]);
  replaceFavourites(mergedFavourites);

  return { circuits: newCircuits.length, schedule: newEntries.length, favourites: mergedFavourites.length };
}

/* ─── View ─────────────────────────────────────────────────────────────── */

const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export function renderTransfer(main) {
  clear(main);

  // Reached from the footer, which is on every screen, so back means back
  // rather than any particular tab.
  main.appendChild(
    el('div', { class: 'page-head' }, [
      el('button', {
        class: 'btn btn-ghost back-link',
        type: 'button',
        text: 'Back',
        onclick: () => (history.length > 1 ? history.back() : (location.hash = '#/calendar')),
      }),
    ])
  );

  // Spelled out rather than summarised: reached from a footer link called
  // "Your data", it should be obvious this is the whole thing and not just the
  // circuits.
  const data = exportData();
  const doneCount = data.schedule.filter((e) => e.status === 'done').length;

  main.appendChild(el('h2', { class: 'eyebrow', text: 'What this holds' }));
  main.appendChild(
    el('ul', { class: 'inventory' }, [
      el('li', {}, [el('strong', { text: plural(data.circuits.length, 'circuit') }), ' you have built']),
      el('li', {}, [
        el('strong', { text: plural(data.schedule.length, 'calendar entry', 'calendar entries') }),
        `, ${doneCount} of them done`,
      ]),
      el('li', {}, [el('strong', { text: plural(data.favourites.length, 'starred movement') })]),
    ])
  );

  main.appendChild(el('h2', { class: 'eyebrow', text: 'Export' }));
  main.appendChild(
    el('p', {
      class: 'lead',
      text: 'All of it, as text. Copy it somewhere safe, or paste it into another browser below — the installed app and Safari keep separate stores on iOS, and this is the way across.',
    })
  );

  const out = el('textarea', {
    class: 'transfer-box',
    id: 'export-box',
    readonly: 'readonly',
    rows: 8,
    'aria-label': 'Your data as JSON',
  });
  out.value = exportText();

  const copyStatus = el('span', { class: 'meta', role: 'status' });

  main.appendChild(out);
  main.appendChild(
    el('div', { class: 'transfer-actions' }, [
      el('button', {
        class: 'btn btn-outline',
        type: 'button',
        text: 'Copy',
        onclick: async () => {
          try {
            await navigator.clipboard.writeText(out.value);
            copyStatus.textContent = 'Copied.';
          } catch (e) {
            // Clipboard access is refused in plenty of contexts; selecting the
            // text is a fine fallback and needs no permission.
            out.select();
            copyStatus.textContent = 'Selected — copy it with your keyboard.';
          }
        },
      }),
      copyStatus,
    ])
  );

  main.appendChild(el('h2', { class: 'eyebrow', text: 'Import' }));
  main.appendChild(
    el('p', {
      class: 'lead',
      text: 'Paste an export here. Merging keeps what you already have and skips anything already present; replacing wipes this browser first — circuits, calendar and stars alike.',
    })
  );

  const box = el('textarea', {
    class: 'transfer-box',
    id: 'import-box',
    rows: 6,
    placeholder: 'Paste your export here',
    'aria-label': 'Export to import',
  });
  const status = el('p', { class: 'transfer-status', role: 'status' });

  function run(mode) {
    status.className = 'transfer-status';
    if (!box.value.trim()) {
      status.textContent = 'Nothing pasted yet.';
      return;
    }
    if (mode === 'replace' && !confirm('Replace everything in this browser with the pasted export?')) {
      return;
    }
    try {
      const added = importText(box.value, mode);
      status.classList.add('is-good');
      status.textContent =
        mode === 'replace'
          ? `Replaced with ${plural(added.circuits, 'circuit')} and ${plural(added.schedule, 'scheduled day')}.`
          : added.circuits || added.schedule
            ? `Added ${plural(added.circuits, 'circuit')} and ${plural(added.schedule, 'scheduled day')}.`
            : 'Nothing new — this browser already has all of that.';
      box.value = '';
      out.value = exportText();
    } catch (err) {
      status.classList.add('is-bad');
      status.textContent = err.message;
    }
  }

  main.appendChild(box);
  main.appendChild(
    el('div', { class: 'transfer-actions' }, [
      el('button', { class: 'btn btn-primary', type: 'button', text: 'Merge in', onclick: () => run('merge') }),
      el('button', { class: 'btn btn-outline', type: 'button', text: 'Replace everything', onclick: () => run('replace') }),
    ])
  );
  main.appendChild(status);
}
