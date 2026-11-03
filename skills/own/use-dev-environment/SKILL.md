---
name: use-dev-environment
description: >-
  Use when the user delegates coding or repo work to you (build a site, fix a
  bug, open a PR, touch a git repo). Covers how to run the coding agent (omp
  via Herdr on the dev host shonen-lab, GitHub as shonen-bot) from request to
  report, not how to develop. Not for answering questions about code.
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

- All coding work runs on **`shonen-lab`**, never on the box. The box's own omp has no working subscription, so don't use it as a fallback.
- From the box: `ssh -o BatchMode=yes shonen-lab '…'` (Tailscale). If it fails, run the `cf-one-client-restore` skill first. Never print secret files.
- Non-interactive ssh doesn't load mise. Start every remote command with `export PATH=$HOME/.local/share/mise/shims:$HOME/.local/bin:$PATH;`.
- GitHub identity is **`shonen-bot`**. `gh` is logged in as it, and git signs and pushes as it. Issues, PRs, and pushes must never come from `maou-shonen`. If access is denied, ask the user to add `shonen-bot` as a collaborator. Don't switch accounts.
- Repos live in `~/projects/<repo>`. Local `main` may hold the user's unpushed commits, so branch from `origin/main` and never reset or push local main. Don't `git stash`. If the checkout is dirty with someone else's changes, stop and ask.
- Worktrees always go at `<repo>/.worktree/<name>` (`wt-new <name> [base]`, `wt-rm <name>`).

## Driving omp through Herdr

Herdr's own skill is the reference for commands: read `~/.agents/skills/herdr/SKILL.md` on shonen-lab. The house rules:

- The Herdr server is the user's live session. Check `herdr status`, and don't start, stop, or reload it unless it's down. Don't script `herdr --remote`.
- List workspaces and agents first. Reuse this repo's workspace when its omp is idle or done. Never prompt or close workspaces that belong to other projects or bots. Create new ones with a unique label and close them when finished.
- Launch omp with `--thinking xhigh` and no `--model`. Never read `~/.omp/agent/.env` or change omp config.
- Write the prompt to a file, copy it over, and pass it with `"$(cat …)"`. Use absolute paths in prompts.
- Prompt only when the agent is idle or done. If it's blocked, read the pane, answer it (or ask the user), and only then prompt again.
- Browser automation in the omp pane reuses one fixed session name and closes it on exit. Don't launch Chrome straight from ssh, and never add `--no-sandbox`.
