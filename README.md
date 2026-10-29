# maou-shonen/skills

個人化的 agent skills，跑在 omp 上。以兩個上游為基礎做適配：

- **pstack**（`cursor/plugins` 的 `pstack/`）：orchestration、poteto 風格、驗證 playbook、`principle-*` 原則卡。版本見 `pins/pstack.pin`，機制映射見 `pins/pstack.changes.md`。
- **matt**（`mattpocock/skills`）：只取 `domain-modeling` 相關鏈（`domain-modeling`、`codebase-design`、`prototype`、`to-spec`、`to-tickets`、`setup-matt-pocock-skills`）。版本見 `pins/matt.pin`，映射見 `pins/matt.changes.md`。
- **自撰**：`draft-a-task`、`draft-a-adr`（取代 matt 的 grill 系列，見 ADR-0009）。
- **提煉自 yui540**：`css-transitions`，CSS 轉場技巧收錄。美學筆記在 `skills/inspired-yui540/README.md`，暫不給 agent 用。

## 安裝

```sh
npx skills add maou-shonen/skills
```

`npx skills add` 依 `.claude-plugin/marketplace.json` 分成四組：`follow-pstack`、`follow-matt`、`inspired-yui540`、`own`（一個分類資料夾一組）。入口從 `/poteto-help` 開始。

## 結構

| 路徑 | 內容 |
|---|---|
| `skills/<分類>/` | 每個 skill 一個資料夾，`SKILL.md` 的 `name` 與資料夾同名。分類（`follow-pstack`、`follow-matt`、`compat-omp`、`own`）只在 repo 裡，安裝後扁平，見 [`docs/layout.md`](docs/layout.md) |
| `docs/layout.md` | 分類規則與上游路徑對應 |
| `pins/` | 上游版本與機制映射 |
| `docs/adr/` | 權衡決策（刪、降級、暫不支持），一決策一檔 |
| `scripts/follow-*.ts` | 對上游算漂移，`--port` 輸出本地路徑的補丁（zx） |
| `scripts/check-links.ts` | 以扁平安裝檢查 skill 內相對連結（zx） |
| `.github/workflows/validate.yml` | push 與 PR 時跑 `check-links.ts` |
| `.github/workflows/follow-upstream.yml` | 每日 09:00（台北）檢查漂移，有差異開 issue，不改檔 |

維護規則見 [`AGENTS.md`](AGENTS.md)。
