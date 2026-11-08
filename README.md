# maou-shonen/skills

個人化的 agent skills，給 Grok Bot 與 coding agent（omp 等）用。以兩個上游為基礎做適配：

- **pstack**（`cursor/plugins` 的 `pstack/`）：orchestration、poteto 風格、驗證 playbook、`principle-*` 原則卡。版本見 `pins/pstack.pin`，機制映射見 `pins/pstack.changes.md`。
- **matt**（`mattpocock/skills`）：只跟 `skills/engineering/`（`to-questionnaire` 是唯一的例外）。版本見 `pins/matt.pin`，映射見 `pins/matt.changes.md`。
- **自撰**：`draft-a-task`、`draft-a-adr`（取代 matt 的 grill 系列）、`use-dev-environment`（Grok Bot 代管開發時怎麼操作 omp）。

## 安裝

```sh
npx skills add maou-shonen/skills            # 唯一 plugin，一次裝全部
npx skills add maou-shonen/skills -g -y      # 全域重裝全部
```

omp：

```bash
omp plugin marketplace add maou-shonen/skills
omp plugin install maou-dev@maou-shonen-skills
omp plugin marketplace update maou-shonen-skills && omp plugin upgrade   # 之後更新（有 version 就不具名全升）
```

誰裝什麼：Grok Bot 與 omp 都裝 `maou-dev`（全部 71 個）；`disable-model-invocation` 擋掉不該自動觸發的 skill（`manualSkills` 可再擋，見 `skills.md`）。

## 佈局

`skills/<來源>/`，一個上游一個資料夾（`pstack`、`matt`，自撰放 `own/`），只管上游追蹤。marketplace 只有一個 `maou-dev` plugin，全收 71 個，版本見 catalog `version`（`zx scripts/bump-version.ts` 自動 bump）。上游內容是 omp 適配版，不是原樣。安裝後扁平：skill 名全 repo 唯一，skill 間連結照上游寫 `../X/`。上游事實只在 `pins/<上游>.changes.md`（版本、機制映射、每項取捨）。
