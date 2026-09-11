# 005 — Kit and a wider library

**Status:** Implemented. `data/exercises.json` is at version 3 — 93 movements
across sixteen kinds of equipment. See "What changed in the building" at the
foot of this spec for where it departs from what is written above.
**Model:** Opus for the movement content; Sonnet for the rest.
**Depends on:** [001 — Exercise library data](001-exercise-library-data.md)

## Goal

The library knows 51 movements and two kinds of equipment: a kettlebell, or
nothing at all. Reality is both wider and narrower than that. Wider, because a
stationary bike and a rowing machine are equipment the app has never heard of.
Narrower, because it offers me a bench press, a pull-up and a swim, and I have
no bench, no bar and no pool.

Both are the same fix: let the app know what you can actually get to, and show
you that by default.

Note that this is about *access*, not ownership — a pool at the gym you go to
counts, a bike in the shed you never ride does not. "Your kit" is the label, but
the question it asks is "can you use this today".

## Scope

**In:**
- A proper equipment vocabulary — ids, labels, grouping — replacing the list
  currently inferred from whatever strings happen to be in the JSON.
- `kb.kit`: which kinds you have.
- The library filtering to your kit by default, with "Everything" one tap away.
- Cardio movements: machines and the outdoor ones.
- More movements generally, chosen to make each new kind of kit worth owning.
- A settings view to tick the boxes in.

**Out:**
- Sizes and weights. "Two bells, 16 and 24 kg" is a different idea and a much
  bigger one — it would have to reach into circuits. Owning a *kind* is enough
  to filter on.
- User-created custom exercises. Still 001's non-goal.
- Cardio *measurement* — pace, distance, splits, heart rate. A cardio session
  you did is spec 006's problem; this spec only adds the movements.
- Presets ("I go to a commercial gym, tick everything"). Ticking fourteen boxes
  once is not a burden worth designing around.

## The vocabulary

Equipment today is whatever strings appear in `exercises.json`, labelled by
`sentenceCase()`. That is fine for `kettlebell` and falls over immediately after:
it renders `pull-up-bar` as "Pull-up-bar", and it cannot group anything, which
the settings list needs.

So a small table in `js/equipment.js` — id, label, group — with the JSON
validated against it rather than defining it.

| id | Label | Group |
| --- | --- | --- |
| `bodyweight` | Bodyweight | Always |
| `pull-up-bar` | Pull-up bar | Equipment |
| `bench` | Bench | Equipment |
| `box` | Box or step | Equipment |
| `resistance-band` | Resistance band | Equipment |
| `jump-rope` | Skipping rope | Equipment |
| `kettlebell` | Kettlebell | Weights |
| `dumbbell` | Dumbbells | Weights |
| `barbell` | Barbell | Weights |
| `stationary-bike` | Stationary bike | Machines |
| `rower` | Rowing machine | Machines |
| `elliptical` | Cross trainer | Machines |
| `stair-machine` | Stair machine | Machines |
| `treadmill` | Treadmill | Machines |
| `bike` | Bike | Outdoors |
| `pool` | Pool | Outdoors |

`bodyweight` is always on and cannot be unticked — it is in the table so that
matching has nothing special-cased about it, not so you can turn your body off.

Groups exist only to shape the settings list. They are not a filter.

Where access genuinely differs, the movement splits: **Cycling** needs `bike`,
**Stationary bike** needs `stationary-bike`, and someone with one and not the
other sees exactly one of them. Where it doesn't, it doesn't: **Running** is one
entry needing nothing, not a road version and a treadmill version.

## Owning kit

Key: `kb.kit` → an array of equipment ids.

```json
["bodyweight", "kettlebell", "stationary-bike", "resistance-band"]
```

Unset is not the same as empty. **Unset** means you have never said, so show
everything — an app that hides half its library before you have told it anything
is broken. **Empty** (well, bodyweight only) means you said, and the answer was
"nothing".

## Filtering

The equipment segmented control is currently Everything / Bodyweight /
Kettlebell. At fourteen kinds that control cannot exist on a phone, so the two
jobs it is doing now split apart:

- **Segmented control: My kit | Everything.** Two options, forever, regardless
  of how long the vocabulary gets. Defaults to "My kit" once `kb.kit` is set and
  "Everything" until then.
- **A kind, in the dropdown row** beside pattern and difficulty: "All kit",
  then every kind in the table. This is the "just show me bike things" filter.

They interact in the one way that isn't confusing: picking a specific kind you
don't have flips the segmented control to Everything, because the alternative is
an empty grid and no visible reason for it.

Matching changes shape too. Today it is `ex.equipment.includes(kit)` — one kind,
any match. Ownership needs **every** piece: a dumbbell bench press needs a bench
*and* dumbbells, and having one of the two doesn't get you the movement.

The count line already says when you are seeing a subset; it should say why.
"38 of 92 movements, filtered to your kit" rather than the bare fraction.

Empty state, when your kit is the reason: "Nothing here works with the kit you
have" and a button to show everything. Not a dead end.

## Cardio and circuits

Machine cardio is `category: "cardio"`, `defaultMode: "time"`, `unilateral:
false`, and carries cues like everything else — rowing has a legs-hips-arms
sequence worth writing down, and "sit tall, drive through the heels" is the same
kind of note as a swing cue.

Which means cardio drops straight into an **intervals** circuit (row three
minutes, rest one, repeat) with no builder change at all. It fits **AMRAP** and
**tally** badly, because both are rep-shaped and "fifteen reps of cross trainer"
is nonsense. Deliberately not fixing that: no seconds field on an AMRAP item, no
policing of what you're allowed to add. Mostly because a forty-minute bike ride
is not a circuit in the first place — it is a session, which is spec 006.

## Movements to add

Roughly two or three per kind of kit. The target is that ticking a box visibly
changes what the library offers, not that every movement anyone has ever done is
in here. Call it 51 → 90.

- **Machines** — stationary bike, rowing machine, cross trainer, stair machine,
  treadmill intervals.
- **Outdoors** — running, easy walk, hill sprints, cycling, swimming, rucking.
- **Skipping rope** — basic skip, high knees skip, double unders.
- **Dumbbells** — floor press, bench press, row, shoulder press, Romanian
  deadlift, walking lunge, curl.
- **Barbell and bench** — back squat, deadlift, bench press, overhead press,
  bent-over row.
- **Pull-up bar** — pull-up, chin-up, dead hang, hanging knee raise.
- **Bands** — pull-apart, pull-through, banded press, assisted pull-up.
- **Box or step** — step-up, box jump, elevated push-up, Bulgarian split squat.
- A few more **bodyweight** fill-ins so an empty-kit library is still a library.

The cues are the expensive part, not the JSON. Forty movements at three cues
each, in the same voice as the existing ones, is the actual work of this spec.

## Data

`data/exercises.json` goes to version 3. No migration: no existing id changes,
no movement is removed, and circuits only ever store ids. The one new constraint
is that `equipment` entries must appear in the table above, which is what
finally made the validation check 001 asked for worth writing:
`tools/check-data.mjs`, zero dependencies, reading the vocabulary out of
`js/equipment.js` so the two cannot drift.

## Settings

`#/data` becomes `#/settings`, in three sections:

1. **Your kit** — checkboxes, grouped, with bodyweight ticked and disabled.
2. **Sounds** — the `beeps` flag in `kb.settings`, which today can only be
   changed by editing code.
3. **Data** — export and import, exactly as they are.

`#/data` keeps working as an alias. The view needs a way in that isn't typing a
hash: a gear beside the theme toggle in the top bar, which marks itself while
you are standing in it. Not a fourth tab — Calendar, Circuits and Library are
where the app's content lives, and settings is a utility, not a section.

`kb.kit` joins the export payload, taking `transfer.js` to format version 2.
Version 1 exports still import; an export with no `kit` key leaves your kit
alone rather than clearing it.

## What changed in the building

- **`mat` is not in the vocabulary.** It was in the table above, and it earned
  nothing: you can hold a plank on a carpet. A box you can tick that changes
  what you see by zero movements is worse than no box.
- **The way in changed twice.** It started as the renamed footer link alone,
  with a "filter these to your kit" link in the library's count line. Both were
  wrong: a call to action wedged into a line of metadata reads as an error
  message, and a setting you can only reach from the footer may as well not
  exist. Now there is a gear in the top bar, an "Edit kit" link beside the
  control it changes — settings is a place nobody visits on spec, and "why
  can't I see the bench press" is a question you ask in the library — the count
  line is a count again, and the footer link stays as the quiet second path it
  always was.
- **The groups are by what a thing is, not where it lives.** "At home" was the
  first cut and it was wrong twice over: a bench is home equipment for plenty
  of people, and kettlebells and dumbbells are weights wherever they sit.
  Equipment / Weights / Machines / Outdoors.
- **The filter bar was relaid out.** The star moved up onto the search row —
  once the equipment segmented control became conditional, the star was left
  alone on a line of its own, reading as something left behind. "My kit |
  Everything" now has its own row, capped at 24rem so two options don't stretch
  the width of a desktop library.
- **The kit filter can be switched off entirely**, not just emptied. "Stop
  filtering by kit" in settings clears `kb.kit` back to unset, because unset is
  a real state — it is what makes the library show everything to someone who
  has never opened settings — and there was otherwise no way back to it.
- **93 movements, not ~90.** 42 added. `rucking` is filed under `carry` rather
  than `cardio`: it is a loaded carry that happens to take an hour.
- **Sounds moved in.** The `beeps` flag in `kb.settings` had no UI at all and
  was only changeable by editing code. It is two lines in a view that now
  exists, so it is in.

## Open questions

- ~~Should the builder's picker default to your kit too?~~ Yes, and it came
  free: it uses the same `defaultFilters()`, with the same segmented control
  to widen it.
- Hidden or greyed out? Hidden. A greyed row is a permanent advertisement for
  what you can't do, which is the opposite of the point.
- Is `pool` really equipment? It is a facility, and so is half the machines
  group. The model doesn't care, but the settings heading might want to be
  "What you can get to" rather than "Your kit".
- Does kit belong in the export at all, or is it as machine-specific as it
  sounds? It is the same answer either way for one person with two devices.

## Non-goals

Weights and sizes, custom movements, gym presets, anything that tracks a cardio
session's numbers, or fetching exercise data from anywhere but this repo.
