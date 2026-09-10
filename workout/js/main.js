/* Entry point: load the exercise library, then start the router. */
import { loadExercises } from './exercises.js';
import { initThemeToggle } from './themeToggle.js';
import { initRouter } from './app.js';
import { el, clear } from './util.js';

function showLoadError(err) {
  console.error(err);
  const main = document.getElementById('view');
  clear(main);
  main.appendChild(
    el('div', { class: 'empty' }, [
      el('p', { text: 'Could not load the movement library.' }),
      el('p', {
        class: 'meta',
        text: 'The app needs to be served over http — opening index.html from disk will not work.',
      }),
    ])
  );
}

/*
 * Cache-first offline support, so a circuit still runs in a gym with no signal.
 * Skipped on localhost: during development the cache only gets in the way, and
 * home-screen install needs https anyway.
 */
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  if (['localhost', '127.0.0.1'].includes(location.hostname)) return;
  // Path-relative, so the scope stays /workout/.
  navigator.serviceWorker.register('./sw.js').catch((err) => console.warn('sw failed', err));
}

document.addEventListener('DOMContentLoaded', async () => {
  initThemeToggle();
  try {
    await loadExercises();
  } catch (err) {
    showLoadError(err);
    return;
  }
  initRouter();
  registerServiceWorker();
});
