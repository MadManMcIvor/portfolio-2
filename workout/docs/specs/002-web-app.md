# 002 — Web App

**Status:** Implemented, then reworked when the app moved into the portfolio —
restyled against the Cream & Ink tokens, converted to ES modules, and made
installable. See [the brief](../BRIEF.md) for what that pass covered.
Superseded in part by [003](003-scheduling.md): the calendar is now the home
view and the player is one way to start a session rather than the point of the
app.
**Depends on:** [001 — Exercise Library Data](001-exercise-library-data.md)

## Built

- `index.html` + `tokens.css` + `styles.css` + `js/*.js` (ES modules, one
  `init*()`/`render*()` per module, no globals). Served over http, not `file://`.
- Views: Library (`#/library`), Circuits list + editor (`#/builder`,
  `#/builder/:id`), Player (`#/play/:id`). Hash router in `js/app.js`.
- `js/storage.js` — `kb.circuits` / `kb.settings` in localStorage.
- `js/player.js` — flattens a circuit into timed segments (per-side work split into
  Left/Right), 1s tick, WebAudio beeps, screen wake-lock (best effort),
  keyboard: space = pause, ←/→ = back/skip, Esc = quit.
- Rep-mode items get a rough time budget (`max(20s, reps × 3s)`) for the estimate
  and the player clock.
- Deviations from the draft below: `perSide` lives per circuit item (not derived
  live); rest is emitted only after the final side; reorder is ▲/▼ buttons (no
  drag); no export/import yet.

## Goal

A static HTML site to browse the exercise library and build ~20-minute kettlebell
circuits. No backend, no build step. Saved workouts live in `localStorage`.

## Scope

**In (v1):**
- Browse / search / filter the exercise library.
- Build a circuit: ordered list of movements, each with a mode (time or reps),
  duration/reps, and rest.
- See total estimated workout time as you build.
- Save / rename / delete circuits (localStorage).
- Run a circuit: full-screen timer that steps through movements with work/rest
  beeps and a "next up" preview.

**Out (v1):**
- Accounts, sync, sharing.
- Editing the exercise library from the UI.
- Progress tracking / history / logging (candidate for v2).
- ~~PWA / offline install~~ — landed in the portfolio pass (manifest + cache-first
  service worker). Opening from disk is no longer supported.

## Pages / views

Single page, hash-routed, or 3 small HTML files — decide during build. Views:

1. **Library** — grid/list of exercises. Filter by category, difficulty, tag.
   Click an exercise for its cues and description.
2. **Builder** — pick a saved circuit or start new. Add movements from the
   library, reorder (drag or up/down), set per-movement work/rest/mode, set
   round count. Live total-time readout. Save.
3. **Player** — big timer. Shows current movement + cue, time remaining, round
   x/y, next movement. Pause / skip / back / quit. Audio cue on transitions.

## Data model (localStorage)

Key: `kb.circuits` → array of:

```json
{
  "id": "uuid",
  "name": "20 min posterior chain",
  "created": "2026-08-30T10:00:00Z",
  "updated": "2026-08-30T10:00:00Z",
  "rounds": 3,
  "restBetweenRounds": 60,
  "items": [
    {
      "exerciseId": "two-hand-swing",
      "mode": "time",
      "work": 40,
      "rest": 20,
      "perSide": false
    }
  ]
}
```

Key: `kb.settings` → `{ "beeps": true, "lastCircuitId": "uuid" }`.

Notes:
- `exerciseId` references `data/exercises.json`. If an id is missing at load time,
  show the item as "unknown exercise" rather than crashing.
- Time estimate = `rounds * (sum(work + rest for items) ) + restBetweenRounds * (rounds - 1)`.
  For `perSide` items on a unilateral exercise, count `work` twice.

## Tech

- Vanilla JS (ES modules), plain CSS. No framework, no bundler.
- `fetch('./data/exercises.json')` on load; cache in memory.
- Works when served over `file://` if possible; otherwise document
  `python3 -m http.server`.
- Keep it to a handful of files: `index.html`, `styles.css`, `app.js` +
  small modules (`library.js`, `builder.js`, `player.js`, `storage.js`).

## Layout / feel

- Mobile-first — this gets used with a phone propped against a wall.
- Big tap targets. High contrast. Player view readable across the room.
- No external fonts/CDNs; system font stack.

## Open questions

- Hash router in one file vs. three separate HTML files — lean single file.
- Drag-to-reorder vs. up/down buttons for v1 (up/down is less code, fine on mobile).
- Audio: bundle a tiny beep as base64/WebAudio oscillator rather than an asset file.
- Export/import circuits as JSON text (copy-paste) — cheap way to back up without a backend. v1 or v2?
