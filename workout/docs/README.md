# Docs

Working notes and specifications for the Kettle Bells project.

## Layout

- `specs/` — one spec per feature or chunk of work, numbered in the rough order we
  expect to build them (`001-…`, `002-…`). A spec describes *what* we're building and
  *why*, plus enough of the *how* to start. It's allowed to change as we learn.

## Spec conventions

- Filename: `NNN-short-slug.md`.
- Keep them short. Bullet points over prose.
- Each spec should cover: goal, scope (in/out), data or UI shape, and open questions.
- When a spec is implemented, note it at the top (`Status: implemented`) rather than
  deleting it — it's the record of the decision.
- Carry a `Model:` line in the header saying who should build it (see below).

The [brief](BRIEF.md) is the separate record of moving the app into the
portfolio: reskin, ES modules, PWA.

## Which model builds it

Every proposed spec names the model it should be handed to, because "how much
judgement does this need" is a thing the person writing the spec already knows
and the person picking it up shouldn't have to work out again.

- **Sonnet** when the spec leaves nothing to decide: the shape is settled, the
  patterns already exist somewhere in `js/`, and a wrong answer shows up on
  screen or in the data.
- **Opus** when the work is prose in the house voice, a decision the spec
  deliberately left open, or a change to code whose correctness isn't visible —
  the places carrying a comment that explains why something isn't done the
  obvious way.
- **Split it** when a spec has both, and say which part is which. Most specs of
  any size are a split.

A `Model:` line is a starting point, not a rule. Hand the whole thing to Opus if
it goes sideways.

## Current specs

| #   | Spec | Status | Model |
| --- | --- | --- | --- |
| 001 | [Exercise library data](specs/001-exercise-library-data.md) | Implemented | — |
| 002 | [Web app](specs/002-web-app.md) | Implemented, reworked for the portfolio | — |
| 003 | [Scheduling and tracking](specs/003-scheduling.md) | Implemented | — |
| 004 | [Circuit catalogue](specs/004-circuit-catalogue.md) | Proposed | Sonnet |
| 005 | [Kit and a wider library](specs/005-kit-and-a-wider-library.md) | Implemented | Split |
| 006 | [Logged sessions](specs/006-logged-sessions.md) | Proposed | Sonnet |

Numbering is the order they were written, not the order they get built: 006 is
next, and 004 last — a catalogue of ready-made circuits is worth writing once
the library it draws on has settled.
