---
name: transition-refined
description: Use when writing or polishing UI transitions for work, product, dashboard, or public-facing tool UI that should feel crisp and alive without drawing attention. Install with transition-core; do not install alongside transition-expressive.
---

# Transition: refined

Apply every rule in [transition-core](../transition-core/SKILL.md); this file sets the
amplitudes. Install with `transition-core`, and not with `transition-expressive`
(they give conflicting values for the same knobs).

## Amplitudes

| Knob | Value |
| --- | --- |
| Overshoot | scale ≤ 1.14 on small controls, translate ≤ 2px on rows |
| Squash/stretch | none |
| Anticipation | 4px back |
| Exit travel | 24px, no rotation |
| Secondary motion | child stagger only |
| Page intro | none |
| Ambient | none |

## Recipes

- **Item enter**: row `clip-path: inset(0 100% 0 0)` → `inset(0)` 0.55s `--ease-io`, height grows 0.4s;
  children translate −10px → +2px → 0 with 0.05s stagger starting at 0.12s.
- **Item exit**: content −4px then +24px with fade, 0.22s; row collapses 0.3s starting at 0.14s.
- **Complete**: box press 0.88 → 1.14 → 0.97 → 1 over 0.36s; tick draws by `stroke-dashoffset` 0.3s;
  strike line `scaleX` 0 → 1 from the left 0.35s `--ease-io` at +0.08s; text greys at +0.1s.
  Uncomplete retracts the line to the right in 0.2s.
- **Empty state**: icon scale 0.4 rotate −30° → 1.06 rotate 6° → rest, 0.6s `--ease-pop`;
  text lines rise 10px at 0.12s and 0.18s. Reserve the list area's min-height so the card never jumps,
  and show the empty state while the last row is still leaving.
- **Filter**: FLIP survivors (core) with 4px overshoot, 0.48s, 0.04s stagger.
- **Button press**: `:active` scale 0.94.
