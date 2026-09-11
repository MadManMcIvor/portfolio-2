/*
 * Settings: what kit you can get to, whether the player makes a noise, and the
 * data itself. See docs/specs/005-kit-and-a-wider-library.md.
 *
 * These are the three things that belong to no tab — previously only the data
 * half existed, at #/data, reachable from a footer link and nowhere else.
 */
import { equipmentGroups, ALWAYS, getKit, setKit, clearKit, hasKit, canDo } from './equipment.js';
import { exercises } from './exercises.js';
import { getSettings, saveSettings } from './storage.js';
import { renderTransferSections } from './transfer.js';
import { el, clear } from './util.js';

export function renderSettings(main) {
  clear(main);

  // Reached from a footer link that is on every screen, so back means back
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

  main.appendChild(kitSection());
  main.appendChild(soundsSection());
  renderTransferSections(main);
}

/* ─── Your kit ─────────────────────────────────────────────────────────── */

function kitSection() {
  const section = el('section', { class: 'kit' });
  const status = el('p', { class: 'meta kit-status', role: 'status' });

  /* Says what ticking the boxes actually did, in the only terms that matter:
   * how much of the library is left. */
  function syncStatus() {
    const all = exercises();
    if (!all.length) return;
    if (!hasKit()) {
      status.textContent = `Showing all ${all.length} movements.`;
      return;
    }
    const kit = getKit();
    const usable = all.filter((ex) => canDo(ex, kit)).length;
    status.textContent = `${usable} of ${all.length} movements need only the kit you have.`;
  }

  function onChange() {
    const ticked = [...section.querySelectorAll('input[type=checkbox]:checked')].map((box) => box.value);
    setKit(ticked);
    syncStatus();
  }

  section.appendChild(el('h2', { class: 'eyebrow', text: 'Your kit' }));
  section.appendChild(
    el('p', {
      class: 'lead',
      text: 'Tick what you can actually get to and the library will show you those movements first. Access, not ownership — a pool at the gym you go to counts; a bike in the shed you never ride does not.',
    })
  );

  const kit = new Set(getKit() || []);

  for (const { group, kinds } of equipmentGroups()) {
    section.appendChild(el('h3', { class: 'kit-group', text: group }));
    section.appendChild(
      el(
        'div',
        { class: 'kit-list' },
        kinds.map((kind) => {
          const box = el('input', { type: 'checkbox', value: kind.id });
          // You always have your body. Ticked, disabled, and left in the list
          // so the rule is visible rather than hidden in the matching.
          if (kind.id === ALWAYS) {
            box.checked = true;
            box.disabled = true;
          } else {
            box.checked = kit.has(kind.id);
            box.addEventListener('change', onChange);
          }
          return el('label', { class: 'checkbox' }, [box, kind.label]);
        })
      )
    );
  }

  section.appendChild(status);

  /*
   * Never having said is a real state, distinct from having nothing — it is
   * what makes the library show everything to someone who has just opened the
   * app. So there has to be a way back to it.
   */
  const reset = el('button', {
    class: 'btn btn-ghost btn-sm kit-reset',
    type: 'button',
    text: 'Stop filtering by kit',
    onclick: () => {
      clearKit();
      for (const box of section.querySelectorAll('input[type=checkbox]')) {
        if (box.value !== ALWAYS) box.checked = false;
      }
      syncStatus();
      reset.hidden = true;
    },
  });
  reset.hidden = !hasKit();
  section.appendChild(reset);

  // Ticking the first box is what turns filtering on, so the button has to
  // appear then rather than only on the next visit.
  section.addEventListener('change', () => {
    reset.hidden = !hasKit();
  });

  syncStatus();
  return section;
}

/* ─── Sounds ───────────────────────────────────────────────────────────── */

function soundsSection() {
  const box = el('input', { type: 'checkbox' });
  box.checked = getSettings().beeps;
  box.addEventListener('change', () => saveSettings({ beeps: box.checked }));

  return el('section', { class: 'sounds' }, [
    el('h2', { class: 'eyebrow', text: 'Sounds' }),
    el('label', { class: 'checkbox' }, [box, 'Beep on the last seconds of work and rest']),
    el('p', {
      class: 'meta',
      text: 'The player and the board both use it. Silence is the right answer in a shared gym.',
    }),
  ]);
}
