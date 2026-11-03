# Technique catalogue

Tokens (`--ease-*`) and the always-on rules are in [the skill](../SKILL.md). Each entry:
**When**, **Snippet**, **Pitfalls**.

## 1. Staggered reveal

**When**: a list, grid, or group of lines arrives together.

```css
.item {
  animation: rise 0.5s var(--ease-out) both;
  animation-delay: calc(var(--delay, 0s) + var(--i) * 0.05s);
}
@keyframes rise { from { opacity: 0; transform: translateY(16px); } }
```
```html
<li class="item" style="--i: 0">…</li><li class="item" style="--i: 1">…</li>
```

**Pitfalls**
- Cap `--i` at 6–8 (`min(var(--i), 7)`); later items appear with the last one. Keep total stagger ≤ 0.4s.
- Step below 0.03s reads as simultaneous, above 0.12s as slow.
- One `--delay` per group lets you move the whole sequence as a unit.
- Regular stagger for things read in order; irregular delays only for decoration.

## 2. Mask reveal (clip-path)

**When**: an image, card, or heading should appear by being uncovered instead of faded.

```css
.reveal { animation: unmask 0.6s var(--ease-io) both; }
@keyframes unmask {
  from { clip-path: inset(0 100% 0 0); }   /* left → right */
  to   { clip-path: inset(0 0 0 0); }
}
/* image settles inside its mask */
.reveal img { animation: settle 0.8s var(--ease-out) both; }
@keyframes settle { from { transform: scale(1.08); } }
```

**Pitfalls**
- `--ease-io` from fully hidden shows nothing for ~0.3s. When content arrives from a fetch, start partly open (`inset(60% 0 0 0)`) or use `--ease-out`.
- On dark cards the mask edge is invisible; add a 2px light line riding the edge, or use a block wipe (3).
- `border-radius` is not clipped by `inset()` unless you add `round 16px` to it.

## 3. Block wipe (one or two layers)

**When**: swapping content under a cover (route change, hero swap, skeleton→content when boxes differ).

```css
.wipe { position: relative; overflow: hidden; }
.wipe::before, .wipe::after {
  content: ""; position: absolute; inset: 0; transform: translateX(-101%);
  animation: wipe 1s var(--ease-io) both;
}
.wipe::before { background: #ccc; animation-delay: calc(var(--delay, 0s) + 0s); }
.wipe::after  { background: #666; animation-delay: calc(var(--delay, 0s) + 0.2s); }
@keyframes wipe {
  0%   { transform: translateX(-101%); }
  50%  { transform: translateX(0); }
  100% { transform: translateX(101%); }
}
/* swap the content at ~50% (while covered) */
```

**Pitfalls**
- Use 101%, not 100%, to hide a subpixel seam.
- Second layer 0.2s behind the first reads as one gesture; reverse order on the way out (last in, first out).
- On dark surfaces each layer needs ≥ 1.4:1 contrast against the surface and ≥ 1.3:1 against each other, or the wipe disappears.

## 4. Text out of a mask

**When**: headings and short titles.

```css
.line { display: block; overflow: hidden; }
.line > span { display: block; animation: up 0.6s var(--ease-out) both;
  animation-delay: calc(var(--i) * 0.06s); }
@keyframes up { from { transform: translateY(105%); } }
```

**Pitfalls**
- Per line for headings; per character only for very short titles (wrap each char in a span with `aria-hidden` and keep the real text in `aria-label`).
- Descenders get clipped by `overflow: hidden`; add `padding-bottom: 0.1em`.

## 5. Line draw (stroke-dashoffset)

**When**: underlines, dividers, icons or logos that should be drawn.

```css
.draw path {
  stroke-dasharray: var(--len); stroke-dashoffset: var(--len);
  animation: draw 0.8s var(--ease-io) both;
}
@keyframes draw { to { stroke-dashoffset: 0; } }
```
```js
for (const p of document.querySelectorAll('.draw path'))
  p.style.setProperty('--len', p.getTotalLength());
```
Or set `pathLength="1"` on the path and use `1` instead of `--len`.

CSS-only underline: `background: linear-gradient(currentColor 0 0) left bottom / 0% 2px no-repeat;` → animate `background-size` to `100% 2px` (cheap enough for one element; not for lists).

**Pitfalls**
- `stroke-linecap: round` makes the start visible as a dot before the line moves; fine for a "pen tip", surprising otherwise.
- Filled shapes don't draw; draw the outline, then fade the fill in after.

## 6. Overshoot and weight

**When**: something should land with weight (a badge, a toggle, a dropped card).

```css
@keyframes land {
  0%   { transform: translateY(-24px); }
  60%  { transform: translateY(2px); }   /* pass the target */
  80%  { transform: translateY(-1px); }  /* rebound */
  100% { transform: none; }
}
.pop { animation: pop 0.5s var(--ease-pop) both; }   /* or overshoot via the curve alone */
@keyframes pop { from { transform: scale(0.6); opacity: 0; } }
```
Template: rest → anticipation (0–30%, move against the direction or squash) → reach/pass (~60%) → rebound (~80%) → settle.
Curved path: animate X on an outer element with `--ease-in` and Y on an inner one with `--ease-out`.

**Pitfalls**
- Overshoot on grids or large blocks looks wobbly; keep it for small elements.
- Squash with `scale(1.1, 0.9)` needs `transform-origin: bottom` or it floats.

## 7. Press, hover, focus

```css
.btn { transition: transform 0.18s var(--ease-out), background-color 0.15s; }
.btn:active { transform: scale(0.94); transition-duration: 0.08s; }
.card:hover { transform: translateY(-2px); }
```
**Pitfalls**: scale changes under 0.04 are invisible on small controls; cards use 0.98, buttons 0.94. Never delay feedback behind choreography.

## 8. Enter / exit (single item)

```css
.toast[data-state="enter"] { animation: rise 0.4s var(--ease-out) both; }
.toast[data-state="exit"]  { animation: drop 0.28s var(--ease-in) both; pointer-events: none; }
@keyframes drop { to { opacity: 0; transform: translateY(24px); } }
```
```js
el.dataset.state = 'exit';
const done = () => el.remove();
el.addEventListener('animationend', done, { once: true });
setTimeout(done, 400); // fallback
```
**Pitfalls**: exits are for one item the user removed. When a whole set is replaced (filter, search, page), skip exits and use 10.

Native alternative for toggled elements: `transition-behavior: allow-discrete` with `@starting-style` (dialogs, popovers, `display: none` toggles); check browser support for your target.

## 9. FLIP re-layout

**When**: the same rows survive and move (sort, filter, one removal).

```js
const first = new Map([...list.children].map(el => [el.dataset.id, el.getBoundingClientRect().top]));
render(); // DOM update
[...list.children].forEach((el, i) => {
  const dy = first.get(el.dataset.id) - el.getBoundingClientRect().top;
  if (!dy) return;
  el.animate(
    [{ transform: `translateY(${dy}px)` }, { transform: 'translateY(-4px)', offset: 0.7 }, { transform: 'none' }],
    { duration: 480, easing: 'cubic-bezier(0,0.31,0.18,0.99)', delay: i * 40 }
  );
});
```
**Pitfalls**: rows without a `first` entry are new; give them the enter recipe. Skip under reduced motion. Don't FLIP while scroll restoration or anchors measure layout. View Transitions API (`document.startViewTransition`) is an alternative for whole-region swaps.

## 10. List update (set replaced)

**When**: search results, pagination, refetch, where rows are replaced rather than moved.
New rows: rise 12px + fade, 0.32s `--ease-out`, step 0.03s, first 6 only; old rows removed at once. Total ≤ 0.5s.
**Pitfalls**: don't play exit + enter through an empty list; keep the old content until the new arrives.

## 11. Expand / collapse

```css
.panel { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.4s var(--ease-out); }
.panel[open] { grid-template-rows: 1fr; }
.panel > .inner { overflow: hidden; }
```
**Pitfalls**: never animate `height: auto` with JS measurements per frame. Nested padding on `.panel` itself stays visible when collapsed; put it on `.inner`'s child.

## 12. Loading and skeleton handoff

- Show nothing for the first 180ms so fast loads never flash a loader.
- After that, a skeleton shaped like the content: fade in 0.2s, then shimmer (the one allowed loop).

```css
.skeleton { background: linear-gradient(90deg, #eee 0 40%, #f6f6f6 50%, #eee 60% 100%) 0 0 / 300% 100%;
  animation: shimmer 1.2s linear infinite; }
@keyframes shimmer { to { background-position: -150% 0; } }
```
Handoff, in priority order:
1. Same box: keep the skeleton until the content's first visible frame, then remove it.
2. Different box: cover with a block wipe (3), swap underneath.
3. Never: blank gap, cross-fade in place, or fade out to an empty page and back.

**Pitfalls**: don't show the empty state while loading. Don't run content entrances underneath a skeleton. Prefer a `transform`-based shimmer (moving pseudo-element) on long lists; `background-position` repaints.

## 13. Button busy state

**When**: a button starts work (search, submit, sync).
- Press feedback within 0.1s, then the label is **replaced** (not overlaid) by a dot row or spinner inside the same button.
- Busy stays ≥ 0.35s even if the result is faster, and holds until the result arrives (no timeout back to idle).
- Then label back (0.15s) and the result region gets 10 in the same frame; errors go to the error state.

```css
.btn[aria-busy="true"] .label { visibility: hidden; }
.btn[aria-busy="true"] .dots { position: absolute; inset: 0; display: grid; place-items: center; }
.dots i { animation: blink 0.9s infinite both; animation-delay: calc(var(--i) * 0.15s); }
@keyframes blink { 50% { opacity: 0.2; } }
```
**Pitfalls**: keep the button width fixed while busy (the hidden label holds it).

## 14. Expensive effects, cheaply

- Blur: never animate `filter: blur()`. Stack pre-blurred copies and cross-fade their opacity.
- Shadows: animate the opacity of a pseudo-element that carries the shadow, not `box-shadow`.
- Color: `background-color` transitions are fine on a few elements; on many, cross-fade a layer.
- `will-change: transform` only on elements about to animate; remove after.

## 15. Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important; animation-iteration-count: 1 !important;
    transition-duration: 0.15s !important; transition-property: opacity, color, background-color !important;
    scroll-behavior: auto !important;
  }
}
```
No movement, no stagger, no loops; opacity and color changes ≤ 0.15s are fine. Skip FLIP in JS: `matchMedia('(prefers-reduced-motion: reduce)').matches`.
**Pitfalls**: with `fill-mode: both`, a 0.01ms animation still lands on its end state, which is what you want; check that end states don't depend on the animation running.

## 16. Verify

Record the interaction ([record.mjs](record.mjs)), then tile frames around it:
`ffmpeg -ss T -t 0.8 -i out.mp4 -vf "fps=15,tile=4x3" -frames:v 1 t.png`. Check: feedback in the first frames, no layout jump, no sibling teleporting, nothing replaying on re-render, no blank frame at loading handoff, text never covered by a loader.
