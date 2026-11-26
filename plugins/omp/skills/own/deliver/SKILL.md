---
name: deliver
description: Deliver an agreed goal by delegating its implementation and review to other agents, from a parent issue with sub-issues or straight from the conversation. Use for /deliver after aligning on a plan.
disable-model-invocation: true
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

## Current tools

- Delegation runs through **hc** (herdr-core). Read `hc --skill` before the first hc command and take every command from it.
- Implementation is one **omp** session per unit in its own worktree. The brief's first line is `/poteto-mode`.
- Review is another omp session with the PR link and the unit as its brief.
- When a unit merges, close its sessions and remove its worktree. Show the operator any uncommitted work first.
- Host, git identity, and paths come from the operator's private setup, never from this repo.
