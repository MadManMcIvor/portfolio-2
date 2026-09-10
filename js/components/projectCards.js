import { projects } from '../data/projects.js';

export function initProjectCards({containerSelector = '#projects-grid'} = {}){
  const container = document.querySelector(containerSelector);
  if(!container) return;

  // Links to elsewhere on this site stay in the tab; only outbound ones open a
  // new one, and only those get the arrow and the "opens in a new tab" note.
  const cardLink = (p) => {
    const label = p.linkLabel || p.url;
    const external = !p.url.startsWith('/');
    const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
    const note = external ? ' (opens in a new tab)' : '';
    const arrow = external ? '<span aria-hidden="true"> &#8599;</span>' : '';
    return `<a class="card-link" href="${p.url}"${attrs} aria-label="${p.title} — ${label}${note}">${label}${arrow}</a>`;
  };

  container.innerHTML = projects.map(p => (
    `<div class="card" role="listitem" data-id="${p.id}">
      <header>
        <h3>${p.title}</h3>
        <p>${p.desc}</p>
      </header>
      <section>
        <div class="badges">${p.tech.map(t=>`<span class="badge">${t}</span>`).join('')}</div>
        <span class="sr-only">Technologies: ${p.tech.join(', ')}</span>
        ${p.url ? cardLink(p) : ''}
      </section>
    </div>`
  )).join('');

} 
