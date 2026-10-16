import { projects } from '../data/projects.js';
import { plate } from './plate.js';

// Projects with somewhere public to go are whole-card links; links to elsewhere on this
// site stay in the tab, outbound ones open a new one. The first project leads, two
// columns wide, so five fill two rows of three.
export function initProjectCards({containerSelector = '#projects-grid'} = {}){
  const container = document.querySelector(containerSelector);
  if(!container) return;

  container.innerHTML = projects.map((p, i) => plate({
    key: p.id,
    color: p.color,
    title: p.title,
    desc: p.desc,
    meta: p.tech,
    href: p.url,
    external: p.url ? !p.url.startsWith('/') : false,
    linkLabel: p.url ? (p.linkLabel || p.url) : undefined,
    variant: i === 0 ? 'wide' : undefined,
  })).join('');
}
