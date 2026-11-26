---
name: deliver
description: Deliver an agreed goal by delegating its implementation and review to other agents, from a parent issue with sub-issues or straight from the conversation. Use for /deliver after aligning on a plan.
disable-model-invocation: true
metadata:
  source: own
---

You own the goal's outcome and move it one merged unit at a time. Implementation agents own the code. You don't write it.

**The goal** is a parent issue with its sub-issues when one exists, otherwise the plan agreed in this conversation. **Done** means every unit is merged and the goal's acceptance criteria hold on the integrated default branch. Check the goal yourself; green units don't prove it.

- **Plan the units.** With an issue, the units are its sub-issues and their blocking edges. Without one, split the plan yourself into units with acceptance criteria and write them down where a fresh session can pick them up, as sub-issues or a plan file; a small goal is one unit. The ready set is open units whose blockers have merged. If the breakdown is wrong, fix it before delegating, not in a brief.
- **Delegate one unit per agent,** each isolated on its own branch off the default branch as it stands when the agent starts. Keep queued agents to at most half of those running: a short queue fills a freed slot and shows when the limit moves, a long one only lets branches drift and finished PRs wait. A queued implementer yields to a review; stop it and respawn it when a slot frees. The brief is the unit plus its acceptance criteria as the bar. Leave the how to the agent.
- **Review each unit as soon as it finishes** with a fresh agent that did not write the PR. Its only question: does the PR do what the unit asks, nothing missing and nothing extra? It reports each gap or extra with evidence. It does not rerun lint or tests (CI owns those) and does not raise issues that don't affect correctness.
- **Decide on the review yourself.** A gap goes back to the implementing agent. An extra is reverted or split into its own unit. A finding the unit was wrong about means fixing the unit. Merge once the PR sits on the current default branch and that head has green CI and a clean review, then start the next ready unit from the new default branch.
- **Keep the record true.** With an issue, close each sub-issue on merge and note on later ones what you learned. Without one, keep the units' status in the plan you wrote down.
- **Escalate only product calls and irreversible steps.** Decide everything else and say so in the record.
- **Finish** by checking the goal, closing the parent issue if there is one, and reporting each unit's PR plus any follow-ups.

## Current tools (Claude Code)

- **Spawn** each implementer with `Agent`, `subagent_type: "maou-claude:poteto-agent"`, `isolation: "worktree"`, on a branch off the latest default branch. Every spawn in this skill takes `model` and `effort` from the tier table in the Subagents section of [poteto-mode](../poteto-mode/SKILL.md). The brief is the goal, the unit, its acceptance criteria, and pointers (issue links, shared notes), not pasted context.
- **Explore once, share it.** When units need the same background, one exploration subagent writes notes outside the repo and every brief points to them.
- **Start with the riskiest ready unit** and fix the brief from its report and diff before spawning the next. Run each implementer and reviewer as its own background agent, never one workflow over several units, so each result reaches you the moment its unit finishes.
- **Each implementer** builds with [**tdd**](../tdd/SKILL.md) when the unit has a cheap test path, opens its own PR ready for review with `gh pr create`, and reports `PASS`, `ISSUES`, or `BLOCKED` with the PR link and evidence. `BLOCKED` means the unit is wrong; fix the unit, then spawn fresh.
- **Review** with a fresh `subagent_type: "Explore"` given the PR link and the unit. Its brief says not to edit files.
- **Merge** with `gh pr merge` yourself, one PR per unit into the default branch. A PR that falls behind rebases before its review.
- When a unit merges, remove its worktree. Show the operator any uncommitted work first.
