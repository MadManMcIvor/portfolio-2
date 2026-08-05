export function initThemeToggle({buttonSelector = '#theme-toggle'} = {}){
  const btn = document.querySelector(buttonSelector);
  if(!btn) return;

  // Use ARIA switch pattern for clarity to AT users
  btn.setAttribute('role', 'switch');

  // Create or reuse a polite live region to announce changes
  let live = document.getElementById('theme-toggle-live');
  if(!live){
    live = document.createElement('span');
    live.id = 'theme-toggle-live';
    live.className = 'sr-only';
    live.setAttribute('aria-live', 'polite');
    btn.parentNode.appendChild(live);
  }

  function updateState(){
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    btn.setAttribute('aria-checked', String(isDark));
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    btn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    live.textContent = isDark ? 'Dark mode enabled' : 'Light mode enabled';
  }

  btn.addEventListener('click', ()=>{
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    window.setTheme(isDark ? 'light' : 'dark');
    updateState();
  });

  // Reflect initial state
  updateState();

  // Sync across tabs
  window.addEventListener('storage', (e)=>{ if(e.key === 'theme') updateState(); });
}
