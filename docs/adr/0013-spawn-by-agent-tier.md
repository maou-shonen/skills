# ADR-0013：spawn 依三層 agent 選，不逐次判斷 seat

- Status: Accepted
- Date: 2026-11-01

## Context

poteto-mode 的「Match the seat to the job」要 agent 每次 spawn 前自己判斷升降 seat，實際上讓 agent 在 spawn 前反覆猶豫。omp 的模型綁在 agent 上，缺的是判斷層。

## Decision

固定三層：機械 → `sonic`，一般程式 → `task`，判斷／最難 → `deep`（使用者自建）。沒有 `deep` 時退回 `task`，提醒一次，不中止。`setup-pstack` 只檢查這三個 agent 解析到的模型，缺 `deep` 時用 `templates/deep.md` 建。

## 與 ADR-0001 的關係

不衝突。ADR-0001 禁的是 skill 逐次指定模型；這裡 skill 指定的是 agent 名，模型仍只在 agent 檔、`modelRoles` 與 `task.agentModelOverrides` 裡，skill 側不出現 slug。

## Consequences

- 刪掉 poteto-mode 的逐次升降 seat 指示，改成一張表。
- 路由型 skill（how、why、interrogate、reflect、swarm）自帶的 agent 不變；層級只在步驟沒指定 agent 時生效。
- `setup-pstack` 不再寫每角色一行。
- 全部 skill 的「seat」用詞改成 tier（sonic / task / deep），agent 一看就懂。
- swarm 拿掉 model race：使用者不跑模型比賽，swarm 只依層級 spawn。
- `how` 維持上游：所有 spawn 都是 `task`，explainer 不升 `deep`。
