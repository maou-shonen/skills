---
name: transition-core
description: Shared transition rules used by transition-refined and transition-expressive; loaded through one of them, not used standalone. Layers, curve tokens, timeline and stagger, weight template, FLIP re-layout, performance, reduced motion, and the record-and-review loop.
---

# Transition core

Shared by [transition-refined](../transition-refined/SKILL.md) and
[transition-expressive](../transition-expressive/SKILL.md). The entry skill sets the
amplitudes; this file sets everything that does not change with intensity.

Goal: motion with a beat. The generic tell is `transition: all .3s ease` on everything:
same curve, same time, no weight. Principles are distilled from yui540's public CSS
(pixiv inside, note talk, MIT repo `yui540/css-animations`); worked examples with the
reasoning behind each number are in [references/dissections.md](references/dissections.md).

## Layers

| Layer | Use for | Duration | Curve |
| --- | --- | --- | --- |
| Interaction | hover, press, focus, toggles | press 0.08s, release 0.16–0.2s | `--ease-out` / `--ease-pop` |
| Choreography | enter, exit, state change, re-layout, empty state | 0.4–0.8s per element | strong custom curve |
| Show | intro, celebration, loading | free, finite (`both`/`forwards`, fixed count) | whatever serves the story |

Input feedback lands inside 0.2s and never waits on choreography. Nothing blocks input:
leaving nodes get `pointer-events: none` and every node animates independently.

## Curve tokens

```css
--ease-out: cubic-bezier(0, 0.31, 0.18, 0.99);   /* arrive: fast start, long soft landing */
--ease-pop: cubic-bezier(0, 0.56, 0.15, 1.01);   /* arrive with built-in overshoot (y2 > 1) */
--ease-io:  cubic-bezier(0.87, 0.05, 0.02, 0.97); /* wipes, big moves: hold, snap, settle */
--ease-in:  cubic-bezier(0.64, 0.08, 1, 0.97);   /* exits and throws only */
```
All four appear in yui540/css-animations. Built-in `ease` is not a token.

## Timeline

- One `--delay` per sequence, one index `--i` per child: `calc(var(--delay, 0s) + var(--i) * step)`.
- Stagger step 0.04–0.1s; below 0.03s reads as simultaneous, above 0.12s as slow.
- Overlap: the next part starts before the previous ends.
- Exit is 60–75% of the matching enter and uses `--ease-in`.
- Lists use regular stagger (read in order); decoration may use irregular stagger.

## Weight template

```
0%    rest
0–30% anticipation: move against the direction, or squash
~60%  reach or pass the target
~80%  rebound
100%  settle
```
The entry skill sets how far each phase goes. For curved paths, animate X and Y on
nested elements with `--ease-in` on one axis and `--ease-out` on the other.

## FLIP re-layout

When a filter, sort, or removal moves surviving rows: record each row's `top` (First),
re-render (Last), animate `translateY(old - new)` to 0 (Invert, Play) with `--ease-out`,
staggered by index; rows that are new use the enter recipe. Skip when reduced motion is on.

## Hard rules

- Animate `transform`, `opacity`, `clip-path`. Height collapse via `grid-template-rows: 1fr → 0fr`.
- Never animate `filter: blur` live; cross-fade pre-blurred layers.
- No `transition: all`; name properties.
- Infinite loops only for loading or ambient decoration, never on content.
- Gate replay-on-render: a "just changed" class triggers state animations, so re-renders don't refire them.
- Remove leaving nodes on `animationend` with a timeout fallback.
- `prefers-reduced-motion: reduce`: no movement, no stagger, no particles; opacity and color ≤ 0.15s.

## Record-and-review loop (mandatory)

1. Record: adapt the interaction script in [references/record.mjs](references/record.mjs)
   (Playwright + ffmpeg, mp4) and run it against the page.
2. Look: `ffmpeg -ss T -t 0.8 -i out.mp4 -vf "fps=15,tile=4x3" -frames:v 1 t.png`
   around each interaction, then view the image.
3. Critique, one line each:
   - Does every change have a beat, or is it a flat fade?
   - Is feedback visible in the first frames (≤ 0.2s)?
   - Do parts arrive in sequence with overlap?
   - Any layout jump, or siblings teleporting?
   - Any animation replaying when it shouldn't?
   - Anything moving that doesn't need to?
4. Revise, re-record, re-look. At least one iteration.
