import { curioItems } from '../data/curio.js';

export function initCurioCabinet({ containerSelector = '#curio-table', modal }) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  // Build the table
  const table = document.createElement('table');
  table.className = 'curio-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>What?</th>
        <th>Type</th>
        <th>Thoughts</th>
      </tr>
    </thead>
    <tbody>
      ${curioItems.map(item => `
        <tr data-id="${item.id}">
          <td><a href="#" class="curio-link" data-id="${item.id}">${item.title}</a></td>
          <td><span class="badge">${item.type}</span></td>
          <td><button class="btn btn-outline btn-sm curio-thoughts-btn" data-id="${item.id}">Context</button></td>
        </tr>
      `).join('')}
    </tbody>
  `;
  
  container.appendChild(table);

  // Handle "Context" button clicks to open modal
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.curio-thoughts-btn');
    if (!btn) return;
    
    const id = btn.dataset.id;
    const item = curioItems.find(i => i.id === id);
    if (!item) return;

    modal.open({
      src: null,
      title: item.title,
      content: item.thoughts
    });
  });

  // Handle link clicks
  container.addEventListener('click', (e) => {
    const link = e.target.closest('.curio-link');
    if (!link) return;
    e.preventDefault();
    const id = link.dataset.id;
    const item = curioItems.find(i => i.id === id);
    if (!item) return;

    modal.open({
      src: null,
      title: item.title,
      content: item.thoughts
    });
  });
}
