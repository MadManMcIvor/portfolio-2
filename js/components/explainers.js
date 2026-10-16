import { explainers, explainerGroups } from '../data/explainers.js';

// Each card is one link: the whole card is the target, so there's no separate "read" link
// to aim for. The list role sits on a wrapper so the link keeps its own role. `base` is
// the path from the current page to /explainers/.
const card = (e, base) => (
  `<div class="card-item" role="listitem">
    <a class="card card--link" href="${base}${e.slug}/">
      <h3>${e.title}</h3>
      <p>${e.desc}</p>
      <div class="badges" aria-hidden="true">${e.tags.map(t => `<span class="badge">${t}</span>`).join('')}</div>
      <span class="card-go" aria-hidden="true">Open &rarr;</span>
    </a>
  </div>`
);

/** Home page: the featured few, linking into /explainers/. */
export function initFeaturedExplainers({ containerSelector = '#explainers-grid', base = 'explainers/' } = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  container.innerHTML = explainers.filter(e => e.featured).map(e => card(e, base)).join('');

  const more = document.querySelector('#explainers-more');
  if (more) more.textContent = `All ${explainers.length} explainers`;
}

/** The explainers page: every one, in its group. */
export function initExplainerIndex({ containerSelector = '#explainer-groups', base = './' } = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  container.innerHTML = explainerGroups.map(g => {
    const items = explainers.filter(e => e.group === g.id);
    if (!items.length) return '';
    return `<section class="explainer-group" aria-labelledby="group-${g.id}">
      <h2 id="group-${g.id}" class="section-title">${g.title}</h2>
      <p class="lead">${g.lead}</p>
      <div class="grid" role="list">${items.map(e => card(e, base)).join('')}</div>
    </section>`;
  }).join('');
}
