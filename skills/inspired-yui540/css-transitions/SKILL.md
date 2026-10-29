---
name: css-transitions
description: Catalogue of CSS transition and animation techniques for UI work - curve and duration tokens, staggered reveals, clip-path mask and block wipes, stroke-dashoffset line draw, overshoot and weight, FLIP list updates, loading and skeleton handoff, button busy states, reduced motion, and performance rules. Use when adding or fixing enter/exit, state-change, list, or loading motion in a web UI.
---

# CSS transitions

A technique catalogue, not a style guide. Pick the entry that fits the change in front of
you, copy the snippet, check its pitfalls. Every entry has **When**, **Snippet**, **Pitfalls**.

- [references/techniques.md](references/techniques.md): the catalogue (wipes, masks, line draw, stagger, FLIP, loading, busy buttons, …).
- [references/dissections.md](references/dissections.md): annotated numbers from the MIT repo `yui540/css-animations`, if you want to see why a value was chosen.
- [references/record.mjs](references/record.mjs): optional Playwright + ffmpeg script to record an interaction and check it frame by frame.

## Tokens (start here)

```css
:root {
  --ease-out: cubic-bezier(0, 0.31, 0.18, 0.99);    /* arrivals, fades, rises */
  --ease-pop: cubic-bezier(0, 0.56, 0.15, 1.01);    /* small overshoot (y2 > 1) */
  --ease-io:  cubic-bezier(0.87, 0.05, 0.02, 0.97); /* wipes, masks, line draws, big moves */
  --ease-in:  cubic-bezier(0.64, 0.08, 1, 0.97);    /* exits only */
}
```
Curves from MIT `yui540/css-animations`. Built-in `ease` is not one of them.

| Curve | Use for | Avoid for |
| --- | --- | --- |
| `--ease-out` | fades, rises, text out of a mask, list arrivals | exits |
| `--ease-pop` | a badge, button, icon arriving | grids, large blocks |
| `--ease-io` | masks, block wipes, line draws, large moves | opacity or small rises (reads as freeze-then-jump) |
| `--ease-in` | exits, throws | arrivals |

| Kind of change | Duration |
| --- | --- |
| Press | 0.08s down, 0.16–0.2s release |
| Hover / focus | 0.15s |
| Enter, state change, re-layout | 0.4–0.6s per element (default 0.5s) |
| Exit | 60–75% of the matching enter, `--ease-in` |
| Stagger step | 0.03–0.1s (default 0.05s); stagger only the first 6–8 items |

## Rules that always apply

- Animate only `transform`, `opacity`, `clip-path` (plus `stroke-dashoffset` on SVG). Collapse height with `grid-template-rows: 1fr → 0fr`.
- Name properties; never `transition: all`.
- Input feedback lands within 0.2s and is never blocked by an animation; leaving nodes get `pointer-events: none`.
- Content never loops. Loops are for loading indicators only, until the wait ends.
- Finite animations use `animation-fill-mode: both` so there is no flash before or after.
- Trigger state animations from a "just changed" class, not from render, so re-renders don't replay them.
- Remove leaving nodes on `animationend` with a timeout fallback.
- Honor `prefers-reduced-motion: reduce` (techniques.md, last entry).
- Under ~12px of travel on a block wider than ~200px, a rise reads as nothing; use a mask reveal or skip the motion.
