import { footer as footerData } from '../data/footer.js';

export function initFooter() {
  const footerEl = document.querySelector('.site-footer');
  if (!footerEl) return;

  const footerInner = footerEl.querySelector('.footer-inner');
  if (!footerInner) return;

  footerInner.innerHTML = `
    <p>${footerData.copyright}</p>
    <p class="muted-note">${footerData.credit}</p>
  `;
}
