# 003 — Scheduling and tracking

**Status:** Implemented
**Depends on:** [002 — Web app](002-web-app.md)

## Goal

Turn the app from "a thing that runs a workout" into "a record of what you
meant to do and what you actually did". Scheduling and tracking is the point;
the timer is now one way to start a session, not the centre of the app.

This reverses spec 002's non-goal of "progress tracking / history / logging" —
a deliberate change, not an oversight.

## Scope

**In:**
- A month calendar as the app's home view.
- Schedule a saved circuit onto a date.
- Mark a scheduled workout done, skipped, or back to planned.
- A running count of what's done and still planned in the month on screen.
- Finishing a circuit in the player ticks off that day automatically.

**Out (for now):**
- Repeats and weekly templates — scheduling is one day at a time. If a routine
  settles into a fixed shape, revisit.
- Per-session notes, weights used, or how it felt.
- Streaks, targets, or anything that gamifies it.

## Data

Key: `kb.schedule` → array of:

```json
{
  "id": "uuid",
  "date": "2026-09-10",
  "circuitId": "uuid",
  "status": "planned",
  "created": "2026-09-01T10:00:00Z",
  "completedAt": null
}
```

`status` is `planned` | `done` | `skipped`. `completedAt` is set when the status
becomes `done` and cleared otherwise.

Dates are plain `YYYY-MM-DD` strings in **local** time. Not ISO timestamps: a
workout belongs to the day you did it, and storing UTC would push an evening
session into tomorrow for anyone east of Greenwich.

Several entries may share a date — two sessions in a day is legitimate.

## Behaviour

- Deleting a circuit deletes its scheduled entries. A day pointing at a circuit
  that no longer exists is debris, and the alternative (a "deleted circuit" row
  you have to clear by hand) is worse.
- Reaching the end of the player marks today's *planned* entry for that circuit
  as done. Quitting deliberately does not — quitting is how you abandon a
  session.
- The player only ever completes an entry dated today, so replaying an old
  circuit doesn't retroactively tick off last Tuesday.

## Colour

Status uses the design system's existing two colours and adds nothing:

| Status  | Mark                  | Reasoning                          |
| ------- | --------------------- | ---------------------------------- |
| Done    | Filled sage dot       | Sage means settled. This is its job. |
| Planned | Open clay ring        | Clay is attention — still owed.    |
| Skipped | Open hairline ring    | Spent, but not a failure. No red.  |

## Added since

- **AMRAP circuits.** A circuit now carries a `type`: `intervals` (each movement
  timed, with rest) or `amrap` (a list of rep counts looped for a fixed stretch).
  AMRAP is the default for a new circuit. An AMRAP item holds only
  `exerciseId`, `reps` and `perSide` — no mode, no work, no rest — so its card
  in the editor is a single field. Circuits saved before this have no `type` and
  are read as `intervals`.
- **The board** (`js/board.js`). The whole workout on one screen, for a phone
  propped up across the room: every movement listed at once, a clock big enough
  to read at a distance, and a round counter. The clock can be hidden entirely,
  which leaves a plain list to work down at your own pace. Reaching zero ticks
  off the day exactly as finishing the interval player does.
- **Export and import** (`js/transfer.js`). Everything as a block of JSON text.
  Needed because iOS gives a home-screen web app its own storage, separate from
  Safari's, so there is otherwise no way to move data between them. Merging
  keys off ids, so importing the same export twice adds nothing.
- **Favourites** (`kb.favourites`). A star on each movement and a filter for
  them, so the movements you actually use are one tap away when building.
- **Lifetime totals.** Workouts done all time, this year, this month, above the
  month grid. Only `done` counts — a plan you didn't keep isn't a workout.

## Later additions

- **Tally circuits.** A third `type`, alongside `amrap` and `intervals`: a total
  to reach by the end of the day, in whatever chunks suit — 100 push-ups, 100
  sit-ups, 100 squats, done between other things. No clock. Items carry `reps`
  (the day's target) and `step` (the size of one chunk, for the `+10` button).
  Running counts live on the day's calendar entry as `progress`, keyed by the
  item's position in the circuit rather than its exercise id, so a circuit
  listing the same movement twice keeps two separate totals. Opening a tally
  creates today's entry immediately rather than at the end, because the counts
  need somewhere durable to live from the first rep. Hitting every target marks
  the entry done on its own; that can be undone from the calendar.

- **Ad-hoc completion.** Finishing a session now always lands on the calendar,
  not only when it was scheduled. `recordCompletion()` ticks off a planned entry
  for that circuit if there is one, otherwise fills an open "any workout" slot,
  otherwise adds a fresh entry already marked done. Quitting still records
  nothing.

- **"Any workout" slots.** A scheduled entry with a null `circuitId` — a day you
  intend to train without having decided what. Finishing anything that day fills
  it in and binds it to what you actually did, and anything else done that day
  clears it, so a day never shows both the slot and the workout that satisfied
  it. See [006](006-logged-sessions.md).

- **Rep ranges and "to failure".** A rep-mode item carries an optional `repsMax`
  — `10` with a `repsMax` of `14` reads as "10–14" — and an optional `toFailure`
  flag that replaces the count entirely. Both are off by default, so the
  ordinary case is still one box with one number in it. Estimates budget the top
  of a range, and a nominal count for failure.

- **Optional tally set sizes.** A tally item's `step` may be null, meaning no
  fixed chunk. The board then offers a field and an **Add** rather than a `+10`,
  which is what "40, then 40, then 20" actually needs. A named step still gets
  its one-tap button.

## Open questions

- Does one-day-at-a-time scheduling get tedious once a routine settles? If so,
  repeats are the next thing, not templates.
- Nothing surfaces "you haven't scheduled anything this week". Worth a nudge, or
  is that the sort of nagging this app is meant to avoid?
