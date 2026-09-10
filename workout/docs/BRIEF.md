# Brief — bring `/workout` into the portfolio

This folder is a working kettlebell circuit-builder app, moved over from the
`kettle-bells` prototype repo. It runs as-is (open `workout/index.html` or
`node workout/tools/serve.mjs 4173`). It is **not yet styled to match the site** and
is **not yet a PWA**. This brief is the to-do list for finishing that here.

Use this as the starting prompt for a Claude Code session run from the
`portfolio-2` root.

---

## What the app is

- A library of ~27 kettlebell movements (`data/exercises.json`) with coaching cues.
- A builder for ~20-minute circuits: ordered movements, each timed or repped, with
  rest; rounds; rest between rounds; live time estimate.
- A full-screen player: interval timer, work/rest phases, beeps, "up next",
  keyboard controls, screen wake-lock.
- Storage is `localStorage` (`kb.circuits`, `kb.settings`) — single user, this
  browser only. No backend, ever.

Specs: [`specs/001-exercise-library-data.md`](specs/001-exercise-library-data.md),
[`specs/002-web-app.md`](specs/002-web-app.md). File-by-file map is in
[`../README.md`](../README.md).

## Target

Lives at `alexmcivor.com/workout/` — a self-contained mini-app in `workout/`, not
wired into the portfolio's component/data architecture. It borrows the design
system; it does not become a section of the single-page site.

> Confirm GitHub Pages is serving the deploy branch from the repo root (so
> `workout/index.html` → `/workout/`). Current branch is `release`; site merges
> land there.

---

## Work to do

### 1. Reskin to Cream & Ink (the important one)

The app currently ships a hardcoded-dark theme with an orange accent and saturated
green/blue work/rest colours. That is the opposite of the site's design system.
Rules that matter (full text in `../.github/copilot-instructions.md` and
`../steadwell-design-system/README.md`):

- **Light is the intended look.** Dark is designed, not computed — never auto-apply
  from OS.
- Never pure white / pure black. Warm paper, warm ink.
- **One accent: clay. Never red.** Sage is the only second colour and it means
  *settled / done*. No third colour — so the player's work vs rest states must be
  expressed with **clay vs sage** (or paper-tone + a hairline), not a new palette.
- Depth from paper tone and hairline rules, not shadows. No gradients, no glass.
- Serif (`--font-serif`) only for a display line / the odd italic aside. The big
  player clock is a fine place for it; body and controls stay sans.
- Sentence case everywhere. The one exception is small uppercase eyebrows at
  `0.08em` letter-spacing (the player's "Work" / "Rest" label is exactly that).

Concretely:
- Vendor a copy of `css/tokens.css` into `workout/` (keep it read-only, same as the
  site treats it). Delete `workout/styles.css`'s `:root` block and restyle every
  rule against the tokens — `--paper*`, `--ink*`, `--clay*`, `--sage*`, `--space-*`,
  `--radius*`, `--text-*`, `--font-*`.
- Add the pre-paint theme script from the site's `index.html` (the IIFE that reads
  `localStorage['theme']` and sets `data-theme` before first paint) so `/workout`
  honours the same light/dark choice as the main site. Optionally add the site's
  `#theme-toggle` button + `themeToggle.js` pattern in the app's top bar.
- Player background: instead of green (`work`) / blue (`rest`), use
  `--paper` with a clay hairline/label for work and `--paper-sunken` with a sage
  label for rest — or similar. Keep it quiet.
- Buttons: match `.btn` / `.btn-primary` from `css/base.css`.

### 2. Match house JS conventions

- Convert the `KB` global + classic `<script>` tags to **ES modules**
  (`<script type="module">`, `import`/`export`, one `init*()` per module). The
  house style forbids globals and requires ES modules.
- Once hosted (not `file://`), `fetch('./data/exercises.json')` works — so drop the
  `data/exercises.js` generation hack, load the JSON directly, and delete
  `tools/gen-data.mjs`. Keep `tools/serve.mjs` for local dev, or use any static
  server.
- Keep it dependency-free. No CDNs, no build step (both are hard site constraints).

### 3. Make it a PWA (new territory — notes below)

- `workout/manifest.webmanifest`: `name`, `short_name` ("Workout"), `start_url:
  "/workout/"`, `scope: "/workout/"`, `display: "standalone"`, `theme_color` /
  `background_color` from the paper/ink tokens, and `icons` (192 + 512 PNG, plus a
  maskable one). Link it: `<link rel="manifest" href="./manifest.webmanifest">`.
- iOS needs the old meta tags too: `apple-mobile-web-app-capable`,
  `apple-mobile-web-app-status-bar-style`, and an `apple-touch-icon` (180px).
- `workout/sw.js`: a small cache-first service worker scoped to `/workout/` that
  precaches the shell (html, css, js, `exercises.json`, icons) so it opens offline.
  Register it with a path-relative URL so scope stays `/workout/`. Bump a
  `CACHE_VERSION` const on each deploy and clean old caches in `activate`.
- Test the real use case on an iPhone: Add to Home Screen, start a circuit, screen
  propped up — confirm the wake lock holds and the beeps fire for a full 20 min. If
  audio dies when the screen dims, that's the known web limitation; note it and
  decide whether it's good enough (it probably is with wake lock on).
- Icon art: simple kettlebell glyph on a `--paper` ground, clay mark. Keep it in
  the notebook aesthetic.

### 4. Loose ends

- Decide how it's discovered: a "Workout" nav link feels out of place next to
  Selected work / Skills / Curio. Options: a project card that links to it, a small
  footer link, or nothing (just the URL). User's call.
- `favicon` for the page (the site may not set one for subpaths).
- `workout/README.md` and the specs mention the `kettle-bells` repo and the
  `gen-data` flow — update them once the above lands. Mark spec 002's status.
- The `kettle-bells` repo is now the archived origin; it can be deleted once this
  is committed and deploying.

## Non-goals (still)

Accounts, sync, a backend, workout history/logging, custom user exercises,
framework or build tooling. If the app wants to grow past a single-file localStorage
tool, that's a separate conversation.
