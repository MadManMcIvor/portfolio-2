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
        <img src="${p.img}" alt="Screenshot for ${p.title}" loading="lazy" tabindex="0" role="button" aria-label="Open screenshot for ${p.title}"/>
        <div class="badges" aria-hidden="true">${p.tech.map(t=>`<span class="badge">${t}</span>`).join('')}</div>
      </section>
      <footer>
        <div class="actions">
          <a class="btn btn-outline btn-lg" href="${p.github}" target="_blank" rel="noopener">Code</a>
          <a class="btn btn-outline btn-lg" href="${p.live}" target="_blank" rel="noopener">Live</a>
        </div>
      </footer>
    </div>`
  )).join('');

  // Open image in modal when clicked or activated by keyboard
  container.addEventListener('click', (e)=>{
    const img = e.target.closest('img[role="button"]');
    if(!img) return;
    const card = img.closest('.card');
    if(!card) return;
    const id = card.dataset.id;
    const project = projects.find(p=> String(p.id) === id);
    if(!project) return;
    modal.open({src: project.img, alt: project.title, title: project.title}, img);
  });

  container.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' || e.key === ' '){
      const img = e.target.closest('img[role="button"]');
      if(!img) return;
      e.preventDefault();
      const card = img.closest('.card');
      const id = card.dataset.id;
      const project = projects.find(p=> String(p.id) === id);
      if(!project) return;
      modal.open({src: project.img, alt: project.title, title: project.title}, img);
    }
  });

} 
