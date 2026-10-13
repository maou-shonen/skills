# ADR-0001：刪除逐次 model 選擇，模型歸配置

- Status: Accepted
- Date: 2026-10-13

## Context

上游每個 skill 用 Task 的 `model` 欄位逐次指定模型，配 `pstack-models.mdc` 表。這台 omp 的 task 沒有 `model` 欄位。

## Decision

Skill 內不選模型。每個 spawn 跑用戶配置給的模型，未配置跑父模型。跨 skill 需要區分角色時，用 agent 名 + `task.agentModelOverrides` 條目隔離。

## Consequences

- 刪：how、why、reflect、arena、swarm、interrogate、poteto-mode（含 5 個 playbook）、architect 內的逐次選模型段、`omit model`、`reject` fallback、`claude-*`/`grok-*` 前綴家族。
- 替代：`setup-pstack` 改成只寫別名不寫 slug 的鏡子（見 ADR-0004）。
- skill 側永遠不出現 slug。slug 只活在 `modelRoles`。
