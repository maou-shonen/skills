---
name: setup-pstack
description: Show the operator what models pstack roles resolve to and record per-role choices. Use for /setup-pstack, "configure pstack models", or changing pstack's model choices.
layer: coordinator
manual: true
---

# Setup pstack

Skills never pick a model. pstack spawns name one of three omp agents by tier (see poteto-mode **Spawn by tier, not by model**): `sonic` for mechanical work, `task` for code work, `deep` for judgment work. This skill is a mirror: it shows what each agent resolves to, creates `deep` when it is missing, and records the operator's choices. The chat model stays the operator's choice, made with `/model`. Slugs live in `modelRoles` only. This skill never writes a slug.

How omp resolves an agent's model (oh-my-pi `docs/task-agent-discovery.md`, `packages/coding-agent/src/task/agents.ts`): `task.agentModelOverrides.<agent>` wins, then the agent's frontmatter `model`. Bundled `sonic` uses `@smol`; bundled `task` uses `@task` (unset means the parent model). User agents live in `~/.omp/agent/agents/*.md`, and `@<role>` resolves through `modelRoles.<role>`.

## Steps

### 1. Show the current picture

Present one table, one row per tier agent (`sonic`, `task`, `deep`), with its alias and the model it resolves to:

- `omp models` lists the models configured on this machine. Group them by wallet: subscription, metered, free.
- `omp config get modelRoles` shows what `smol`, `task`, and `deep` point at.
- `omp config get task.agentModelOverrides` shows per-agent overrides. Empty is a valid standing choice.
- `ls ~/.omp/agent/agents/{poteto-agent,comment-sicko}.md` checks for the two role agents poteto-mode and no-comments spawn by name. Report any that is missing.
- `ls ~/.omp/agent/agents/deep.md .omp/agents/deep.md` checks for the `deep` agent. If it is missing, say so plainly: judgment work currently falls back to `task`. Also report when `modelRoles.deep` is unset.

### 2. Ask what to change

Ask per tier whether to keep the default, point the agent at another alias, or (for `deep`) create it. Judgment deserves the best model, code a cheap fast one, mechanical whatever is free. Prefer `ask` over free text.

Budget tiers (`unlimited` / `large` / `medium` / `small` effort scaling) are not supported yet. Quota gaps across providers are tenfold and reset weekly, so effort scaling without wallet awareness misleads. Leave budget control to `modelRoles`.

### 3. Validate

Every value written is an alias in `modelRoles` (`@name`). Never write a slug. If a chosen alias is not in `modelRoles`, stop and ask again.

### 4. Write

- Missing `deep`: copy [templates/deep.md](templates/deep.md) to `~/.omp/agent/agents/deep.md`. Its body is omp's bundled `task.md` prompt copied verbatim (source commit in its frontmatter comments); only the model differs from `task`. Resync it when omp updates `task.md`. If `modelRoles.deep` is unset, have the operator map it in `/model`'s Roles view; this skill writes no slug.
- Missing `poteto-agent` or `comment-sicko`: copy [templates/poteto-agent.md](templates/poteto-agent.md) and [templates/comment-sicko.md](templates/comment-sicko.md) to `~/.omp/agent/agents/`. Both are pstack's agent files ported to omp's agent format; they run on `@task`. Overwrite only when the operator agrees, since a local copy may carry edits.
- Retargeting `sonic` or `task`: set `task.agentModelOverrides.sonic` / `.task` to an alias in `~/.omp/agent/config.yml`, or delete the line to fall back to the bundled default. Retarget `deep` by editing its file's `model`. Re-runs overwrite the same keys, so they stay idempotent. Drop any old per-role lines (`feature, refactoring`, `how explorer`, ...) left by earlier versions of this skill.

### 5. Confirm

Tell the user what was written and that it applies to new task spawns. Re-running this skill updates it.
