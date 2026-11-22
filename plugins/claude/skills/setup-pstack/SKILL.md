---
name: setup-pstack
description: Show which model and effort each pstack tier runs on, and offer project verification skills. Use for /setup-pstack, "which models does pstack use", or "configure pstack models".
---

# Setup pstack

This plugin picks no model per role and writes no rule. Every spawn takes `model` and `effort` from the tier table in the Subagents section of [poteto-mode](../poteto-mode/SKILL.md).

## Steps

1. Show the user that table. Say the main chat runs on whatever they chose with `/model` and `/effort`, which the table does not touch. To change a tier, they edit that table in the plugin source.
2. If `~/.claude/rules/pstack-models.md` exists, from an upstream pstack install, say this plugin does not follow it and offer to delete it.
3. **Offer a verification skill (optional).** Check whether the project has a way to drive the real app for proof (a `verify-*` skill, or an existing harness). If not, offer once to generate one with [`/create-verification-skill`](../create-verification-skill/SKILL.md). On no, move on without pushing.
4. **Offer a formal verification skill (optional).** Check whether the project already has a formal verification skill. If not, offer once to generate one with [`/create-formal-verification-skill`](../create-formal-verification-skill/SKILL.md). On no, move on without pushing.
