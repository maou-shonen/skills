# ADR-0011：pstack 0.15.26–0.15.28 的 Claude Code 段與 setup 推薦步驟不引

- Status: Accepted
- Date: 2026-10-25

## Context

pstack 0.15.28 在 `poteto-help` 加了 Claude Code 安裝段（`/plugin marketplace add cursor/plugins`、`pstack:` 前綴、`docs/harness/claude-code.md` adapter），並在 `setup-pstack` 加第 8 步「推薦生成 formal verification skill」。本地 `setup-pstack` 已重寫成看 omp 配置的鏡子，沒有上游第 6/7 步的推薦流程；這台也不用 Claude Code。

## Decision

- `poteto-help` 的 Claude Code 安裝段不引；引用的 `docs/harness/claude-code.md` 本 repo 也沒有。
- `setup-pstack` 第 8 步不引，維持鏡子定位；`poteto-help` 第 2 點「setup 會推薦 verification skill」的句子一併不引。
- 兩個 formal verification skill 本體照引，入口改由 `poteto-help` 的提示行與路由表提供。

## Consequences

- 想要 setup 主動推薦時，要連同第 7 步一起補回，不只補第 8 步。
- 將來真用 Claude Code，從上游 0.15.28 的 `poteto-help` 補回該段。
