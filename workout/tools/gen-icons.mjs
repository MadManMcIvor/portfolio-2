// Exports the PNGs the manifest and iOS need from the kettlebell mark.
//
//   node tools/gen-icons.mjs
//
// `icons/icon.svg` is the source of truth for the art; the glyph below is the
// same two paths, reused to build the platform variants (rounded, full-bleed,
// safe-zone inset). Rasterising uses macOS' own QuickLook and sips, so there is
// nothing to install — but that does make this a Mac-only step. It is art
// tooling, not a build step: the PNGs are committed, and this only needs
// running when the mark itself changes.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const OUT = join(ROOT, 'icons');

const PAPER = '#f8f4ec';
const CLAY = '#a85d42';

/** The mark itself, in a 512-unit design space. Keep in sync with icon.svg. */
const GLYPH = `
  <path fill="${CLAY}" d="M186 240 C138 272 114 318 118 358 C120 394 140 418 168 432 L344 432 C372 418 392 394 394 358 C398 318 374 272 326 240 Z"/>
  <path fill="none" stroke="${CLAY}" stroke-width="38" stroke-linecap="round"
        d="M176 252 L176 196 Q176 140 232 140 L280 140 Q336 140 336 196 L336 252"/>`;

/**
 * @param corner rounded-rect radius of the paper ground; 0 is full bleed, for
 *               icons the platform masks itself (maskable, apple-touch)
 * @param inset  glyph scale about the centre — maskable icons keep the art
 *               inside the 80% safe zone
 */
const svg = ({ corner = 112, inset = 1 } = {}) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${corner}" fill="${PAPER}"/>
  <g transform="translate(${256 * (1 - inset)} ${256 * (1 - inset)}) scale(${inset})">${GLYPH}
  </g>
</svg>`;

const targets = [
  ['icon-192.png', 192, {}],
  ['icon-512.png', 512, {}],
  ['icon-maskable-512.png', 512, { corner: 0, inset: 0.72 }],
  ['apple-touch-icon.png', 180, { corner: 0 }],
  ['favicon-32.png', 32, {}],
];

const work = mkdtempSync(join(tmpdir(), 'workout-icons-'));
mkdirSync(OUT, { recursive: true });

try {
  for (const [name, size, opts] of targets) {
    const src = join(work, `${name}.svg`);
    writeFileSync(src, svg(opts));

    // QuickLook renders at its own idea of the size, so ask for a generous one
    // and let sips do the final resample.
    execFileSync('qlmanage', ['-t', '-s', '1024', '-o', work, src], { stdio: 'ignore' });
    const rendered = join(work, `${name}.svg.png`);
    execFileSync('sips', ['-z', String(size), String(size), rendered], { stdio: 'ignore' });

    writeFileSync(join(OUT, name), readFileSync(rendered));
    console.log(`${name}  ${size}×${size}`);
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
