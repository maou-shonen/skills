---
name: retro
description: "Conduct a retrospective on a coding session."
disable-model-invocation: true
---

The user has asked for a **retrospective**. You are suggesting improvements to the coding agent's **environment** to improve future runs.

Division of labor: `retro` improves the repo environment (checks, AGENTS.md, standards). To improve skills instead, use the **reflect** skill.

## Steps

1. Run the **unslop** skill for the writing style of anything you propose.

2. Read the primary sources for the session the user specifies, using your harness's session history (on omp, `history://`: bare lists sessions, `history://<id>` pages one). If the user doesn't specify a session, default to the current one.

3. Look for candidates for improvement in these categories.

- **Navigation**: how easy was it for the agent to find the right files? Are there hidden dependencies between files? Would a **navigation pointer** make it easier? _Use when_ the session took a long time to find a piece of information.
- **Automated checks**: are there automated checks that could catch errors the agent made? Linting, typing, tests, filesystem linters? Read the repo's own check command first (its `package.json`/build-tool `lint`/`check` scripts, its CI workflow), so a check that already exists but sits unwired or silently broken is the finding, not a reinvention. A repo with no **guardrail** (no pre-commit hook and no CI job running its lint/typecheck/test command) is itself a finding: an un-linted repo is a standing missed opportunity, not a neutral default. _Use when_ the agent made a mistake an automated check could have caught, or the repo has no guardrail at all.
- **Coding standards**: should the **review step** be given a new rule to enforce? Should an existing rule be removed or clarified? Classify the violation first: a **mechanical** one (a fixed syntactic pattern, a banned API, an import shape, a file-location rule) gets a deterministic check, full stop: a custom rule in the repo's own linter, a new pre-commit hook, or a new CI job, whichever the repo's language and existing guardrail make cheapest. Default to building the check over writing the rule. Reserve prose standards for genuine **judgement calls** (cross-file consistency, "matches the surrounding style," anything no guardrail could ever substitute for). _Use when_ the review step failed to catch a mistake.
- **Global AGENTS.md**: are there any steering instructions that should be moved to coding standards (or automated checks) instead? _Use when_ the AGENTS.md file is particularly large - in the repo OR the user's global scope.
- **Tool economy**: did the agent make expensive tool calls that could be streamlined? Is there any custom tooling (CLI's, MCP's) that is particularly token-inefficient? _Use when_ the agent made an expensive tool call.
- **No-ops**: look for instructions in steering files that don't modify the agent's behavior. _Use when_ the steering files are large and unwieldy.
- **Information access**: look for opportunities to increase the agent's access to information. Teeing dev server logs, readonly access to third-party services. _Use when_ a crucial piece of information was not available to the agent.

4. Present these candidates to the user, in order of severity. Every candidate must point to a specific moment in the session; drop any that can't.

5. Change nothing until the user picks candidates. Then dispatch a worker to implement the chosen ones and report back; review its diff before reporting.

## Reference

### Implementation vs Review

All work goes through two stages: implementation and review. The implementing worker has the most **context pressure**. It is responsible for exploration, writing code, and debugging failures.

The review step has the least context pressure - it receives a diff, so no exploration needed. Here the review step is the coordinator reviewing each worker's diff (see "You own every subagent's work" in the **poteto-mode** skill), plus any PR review bot.

This means that the review step should be responsible for imposing coding standards, not the implementing worker.

### Files

- `AGENTS.md`: pushed to the context window of any agent working in this repo. Use it incredibly sparingly, usually only for **navigation pointers** to other files.
- Coding standards: no skill here ships a standards file. Propose judgement-call rules into a repo doc the review step reads (an existing `CONTRIBUTING.md` or standards doc; otherwise propose creating `docs/coding-standards.md`), never into AGENTS.md. Add **navigation pointers** to docs folders if the standards doc gets more than 1,000 lines long.
- Docs: use docs as references files, pointed to by other files. Look for existing docs before writing new ones.
- Skills: use skills for docs (since their description goes into the agent's context window), or for user-invoked commands. Changes to skills belong to the **reflect** skill.
