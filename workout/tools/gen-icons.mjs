// Exports the PNGs the manifest and iOS need from the kettlebell mark.
//
//   node tools/gen-icons.mjs
//
// `icons/icon.svg` is the source of truth for the art; the glyph below is the
// same three shapes, reused to build the platform variants (rounded, full-bleed,
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
const INK = '#1c1917';
const CLAY = '#a85d42';

/** The mark itself, in a 512-unit design space. Keep in sync with icon.svg. */
const GLYPH = `
  <path fill="none" stroke="${INK}" stroke-width="46"
        d="M193 250 L193 151 Q193 116 237 116 L275 116 Q319 116 319 151 L319 250"/>
  <path fill="${INK}" d="M170 200 A150 105 0 0 0 170 372 L342 372 A150 105 0 0 0 342 200 Z"/>
  <rect x="170" y="394" width="172" height="26" rx="13" fill="${CLAY}"/>`;

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
