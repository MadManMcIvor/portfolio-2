import { hero } from '../data/hero.js';

export function initHero() {
  const section = document.querySelector('[data-section="hero"]');
  if (!section) return;

  const heroInner = section.querySelector('.hero-inner');
  if (!heroInner) return;

  // Find or create the text content div
  let textDiv = heroInner.querySelector('.hero-text');
  if (!textDiv) {
    textDiv = document.createElement('div');
    heroInner.insertBefore(textDiv, heroInner.firstChild);
  }

  textDiv.innerHTML = `
    <h2 id="hero-heading">${hero.name} — ${hero.tagline}</h2>
    <p class="lead">${hero.description}</p>
    <div class="hero-actions">
      ${hero.cta.map(btn => `
        <a href="${btn.href}" class="btn btn-${btn.variant}">${btn.text}</a>
      `).join('')}
    </div>
  `;
}
