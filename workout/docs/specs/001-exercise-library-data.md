# 001 — Exercise Library Data

**Status:** Implemented. `data/exercises.json` is at version 2 — 51 movements,
fetched directly at startup. Version 2 widened the library past kettlebells:
`equipment` now carries `bodyweight` as well as `kettlebell`, and `cardio` was
added to the category vocabulary. Rep-mode items also carry a `reps` field on circuit entries
(see spec 002); the library JSON itself matches the schema below.

## Goal

Define a single static JSON file that describes every kettlebell exercise the app
knows about. The web app (spec 002) reads this file to render the movement library
and to let the user pick movements when building a circuit.

## Scope

**In:**
- A versioned JSON file: `data/exercises.json`.
- A documented schema for each exercise.
- An initial set of common kettlebell movements (~15–25 to start).

**Out:**
- User-created custom exercises (may come later; would live in `localStorage`).
- Images / video / animation. Leave a field for a future media reference but don't
  source assets now.
- Localisation.

## File shape

```json
{
  "version": 1,
  "updated": "2026-08-30",
  "exercises": [
    {
      "id": "two-hand-swing",
      "name": "Two-Hand Kettlebell Swing",
      "aliases": ["Russian Swing"],
      "category": "hinge",
      "primaryMuscles": ["glutes", "hamstrings", "back"],
      "equipment": ["kettlebell"],
      "difficulty": "beginner",
      "unilateral": false,
      "defaultMode": "time",
      "tags": ["ballistic", "cardio", "posterior-chain"],
      "cues": [
        "Hike the bell back between the legs",
        "Snap the hips to float the bell to chest height",
        "Arms stay relaxed, ribs down"
      ],
      "description": "Hip-hinge ballistic movement; the foundational kettlebell exercise.",
      "media": null
    }
  ]
}
```

## Field reference

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | kebab-case, unique, stable. Used as the key everywhere else. |
| `name` | string | Display name. |
| `aliases` | string[] | Other common names, for search. Optional. |
| `category` | enum | Movement pattern: `hinge`, `squat`, `press`, `pull`, `carry`, `rotation`, `lunge`, `core`, `full-body`. |
| `primaryMuscles` | string[] | Free-ish list from a small controlled vocab (see below). |
| `equipment` | string[] | Usually `["kettlebell"]`; some need `["kettlebell","kettlebell"]` (double) or a mat. |
| `difficulty` | enum | `beginner`, `intermediate`, `advanced`. |
| `unilateral` | boolean | True if performed one side at a time (affects how circuits schedule L/R). |
| `defaultMode` | enum | `time` or `reps` — the natural way to program this move in a circuit. |
| `tags` | string[] | Freeform, for filtering (`cardio`, `grind`, `ballistic`, `mobility`, …). |
| `cues` | string[] | 2–4 short coaching cues. |
| `description` | string | One or two sentences. |
| `media` | object \| null | Reserved. Future: `{ "image": "...", "video": "..." }`. |

### Muscle vocab (keep small)

`glutes`, `hamstrings`, `quads`, `calves`, `back`, `lats`, `traps`, `shoulders`,
`chest`, `biceps`, `triceps`, `forearms`, `core`, `obliques`.

## Initial exercise list (first pass)

Swings (two-hand, one-hand, hand-to-hand), clean, clean & press, press, push
press, snatch, goblet squat, front squat (double), reverse lunge, walking lunge,
Turkish get-up, halo, around-the-world, high pull, deadlift, suitcase deadlift,
row (bent-over / gorilla), farmer carry, rack carry, overhead carry, windmill,
Russian twist, plank drag / pull-through, deck squat.

## Validation

- `id` unique across the file.
- `category`, `difficulty`, `defaultMode` are within their enums.
- A tiny check script (`npm`-free, run in browser console or a small node script)
  can assert this. Nice-to-have, not blocking.

## Open questions

- Do we need a `worksBothSides` scheduling hint beyond `unilateral`?
- Store `tempo` / recommended rep ranges per difficulty, or leave that to the circuit builder?
- One flat file forever, or split by category once it gets big? (Flat for now.)
