# ADR-0013：spawn 依三層 agent 選，不逐次判斷 seat

- Status: Accepted
- Date: 2026-11-01

## Context

poteto-mode 的「Match the seat to the job」要 agent 每次 spawn 前自己判斷升降 seat，實際上讓 agent 在 spawn 前反覆猶豫。omp 的模型是綁在 agent 上的：bundled `sonic` 用 `@smol`、`task` 用 `@task`（未設即父模型），使用者 agent 放 `~/.omp/agent/agents/*.md`，`model: "@<role>"` 經 `modelRoles` 解析；`task.agentModelOverrides.<agent>` 可蓋掉（oh-my-pi `docs/task-agent-discovery.md`、`packages/coding-agent/src/task/agents.ts`）。缺的是判斷層。

## Decision

固定三層：機械 → `sonic`，一般程式 → `task`，判斷／最難 → `deep`（使用者自建，`model: "@deep"`）。沒有 `deep` 時退回 `task`，提醒一次，不中止。`setup-pstack` 只檢查這三個 agent 解析到的模型，缺 `deep` 時用 `templates/deep.md` 建；模板內文原文複製 omp 內建 `task.md`（omp 的 agent 檔不能繼承內建 prompt），只換模型，omp 更新 `task.md` 時要重新同步。

## 與 ADR-0001 的關係

不衝突。ADR-0001 禁的是 skill 逐次指定模型；這裡 skill 指定的是 agent 名，模型仍只在 agent 檔、`modelRoles` 與 `task.agentModelOverrides` 裡，skill 側不出現 slug。

## Consequences

- 刪掉 poteto-mode 的逐次升降 seat 指示，改成一張表。
- 路由型 skill（how、why、interrogate、reflect、swarm）自帶的 agent 不變；層級只在步驟沒指定 agent 時生效。
- 舊的「每角色一行 `agentModelOverrides`」不再寫；`agentModelOverrides` 只用來重定向 `sonic` / `task`。
