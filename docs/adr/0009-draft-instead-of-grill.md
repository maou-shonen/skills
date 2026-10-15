# ADR-0009：grill 拷問鏈不引，用 draft-a-task / draft-a-adr 代

- Status: Accepted
- Date: 2026-10-16

## Context

matt 的 `grilling` / `grill-me` / `grill-with-docs` 是 relentless interview：design tree 全 frontier 輪詢，每輪等用戶答完才推進。用戶已有自撰簡化版 `draft-a-task`（只問 load-bearing，高信心自動決、silence=accept）與 `draft-a-adr`（結構同 `grill-with-docs`，入口換成 `draft-a-task` + `domain-modeling`）。

## Decision

grill 三件不引。`draft-a-task` / `draft-a-adr` 從 dotfiles 晉升進 `skills/`，成為本 repo 的共識入口。

## Consequences

- 降級：少 design-tree 嚴謹性，複雜設計可能漏分支。換來速度：簡單事一輪過，不被拷問。
- `draft-a-task` 是全 repo 唯一 `disable-model-invocation: false`（53 個 `true` 中唯一的例外），模型動工前可主動調用。過度觸發靠 description 觸發語句約束，不加新機制。
- 將來遇到真需要拷問的大設計，再考慮引 `grilling`。
