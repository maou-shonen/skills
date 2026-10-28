# ADR-0007：interrogate 雙 lens 是降級替代，承認

- Status: Superseded by ADR-0012
- Date: 2026-10-13

## Context

上游 interrogate 的雙視角靠不同模型自然帶來（claude 看設計、grok 摳正確性）。ADR-0001/0003 之後模型不可選，雙視角沒了來源。

## Decision

用 brief 內 lens 分工替代：Reviewer A 看正確性與盲點，B 看設計與可維護性。同一份 reviewer-prompt 模板，不同 lens 段。這是降級——同模型同底，lens 分再細也補不回不同先驗。

## Consequences

- 評分邏輯從「不同模型同時提才是強信號」換成「不同席位獨立提才是強信號」（Step 4、lead-judgment、Output 全換）。
- 將來有多錢包時，A/B 綁不同配置即回升，文字不用改。
- 不假裝 lens 等於 diversity。skill 開頭寫明信號來自隔離盲審。
