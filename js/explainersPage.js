// Entry point for /explainers/, the index of every explainer.
import { initThemeToggle } from './components/themeToggle.js';
import { initExplainerIndex } from './components/explainers.js';
import { initFooter } from './components/footer.js';

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initExplainerIndex();
  initFooter();
});
