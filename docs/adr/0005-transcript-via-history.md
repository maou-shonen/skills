# ADR-0005：transcript 走 history://，刪除盤路徑

- Status: Accepted
- Date: 2026-10-13

## Context

上游讀 `~/.cursor/projects/<slug>/agent-transcripts/` 落盤 JSONL，還要處理三種佈局（flat/nested/subagents）+ 首行匹配。這台 omp 有 `history://`、`agent://` 內部 URI，bare 列席位、`<id>` 翻頁。

## Decision

一律走 `history://`、`agent://`。不讀落盤，不跨 session。落盤路徑（`~/.omp/agent/sessions/<encoded-cwd>/`）只在診斷時由人看，skill 不寫。

## Consequences

- 刪：recall、reflect（含 automate-me 等引用處）的落盤 glob、三佈局處理、首行匹配。
- 跨 workspace 邊界規則保留：只讀本會話，不讀別人的。
