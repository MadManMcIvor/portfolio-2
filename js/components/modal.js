export function initModal() {
  const modal = document.createElement('div');
  modal.className = 'app-modal';
  modal.innerHTML = `
    <div class="modal-backdrop" tabindex="-1" data-close>
      <div class="modal-inner" role="dialog" aria-modal="true" aria-label="Screenshot preview">
        <button class="btn btn-ghost modal-close" aria-label="Close">✕</button>
        <div class="modal-body"></div>
      </div>
    </div>
  `;
  document.body.append(modal);

  const backdrop = modal.querySelector('.modal-backdrop');
  const body = modal.querySelector('.modal-body');
  const closeBtn = modal.querySelector('.modal-close');

  function open({src, alt = '', title = ''}){
    body.innerHTML = '';
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt || title;
    img.style.maxWidth = '90vw';
    img.style.maxHeight = '70vh';
    body.append(img);
    modal.style.display = 'block';
    // trap focus
    closeBtn.focus();
    document.addEventListener('keydown', onKey);
  }
  function close(){
    modal.style.display = 'none';
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e){ if(e.key==='Escape') close(); }
  backdrop.addEventListener('click', (e)=>{ if(e.target.dataset.close!==undefined) close(); });
  closeBtn.addEventListener('click', close);

  // hide initially
  modal.style.display = 'none';

  return {open, close};
}

/* Minimal styling for modal — inlined here for convenience */
const css = `
.app-modal{position:fixed;inset:0;display:none;z-index:6000}
.app-modal .modal-backdrop{position:fixed;inset:0;background:rgba(2,6,10,0.6);display:flex;align-items:center;justify-content:center}
.app-modal .modal-inner{background:var(--card-bg);padding:18px;border-radius:12px;border:1px solid rgba(255,255,255,0.03);max-width:92vw}
.app-modal .modal-close{position:absolute;right:10px;top:8px;background:transparent;border:0;color:var(--text);font-size:16px}
.app-modal img{display:block;border-radius:8px}
`;
const style = document.createElement('style');
style.textContent = css;
document.head.append(style);
