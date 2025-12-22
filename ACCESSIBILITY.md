Accessibility checklist and manual tests

This file contains quick manual checks and remediation notes for the portfolio.

Quick checks (manual)

1. Keyboard navigation
   - Tab through the page and ensure each interactive element receives a visible focus ring.
   - The theme toggle (`#theme-toggle`) should be reachable with Tab and toggle with Enter/Space.
   - Images in project cards (they are `role="button"` and `tabindex="0"`) should be focusable and open the modal with Enter or Space.

2. Modal behavior
   - Open a project screenshot (click or keyboard). Focus should move into the modal (first focusable element).
   - Tab should cycle through modal controls only (focus trap). Shift+Tab should work in reverse.
   - Press Escape to close the modal. Focus should be restored to the element that opened it.
   - Content behind the modal should be hidden from assistive tech (aria-hidden) while modal is open.

3. ARIA & semantics
   - `main`, `nav`, `header`, and `footer` are present and have semantic roles.
   - Buttons have appropriate `aria-label` or visible labels (theme toggle has `aria-pressed` and `aria-label`).

4. Forms
   - The contact form has properly associated `label` elements and required fields.

5. Visual focus
   - Focus-visible styles are present and high-contrast for keyboard users (check `:focus-visible` on buttons and `img[role="button"]`).

Notes and next steps
- Implemented: modal focus-trap, aria-hidden toggling, keyboard activation for project images, focus-visible improvements.
- Remaining: add automated accessibility tests (axe/lighthouse CI), optimize images with responsive srcset, and run a full screen-reader test (NVDA/VoiceOver) if possible.

How to run the manual tests locally

1. Start a simple static server (e.g. `python -m http.server` in the project folder) and open `http://localhost:8000`.
2. Use Tab/Shift+Tab to navigate; use Enter/Space to activate image modal and theme toggle; press Escape to close modal.
3. Optionally run Lighthouse accessibility audit in Chrome DevTools and review any flagged issues.
