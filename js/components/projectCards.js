import { projects } from '../data/projects.js';

export function initProjectCards({containerSelector = '#projects-grid'} = {}){
  const container = document.querySelector(containerSelector);
  if(!container) return;

  container.innerHTML = projects.map(p => (
    `<div class="card" role="listitem" data-id="${p.id}">
      <header>
        <h3>${p.title}</h3>
        <p>${p.desc}</p>
      </header>
      <section>
        <div class="badges">${p.tech.map(t=>`<span class="badge">${t}</span>`).join('')}</div>
        <span class="sr-only">Technologies: ${p.tech.join(', ')}</span>
        ${p.url ? `<a class="card-link" href="${p.url}" target="_blank" rel="noopener noreferrer" aria-label="${p.title} — ${p.linkLabel || p.url} (opens in a new tab)">${p.linkLabel || p.url}<span aria-hidden="true"> &#8599;</span></a>` : ''}
      </section>
    </div>`
  )).join('');

} 
