# 006 — Logged sessions

**Status:** Proposed — not built
**Model:** Sonnet.
**Depends on:** [003 — Scheduling and tracking](003-scheduling.md)

## Goal

Not every workout is a circuit this app built. Tuesday was Orange Theory,
Thursday was a swim, Saturday was a long walk. The calendar is supposed to be
the record of what you did, and those days are currently blank — which is worse
than useless, because a blank day is how this app says you didn't train.

A logged session is a name and a date. No movements, no reps, no timer, no
circuit. You went and did a thing; the calendar should say so.

## Shape

It is an entry on `kb.schedule`, not a new store. Make it an entry and the month
grid, the day panel, the done/skipped rings, the lifetime totals and the export
all handle it without being told anything.

```json
{
  "id": "uuid",
  "date": "2026-09-08",
  "circuitId": null,
  "activity": { "name": "Orange Theory", "minutes": 60, "note": "" },
  "status": "done",
  "created": "2026-09-08T19:40:00Z",
  "completedAt": "2026-09-08T19:40:00Z"
}
```

Two fields now tell the three kinds of entry apart:

| `circuitId` | `activity` | What it is |
| --- | --- | --- |
| set | null | A circuit — planned, done or skipped (003) |
| null | null | An "any workout" slot — a day you meant to train (003) |
| null | set | A logged session |

`name` is required and is what shows. `minutes` and `note` are both optional and
may be null.

## Behaviour

- **Logging lives in the day panel**, next to the existing schedule control:
  "Log something else", opening a name field, minutes, and a note. It is the
  same panel you would have marked a circuit done in.
- **Status follows the date.** Logging on today or a past day lands as `done` —
  you are recording what happened. Logging on a future day lands as `planned`,
  which quietly gets you "Orange Theory, Tuesday 6pm" with no extra UI. Marking
  it done afterwards already works.
- **Names suggest themselves.** A `<datalist>` of names you have used before,
  most recent first, read off the existing entries. No store of activity types,
  nothing to curate, and by the third week the field is effectively a menu.
- **`recordCompletion()` needs a guard.** It currently fills the first entry
  matching `!e.circuitId && status === 'planned'`, which would be a class you
  scheduled for tonight — finishing a kettlebell circuit would tick off your
  gym class. The test becomes `!e.circuitId && !e.activity`.
- **Done, skip and undo behave exactly as they do for a circuit.** A class you
  didn't go to is skipped, with the same hairline ring. Still no red.
- **No editing, at first.** Delete and log it again; the delete button is
  already on the row. If that turns out to be annoying in practice, an edit form
  is a small addition — but it is a form, and this is meant to be four seconds
  of typing.

## Display

The row in the day panel is the same row, with the activity name where the
circuit name goes and no **Start** button — there is nothing to start. The meta
line carries the shape of it: "Logged · 60 min", or the note if there is one, or
just "Logged".

Nothing else changes. A done session is a filled sage dot on the month grid like
any other, and it counts in the all-time / this-year / this-month totals, which
is the entire point of putting it here rather than in a notebook.

## Export

Nothing to do. Entries are copied whole and merged by id, so `activity` rides
along in `schedule` with no change to `transfer.js` and no format bump.

## Open questions

- Are minutes worth the field? Name and date are the honest minimum. Minutes
  cost one input and make "how much did I actually do this month" possible
  later, so: keep, optional, never required.
- Should a session carry a kind (`class`, `run`, `swim`, `other`) so the app
  could summarise by type? That is a taxonomy nobody asked for, and the datalist
  gets most of the benefit for none of the cost. No.
- Once 005 lands, "Bike, 40 min" could be a logged session *or* a one-movement
  cardio circuit you actually ran. Both are legitimate and they will both get
  used; the log is the lighter path and will probably win.
- Should finishing a session in the player ever produce one of these? No —
  that is what `recordCompletion()` already does, with a circuit attached.

## Non-goals

Importing from Strava, Apple Health, or any other service. Pace, distance, heart
rate, calories, or anything else a watch would know. Attaching a logged session
to a circuit. Reminders or nagging about a class you scheduled and missed.
