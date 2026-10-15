# ADR-0010：GitLab / glab 模板不引

- Status: Accepted
- Date: 2026-10-16

## Context

`setup-matt-pocock-skills` 帶 GitHub / GitLab / local 三套 tracker 模板，GitLab 那套綁 `glab` CLI（含 label、MR、blocking-link 操作）。這台只用 `gh`，`glab` 沒裝也沒需求。

## Decision

`issue-tracker-gitlab.md` 整檔不引。`SKILL.md` 內 GitLab 選項、`glab` 引用、`CLAUDE.md` 優先（改 `AGENTS.md` 定稿）同步清掉。

## Consequences

- 將來真有 GitLab repo 時，從上游按 `pins/matt.changes.md` 的映射補回，不是重新適配。
- `triage-labels.md` 的五角色表與 tracker 無關，原樣保留。
