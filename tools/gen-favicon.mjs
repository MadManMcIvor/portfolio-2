// Writes the site favicon set from the "a." mark.
//
//   node tools/gen-favicon.mjs
//
// The mark is Georgia Italic's lowercase a, outlined to a path so it renders
// the same whatever fonts the viewer has, with a clay full stop beside it.
// Rasterising uses macOS' QuickLook and sips (as workout/tools/gen-icons.mjs
// does), so this is a Mac-only art step: the outputs are committed, and this
// only needs running when the mark changes.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { inflateSync, deflateSync, crc32 } from 'node:zlib';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

const INK = '#1c1917';
const PAPER = '#f8f4ec';
const CLAY = '#d89272'; // the dark-theme clay, which is the one that reads on ink

/** Georgia Italic "a", font units (2048/em), y flipped so the baseline is y=0. */
const A = 'M696 -132H689Q667 -114 636.5 -86.5Q606 -59 565 -34Q526 -9 480 9.5Q434 28 380 28Q235 28 152.5 -76Q70 -180 70 -360Q70 -484 116 -601Q162 -718 243 -811Q320 -900 426 -954.5Q532 -1009 644 -1009Q715 -1009 779.5 -990Q844 -971 881 -947L1064 -994L1076 -979L924 -334Q916 -303 907.5 -258.5Q899 -214 899 -193Q899 -136 923 -116Q947 -96 1004 -96Q1023 -96 1058 -102Q1093 -108 1112 -115L1097 -51Q1007 -15 963 1Q919 17 856 17Q784 17 742 -25Q700 -67 696 -132ZM839 -764Q839 -797 832 -827Q825 -857 803 -883Q783 -908 748 -923Q713 -938 660 -938Q587 -938 518 -890Q449 -842 394 -761Q342 -685 309 -577Q276 -469 276 -358Q276 -297 283 -250Q290 -203 310 -164Q329 -126 365 -105Q401 -84 456 -84Q512 -84 573.5 -115.5Q635 -147 712 -226Z';

/**
 * The mark in a 64-unit square.
 * @param corner radius of the ink ground; 0 is full bleed, for platforms that
 *               mask the icon themselves (apple-touch)
 * @param inset  scale of the art about the centre
 */
const svg = ({ corner = 14, inset = 1 } = {}) => {
  const k = 0.034; // font units -> design units
  const r = 6; // the full stop
  const gap = 1.5;
  const w = (1112 - 70) * k + gap + 2 * r;
  const x0 = (64 - w) / 2;
  const baseline = 32 + (1009 * k) / 2 - 0.5; // optically centre the x-height
  const n = (v) => +v.toFixed(2);
  const t = inset === 1 ? '' : ` transform="translate(${n(32 * (1 - inset))} ${n(32 * (1 - inset))}) scale(${inset})"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="${corner}" fill="${INK}"/>
  <g${t}>
    <path fill="${PAPER}" transform="translate(${n(x0 - 70 * k)} ${n(baseline)}) scale(${k})" d="${A}"/>
    <circle cx="${n(x0 + (1112 - 70) * k + gap + r)}" cy="${n(baseline - r)}" r="${r}" fill="${CLAY}"/>
  </g>
</svg>
`;
};

/** An .ico is a directory of images; modern ones may simply embed PNGs. */
function ico(pngs) {
  const head = Buffer.alloc(6 + 16 * pngs.length);
  head.writeUInt16LE(1, 2); // type: icon
  head.writeUInt16LE(pngs.length, 4);
  let offset = head.length;
  pngs.forEach(({ size, data }, i) => {
    const e = 6 + 16 * i;
    head.writeUInt8(size % 256, e);
    head.writeUInt8(size % 256, e + 1);
    head.writeUInt16LE(1, e + 4); // colour planes
    head.writeUInt16LE(32, e + 6); // bits per pixel
    head.writeUInt32LE(data.length, e + 8);
    head.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([head, ...pngs.map((p) => p.data)]);
}

const work = mkdtempSync(join(tmpdir(), 'favicon-'));

/**
 * QuickLook renders at its own idea of the size, so render big and let sips
 * resample. QuickLook also paints transparency white, so the art is rendered
 * full bleed and `corner` (in 64ths) is cut out of the alpha afterwards.
 */
function png(size, { corner = 14, ...opts } = {}) {
  const src = join(work, `${size}-${corner}.svg`);
  writeFileSync(src, svg({ ...opts, corner: 0 }));
  execFileSync('qlmanage', ['-t', '-s', '1024', '-o', work, src], { stdio: 'ignore' });
  const out = `${src}.png`;
  execFileSync('sips', ['-z', String(size), String(size), out], { stdio: 'ignore' });
  return corner ? roundCorners(readFileSync(out), (corner / 64) * size) : readFileSync(out);
}

/** Masks an 8-bit RGBA PNG to a rounded square of radius r px, antialiased by supersampling. */
function roundCorners(file, r) {
  const { width, height, rgba } = decodePng(file);
  const SS = 4;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let inside = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = x + (sx + 0.5) / SS;
          const py = y + (sy + 0.5) / SS;
          const dx = Math.max(r - px, px - (width - r), 0);
          const dy = Math.max(r - py, py - (height - r), 0);
          if (dx * dx + dy * dy <= r * r) inside++;
        }
      }
      const i = (y * width + x) * 4 + 3;
      rgba[i] = Math.round((rgba[i] * inside) / (SS * SS));
    }
  }
  return encodePng(width, height, rgba);
}

function decodePng(buf) {
  let pos = 8;
  let width, height, depth, type;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const kind = buf.toString('latin1', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (kind === 'IHDR') [width, height, depth, type] = [data.readUInt32BE(0), data.readUInt32BE(4), data[8], data[9]];
    if (kind === 'IDAT') idat.push(data);
    pos += 12 + len;
  }
  if (depth !== 8 || type !== 6) throw new Error(`expected 8-bit RGBA from sips, got depth ${depth} type ${type}`);
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * 4;
  const rgba = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let i = 0; i < stride; i++) {
      const a = i >= 4 ? rgba[y * stride + i - 4] : 0;
      const b = y ? rgba[(y - 1) * stride + i] : 0;
      const c = i >= 4 && y ? rgba[(y - 1) * stride + i - 4] : 0;
      const p = a + b - c;
      const paeth = Math.abs(p - a) <= Math.abs(p - b) && Math.abs(p - a) <= Math.abs(p - c) ? a : Math.abs(p - b) <= Math.abs(p - c) ? b : c;
      const pred = [0, a, b, (a + b) >> 1, paeth][filter];
      rgba[y * stride + i] = (line[i] + pred) & 0xff;
    }
  }
  return { width, height, rgba };
}

function encodePng(width, height, rgba) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  const chunk = (kind, data) => {
    const out = Buffer.alloc(12 + data.length);
    out.writeUInt32BE(data.length, 0);
    out.write(kind, 4, 'latin1');
    data.copy(out, 8);
    out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
    return out;
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.set([8, 6, 0, 0, 0], 8);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

try {
  writeFileSync(join(ROOT, 'favicon.svg'), svg());
  console.log('favicon.svg');

  const sizes = [16, 32, 48];
  writeFileSync(join(ROOT, 'favicon.ico'), ico(sizes.map((size) => ({ size, data: png(size) }))));
  console.log(`favicon.ico  ${sizes.join(', ')}`);

  writeFileSync(join(ROOT, 'apple-touch-icon.png'), png(180, { corner: 0, inset: 0.86 }));
  console.log('apple-touch-icon.png  180×180');
} finally {
  rmSync(work, { recursive: true, force: true });
}
