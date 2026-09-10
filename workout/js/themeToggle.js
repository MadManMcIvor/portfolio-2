/*
 * Wires the top bar's toggle to window.setTheme, which the inline script in
 * index.html defines before first paint. Mirrors the main site's component so
 * both share the stored choice.
 */
export function initThemeToggle({ buttonSelector = '#theme-toggle' } = {}) {
  const btn = document.querySelector(buttonSelector);
  if (!btn) return;

  btn.setAttribute('role', 'switch');

  function updateState() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    btn.setAttribute('aria-checked', String(isDark));
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    btn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  }

  btn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    window.setTheme(isDark ? 'light' : 'dark');
    updateState();
  });

  updateState();

  // The main site writes the same key, so a change there shows up here.
  window.addEventListener('storage', (e) => {
    if (e.key !== 'theme') return;
    if (e.newValue === 'light' || e.newValue === 'dark') {
      document.documentElement.setAttribute('data-theme', e.newValue);
      updateState();
    }
  });
}
