import { markFor } from './marks.js';

/**
 * A plate card: a tinted figure with the item's drawing, then the title, a description and
 * a quiet meta line. With an `href` the whole card is the link; without one it's a plain
 * card. Used for explainers and projects alike, so they read as one set.
 *
 * `color` is a categorical colour name from css/palette.css. `variant` adds a modifier
 * (`wide` lays the figure beside the text; `token` sizes a language token).
 */
export function plate({ key, color, title, desc, meta = [], href, external = false, linkLabel, variant }) {
  const tag = href ? 'a' : 'div';
  const cls = `plate${variant ? ` plate--${variant}` : ''}`;
  const style = `--c:var(--cat-${color});--t:var(--cat-${color}-tint)`;
  const attrs = href
    ? ` href="${href}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}`
    : '';
  const link = linkLabel
    ? `<span class="plate-link">${linkLabel}${external ? '<span aria-hidden="true"> &#8599;</span><span class="sr-only"> (opens in a new tab)</span>' : ''}</span>`
    : '';

  return `<div class="plate-item" role="listitem">
    <${tag} class="${cls}" style="${style}"${attrs}>
      <span class="plate-fig">${markFor(key)}</span>
      <span class="plate-body">
        <span class="plate-title">${title}</span>
        <span class="plate-desc">${desc}</span>
        ${meta.length ? `<span class="plate-meta">${meta.join(' · ')}</span>` : ''}
        ${link}
      </span>
    </${tag}>
  </div>`;
}
