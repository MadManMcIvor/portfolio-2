# Cream & Ink

A warm, editorial design system. Cream paper, warm near-black ink, one earthen accent.
Built for [Steadwell](https://github.com/MadManMcIvor/steadwell), extracted here so it can
be reused — for a personal site, a blog, anything that should feel unhurried.

**The feeling to aim for:** a well-made notebook. Warm, durable, quiet. Not a SaaS
dashboard, not a startup landing page.

---

## Files

| File | What it is |
|---|---|
| `tokens.css` | The whole system. Custom properties plus minimal base styles. |
| `theme-toggle.js` | ~20 lines. Light / dark / system, persisted, no flash. |
| `example.html` | A working page. Open it in a browser to see the system. |

No build step, no dependencies, no class names to learn. Drop in the CSS and style against
the variables.

---

## Quick start

```html
<link rel="stylesheet" href="tokens.css" />
<script src="theme-toggle.js"></script>
```

Then use the variables:

```css
.card {
  padding: var(--space-4);
  background: var(--paper-raised);
  border: 1px solid var(--paper-line);
  border-radius: var(--radius);
  box-shadow: var(--shadow-card);
}
```

---

## The rules that actually matter

Copying the hex codes gets you 40% of the way. These get you the rest.

### 1. Never pure white, never pure black

`#FFF` reads clinical against cream. Pure black on cream is harsh and faintly cold.
Everything is warmed: paper is `#F8F4EC`, ink is `#1C1917`.

### 2. One accent, and it is never red

Clay (`#A85D42`) is warm and earthen. Red is loud, it means failure, and it makes
everything around it feel urgent. If you need a second colour, sage (`#5F7355`) means
*settled* — done, shipped, resolved. Both are muted deliberately.

Two accents is the ceiling. A third makes it a theme rather than a voice.

### 3. Space does most of the work

The 4px scale runs to `--space-7` (3rem) and you should reach for the large end more than
feels natural. Generous whitespace is the single biggest contributor to the calm feeling —
more than the colours.

### 4. Depth comes from paper, not shadows

`--shadow-card` is a 1px hairline of a thing, and that's on purpose. Separation comes from
paper tone (`--paper` vs `--paper-raised`) and hairline rules, the way it would on an
actual page. No elevation system, no blur, no glow.

### 5. The serif carries the voice, sparingly

System serif (New York on Apple platforms) for the display line and the occasional italic
aside. **Everything functional stays sans.** Used more widely it tips from editorial into
precious. In Steadwell it appears in exactly two places per screen.

### 6. Sentence case, always

Not Title Case, not ALL CAPS — except small uppercase eyebrows with wide letter-spacing
(`0.08em`), which are a deliberate device.

---

## Dark mode is designed, not computed

**Do not invert.** Cream does not become black; it becomes a warm brown-grey. Inverting
mechanically produces a cold, dead grey that loses everything that made the light theme
work.

Both accents also have to **lift** on a dark ground to stay legible:

| | Light | Dark |
|---|---|---|
| Clay | `#A85D42` | `#D89272` |
| Sage | `#5F7355` | `#9CB38E` |

**Light is the default**, not the OS preference. Dark applies only on an explicit choice.
Following the system automatically means most visitors never see the look you actually
designed. That's a real opinion and you may disagree — change `DEFAULT` in
`theme-toggle.js` if so.

---

## Colour reference

### Paper

| Token | Light | Dark | Use |
|---|---|---|---|
| `--paper-raised` | `#FDFBF7` | `#232019` | Cards, anything lifted |
| `--paper` | `#F8F4EC` | `#1A1714` | Page background |
| `--paper-sunken` | `#F1EBE0` | `#14120F` | Wells, code blocks |
| `--paper-line` | `#E4DCCE` | `#332E27` | Hairlines, dividers |

### Ink

| Token | Light | Dark | Use |
|---|---|---|---|
| `--ink` | `#1C1917` | `#F2EDE3` | Primary text |
| `--ink-muted` | `#5F584E` | `#ABA294` | Secondary text |
| `--ink-faint` | `#857D70` | `#7D7568` | Tertiary — large or decorative only |

⚠️ `--ink-faint` sits around 3.9:1 on paper, which is **below WCAG AA for body text**. Use
it for large text, eyebrows, and decoration. For anything someone has to read, use
`--ink-muted`.

### Accents

| Token | Light | Dark | Means |
|---|---|---|---|
| `--clay` | `#A85D42` | `#D89272` | Attention, links, active |
| `--sage` | `#5F7355` | `#9CB38E` | Settled, done, resolved |

`*-tint` variants are for chip and badge fills. `*-strong` for hover and text on tint.

---

## Type scale

| Token | Size | Use |
|---|---|---|
| `--text-display` | 34px | Serif. One per page. |
| `--text-title` | 24px | Section headings |
| `--text-heading` / `--text-body` | 17px | Card titles, body |
| `--text-sub` | 15px | Supporting text |
| `--text-small` | 13px | Eyebrows, labels, metadata |

All in `rem`, so browser text scaling works.

---

## Adapting it for a personal site

Some notes specific to porting this to a portfolio or blog.

**Long-form reading.** Cap measure at `34rem`–`38rem`. Line length matters more than
anything else for readability, and the cream background is already easy on the eye.

**Code blocks** are handled in `tokens.css` — `--paper-sunken` with a hairline. If you add
syntax highlighting, pick a warm-leaning theme; a cold blue-purple scheme will fight the
paper badly.

**Photography is the risk.** Warm cream fights cool-toned images. Options: give photos a
hairline border and generous padding so paper never touches image edge-to-edge, or warm
them slightly, or set image-heavy pages on `--paper-sunken` instead.

**Links.** `tokens.css` styles `a` in clay with a thin underline at a comfortable offset.
Consider removing underlines in navigation but **keeping them in prose** — it's more
readable and more accessible.

**The eyebrow device** — small uppercase, `0.08em` letter-spacing, `--ink-faint` — works
well for dates, categories, and section labels. It carries a lot of the editorial feel.

**What to resist:** gradients, glassmorphism, drop shadows, animated gradients on
headings, and a second sans-serif. Any of them will undo it.

---

## Licence

Take it, change it, no attribution needed.
