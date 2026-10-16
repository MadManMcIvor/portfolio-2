import { explainers, explainerGroups } from '../data/explainers.js';
import { plate } from './plate.js';

// `base` is the path from the current page to /explainers/.
const card = (e, base, variant) => plate({
  key: e.slug,
  color: e.color,
  title: e.title,
  desc: e.desc,
  meta: e.tags,
  href: `${base}${e.slug}/`,
  variant: variant || (e.group === 'languages' ? 'token' : undefined),
});

/** Home page: the featured few, linking into /explainers/. */
export function initFeaturedExplainers({ containerSelector = '#explainers-grid', base = 'explainers/' } = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  container.innerHTML = explainers.filter(e => e.featured).map(e => card(e, base)).join('');

  const more = document.querySelector('#explainers-more');
  if (more) more.textContent = `All ${explainers.length} explainers`;
}

/**
 * The explainers page: every one, in its group. The first concept leads, two columns
 * wide, so five concepts fill two rows of three; the four languages sit in a row.
 */
export function initExplainerIndex({ containerSelector = '#explainer-groups', base = './' } = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  container.innerHTML = explainerGroups.map(g => {
    const items = explainers.filter(e => e.group === g.id);
    if (!items.length) return '';
    const four = g.id === 'languages';
    return `<section class="plate-group" aria-labelledby="group-${g.id}">
      <h2 id="group-${g.id}" class="section-title">${g.title}</h2>
      <p class="section-lead">${g.lead}</p>
      <div class="plates${four ? ' plates--four' : ''}" role="list">${items.map((e, i) => card(e, base, !four && i === 0 ? 'wide' : undefined)).join('')}</div>
    </section>`;
  }).join('');

  const count = document.querySelector('#explainer-count');
  if (count) count.textContent = explainers.length;
}
