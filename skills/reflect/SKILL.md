---
name: reflect
description: Spawn three parallel review subagents over the active transcript, surface learnings, and route each to a concrete edit on an existing skill. Use when the user says reflect.
disable-model-invocation: true
---

# Reflect

Mine the current conversation for durable learnings, then route them into skill edits.

Invoke when the user says "reflect" or "/reflect". Skip when the conversation is trivial, off-topic, or already covered by an existing skill the parent followed correctly. One-offs are not learnings.

## 1. Locate the active transcript

Find this conversation's transcript via `history://` (bare lists agents, `history://<id>` pages one). Do not read other sessions.

## 2. Spawn three reviewers in parallel

One `task` call with three items in `tasks[]`, each `agent`: `task` (omp's general-purpose bundled agent), full tools per spawn. Reviewers need MCP access to look up the tickets, chat threads, and observability traces the transcript references. There is no `readonly` field, so nothing strips MCP. The brief still forbids writes.

Each reviewer and the synthesizer name a role line in the `task.agentModelOverrides` map in `~/.omp/agent/config.yml` and a default. The `task` tool takes no per-call `model`. Bind that role in `task.agentModelOverrides`, or leave it out when the value is `auto` or `inherit-parent` so the worker runs on the parent model.

| Lens | Role line | Default `model` | Prompt template |
|---|---|---|---|
| Judgment | `reflect judgment, divergent, synthesizer` | your strongest judgment model | `references/judgment-reviewer.md` |
| Tooling | `reflect tooling` | your fast code model | `references/tooling-reviewer.md` |
| Divergent | `reflect judgment, divergent, synthesizer` | your strongest judgment model | `references/divergent-reviewer.md` |

Pass each template verbatim, substituting the transcript path or digest where marked. Reviewers return findings in the `Task` response body.

## 3. Synthesize

One `task` call, `agent`: `task` (omp's general-purpose bundled agent), role from the `reflect judgment, divergent, synthesizer` line (default your strongest judgment model), full tools per spawn. It spot-verifies citations through MCP. Pass `references/synthesizer.md` verbatim, with each reviewer's full output inlined where marked. It returns an Accepted / Rejected / Backlog list.

## 4. Structural enforcement check

Move any Accepted item that a lint rule, script, metadata flag, or runtime check would enforce more reliably to Backlog. See the **encode-lessons-in-structure** principle skill.

## 5. Apply

Present the synthesizer's full Accepted / Rejected / Backlog output and wait for explicit approval before applying any Accepted edit. The user picks the subset and may redirect routings. Skill changes affect every future agent in the org. Do not auto-apply.

File each Backlog item to your team's devex or backlog tracker without waiting. Only the Accepted list waits for approval.

Follow each approved row's Routing exactly:

- Trivial existing-skill edit (a one-line bullet, a tightened sentence, a stale fact corrected): the parent does it directly.
- Substantive existing-skill edit (a new section, a new pattern table, more than ~10 lines): hand to the `authoring-a-skill` playbook and run its draft / test / iterate loop.
- `tune description: <skill path>` (the skill exists but didn't trigger when it should have): hand to the `authoring-a-skill` playbook and run its description-optimization loop.
- `new skill via authoring-a-skill: <kebab-name>`: hand creation to the `authoring-a-skill` playbook. Do not invent the shape ad hoc.

If your environment ships a SKILL.md validator, run it on every touched skill before declaring done.

## 6. Summarize for the user

Short list, no preamble:

- Edits applied: `<skill path>`. What changed, one line each.
- New skills created: `<skill path>`. One line each (rare).
- Backlog filed to the devex tracker: `<issue title>` (`<tags>`). One line each.
- Dropped: one line per rejected finding + reason from the synthesizer.
