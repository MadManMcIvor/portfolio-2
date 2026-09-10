/* Hash router. The shell itself lives in index.html. */
import { renderCalendar } from './calendar.js';
import { renderLibrary } from './library.js';
import { renderCircuitList, renderCircuitEditor } from './builder.js';
import { startPlayer, stopPlayer } from './player.js';
import { startBoard, stopBoard } from './board.js';
import { renderTransfer } from './transfer.js';
import { clear } from './util.js';

function setActiveTab(name) {
  for (const tab of document.querySelectorAll('.tabs a')) {
    const isActive = tab.dataset.tab === name;
    tab.classList.toggle('is-active', isActive);
    if (isActive) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
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

    case 'data':
      setActiveTab(null);
      renderTransfer(main);
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
