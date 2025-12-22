import { initThemeToggle } from './components/themeToggle.js';
import { initProjectCards } from './components/projectCards.js';
import { initModal } from './components/modal.js';

document.addEventListener('DOMContentLoaded', ()=>{
  const modal = initModal();
  initThemeToggle();
  initProjectCards({modal});

  // Smooth scroll for in-page links and accessible focus handling
  document.addEventListener('click', (e)=>{
    const a = e.target.closest('a[href^="#"]');
    if(!a) return;
    const href = a.getAttribute('href');
    if(href === '#') return;
    const target = document.querySelector(href);
    if(!target) return;
    e.preventDefault();

    // Compute header height (reads CSS var) and convert to pixels
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '72px';
    const headerHeight = parseInt(raw, 10) || 72;

    // Smooth scroll to target while offsetting for the sticky header
    const top = window.scrollY + target.getBoundingClientRect().top - (headerHeight + 8);
    window.scrollTo({ top, behavior: 'smooth' });

    // Accessible focus handling after the smooth scroll (delayed to allow animation)
    target.setAttribute('tabindex','-1');
    setTimeout(()=>{
      target.focus();
      setTimeout(()=> target.removeAttribute('tabindex'), 1000);
    }, 420);
  });

  const form = document.getElementById('contact-form');
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const f = new FormData(form);
    const name = f.get('name');
    const email = f.get('email');
    const message = f.get('message');
    // compose mailto
    const to = 'you@example.com'; // replace with your email
    const subject = encodeURIComponent('Portfolio contact from ' + name);
    const body = encodeURIComponent(`From: ${name} <${email}>\n\n${message}`);
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  });
});
