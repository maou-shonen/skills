---
name: deliver
description: Deliver an agreed goal by delegating its implementation and review to other agents, from a parent issue with sub-issues or straight from the conversation. Use for /deliver after aligning on a plan.
disable-model-invocation: true
metadata:
  source: own
---

You own the goal's outcome. Implementation agents own the code. You don't write it.

**The goal** is a parent issue with its sub-issues when one exists, otherwise the plan agreed in this conversation. **Done** means every unit is merged and the goal's acceptance criteria hold on the integrated default branch. Check the goal yourself; green units don't prove it.

- **Plan the units.** With an issue, the units are its sub-issues and their blocking edges. Without one, split the plan yourself into units with acceptance criteria; a small goal is one unit. The ready set is open units whose blockers have merged. If the breakdown is wrong, fix it before delegating, not in a brief.
- **Delegate one unit per agent,** each isolated on its own branch off the latest default branch. The brief is the unit plus its acceptance criteria as the bar. Leave the how to the agent.
- **Review before merge** with a fresh agent that did not write the PR. Its only question: does the PR do what the unit asks, nothing missing and nothing extra? It reports each gap or extra with evidence. It does not rerun lint or tests (CI owns those) and does not raise issues that don't affect correctness.
- **Decide on the review yourself.** A gap goes back to the implementing agent. An extra is reverted or split into its own unit. A finding the unit was wrong about means fixing the unit. Merge once the review is clean and CI is green.
- **Keep the record true.** With an issue, close each sub-issue on merge and note on later ones what you learned. Without one, keep the units' status in your todo list.
- **Escalate only product calls and irreversible steps.** Decide everything else and say so in the record.
- **Finish** by checking the goal, closing the parent issue if there is one, and reporting each unit's PR plus any follow-ups.

## Current tools (Claude Code)

- **Spawn** each implementer with `Agent`, `subagent_type: "maou-claude:poteto-agent"`, `isolation: "worktree"`, on a branch off the latest default branch. Every spawn in this skill takes `model` and `effort` from the tier table in the Subagents section of [poteto-mode](../poteto-mode/SKILL.md). The brief is the goal, the unit, its acceptance criteria, and pointers (issue links, shared notes), not pasted context.
- **Explore once, share it.** When units need the same background, one exploration subagent writes notes outside the repo and every brief points to them.
- **Pilot one unit first:** the riskiest ready one. Read its report and diff, fix the brief, then spawn the rest of the ready set together. When a unit merges, recompute the ready set and spawn the next ones.
- **Each implementer** builds with [**tdd**](../tdd/SKILL.md) when the unit has a cheap test path, opens its own PR ready for review with `gh pr create`, and reports `PASS`, `ISSUES`, or `BLOCKED` with the PR link and evidence. `BLOCKED` means the unit is wrong; fix the unit, then spawn fresh.
- **Review** with a fresh `subagent_type: "Explore"` given the PR link and the unit. Its brief says not to edit files.
- **Merge** with `gh pr merge` yourself, one PR per unit into the default branch. A PR that falls behind rebases before its review.
- When a unit merges, remove its worktree. Show the operator any uncommitted work first.
