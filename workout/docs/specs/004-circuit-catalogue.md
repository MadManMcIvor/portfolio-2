# 004 — Circuit catalogue

**Status:** Proposed — not built
**Model:** Sonnet — the blurbs want a read-through afterwards.
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
