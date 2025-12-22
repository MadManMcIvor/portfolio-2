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
    // append near the button so it's in a logical reading order
    btn.parentNode.appendChild(live);
  }

  function updateState(){
    const isDark = document.documentElement.classList.contains('dark');
    btn.setAttribute('aria-checked', String(isDark));
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    btn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    // Update polite live text so screen readers announce the new state
    live.textContent = isDark ? 'Dark mode enabled' : 'Light mode enabled';
  }

  btn.addEventListener('click', ()=>{
    // Dispatch Basecoat's theme event — Basecoat's head script handles persistence
    document.dispatchEvent(new CustomEvent('basecoat:theme'));
    // Update shortly after to reflect the applied theme
    setTimeout(updateState, 60);
  });

  // Update state when Basecoat theme event happens (avoid visual lag)
  document.addEventListener('basecoat:theme', () => setTimeout(updateState, 40));

  // Reflect initial state
  updateState();

  // Sync across tabs
  window.addEventListener('storage', (e)=>{ if(e.key === 'themeMode') updateState(); });
}
