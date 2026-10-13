# ADR-0004：預算四檔暫不支持，setup-pstack 改成配置鏡子

- Status: Accepted
- Date: 2026-10-13

## Context

上游 `setup-pstack` 四檔預算調 slug 的 effort 段（max/xhigh/high/medium）。前提是額度無限。這台配額差十倍起跳、每週重置，調 effort 不解決「燒哪家錢」的問題，反而誤導。

## Decision

預算暫不支持。`setup-pstack` 改成鏡子：三個命令（`omp models`、`modelRoles`、`agentModelOverrides`）攤開現況，逐 role 問用戶綁哪個別名，只寫別名不寫 slug。錢包分組（訂閱/按量/免費）靠人眼，不假裝機器能分。

## Consequences

- 刪：四檔問卷、effort ladder、panel 席位數行、按量改寫、verification skill 推銷。
- 錢包感知設計是未來課題， delivering 前預算控制歸操作員的 pane 和 `modelRoles`。
- `poteto-help` 成本段只指回本 skill，不重複描述（單一事實來源）。
