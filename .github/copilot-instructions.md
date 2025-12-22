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
* UI components should rely on **Basecoat UI (via CDN)**

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
* [Basecoat UI (CDN-based)](https://basecoatui.com/installation/) — prefer using Basecoat primitives (badges, cards, buttons, dialogs) in markup instead of re-implementing these patterns.

  Recommended CDN snippet to include in `<head>`:

  ```html
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/basecoat-css@0.3.9/dist/basecoat.cdn.min.css">
  <script src="https://cdn.jsdelivr.net/npm/basecoat-css@0.3.9/dist/js/all.min.js" defer></script>
  ```

  (Load Basecoat before your local CSS so you can override styles when necessary.)
* No Node build tooling

---

## Project Structure

Use a simple, scalable structure:

```
/index.html
/css/
  base.css
  theme.css
/js/
  main.js
  components/
    navbar.js
    themeToggle.js
    projectCards.js
  data/
    projects.js
  utils/
    dom.js
    theme.js
/assets/
  screenshots/README.md
  screenshots/  # keep original screenshots here

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

* Minimalist, calm, intentional UI
* Generous whitespace
* Subtle transitions (no flashy animations)
* Accessible color contrast
* Components should feel lightweight and unobtrusive
* Avoid heavy shadows and excessive decoration

---

## Content Sections

### 1. Landing / Hero

* Name
* Short professional tagline
* Optional brief intro paragraph

### 2. Projects

Each project card should include:

* Screenshot image
* Short description
* Tech stack used
* External links (GitHub, live demo if available)

### 3. Footer / Contact

* Links to GitHub, LinkedIn, etc.
* Simple, unobtrusive layout
* Prefer a contact form (or `mailto:`) for inbound messages; do **not** host a publicly downloadable resume


---

## Assets & Visual Direction

* Screenshots from **Lovable mockups** are provided in `/assets/screenshots`
* Use these screenshots to infer:

  * Layout
  * Spacing
  * Visual hierarchy
  * Overall vibe and tone

Do **not** invent flashy UI elements that are inconsistent with the mockups.

My name is "Alex McIvor" **not** "Alex Johnson" so please use McIvor instead.

---

## Philosophy

This codebase should reflect:

* Pragmatism
* Good taste
* Thoughtful restraint
* Clear engineering decisions

Favor simplicity over overengineering at all times.
