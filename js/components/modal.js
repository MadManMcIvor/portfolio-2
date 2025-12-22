export function initModal() {
  const modal = document.createElement('div');
  modal.className = 'app-modal';
  modal.innerHTML = `
    <div class="modal-backdrop" tabindex="-1" data-close>
      <div class="modal-inner" role="dialog" aria-modal="true" aria-label="Screenshot preview" tabindex="0">
        <button class="btn btn-ghost modal-close" aria-label="Close">✕</button>
        <div class="modal-body" tabindex="-1"></div>
      </div>
    </div>
  `;
  document.body.append(modal);

  const backdrop = modal.querySelector('.modal-backdrop');
  const modalInner = modal.querySelector('.modal-inner');
  const body = modal.querySelector('.modal-body');
  const closeBtn = modal.querySelector('.modal-close');

  let previouslyFocused = null;
  // nodes outside the modal we will hide from assistive tech while modal is open
  const appNodes = Array.from(document.body.children).filter(n => !n.classList.contains('app-modal'));

  function getFocusable(container){
    const selectors = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable]';
    return Array.from(container.querySelectorAll(selectors)).filter(el => {
      // visible
      return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length;
    });
  }

  function trapFocus(e){
    if(e.key !== 'Tab') return;
    const focusable = getFocusable(modalInner);
    if(!focusable.length){ e.preventDefault(); return; }
    const idx = focusable.indexOf(document.activeElement);
    if (e.shiftKey) {
      if (idx === 0 || document.activeElement === modalInner) {
        e.preventDefault();
        focusable[focusable.length-1].focus();
      }
    } else {
      if (idx === focusable.length - 1) {
        e.preventDefault();
        focusable[0].focus();
      }
    }
  }

  function open({src, alt = '', title = ''}, trigger){
    previouslyFocused = document.activeElement;
    body.innerHTML = '';

    if(title){
      // remove any existing title to avoid duplication on subsequent opens
      const oldTitle = modalInner.querySelector('.modal-title');
      if(oldTitle) oldTitle.remove();
      // optional title inside dialog for screen readers
      const h = document.createElement('h3');
      h.className = 'modal-title';
      h.textContent = title;
      modalInner.insertBefore(h, modalInner.querySelector('.modal-close').nextSibling);
      // ensure title has an id so it can be referenced by aria-labelledby if desired
      h.id = 'modal-title';
      modalInner.setAttribute('aria-labelledby', h.id);
    }

    const img = document.createElement('img');
    img.src = src;
    img.alt = alt || title;
    img.style.maxWidth = '90vw';
    img.style.maxHeight = '70vh';
    body.append(img);

    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
    // prevent the background from scrolling while modal is open
    document.body.style.overflow = 'hidden';
    appNodes.forEach(n => { n.inert = true; n.setAttribute('aria-hidden', 'true'); });

    // focus management: prefer first focusable element inside modal
    const focusable = getFocusable(modalInner);
    (focusable[0] || closeBtn || modalInner).focus();

    document.addEventListener('keydown', onKey);
    document.addEventListener('keydown', trapFocus);
  }

  function close(){
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    // re-enable background scrolling
    document.body.style.overflow = '';
    appNodes.forEach(n => { n.inert = false; n.removeAttribute('aria-hidden'); });

    document.removeEventListener('keydown', onKey);
    document.removeEventListener('keydown', trapFocus);

    if(previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
  }

  function onKey(e){ if(e.key === 'Escape') close(); }

  backdrop.addEventListener('click', (e) => { if(e.target.dataset.close !== undefined) close(); });
  closeBtn.addEventListener('click', close);

  // hide initially
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');

  return {open, close};
}

/* Minimal styling for modal — inlined here for convenience */
const css = `
.app-modal{position:fixed;inset:0;display:none;z-index:6000}
.app-modal .modal-backdrop{position:fixed;inset:0;background:rgba(2,6,10,0.6);display:flex;align-items:center;justify-content:center}
.app-modal .modal-inner{background:var(--card-bg);padding:18px;border-radius:12px;border:1px solid rgba(255,255,255,0.03);max-width:92vw;position:relative}
.app-modal .modal-inner:focus{outline:2px solid var(--primary);outline-offset:4px}
.app-modal .modal-title{margin:0 0 12px;font-size:1.05rem}
.app-modal .modal-close{position:absolute;right:10px;top:8px;background:transparent;border:0;color:var(--text);font-size:16px}
.app-modal img{display:block;border-radius:8px;max-width:100%;height:auto}
`;
const style = document.createElement('style');
style.textContent = css;
document.head.append(style);
