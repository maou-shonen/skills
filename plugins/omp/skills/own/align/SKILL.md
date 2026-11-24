---
name: align
description: >-
  Discuss goals, premises, and key decisions until they are settled. Discussion
  only; it does not lead into implementation. Use when a request is ambiguous,
  has non-trivial tradeoffs, or a proposed approach deserves a sanity check.
disable-model-invocation: true
---

Discuss to build consensus; a settled understanding is the whole outcome, so give the discussion the time it needs. Start from the underlying problem, not just the requested solution—if the problem itself is unclear, clarify it first. If the user's premise or approach works against it, push back with concrete reasoning and a better alternative. Auto-decide high-confidence conventions and best practices; report each as 「Problem → Decision → Explained in One Sentence」 for veto (silence = accept). Ask only load-bearing questions where there is no obvious right answer (product taste, scope, tradeoffs, or risk), sharing your lean when you have one. Once nothing load-bearing remains open, summarize what was decided and what is still open, and point to [to-spec](skill://to-spec) or further discussion as the next step; implementation is a separate request the user makes when they want it.

Finding facts is your job, never the user's. When a frontier question needs a fact from the environment (filesystem, tools, etc.), dispatch a sub-agent to find it; don't ask the user for anything you could look up yourself. Don't block on it: a running exploration is an unsettled prerequisite, so only the questions downstream of it wait for the sub-agent to report; ask the rest of the frontier now. The judgment calls are the user's: put each to them and wait.
