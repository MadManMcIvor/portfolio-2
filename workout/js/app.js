/* Hash router. The shell itself lives in index.html. */
import { renderCalendar } from './calendar.js';
import { renderLibrary } from './library.js';
import { renderCircuitList, renderCircuitEditor } from './builder.js';
import { renderCatalogue } from './catalogue.js';
import { startPlayer, stopPlayer } from './player.js';
import { startBoard, stopBoard } from './board.js';
import { renderSettings } from './settings.js';
import { clear } from './util.js';

function setActiveTab(name) {
  for (const tab of document.querySelectorAll('.tabs a')) {
    const isActive = tab.dataset.tab === name;
    tab.classList.toggle('is-active', isActive);
    if (isActive) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  }

  // The gear is not a tab — it is a destination like any other, and should say
  // so when you are standing in it.
  const gear = document.getElementById('settings-link');
  if (gear) {
    const on = name === 'settings';
    gear.classList.toggle('is-active', on);
    if (on) gear.setAttribute('aria-current', 'page');
    else gear.removeAttribute('aria-current');
  }
}

function route() {
  const [view, id] = (location.hash || '#/calendar').replace(/^#\/?/, '').split('/');
  const main = document.getElementById('view');

  stopPlayer();
  stopBoard();

  // The library is the one view that wants the shell's full width, for its
  // detail column. Everything else stays at a readable measure.
  main.className = `view is-${view || 'calendar'}`;

  switch (view) {
    case 'calendar':
      setActiveTab('calendar');
      renderCalendar(main);
      break;

    case 'library':
      setActiveTab('library');
      renderLibrary(main);
      break;

    case 'builder':
      setActiveTab('builder');
      if (id) renderCircuitEditor(main, id);
      else renderCircuitList(main);
      break;

    // Yours and the catalogue are two halves of the Circuits tab, so the tab
    // stays lit — but each keeps its own hash, so going back works.
    case 'catalogue':
      setActiveTab('builder');
      renderCatalogue(main);
      break;

    case 'play':
      setActiveTab('builder');
      clear(main);
      startPlayer(id);
      break;

    case 'board':
      setActiveTab('builder');
      clear(main);
      startBoard(id);
      break;

    // '#/data' is what this view used to be called, before it grew a kit list
    // and the sound toggle. Kept as an alias rather than breaking a bookmark.
    case 'settings':
    case 'data':
      setActiveTab('settings');
      renderSettings(main);
      break;

    default:
      location.hash = '#/calendar';
      return;
  }
  window.scrollTo(0, 0);
}

export function initRouter() {
  window.addEventListener('hashchange', route);
  if (!location.hash) location.hash = '#/calendar';
  route();
}
