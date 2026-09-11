# 006 — Sessions

**Status:** Implemented
**Depends on:** [003 — Scheduling and tracking](003-scheduling.md)

## Goal

Not every workout is a circuit this app built. Tuesday was Orange Theory,
Thursday was a swim, Saturday was a long walk. The calendar is supposed to be
the record of what you did, and those days are currently blank — which is worse
than useless, because a blank day is how this app says you didn't train.

## Shape

A session is a **circuit**, with a fourth `type` alongside `amrap`, `tally` and
`intervals`:

```json
{
  "id": "uuid",
  "name": "Orange Theory",
  "type": "session",
  "duration": 3600,
  "items": []
}
```

That is the whole of it. No movements, no clock, no rounds — the only question
a session ever asks is whether you did it. `duration` is optional minutes, and
0 means you never said.

Making it a circuit rather than a one-off entry on the calendar is the entire
design: Orange Theory is a thing you do repeatedly, so it should be a thing you
*have*, schedulable from the same dropdown as everything else. Scheduling,
done/skipped, the month grid, the lifetime totals and the export then all handle
it without being told anything, and there is no second way to log a workout.

### Why not a field on the calendar entry

The first cut of this spec put an `activity: { name, minutes, note }` blob on
the schedule entry, with its own "Log something else" form in the day panel.
It was rejected before it shipped: it meant a second, parallel way of recording
a workout, a form to re-type the same class name into every week, and a third
kind of entry for every reader of `kb.schedule` to know about. A circuit type
costs none of that.

## Behaviour

- **Scheduling is the same as for any circuit.** Pick it from the day panel's
  dropdown, press Add, and it lands `planned`. One press of **Mark done** is the
  record. Skip and undo behave exactly as they do for a circuit; a class you
  didn't go to is skipped, with the same hairline ring. Still no red.
- **There is nothing to start.** No **Start** button on the circuits list, in
  the editor, or on the calendar row — a session is not run by this app.
- **The editor is name, kind and minutes**, then a button through to the
  calendar. The movements list, the picker and the running estimate are all
  hidden, because none of them mean anything here.
- **Switching kind keeps your movements.** Changing an existing circuit to a
  session leaves `items` untouched rather than rebuilding them, so switching
  back finds the movements where you left them.
- **The meta line** reads "Session · 60 min", or just "Session".

## Open slots

Related, and fixed alongside: an **"any workout" slot** — a scheduled entry with
a null `circuitId`, meaning "I know I'm training Wednesday, I haven't decided
what" — was leaving a day with two entries. `recordCompletion()` bound the slot
to what you finished, but `ensureTodayEntry()` (the tally path) added a second
entry beside it instead, and marking something done by hand never cleared it.

The rule is now: **a slot means "something, that day", so anything done that day
satisfies it.** `ensureTodayEntry()` claims an open slot rather than adding
alongside it, and an entry becoming `done` drops any other open slot on its
date. One workout, one entry, one dot.

## Export

Nothing to do. A session is a circuit, so it rides along in `circuits` with no
change to `transfer.js` and no format bump.

## Open questions

- A session is only reachable by making a circuit and changing its Kind. That is
  consistent — every other format lives in the same dropdown — but it is not
  discoverable. If it turns out to be the thing that gets used most, it wants
  its own button on the circuits list.
- Adding a session to *today* lands it `planned`, needing one more press to tick
  it off, on the grounds that "Schedule" is a future-tense word and a morning
  plan is not a record. If that press gets annoying, landing a past or present
  date as `done` is a two-line change.
- No note field. A session is a name and a date; if "how did it go" turns out to
  be the point, it is a small addition.

## Non-goals

Importing from Strava, Apple Health, or any other service. Pace, distance, heart
rate, calories, or anything else a watch would know. Reminders or nagging about
a class you scheduled and missed.
