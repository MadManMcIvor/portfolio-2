# Accessibility checklist

Manual checks for the portfolio. Run these after any change to markup, the theme system,
or the modal.

## 1. Keyboard navigation

- Tab through the page; every interactive element should get a visible focus ring
  (2px clay outline).
- The theme toggle (`#theme-toggle`) is reachable with Tab and activates with Enter/Space.
- "Context" buttons in the Curio Cabinet and the pagination controls are reachable and
  activate with Enter/Space.

## 2. Modal behaviour

- Open a Curio "Context" entry. Focus moves into the modal (first focusable element).
- Tab cycles through modal controls only (focus trap); Shift+Tab works in reverse.
- Escape closes the modal and restores focus to the button that opened it.
- Content behind the modal is `inert` and `aria-hidden` while it is open.

## 3. ARIA and semantics

- `main`, `nav`, `header`, and `footer` are present.
- One `h1` per page (the hero), with section headings as `h2` and card titles as `h3`.
- The theme toggle uses the `switch` pattern (`role="switch"` + `aria-checked`) and
  announces its new state through a polite live region.
- The Curio table has a `<caption>` (visually hidden) and `<th>` column headers.

## 4. Colour and contrast

- Both themes are hand-designed — dark mode is not a computed inversion.
- `--ink-faint` sits around 3.9:1 on paper, **below WCAG AA for body text**. It is only
  used for eyebrows, metadata, and decoration. Anything meant to be read uses
  `--ink-muted` (~7:1).
- Never rely on the clay accent alone to convey meaning.

## Running the checks locally

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`, then navigate with Tab/Shift+Tab, activate with Enter/Space,
and close the modal with Escape. A Lighthouse accessibility audit in Chrome DevTools is a
useful backstop.

## Not yet done

- Automated accessibility tests (axe / Lighthouse CI).
- A full screen-reader pass (VoiceOver / NVDA).
