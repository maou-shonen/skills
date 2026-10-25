---
name: setup-pstack
description: Show the operator what models pstack roles resolve to and record per-role choices. Use for /setup-pstack, "configure pstack models", or changing pstack's model choices.
---

# Setup pstack

Skills never pick a model. Every spawn runs on whatever the user's configuration assigns, and an unconfigured role runs on the parent chat model. This skill is a mirror: it shows what each role resolves to today and records the operator's per-role choices in `task.agentModelOverrides`. The chat model stays the operator's choice, made with `/model`, and pstack never overrides it. Slugs live in `modelRoles` only. This skill never writes a slug.

## Steps

### 1. Show the current picture

Run these three and present the result as one table, one row per role:

- `omp models` lists the models configured on this machine. Group them by wallet: subscription, metered, free. That grouping is the budget picture.
- `omp config get modelRoles` shows what each alias points at today.
- `omp config get task.agentModelOverrides` shows which roles the operator already pinned. Empty means every role runs on the parent model, which is a valid standing choice, not a missing setup.

### 2. Ask what to change

Ask the operator role by role whether to pin it to an alias or leave it on the parent model. Three capability tiers guide the choice: judgment work deserves the best model, code work deserves a cheap fast one, mechanical work deserves whatever is free. Which alias that is lives in `modelRoles`, not here. Prefer `ask` over free text. A dropped line from a prior run (a role no longer in step 4) gets named and removed.

Budget tiers (`unlimited` / `large` / `medium` / `small` effort scaling) are not supported yet. Quota gaps across providers are tenfold and reset weekly, so effort scaling without wallet awareness misleads. Leave budget control to the operator's pane and `modelRoles` choices until a wallet-aware design lands.

### 3. Validate

Every value written is an alias in `modelRoles`, or the role is left out to run on the parent model. Never write a slug. If a chosen alias is not in `modelRoles`, stop and ask again.

### 4. Write the rule

Write `task.agentModelOverrides` in `~/.omp/agent/config.yml`, one entry per pinned role, using the same labels poteto-mode uses. Overwrite the whole pstack part of the map so re-runs stay idempotent. Delete a line to fall back to the parent model. The block below is the role-to-capability table and not the file format. Shape:

```
# pstack per-role choices. One line per pinned role. Delete a line to run that role on the parent model.
feature, refactoring: code work, cheap fast alias
bug-fix: code work, cheap fast alias
perf-issue: code work, cheap fast alias
hillclimb: code work, cheap fast alias
judgment and prose: judgment work, best alias
hardest tasks: judgment work, best alias
how explorer: code work, cheap fast alias
how explainer: judgment work, best alias
why investigators: code work, cheap fast alias
why synthesizer: judgment work, best alias
reflect tooling: code work, cheap fast alias
reflect judgment, divergent, synthesizer: judgment work, best alias
```

### 5. Confirm

Tell the user which entries were written and that they apply to new sessions. Re-running this skill updates it.
