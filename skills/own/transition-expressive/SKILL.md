---
name: transition-expressive
description: Use when writing UI transitions for personal, playful, portfolio, event, or first-run pages that should have stage presence (演出感): squash and stretch, big overshoot, intro sequences, particles. Install with transition-core; do not install alongside transition-refined.
---

# Transition: expressive

Apply every rule in [transition-core](../transition-core/SKILL.md); this file sets the
amplitudes. Install with `transition-core`, and not with `transition-refined`
(they give conflicting values for the same knobs). The interaction layer stays as fast
as core requires; only choreography and show get louder.

## Amplitudes

| Knob | Value |
| --- | --- |
| Overshoot | scale 1.25–1.35, then undershoot to ~0.9 |
| Squash/stretch | landing `scale(1.15, .8)`, rebound `scale(.95, 1.06)` |
| Anticipation | 8px back plus squash before a throw |
| Exit travel | 90px with 6° rotation |
| Secondary motion | text skew, row jolt, particles on success |
| Page intro | yes, total ≤ 1.3s |
| Ambient | finite sway, 2 cycles |

## Guardrails

- Particles: ≤ 10, ≤ 0.8s, `pointer-events: none`, removed on finish. One celebration per action.
- Content that only matters after the intro (empty state) waits until the intro ends.
- Long intros on pages opened many times a day should play once per session.

## Recipes

- **Intro**: card `clip-path` wipe top-down 0.7s `--ease-io`; title split per character,
  each drops −22px with landing squash, 0.6s at 0.35s + 0.06s per char; input rises at 0.6s;
  chips pop 0.3 → 1.15 → 0.95 → 1 at 0.75s + 0.06s each.
- **Item enter**: checkbox scale 0 rotate −90° → 1.3 rotate 10° → 0.88 → 1, 0.6s;
  label from −28px `skewX(-18deg)` → +5px `skewX(6deg)` → rest, 0.55s; submit button
  squashes `scale(.86,.9)` → `(1.1,.94)` → rest.
- **Complete**: box 0.7 → 1.35 rotate −8° → 0.9 → 1, 0.5s; row jolts 6px → −2px → 0, 0.45s;
  10 radial particles, 34–56px travel, 0.6–0.8s `--ease-out`, via WAAPI.
- **Item exit**: 30% anticipation `translateX(-8px) scale(1.03,.94)`, then throw with rotation
  and fade, 0.34s `--ease-in`; row collapse 0.32s starting at 0.16s.
- **Empty state**: icon blooms from 30px below, scale 0.2 rotate −180° → −10px `scale(1.25,.85)`
  rotate 15° → `scale(.92,1.08)` → rest, 0.9s; then sways ±8° for 2.4s × 2.
- **Filter**: FLIP survivors (core), same timing as refined; the louder part is the enter recipe for new rows.
