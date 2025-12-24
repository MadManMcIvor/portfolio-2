import { projects } from '../data/projects.js';

export function initProjectCards({containerSelector = '#projects-grid', modal}){
  const container = document.querySelector(containerSelector);
  if(!container) return;

  container.innerHTML = projects.map(p => (
    `<div class="card" role="listitem" data-id="${p.id}">
      <header>
        <h4>${p.title}</h4>
        <p>${p.desc}</p>
      </header>
      <section>
        <div class="badges" aria-hidden="true">${p.tech.map(t=>`<span class="badge">${t}</span>`).join('')}</div>
      </section>
    </div>`
  )).join('');

} 
