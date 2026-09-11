# Workout

A small, no-frills tool for planning short workouts and keeping track of whether
you actually did them. Lives at
[alexmcivor.com/workout/](https://alexmcivor.com/workout/).

## The idea

- Keep a **library of movements** — kettlebell and bodyweight.
- **Build circuits** by stringing movements together.
- **Schedule them** on a calendar and mark off what you did.
- Target format: **~20 minute workouts** made of timed/repped intervals.

A self-contained mini-app inside the portfolio repo — it borrows the site's
design system but is not wired into the single-page site's component/data
architecture. Everything is stored in the browser via `localStorage`; there is
no backend and there never will be.

## Run it

It needs to be served over http — the exercise library is fetched as JSON, so
opening `index.html` from disk won't work.

```bash
node workout/tools/serve.mjs 4173
```

then visit http://localhost:4173/workout/. The server serves the repository
root so the app sits at `/workout/`, exactly as it does in production.

## Using it

- **Calendar** tab — the home view. A month at a glance: a filled sage dot for a
  workout you did, an open clay ring for one still planned. Tap a day to schedule
  a circuit onto it, or to mark one done or skipped.
- **Circuits** tab — two halves, **Yours** and the **Catalogue**. Yours is what
  you have built; the catalogue is a shelf of eight ready-made circuits to take
  a copy of, each with a blurb, the kit it needs and its movements listed. Adopt
  one and it is yours — editing your copy never touches the shelf, and adopting
  twice gives you two independent circuits. Four kinds:
  - **AMRAP** (the default): a list of movements with rep counts, looped for a
    fixed stretch of time. No rest to configure — you rest when you need to.
  - **Tally**: a total to reach by the end of the day, in whatever chunks suit.
    100 push-ups, 100 sit-ups, 100 squats, chipped away at between other things.
    No clock, no need to break a sweat in one go. Counts are saved as you go, so
    you can close the app and come back to it.
  - **Intervals**: each movement runs for its own set time with rest in between,
    for a fixed number of rounds. Live time estimate pinned to the bottom.
  - **Session**: something you do elsewhere — a class, a swim, a long walk. No
    movements and no clock; put it on a day and tick it off, so the calendar is
    a record of everything you did rather than only what this app ran.

  A rep count can be a single number, a range (10–14), or **to failure**. On a
  movement card, the small **i** opens its cues and targets without leaving the
  circuit you're building.
- **Library** tab — browse the movements as cards. Filter by equipment, pattern,
  level or your starred movements; sort A–Z, by pattern, or by difficulty.
  Tapping a card shows its cues beside the grid on a wide screen, or in a sheet
  over the bottom on a phone — the grid itself never moves.
- **Start** — how a circuit runs depends on its kind:
  - An AMRAP opens **the board**: the whole workout on one screen with a big
    countdown and a round counter. Nothing to step through, so the phone can sit
    propped up and untouched. Tap a movement to strike it off; tap **+ Round**
    when you finish a lap. **Hide timer** turns it into a plain list with no
    clock at all.
  - A tally opens the board in counting mode: each movement with what you've
    banked against its target, and a `+1` and a `+10` (or whatever chunk size you
    set). Leave the chunk size blank and you get a field instead, for banking
    whatever you actually did — 40, then 40, then 20. Reaching every target
    marks the day done.
  - An intervals circuit opens the **step-by-step timer**, which walks through
    each movement with beeps and shows what's coming up next while you rest.
    Space = pause, ←/→ = back/skip, Esc = quit.

  Finishing any of them lands on the calendar as done today — whether or not it
  was scheduled — so a session you decided on there and then still counts.
  Quitting doesn't record anything.

You can also pencil in **"any workout"** on a day you mean to train without
having decided what. Finishing anything that day fills the slot in.

Circuits, schedule, starred movements, your kit and settings live in
`localStorage` on that browser only. The app follows the same light/dark choice
as the main site (shared `theme` key).

**Your kit** — the gear in the top bar opens settings, where you tick what you
can actually get to: a stationary bike but not a pool, kettlebells but not a barbell. The
library then filters to movements you can do, with **Everything** always one tap
away. Until you tick anything it shows the lot.

**Export and import** — the same screen gives you everything — circuits,
calendar, stars and kit — as a block of JSON text to copy out or paste in.
Merging skips anything already present, so re-importing the same export is
harmless.

## Installing it

It's a PWA: `manifest.webmanifest` plus a cache-first service worker, so it
opens offline once visited. On iOS, Share → Add to Home Screen gets you a
standalone app with no browser chrome.

The service worker is **not** registered on `localhost` — during development the
cache only gets in the way, and installing needs https anyway. Bump
`CACHE_VERSION` in `sw.js` when the shell changes; old caches are dropped on
activate.

**Worth knowing:** on iOS a home-screen web app gets its own storage, separate
from Safari's. Circuits you build in Safari will not appear in the installed app.
Use the export/import screen to carry them across.

Known limitation: iOS suspends audio when the screen locks. The player takes a
screen wake lock while it's running, which holds as long as the app is in the
foreground, so beeps fire for the length of a workout with the phone propped up.

## Editing the exercise library

`data/exercises.json` is the source of truth and is loaded directly — no
generation step. It holds 93 movements across kettlebells, bodyweight, weights,
machines and the outdoors. Schema and field reference:
[docs/specs/001-exercise-library-data.md](docs/specs/001-exercise-library-data.md).

Every id in an exercise's `equipment` must appear in the table in
[`js/equipment.js`](js/equipment.js) — that table, not the data, is what the
kit list and the filters are built from, so a new kind of kit means a row there
first and a movement second.

`data/circuits.json` holds the catalogue, in the same shape a saved circuit has
plus a `blurb`. Every `exerciseId` in it has to exist in `exercises.json`, or
the circuit renders as "Unknown movement" and runs anyway. After editing either
file, run:

```
node workout/tools/check-data.mjs
```

## Structure

```
.
├── index.html            # shell + pre-paint theme script
├── tokens.css            # vendored from ../css/tokens.css — don't edit here
├── styles.css            # the app, styled against the tokens
├── manifest.webmanifest
├── sw.js                 # cache-first service worker, scoped to /workout/
├── js/
│   ├── main.js           # entry: load data, wire theme, start router, register sw
│   ├── app.js            # hash router
│   ├── exercises.js      # loads and queries the movement library
│   ├── storage.js        # localStorage (circuits, settings)
│   ├── schedule.js       # localStorage (the calendar's entries)
│   ├── favourites.js     # localStorage (starred movements)
│   ├── equipment.js      # the equipment vocabulary + localStorage (your kit)
│   ├── transfer.js       # export / import everything as JSON text
│   ├── settings.js       # your kit, sounds, and the data sections
│   ├── util.js           # time maths, DOM builder, audio
│   ├── calendar.js       # month grid + day detail
│   ├── library.js        # library view + reusable exercise picker
│   ├── builder.js        # circuits list + editor
│   ├── catalogue.js      # the ready-made circuits, and adopting one
│   ├── player.js         # step-by-step interval timer
│   ├── board.js          # whole-workout-on-one-screen view
│   └── themeToggle.js    # top-bar light/dark toggle
├── data/
│   ├── exercises.json    # canonical exercise library
│   └── circuits.json     # the ready-made circuits shipped with the app
├── icons/                # icon.svg is the source; PNGs are generated
├── tools/
│   ├── serve.mjs         # zero-dependency static file server
│   ├── check-data.mjs    # validates exercises.json and circuits.json
│   └── gen-icons.mjs     # icon.svg -> the manifest and iOS PNGs (macOS only)
└── docs/
    ├── README.md
    └── specs/
```

## Tech

- Plain HTML, CSS, and vanilla JavaScript ES modules — no framework, no build step.
- `localStorage` for saved circuits and settings.
- No external fonts, CDNs, or network calls.

## Ideas for later

Repeating schedules, drag-to-reorder, and custom user-created exercises. Every
spec written so far is built — see [docs/README.md](docs/README.md).
