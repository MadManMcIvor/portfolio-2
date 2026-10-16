// Shared by every explainer page: wires the site strip's theme toggle. The theme itself is
// applied before first paint by the inline script in each page's <head>, with the same
// storage key as the rest of the site, so a choice made anywhere carries everywhere.
import { initThemeToggle } from '../js/components/themeToggle.js';

initThemeToggle({ buttonSelector: '#theme-toggle' });
