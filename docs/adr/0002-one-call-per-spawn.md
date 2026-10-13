# ADR-0002：一任務一調用，不用批量 tasks[]

- Status: Accepted
- Date: 2026-10-13

## Context

上游並行派生包進一個 Task 調用的 `tasks[]`，共享 `context`。omp 的 `task.batch` 默認開著，同樣支持。但 `context` 渲染進每一席的 system prompt，寫一次 N 席各付一次，加上父席一次背 N 份 brief，省打字燒 token。

## Decision

一律一任務一調用。每席自己的 brief、乾淨上下文。獨立席位同時發 natural 並行。有先後依賴拆步：上一步結果寫進下一步 brief 再發。寧可重複背景，不共髒上下文。

## Consequences

- 刪：arena、swarm、interrogate、reflect、how、why、poteto-mode 的批量寫法（`tasks[]`、`in a single message`、`batched in parallel`）。
- `task.batch` 開關本身不動，真有原子同生同滅需求還能用，但目前無此需求。
- 共享背景走 `local://` 檔案各席自讀，不走 `context`。
