// Small line drawings that head the plate cards: one per explainer and per project, each
// lifted from the thing itself (the container stack, the nested envelopes, the kettlebell).
// They draw in the card's colour: `currentColor` for lines, `.m-tint` and `.m-solid` for
// fills, both set from the plate's --c and --t (see .plate in base.css).

const svg = (body, viewBox = '0 0 120 72') =>
  `<svg class="mark" viewBox="${viewBox}" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;

// Language references use their file-extension token instead of a drawing.
const token = (t) => `<span class="mark mark--token">${t}</span>`;

const marks = {
  // Explainers
  'system-design': svg(`<rect x="4" y="28" width="24" height="16" rx="3"/><rect x="48" y="28" width="24" height="16" rx="3" class="m-tint"/><rect x="92" y="8" width="24" height="16" rx="3"/><rect x="92" y="48" width="24" height="16" rx="3" class="m-solid"/><path d="M28 36h20M72 36h10v-20h10M82 36v20h10"/>`),
  containers: svg(`<rect x="18" y="6" width="84" height="11" rx="2.5" class="m-solid"/><rect x="26" y="21" width="72" height="11" rx="2.5" class="m-tint"/><rect x="22" y="36" width="78" height="11" rx="2.5" class="m-tint"/><rect x="34" y="51" width="58" height="11" rx="2.5"/><path d="M10 67h100"/>`),
  networking: svg(`<rect x="8" y="4" width="104" height="64" rx="5"/><rect x="18" y="12" width="88" height="50" rx="4" class="m-tint"/><rect x="28" y="20" width="72" height="36" rx="3"/><rect x="38" y="28" width="56" height="20" rx="2.5" class="m-solid"/>`),
  auth: svg(`<circle cx="34" cy="36" r="17" class="m-tint"/><circle cx="34" cy="36" r="6" class="m-solid"/><path d="M51 36h58M92 36v12M102 36v8"/>`),
  sql: svg(`<rect x="10" y="6" width="100" height="60" rx="4"/><rect x="10" y="6" width="100" height="14" rx="4" class="m-tint"/><rect x="10" y="34" width="100" height="12" class="m-solid"/><path d="M10 20h100M10 34h100M10 46h100M44 6v60M78 6v60"/>`),
  'js-ts': token('ts'),
  python: token('py'),
  go: token('go'),
  java: token('java'),

  // Projects
  Workout: svg(`<path stroke-width="22" d="M193 250V151q0-35 44-35h38q44 0 44 35v99"/><path class="m-tint" stroke-width="16" d="M170 200a150 105 0 0 0 0 172h172a150 105 0 0 0 0-172Z"/><rect x="170" y="394" width="172" height="26" rx="13" class="m-solid" stroke="none"/>`, '40 93 432 327'),
  Steadwell: svg(`<path d="M18 36 60 6l42 30"/><path d="M28 29v37h64V29" class="m-tint"/><rect x="52" y="44" width="16" height="22" rx="1.5" class="m-solid"/><rect x="34" y="38" width="12" height="10" rx="1.5"/><rect x="74" y="38" width="12" height="10" rx="1.5"/><path d="M8 66h104"/>`),
  Abigail: svg(`<circle cx="60" cy="36" r="11" class="m-solid"/><rect x="6" y="6" width="28" height="16" rx="3" class="m-tint"/><rect x="86" y="6" width="28" height="16" rx="3" class="m-tint"/><rect x="6" y="50" width="28" height="16" rx="3"/><rect x="86" y="50" width="28" height="16" rx="3"/><path d="M34 18l17 12M86 18 69 30M34 54l17-12M86 54 69 42"/>`),
  'WriteUp!': svg(`<rect x="22" y="4" width="62" height="64" rx="4" class="m-tint"/><path d="M32 18h42M32 28h42M32 38h34M32 48h26"/><path d="m86 52 22-30 7 5-22 30-9 4Z" class="m-solid"/>`),
  PASS: svg(`<path d="M10 66h100"/><rect x="16" y="40" width="14" height="26" rx="2" class="m-tint"/><rect x="38" y="28" width="14" height="38" rx="2" class="m-tint"/><rect x="60" y="34" width="14" height="32" rx="2" class="m-tint"/><rect x="82" y="12" width="14" height="54" rx="2" class="m-solid"/><path d="m16 20 8 7 14-15"/>`),
};

export const markFor = (key) => marks[key] || '';
