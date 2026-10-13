# ADR-0008：對等機制直換，不經決策

- Status: Accepted
- Date: 2026-10-13

## Context

上游大量引用 Cursor 專有機制（路徑、欄位名、工具名、外掛、cloud），這台 omp 都有現成對等物。替換不改變流程語意，不需要權衡。

## Decision

對等物直換，不開逐件 ADR。映射表收在 `pins/pstack.changes.md`，改動即表格的行，不另記原因。後續跟進上游時同理：純對等替換只更新表格，不寫 ADR。

## Consequences

- 26 檔：`.cursor/` 路徑、`subagent_type`、`AskQuestion`、`create-skill`、control-ui/cli、cloud/environment、transcript 桶、`/loop`、Bugbot 泛化、package 改名。
- 例外：`create-skill`→authoring-a-skill、`control-*`→browser/hub、`Bugbot`→security-reviewer 雖是替代品不是嚴格對等，但語意無損，歸入本層不另立 ADR。
- 需要權衡的（模型選擇、批量語意、家族、預算）不在本層，各有專屬 ADR（0001–0004、0007）。
