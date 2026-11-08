# maou-shonen/skills

個人化的 agent skills，給 Grok Bot 與 coding agent（omp 等）用。以兩個上游為基礎做適配：

- **pstack**（`cursor/plugins` 的 `pstack/`）：orchestration、poteto 風格、驗證 playbook、`principle-*` 原則卡。版本見 `pins/pstack.pin`，機制映射見 `pins/pstack.changes.md`。
- **matt**（`mattpocock/skills`）：只取 `domain-modeling` 相關鏈（`domain-modeling`、`codebase-design`、`prototype`、`to-spec`、`to-tickets`、`setup-matt-pocock-skills`）。版本見 `pins/matt.pin`，映射見 `pins/matt.changes.md`。
- **自撰**：`draft-a-task`、`draft-a-adr`（取代 matt 的 grill 系列，見 ADR-0009）、`use-dev-environment`（Grok Bot 代管開發時怎麼操作 omp）。

## 安裝

```sh
npx skills add maou-shonen/skills            # 互動選擇，依 layer 分組
npx skills add maou-shonen/skills -g -y      # 全域重裝全部
```

omp（只裝要的 layer）：

```bash
omp plugin marketplace add maou-shonen/skills
omp plugin install dev-orchestrator@maou-shonen-skills dev-worker@maou-shonen-skills shared@maou-shonen-skills
omp plugin marketplace update maou-shonen-skills && omp plugin upgrade   # 之後更新
```

誰裝什麼：Grok Bot 裝 `assistant` + `shared`；omp 裝 `dev-orchestrator` + `dev-worker` + `shared`；omp subagent 只用 `dev-worker`。
