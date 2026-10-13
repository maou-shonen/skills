# ADR-0006：拆除 adapter 層，死鏈直寫

- Status: Accepted
- Date: 2026-10-13

## Context

匯入時經過 pstack-omp 的 `omp-mechanics` / `pstack-omp` adapter 轉寫，引用鏈指向本 repo 不存在的 skill（`skill://omp-mechanics`、`skill://pstack-omp`）。讀到即斷頭。

## Decision

Adapter 層全拆。引用改成這台實際有的寫法（`task`、`ask`、`history://`、`hub`、內建 skill 名），不經中轉。轉寫規則沉澱進 `pins/pstack.changes.md` 機制表，不留中間 skill。

## Consequences

- 刪：how、why、reflect、setup-pstack、poteto-mode 內的 adapter 引用。
- pstack-omp 上游仍是對照來源（`~/.omp/plugins/cache/`），但不是依賴。
