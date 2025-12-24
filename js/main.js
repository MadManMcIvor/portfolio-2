import { initThemeToggle } from './components/themeToggle.js';
import { initProjectCards } from './components/projectCards.js';
import { initModal } from './components/modal.js';
import { initCurioCabinet } from './components/curioCabinet.js';
import { initHero } from './components/hero.js';
import { initSkills } from './components/skills.js';
import { initContact } from './components/contact.js';
import { initFooter } from './components/footer.js';

document.addEventListener('DOMContentLoaded', ()=>{
  const modal = initModal();
  initThemeToggle();
  initHero();
  initProjectCards({modal});
  initSkills();
  initCurioCabinet({modal});
  initContact();
  initFooter();

  // Smooth scroll for in-page links and accessible focus handling
  document.addEventListener('click', (e)=>{
    const a = e.target.closest('a[href^="#"]');
    if(!a) return;
    const href = a.getAttribute('href');
    if(href === '#') return;
    const target = document.querySelector(href);
    if(!target) return;
    e.preventDefault();

    // Use native scrollIntoView and rely on CSS scroll-padding-top to offset for the sticky header
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Make element focusable temporarily and focus without scrolling to avoid the jump/pop issue
    target.setAttribute('tabindex','-1');
    try {
      target.focus({ preventScroll: true });
    } catch (err) {
      // fallback for older browsers that don't support preventScroll
      setTimeout(()=> target.focus(), 500);
    }
    setTimeout(()=> target.removeAttribute('tabindex'), 1000);
  });

  // Header: add scrolled class once user scrolls past the hero to give it a stronger background
  const header = document.querySelector('.site-header');
  const hero = document.getElementById('hero');
  let _scheduled = false;
  function onScroll(){
    if(_scheduled) return;
    _scheduled = true;
    requestAnimationFrame(()=>{
      const y = window.scrollY || window.pageYOffset;
      const threshold = hero ? Math.max(hero.getBoundingClientRect().bottom - 80, 80) : 80;
      if(y > threshold){ header.classList.add('scrolled'); }
      else { header.classList.remove('scrolled'); }
      _scheduled = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const form = document.getElementById('contact-form');
  if (form) {
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
  }
});
