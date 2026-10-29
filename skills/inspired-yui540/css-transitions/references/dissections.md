# Dissections (source: github.com/yui540/css-animations, MIT; pixiv inside 2020-01-21)

Numbers quoted from source; the "why" is our reading. Principles only: no artwork, no non-MIT code. Source repo `github.com/yui540/css-animations` is MIT, © yui540.

## A. Two-layer wipe (2025-02-25/index.html)
Two pseudo-elements, colors #ccc then #666, both `slideIn 1s cubic-bezier(0.87,0.05,0.02,0.97)`.
Delays: light layer 0s, dark layer 0.2s; out: dark at 1.2s, light at 1.4s.
- Why 0.2s offset: enough to read as two layers, small enough to feel like one gesture.
- Why the out order reverses (last in, first out): it reads as a stack peeling off.
- Why that curve: ~nothing moves for the first ~20%, then a near-instant sweep, then a long
  settle. The hold builds anticipation without a separate keyframe.
- Why `translateX(101%)` not 100%: hides a 1px subpixel seam.
- All delays are `calc(Xs + var(--delay))`: the whole sequence can be moved as one unit.

## B. Toppling stack with overshoot (2026-04-18/tips-2.html)
Four pieces, `0.65s ease-in-out`, delays 0.2 / 0.3 / 0.4 / 0.5s (0.1s stagger).
Keyframes: 0% 0deg → 60% 60deg → 80% 55deg → 100% 60deg.
- Reach target at 60%, rebound 5deg, settle. That rebound is the "weight".
- The last piece rotates 90deg (vs 60–66) so the sequence ends on an accent.
- `transform-origin: right bottom`: pivot at the physical contact point.

## C. Curved throw via split axes (2026-06-07/tips-2.html)
Outer `fly 0.8s cubic-bezier(0.64,0.08,1,0.97)`, inner `move 0.8s cubic-bezier(0,0.31,0.18,0.99)`,
same delay; delays per item 0.4 / 0.5 / 0.75 / 0.9s (irregular, so it doesn't feel mechanical).
- One axis accelerates, the other decelerates → arc without path animation.
- Irregular stagger is deliberate for decoration; use regular stagger for lists (they're read in order).

## D. Pop in/out with tiny overshoot (2026 tips)
`scale-in 0.8s cubic-bezier(0,0.56,0.15,1.01)` then `scale-out 0.6s` same curve at `+1.5s`.
- y2 = 1.01 gives overshoot without a keyframe.
- Out (0.6s) is 75% of in (0.8s).

## E. Expensive effects, cheaply (pixiv inside)
Blur: two copies with fixed `blur(4px)` and `blur(12px)`, cross-faded with opacity
(`animation-direction: reverse` reuses the keyframes; note it also reverses the easing).
Eyelid: one keyframe replayed with delays 0.2 / 1.2 / 1.42 / 6.2 / 6.58s and durations
0.6 / 0.22 / 0.22 / 0.38 / 0.5s, curve `cubic-bezier(0,0,0.11,0.99)`: slow open, quick blink pair.
- Rhythm comes from varying durations of the *same* motion, not new motions.

## F. Interaction layer (yui540.com)
`transition: … 0.16s ease-out` on hover states; `opacity 0.4s cubic-bezier(0,0,0.28,1)`;
`transform 0.55s cubic-bezier(0,0.15,0.25,0.99)`. Short for input, long soft landings for content.
