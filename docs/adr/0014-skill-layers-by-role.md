# ADR-0014：skill 依角色分層，不依來源分組

- Status: Accepted
- Date: 2026-11-03

## Context

Grok Bot 是個人助理兼協調者，不寫程式；omp 既協調也寫程式；之後 worker 可能換成別的 coding agent（例如 Claude Code 跑複雜、omp 跑簡單）。原本 marketplace 一個分類資料夾一個 plugin，誰裝什麼看來源，Grok Bot 因此裝到一堆只在寫程式時有用的 skill。

## Decision

每個 SKILL.md frontmatter 必填 `layer`，依「誰會用」分：

| layer | 裝在 | 內容 |
|---|---|---|
| `assistant` | 只 Grok Bot | 對話助理（bro、sharpen、in-your-own-words、ketchup、ketchup-video） |
| `coordinator` | Grok Bot + omp | 派工、寫 brief、追蹤、驗收（poteto-mode、swarm、arena、to-spec…） |
| `shared` | 全部 | 判斷與寫作原則 |
| `worker` | 只 coding agent | 只在寫程式時有用 |
| `none` | 不裝 | poteto-help |

另有 `manual: true` 標只由使用者叫起的 skill（`disable-model-invocation` 幾乎全開，不能兼用）。使用者不直接跟 worker 對話，所以 `manual: true` 的 skill 不能是 `worker`，只能放 `coordinator`、`assistant`，或兩端都用時放 `shared`（check-links 擋 `layer: worker` + `manual: true`）；反過來，只在執行程式時有用（實作、測試、語言慣例、驗證內部）、不會由使用者叫起也不用於派工驗收的 skill，不放 `coordinator` / `assistant`。（2026-11-03 補）marketplace 一個 layer 一個 plugin，plugin 名等於 layer，`none` 不列；`scripts/check-links.ts` 檢查。

coordinator 與 shared 的內文只講角色與層級（「派一個 worker 回報」），harness 專屬寫法用「on omp, …」括註，worker 換人時只改括註。poteto-mode 整份放 coordinator，只拿掉明確的 Cursor 綁定，不拆。

## Consequences

- `~/.agents/.skill-lock.json` 的 `pluginName` 會從分類名變成 layer 名，合併後整包重裝一次。
- Grok Bot 的 box sync 只同步 assistant、coordinator、shared。
- omp 這側 `skills add` 仍會裝全部四組，assistant 要另外排除（待辦）。
- 新 worker 加入時，只要裝 coordinator 以外的 worker + shared，或依它是否協調決定。
