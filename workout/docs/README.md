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

The [brief](BRIEF.md) is the separate record of moving the app into the
portfolio: reskin, ES modules, PWA.

## Current specs

| #   | Spec | Status |
| --- | --- | --- |
| 001 | [Exercise library data](specs/001-exercise-library-data.md) | Implemented |
| 002 | [Web app](specs/002-web-app.md) | Implemented, reworked for the portfolio |
| 003 | [Scheduling and tracking](specs/003-scheduling.md) | Implemented |
| 004 | [Circuit catalogue](specs/004-circuit-catalogue.md) | Proposed |
