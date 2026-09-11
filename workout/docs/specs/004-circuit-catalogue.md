# 004 — Circuit catalogue

**Status:** Implemented. `data/circuits.json` is at version 1 — eight circuits.
See "What changed in the building" at the foot of this spec.
**Model:** Opus.
**Depends on:** [003 — Scheduling and tracking](003-scheduling.md)

## Goal

A shelf of ready-made circuits you can look through and adopt as your own. The
empty state today is "New circuit" and a blank list of movements, which is the
hardest possible place to start from — you have to already know what a good
twenty minutes looks like.

Adopting copies the circuit into your own circuits. From that moment it is
yours: editing it never touches the catalogue, and the catalogue updating never
touches your copy.

## Shape

Circuits split into two places:

- **Yours** — what `#/builder` already lists. Editable, schedulable, runnable.
- **Catalogue** — read-only, ships with the app, browsable without committing to
  anything.

Probably a tab or a segmented control on the Circuits view rather than a fourth
top-level tab; the top bar is already at three and a phone has no room for more.

## Data

`data/circuits.json`, shipped and fetched like `data/exercises.json`, holding
the same shape a saved circuit has minus the per-user fields (`created`,
`updated`), plus:

```json
{
  "id": "twenty-minute-starter",
  "name": "Twenty-minute starter",
  "blurb": "Five movements, no kit beyond a bell. The one to run when you can't decide.",
  "type": "amrap",
  "duration": 1200,
  "items": [{ "exerciseId": "two-hand-swing", "reps": 15, "perSide": false }]
}
```

Adopting mints a fresh `id` and stamps `created`/`updated`, so a circuit adopted
twice gives two independent copies rather than colliding.

## Content to write

Six or eight, no more — a catalogue you can read in one screen is useful, one
you have to search is a second library to maintain. A spread worth covering:

- Bodyweight only, no equipment at all.
- One bell, twenty minutes, mixed patterns.
- Posterior chain / hinge focus.
- Core and carries.
- A short one — ten minutes for a day that got away from you.
- A beginner's first session, with conservative rep counts.

Each needs a blurb saying who it's for and what it will feel like, in the same
voice as the movement descriptions.

## Open questions

- Does a catalogue circuit stay visible after you adopt it, or grey out? Greying
  out means tracking what came from where, which is state nobody asked for.
  Probably show it always and let a duplicate be the user's problem.
- Should favourites (`kb.favourites`) extend to catalogue circuits, or stay
  movement-only? Movement-only is the smaller idea and probably the right one.
- Is a `catalogueVersion` worth carrying so improved circuits can be re-offered?
  Almost certainly not — it drags a sync problem into an app whose whole premise
  is not having one.

## Non-goals

Sharing circuits between people, user-submitted catalogue entries, or fetching
the catalogue from anywhere but this repo.

## What changed in the building

- **Eight circuits, and they cover all three runnable kinds.** The spread the
  spec asked for, plus a tally ("The hundreds") and two intervals circuits —
  the catalogue is the only place a new user meets AMRAP, tally and intervals
  side by side, so it may as well teach the vocabulary. Carries turned out to
  need intervals: an AMRAP item is a rep count, and "15 reps of farmer carry"
  means nothing.
- **A segmented control, and its own hash.** Yours | Catalogue on the Circuits
  view, as the spec guessed. `#/catalogue` is a route rather than in-page state,
  so the back button and a bookmark both work and the Circuits tab stays lit.
- **The kit you haven't got is named.** Spec 004 predates [005](005-kit-and-a-wider-library.md);
  a catalogue that recommends a kettlebell circuit to someone with no kettlebell
  and says nothing is worse than useless. Each circuit lists the kit it needs as
  chips, and one it can't run reads "Needs kit you haven't got — Kettlebell",
  with a link to change that. Nothing is hidden or filtered: the catalogue is
  worth reading through either way, and a swap is usually one edit away.
- **The movements are on the card.** Adopting on the strength of a name and a
  blurb is adopting blind, so each card carries the whole circuit on one quiet
  line — "Two-Hand Kettlebell Swing 15 · Goblet Squat 10 · …".
- **The empty state points at the shelf.** "No circuits yet" now offers
  "Browse the catalogue" beside building one, which was the whole motivation.
- **Adopting deep-copies.** `structuredClone`, not a spread — a shallow copy
  shares its `items` objects with the in-memory catalogue, so editing your copy
  would have quietly rewritten the shelf for the rest of the session.
- **`tools/check-data.mjs` validates the catalogue too.** A circuit pointing at
  a movement that isn't there renders as "Unknown movement" and runs anyway,
  which is exactly the class of mistake the checker exists for. It also catches
  `perSide` on a movement that has no sides, which silently doubles a time
  budget for nothing.
- **Fetched on first visit**, not at startup: most sessions never open the
  catalogue, and the app already waits on one JSON file before it can paint.
  Both data files are precached by the service worker, so it works offline.

### Still open

The spec's three open questions all landed where it guessed: catalogue circuits
stay visible after adopting (a duplicate is the user's problem), favourites stay
movement-only, and there is no `catalogueVersion`. Nothing has changed to make
any of those worth revisiting.
