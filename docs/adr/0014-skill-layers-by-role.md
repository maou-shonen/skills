# ADR-0014：skill 依角色分層，不依來源分組

- Status: Accepted
- Date: 2026-11-03

## Context

Grok Bot 是個人助理兼協調者，不寫程式；omp 既協調也寫程式；之後 worker 可能換成別的 coding agent（例如 Claude Code 跑複雜、omp 跑簡單）。原本 marketplace 一個分類資料夾一個 plugin，誰裝什麼看來源，Grok Bot 因此裝到一堆只在寫程式時有用的 skill。

## Decision

每個 SKILL.md frontmatter 必填 `layer`，依「誰會用」分：

| layer | 裝在 | 內容 |
|---|---|---|
| `assistant` | Grok Bot（box） | 對話助理（bro、sharpen、in-your-own-words、ketchup、ketchup-video），以及代管開發時怎麼操作 coding agent（use-dev-environment：只教怎麼用 omp via Herdr，不教怎麼開發） |
| `dev-orchestrator` | 只 omp（使用者直接對話的 coding agent） | 派工、設計、寫 brief、驗證、說明程式（poteto-mode、swarm、to-spec、how、why、architect…） |
| `shared` | 全部 | 判斷與寫作原則（box 與 omp 都會用到才放這） |
| `dev-worker` | coding agent 與其 subagent | 只在寫程式時有用 |
| `none` | 不裝 | poteto-help |

另有 `manual: true` 標只由使用者叫起的 skill（`disable-model-invocation` 幾乎全開，不能兼用）。使用者不直接跟 worker 對話，所以 `manual: true` 的 skill 不能是 `dev-worker`，只能放 `dev-orchestrator`、`assistant`，或兩端都用時放 `shared`（check-links 擋 `layer: dev-worker` + `manual: true`）；反過來，只在執行程式時有用（實作、測試、語言慣例、驗證內部）、不會由使用者叫起也不用於派工驗收的 skill，不放 `dev-orchestrator` / `assistant`。（2026-11-03 補）marketplace 一個 layer 一個 plugin，plugin 名等於 layer，`none` 不列；`scripts/check-links.ts` 檢查。

dev-orchestrator 與 shared 的內文只講角色與層級（「派一個 worker 回報」），harness 專屬寫法用「on omp, …」括註，worker 換人時只改括註。poteto-mode 整份放 dev-orchestrator，只拿掉明確的 Cursor 綁定，不拆。

### 2026-11-04 修訂：Grok Bot 不再是協調層；layer 改名

使用者有三條路：一般任務找一般 Grok Bot；代管開發找代管開發用的 Grok Bot，它透過 Herdr 操作 omp；直接開發就直接找 omp。omp 再派 subagent。真正協調開發的是 omp，Grok Bot 只需要懂「coding agent 怎麼用」，不需要懂「開發怎麼做」。

- box 上的 skill 所有 Grok Bot 共用，無法按 bot 分裝，所以 box 裝 `assistant` + `shared`；`use-dev-environment` 放 `assistant`，description 收窄到「使用者委託寫程式／動 repo」才觸發，一般 bot 不會用到。
- layer 改名：`coordinator` → `dev-orchestrator`、`worker` → `dev-worker`，名字直接說明是開發用的；marketplace plugin 名跟著改。
- `dev-orchestrator` 不再裝到 box，只裝 omp；omp 裝 `dev-orchestrator` + `dev-worker` + `shared`；omp subagent 只要 `dev-worker`。
- `use-dev-environment` 放 `assistant`，主機、連線方式、git 身分、repo／worktree 位置放使用者本地的 `dev-environment-info` skill（不進本 repo）；沒有時由 bot 問使用者後建立。
- `shared` 只留 box 與 omp 都用得到的；how、why、statechart、architect、benchmark-checklist、domain-modeling、draft-a-adr 移到 `dev-orchestrator`。
- `manual: true` 不能是 `dev-worker` 的規則不變（manual skill 可放 assistant、dev-orchestrator、shared）。

## Consequences

- `~/.agents/.skill-lock.json` 的 `pluginName` 會從分類名變成 layer 名，合併後整包重裝一次。
- Grok Bot 的 box sync 只同步 assistant、shared（2026-11-04 起；之前含 coordinator，即現在的 dev-orchestrator）。box 上已同步過的 dev-orchestrator skill 要移除。
- omp 這側 `skills add` 仍會裝全部，assistant 要另外排除（待辦）。
- 新 coding agent 加入時，只當執行者就裝 `dev-worker` + `shared`；也會被使用者直接使用就再加 `dev-orchestrator`。
- `pluginName` 從 coordinator／worker 變成 dev-orchestrator／dev-worker，已安裝的要整包重裝。
- （2026-11-04 補）omp 不讀 marketplace 的 `skills` 清單，只掃 plugin 根下的 `skills/<name>/SKILL.md` 一層，`source: ./` 的寫法在 omp 一個 skill 都載不到。omp 改用 `.omp-plugin/marketplace.json`（omp 先讀它，再讀 `.claude-plugin/`），每個 layer 一個 `plugins/<layer>/`，裡面 `skills/<name>` 是從 `skills/<分類>/<name>` 整個複製的產物（不用 symlink，omp 裝完不依賴 repo 或 npx skills），由 `scripts/gen-omp-plugins.ts` 依 layer 產生；內容有變時自動升該 plugin 的 patch version，omp 才會重抓。`.claude-plugin/marketplace.json` 照舊給 `npx skills`。
