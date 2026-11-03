# maou-shonen/skills

個人化的 agent skills，給 Grok Bot 與 coding agent（omp 等）用。以兩個上游為基礎做適配：

- **pstack**（`cursor/plugins` 的 `pstack/`）：orchestration、poteto 風格、驗證 playbook、`principle-*` 原則卡。版本見 `pins/pstack.pin`，機制映射見 `pins/pstack.changes.md`。
- **matt**（`mattpocock/skills`）：只取 `domain-modeling` 相關鏈（`domain-modeling`、`codebase-design`、`prototype`、`to-spec`、`to-tickets`、`setup-matt-pocock-skills`）。版本見 `pins/matt.pin`，映射見 `pins/matt.changes.md`。
- **自撰**：`draft-a-task`、`draft-a-adr`（取代 matt 的 grill 系列，見 ADR-0009）、`use-dev-environment`（Grok Bot 代管開發時怎麼操作 omp）。
- **提煉自 yui540**：`css-transitions`，CSS 轉場技巧收錄。美學筆記在 `skills/inspired-yui540/README.md`，暫不給 agent 用。

## 安裝

```sh
npx skills add maou-shonen/skills            # 互動選擇，依 layer 分組
npx skills add maou-shonen/skills -g -y      # 全域重裝全部（plugin 改名後用這個）
```

`.claude-plugin/marketplace.json` 每個 layer 一個 plugin，plugin 名等於 layer，互動安裝時依此分組挑選，見 ADR-0014。要單裝某幾個用 `-s <skill>`。協調層（omp）的入口是 `/poteto-mode`。

誰裝什麼：一般 Grok Bot 與代管開發 Grok Bot 共用 box，裝 `assistant` + `shared`；omp 裝 `coordinator` + `worker` + `shared`；omp subagent 只用 `worker`。

## 分層

| layer | 裝在哪 | 數量 | 成員 |
|---|---|---|---|
| `assistant` | Grok Bot（box） | 7 | bro、in-your-own-words、ketchup、ketchup-video、sharpen、to-questionnaire、use-dev-environment（代管開發時怎麼用 omp，不教怎麼開發） |
| `coordinator` | omp | 28 | poteto-mode、draft-a-task、draft-a-adr、to-spec、to-tickets、retro、wizard、swarm、arena、figure-it-out、principle-guard-the-context-window、teach、interrogate、recall、blast-radius、correct、create-verification-skill、maintain-verification-skill、create-formal-verification-skill、maintain-formal-verification-skill、setup-pstack、setup-matt-pocock-skills、how、why、statechart、architect、benchmark-checklist、domain-modeling |
| `shared` | 全部 | 13 | research、automate-me、make-bot-ui、reflect、show-me-your-work、technical-writing、unslop、`principle-*`（attack-the-premise、experience-first、explain-the-number、never-block-on-the-human、prove-it-works、sequence-verifiable-units） |
| `worker` | omp 與其 subagent | 23 | 見 [`marketplace.json`](.claude-plugin/marketplace.json) |
| `none` | 不安裝 | 1 | poteto-help |

`manual: true` 的 skill 只由使用者以 `/名稱` 叫用，agent 不自動觸發。

## 結構

| 路徑 | 內容 |
|---|---|
| `skills/<分類>/` | 每個 skill 一個資料夾，`SKILL.md` 的 `name` 與資料夾同名，frontmatter 帶 `layer`（必填）與 `manual`（選填）。分類（`follow-pstack`、`follow-matt`、`compat-omp`、`own`）只在 repo 裡，安裝後扁平，見 [`docs/layout.md`](docs/layout.md) |
| `docs/layout.md` | 分類規則與上游路徑對應 |
| `pins/` | 上游版本與機制映射 |
| `docs/adr/` | 權衡決策（刪、降級、暫不支持），一決策一檔 |
| `scripts/follow-*.ts` | 對上游算漂移，`--port` 輸出本地路徑的補丁（zx） |
| `scripts/check-links.ts` | 以扁平安裝檢查 skill 內相對連結；並查 frontmatter `layer` 必填且合法、`manual` 只能是 `true`、plugin 名等於 layer、`none` 不列入 plugin、manual 不能是 worker（zx） |
| `.github/workflows/validate.yml` | push 與 PR 時跑 `check-links.ts` |
| `.github/workflows/follow-upstream.yml` | 每日 09:00（台北）檢查漂移，有差異開 issue，不改檔 |

維護規則見 [`AGENTS.md`](AGENTS.md)。
