---
name: use-dev-environment
description: >-
  Use when the user delegates coding or repo work to you (build a site, fix a
  bug, open a PR, touch a git repo). Covers how to run the coding agent (omp
  via Herdr on the user's dev host) from request to report, not how to
  develop. Not for answering questions about code.
layer: dev-assistant
---
# Delegate development to the coding agent

You don't write the code, and you don't decide how it gets written. You own four things: the requirement, the hand-off, the acceptance check, and the delivery. **omp** (the coding agent, driven through **Herdr**) owns everything between them, including architecture, task breakdown, tests, and tooling.

## Lifecycle

Example: the user asks for a small todos website.

1. **Clarify.** Restate what you think the user wants: what it does, who uses it, where it lives, and what "done" looks like. Ask only the questions that change the outcome. Wait for the user's approval before starting.
2. **Hand over.** Start or reuse an omp session through Herdr (see below) and give it the agreed requirement, with the repo's absolute path, branch base, constraints, and done criteria. Don't prescribe architecture, tests, or steps. omp decides those.
3. **Accept.** When omp reports done, check the outcome yourself against the requirement. Open the page, click through it, run the command, read the output. This is a check of the product, not a code review. If it falls short, tell omp what is missing **in the same session** and repeat. Don't start a new session for the same task.
4. **Deliver.** Once it passes, pick a delivery that fits: a preview deploy, a PR, or a direct push to main. Confirm the choice with the user before you do it.
5. **Clean up.** Close the omp agent and any Herdr workspace you created, and have the worktree removed (`wt-rm <name>`, or `git worktree remove` plus `git worktree prune`). Kill dev servers and browser sessions that were left running.
6. **Report.** Tell the user what was built, where it is (URL, PR link, commit), how you checked it, and anything left open.

## Dev host

- All coding work runs on **the user's dev host**, which you know from memory or the environment, not on the machine you chat from. Don't fall back to a local coding agent.
- If you can run commands on the dev host directly (for example it's a registered machine), do that. Use Herdr's remote mode only when you can't.
- Use the bot's own git identity configured on that host for commits, pushes, issues, and PRs, never the user's personal account. If access is denied, ask the user to grant it. Don't switch accounts.
- Never print secret files or credentials.
- Local `main` may hold the user's unpushed commits, so branch from `origin/main` and never reset or push local main. Don't `git stash`. If the checkout is dirty with someone else's changes, stop and ask.
- Worktrees always go at `<repo>/.worktree/<name>`. Remove them and prune when done.

## Driving omp through Herdr

Herdr's own skill is the reference for commands, remote mode included. The house rules:

- The Herdr server is the user's live session. Check its status, and don't start, stop, or reload it unless it's down.
- List workspaces and agents first. Reuse this repo's workspace when its omp is idle or done. Never prompt or close workspaces that belong to other projects or bots. Create new ones with a unique label and close them when finished.
- Don't pick a model for omp; it uses the user's configured default. Never read omp's secrets or change its config.
- Use absolute paths in prompts.
- Prompt only when the agent is idle or done. If it's blocked, read the pane, answer it (or ask the user), and only then prompt again.
- Browser automation in the omp pane reuses one fixed session name and closes it on exit. Never add `--no-sandbox`.
