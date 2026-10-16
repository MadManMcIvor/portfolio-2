# Explainers

Interactive, single-page field guides, served at `/explainers/<slug>/`. The index at
`/explainers/` and the home page's Explainers section are both rendered from
`js/data/explainers.js`.

Each explainer keeps its own layout and markup (a long language reference wants a
sidebar; a short concept guide doesn't), but they share the site's look:

- **Palette.** Each page's `<style>` opens with a `:root` block that maps the page's own
  variable names (`--accent`, `--surface`, `--code-bg`…) onto Cream & Ink tokens from
  `../../css/tokens.css`. Light and dark both come from the tokens, so a page never
  defines its own dark palette. Diagrams that colour-code more than two things use the
  categorical colours (`--cat-*`) and syntax colours (`--syn-*`) in `../css/palette.css`.
- **Type.** System sans for everything, the serif for the one display title, system mono
  for code. No web fonts.
- **Chrome.** The `.site-strip` at the top of `<body>` links home and to the index, and
  holds the page's only theme toggle. It uses the site's `theme` storage key, so the
  choice carries between the explainers and the rest of the site.

## Adding one

1. Put the page at `explainers/<slug>/index.html`.
2. In `<head>`: the theme boot script, `../../css/tokens.css` and `../../css/palette.css`
   before the page's `<style>`, and `../explainer.css` after it. Remove any web font links.
3. Replace the page's colour and font variables with a mapping onto the tokens, and
   delete its own dark-mode palette and theme toggle (button and script).
4. Add the site strip as the first thing in `<body>` (after a skip link, if there is
   one), and `<script type="module" src="../explainer.js"></script>` before `</body>`.
5. Add an entry to `js/data/explainers.js` with a `color`, and a drawing for its card in
   `js/components/marks.js` (keyed by slug; language references use a token instead).

Copy any existing explainer's head and strip for steps 2 and 4.

`vendor/mermaid.min.js` is Mermaid 11.16.1 (MIT, see `vendor/mermaid.LICENSE`), used by
the Auth guide's diagrams.
