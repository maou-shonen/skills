# ADR-0003：刪除模型家族前提，用獨立席位取代

- Status: Accepted
- Date: 2026-10-13

## Context

上游 panel skill（arena、interrogate、architect）的獨立性靠不同模型家族保證（claude 一席、grok 一席）。這台實際是單一錢包（opencode-go 訂閱為主），配不出雙家族；且 ADR-0001 之後 skill 無權選模型，家族無處可用。

## Decision

獨立性由席位隔離保證，不由模型保證：看不到彼此、同題盲做、結果各自回報。單家族照跑，不認弱也不停——人獨立就算數。

## Consequences

- 刪：arena runner 表、cross-judge pool、interrogate reviewer 表、architect runner 行、`different model family` 判準（eval、orchestrate、show-me-your-work）。
- 替代：interrogate 的 Reviewer A/B 改按 lens 分工（見 ADR-0007，承認降級）。
- 將來有多錢包時，席位可綁不同配置，skill 文字不用改。
