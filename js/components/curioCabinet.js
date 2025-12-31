import { curioItems } from '../data/curio.js';

const INITIAL_DISPLAY = 10;
const ITEMS_PER_PAGE = 8;

export function initCurioCabinet({ containerSelector = '#curio-table', modal }) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  // Sort items by date (newest first)
  const sortedItems = [...curioItems].sort((a, b) => b.date - a.date);

  // Calculate total pages
  const totalPages = Math.ceil(sortedItems.length / ITEMS_PER_PAGE);
  let currentPage = 1;

  // Wrapper for table and pagination
  const wrapper = document.createElement('div');
  wrapper.className = 'curio-wrapper';

  // Build the table
  const table = document.createElement('table');
  table.className = 'curio-table';
  table.setAttribute('data-curio-table', 'true');

  // Pagination component (Basecoat)
  const paginationContainer = document.createElement('div');
  paginationContainer.className = 'curio-pagination';
  paginationContainer.setAttribute('style', 'margin-top: 24px; margin-bottom: 32px; display: flex; justify-content: flex-end;');

  function renderTable(page) {
    // Determine which items to show
    let itemsToShow;
    if (page === 1) {
      // First page shows up to INITIAL_DISPLAY items
      itemsToShow = sortedItems.slice(0, INITIAL_DISPLAY);
    } else {
      // Subsequent pages show ITEMS_PER_PAGE items
      const startIndex = INITIAL_DISPLAY + (page - 2) * ITEMS_PER_PAGE;
      itemsToShow = sortedItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }

    table.innerHTML = `
      <thead>
        <tr>
          <th>What?</th>
          <th>Type</th>
          <th>Thoughts</th>
        </tr>
      </thead>
      <tbody>
        ${itemsToShow.map(item => `
          <tr data-id="${item.id}">
            <td><a href="${item.url}" class="curio-link" target="_blank" rel="noopener noreferrer">${item.title}</a></td>
            <td><span class="badge">${item.type}</span></td>
            <td><button class="btn btn-outline btn-sm curio-thoughts-btn" data-id="${item.id}">Context</button></td>
          </tr>
        `).join('')}
      </tbody>
    `;
  }

  function renderPagination() {
    paginationContainer.innerHTML = '';

    if (totalPages <= 1) return; // Don't show pagination if only one page

    // Create pagination nav element
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Pagination');

    const ul = document.createElement('ul');
    ul.className = 'pagination curio-pagination-list';

    // Previous button
    const prevLi = document.createElement('li');
    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn btn-outline';
    prevBtn.textContent = 'Previous';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderTable(currentPage);
        renderPagination();
        scrollToTop();
      }
    });
    prevLi.appendChild(prevBtn);
    ul.appendChild(prevLi);

    // Page buttons
    for (let i = 1; i <= totalPages; i++) {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.className = 'btn btn-outline';
      if (i === currentPage) {
        btn.setAttribute('aria-current', 'page');
        btn.classList.add('is-active');
      }
      btn.textContent = i;
      btn.addEventListener('click', () => {
        currentPage = i;
        renderTable(currentPage);
        renderPagination();
        scrollToTop();
      });
      li.appendChild(btn);
      ul.appendChild(li);
    }

    // Next button
    const nextLi = document.createElement('li');
    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-outline';
    nextBtn.textContent = 'Next';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderTable(currentPage);
        renderPagination();
        scrollToTop();
      }
    });
    nextLi.appendChild(nextBtn);
    ul.appendChild(nextLi);

    nav.appendChild(ul);
    paginationContainer.appendChild(nav);
  }

  function scrollToTop() {
    // Don't scroll to avoid moving pagination off screen
  }

  // Initial render
  renderTable(currentPage);
  renderPagination();

  wrapper.appendChild(paginationContainer);
  wrapper.appendChild(table);
  container.appendChild(wrapper);

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
      content: {
        description: item.description,
        thoughts: item.thoughts
      }
    });
  });
}
