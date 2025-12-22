export function initThemeToggle({buttonSelector = '#theme-toggle'} = {}){
  const btn = document.querySelector(buttonSelector);
  if(!btn) return;

  function updateState(){
    const isDark = document.documentElement.classList.contains('dark');
    // aria-pressed = true when in light mode (pressed = light)
    btn.setAttribute('aria-pressed', String(!isDark));
    btn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
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
