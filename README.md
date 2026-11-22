# maou-shonen/skills

個人化的 agent skills。一個 harness 一個 plugin，彼此獨立、各自整包安裝：

| plugin | 目錄 | harness | 狀態 |
|---|---|---|---|
| `maou-dev` | `plugins/omp/` | oh-my-pi（omp） | 使用中 |
| （未定） | `plugins/claude/` | Claude Code | 骨架，尚未列入 marketplace |

兩個 plugin 共用上游追蹤（`pins/`、`scripts/`），內容不互相引用：plugin 安裝時只複製自己的目錄，跨 plugin 的路徑會斷。

上游：

- **pstack**（`cursor/plugins` 的 `pstack/`）：orchestration、poteto 風格、驗證 playbook、`principle-*` 原則卡。版本見 `pins/pstack.pin`，omp 版的機制映射見 `pins/pstack.changes.md`。
- **matt**（`mattpocock/skills`）：只跟 `skills/engineering/`（`to-questionnaire` 是唯一的例外）。版本見 `pins/matt.pin`，omp 版的映射見 `pins/matt.changes.md`。
- **自撰**：`align`、`align-adr`（取代 matt 的 grill 系列）、`deliver`（主 agent 委派實作與審核 agent，把共識好的目標落地，有沒有 issue 都可）。

## 安裝（omp）

```bash
omp plugin marketplace add maou-shonen/skills
omp plugin install maou-dev@maou-shonen-skills
omp plugin marketplace update maou-shonen-skills && omp plugin upgrade   # 之後更新（有 version 就不具名全升）
```

`npx skills add` 會掃到每個 plugin 的 skill，Claude 版有內容後會出現同名衝突，不再建議使用。
