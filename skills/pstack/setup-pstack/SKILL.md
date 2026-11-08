---
name: setup-pstack
description: Show the operator what models pstack roles resolve to and record per-role choices. Use for /setup-pstack, "configure pstack models", or changing pstack's model choices.
---

# Setup pstack

Skills never pick a model. pstack spawns name one of three omp agents by tier (see poteto-mode **Spawn by tier, not by model**): `sonic` for mechanical work, `task` for code work, `deep` for judgment work. The plugin ships `deep`, `poteto-agent`, and `comment-sicko`. This skill is a mirror: it shows what each agent resolves to and records the operator's choices. The chat model stays the operator's choice, made with `/model`. Slugs live in `modelRoles` only. This skill never writes a slug.

How omp resolves an agent's model (oh-my-pi `docs/task-agent-discovery.md`, `packages/coding-agent/src/task/agents.ts`): `task.agentModelOverrides.<agent>` wins, then the agent's frontmatter `model`. Bundled `sonic` uses `@smol`; bundled `task` uses `@task` (unset means the parent model). `@<role>` resolves through `modelRoles.<role>`. Discovery precedence: project `.omp/agents/` wins over `~/.omp/agent/agents/`, which wins over the plugin's `agents/`.

## Steps

### 1. Show the current picture

Present one table, one row per tier agent (`sonic`, `task`, `deep`), with its alias and the model it resolves to:

- `omp models` lists the models configured on this machine. Group them by wallet: subscription, metered, free.
- `omp config get modelRoles` shows what `smol`, `task`, and `deep` point at. Report when `modelRoles.deep` is unset (`deep` then runs on the parent model).
- `omp config get task.agentModelOverrides` shows per-agent overrides. Empty is a valid standing choice.
- `omp config get task.disabledAgents` shows disabled agents. Report `deep`, `poteto-agent`, or `comment-sicko` listed here.
- Check the task tool's agent list for `deep`, `poteto-agent`, and `comment-sicko`. Report any missing (the plugin isn't loading): `deep` falls back to `task`, the other two have no fallback.
- `ls ~/.omp/agent/agents/ .omp/agents/` checks for shadow copies. Delete unless deliberate.

### 2. Ask what to change

Ask per tier whether to keep the default or point the agent at another alias. Judgment deserves the best model, code a cheap fast one, mechanical whatever is free. Prefer `ask` over free text.

Budget tiers (`unlimited` / `large` / `medium` / `small` effort scaling) are not supported yet. Quota gaps across providers are tenfold and reset weekly, so effort scaling without wallet awareness misleads. Leave budget control to `modelRoles`.

### 3. Validate

Every value written is an alias in `modelRoles` (`@name`). Never write a slug. If a chosen alias is not in `modelRoles`, stop and ask again.

### 4. Write

- Retargeting any agent: set `task.agentModelOverrides.<agent>` to an alias in `~/.omp/agent/config.yml`, or delete the line to fall back to the agent file's `model`. Re-runs overwrite the same keys, so they stay idempotent. Drop any old per-role lines (`feature, refactoring`, `how explorer`, ...) left by earlier versions of this skill.
- If `modelRoles.deep` is unset, have the operator map it in `/model`'s Roles view; this skill writes no slug.

### 5. Confirm

Tell the user what was written and that it applies to new task spawns. Re-running this skill updates it.
