# Project Context for Copilot

## Overview

This project is a **personal portfolio website** for a software engineer.

The site should be **minimal, modern, and fast**, emphasizing clarity, restraint, and good engineering judgment.
This is **not an application** — it is a mostly static site with light interactivity.

---

## Core Goals

* Clean, minimal aesthetic
* Excellent readability and spacing
* Fast load time
* Easy long-term maintenance
* Clear separation of concerns

---

## Constraints (Important)

* **Do NOT use frameworks** (no React, Vue, Svelte, etc.)
* **Do NOT introduce a build step or bundler**
* Use **plain HTML, CSS, and JavaScript only**
* Use **ES Modules** (`<script type="module">`) for JavaScript organization
* **No CDNs and no third-party CSS frameworks** — everything ships from this repo

---

## Context file location & management

* **Recommended:** keep a single repository-level context file at `.github/copilot-instructions.md` so it is visible in the repository and integrates well with GitHub workflows and tools.
* **Alternative:** for larger projects or multiple contexts, you may create a `.copilot/` directory (for example `.copilot/COPILOT_CONTEXT.md`) and store related files there. This keeps context files scoped and organized.
* **Security note:** never store secrets (API keys, passwords, private tokens) inside a context file. Treat it as documentation and project guidance that is safe to commit. If you must keep sensitive data, ensure those files are excluded via `.gitignore` and stored securely elsewhere.


---

## Technology Stack

* HTML5
* CSS3
* Vanilla JavaScript (ES Modules)
* **Cream & Ink** — the site's design system, a warm editorial palette shared with the
  Steadwell project. `css/tokens.css` is a vendored copy; treat it as read-only and put
  site-specific styling in `css/base.css`. The full rationale lives in
  `steadwell-design-system/README.md`.
* No Node build tooling

---

## Project Structure

Use a simple, scalable structure:

```
/index.html
/css/
  tokens.css   # Cream & Ink design tokens (vendored — don't edit)
  base.css     # layout and components, styled against the tokens
/js/
  main.js
  components/  # one init*() per section, renders from /js/data
  data/        # all site content lives here, not in markup

> Note: Project metadata is stored in `/js/data/projects.js` as an exported array of simple objects. This makes it easy to list/iterate projects in an ES module without touching HTML.

```

---

## JavaScript Guidelines

* Use **ES module syntax** (`import` / `export`)
* No global variables
* Each component should expose a single `init()` function
* Use `data-*` attributes for DOM selection
* Keep logic simple and readable
* Prefer explicit code over clever abstractions

Example pattern:

```js
export function initComponentName() {
  // setup logic here
}
```

---

## Styling Guidelines

Style against the custom properties in `css/tokens.css` — never hard-code a colour, size,
or spacing value. The rules that matter most:

* Never pure white, never pure black. Everything is warmed.
* One accent (clay), and it is never red. Sage is the only second colour, and it means
  *settled*. A third accent makes it a theme rather than a voice.
* Space does the work — reach for the large end of the scale more than feels natural.
* Depth comes from paper tone and hairline rules, not shadows. No elevation system.
* The serif carries the voice sparingly — the display line and the occasional italic
  aside, nothing else. Used more widely it tips from editorial into precious.
* Sentence case, always. The exception is small uppercase eyebrows with `0.08em`
  letter-spacing, which are a deliberate device.
* Dark mode is designed, not computed — do not invert, and never auto-apply it from the
  OS preference. Light is the intended look.

What to resist: gradients, glassmorphism, drop shadows, animated headings, and a second
sans-serif. Any of them will undo it.

---

## Content Sections

### 1. Landing / Hero

* Name
* Short professional tagline
* Optional brief intro paragraph

### 2. Selected work

Each project card includes a title, a short description, and the tech stack as badges.
These are professional projects without public repos, so the cards carry no links.

### 3. Curio cabinet

A paginated table of technologies and articles worth noting. "Context" opens a modal with
the longer description and Alex's own take.

### 4. Footer / Contact

* Links to GitHub, LinkedIn, etc.
* Simple, unobtrusive layout
* Prefer a contact form (or `mailto:`) for inbound messages; do **not** host a publicly downloadable resume


---

## Visual Direction

The feeling to aim for is a well-made notebook: warm, durable, quiet. Not a SaaS
dashboard, not a startup landing page. Do not invent flashy UI elements.

My name is "Alex McIvor" **not** "Alex Johnson" so please use McIvor instead.

---

## Specs and who builds them

`/workout` is a self-contained mini-app with its own working notes in
`workout/docs/`. Work there is spec-first: one numbered spec per chunk of work,
kept as the record of the decision even after it ships.

Each proposed spec carries a `Model:` line in its header naming the model it
should be handed to — Sonnet for work the spec has fully settled, Opus for
prose in the house voice, decisions left deliberately open, and code whose
correctness isn't visible on screen. Split it when a spec is both. The full
convention is in [`workout/docs/README.md`](../workout/docs/README.md).

---

## Philosophy

This codebase should reflect:

* Pragmatism
* Good taste
* Thoughtful restraint
* Clear engineering decisions

Favor simplicity over overengineering at all times.
