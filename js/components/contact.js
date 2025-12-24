import { contact } from '../data/contact.js';

export function initContact() {
  const section = document.querySelector('[data-section="contact"]');
  if (!section) return;

  const container = section.querySelector('.contact');
  if (!container) return;

  // Update heading
  const heading = container.querySelector('h3');
  if (heading) {
    heading.textContent = contact.heading;
  }

  // Update description
  const lead = container.querySelector('.lead');
  if (lead) {
    lead.textContent = contact.description;
  }

  // Update CTA button
  const cta = container.querySelector('a.btn-cta');
  if (cta) {
    cta.href = contact.cta.href;
    const span = cta.querySelector('span');
    if (span) {
      span.textContent = contact.cta.text;
    }
  }
}
