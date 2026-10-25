---
name: draft-a-task
description: Draft a task
disable-model-invocation: false
---

Discuss first to build consensus. Auto-decide high-confidence conventions and best practices; report each as 「Problem → Decision → Explained in One Sentence」 for veto (silence = accept). Ask only load-bearing questions that change outcome, scope, risk, or user-visible behavior. Never implement until the user explicitly confirms to proceed.

Finding facts is your job, never the user's. When a frontier question needs a fact from the environment (filesystem, tools, etc.), dispatch a sub-agent to find it; don't ask the user for anything you could look up yourself. Don't block on it: a running exploration is an unsettled prerequisite, so only the questions downstream of it wait for the sub-agent to report; ask the rest of the frontier now. The decisions are the user's: put each to them and wait.
