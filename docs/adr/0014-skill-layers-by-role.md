# ADR-0014：skill 依角色分層，不依來源分組

- Status: Accepted
- Date: 2026-11-03

## Context

使用者有三條路：一般任務找一般 Grok Bot；代管開發找代管開發用的 Grok Bot，它透過 Herdr 操作 omp；直接開發就直接找 omp，omp 再派 subagent。真正協調開發的是 omp，Grok Bot 只需要懂「coding agent 怎麼用」，不需要懂「開發怎麼做」。原本按來源分裝，Grok Bot 因此裝到一堆只在寫程式時有用的 skill。

## Decision

每個 SKILL.md frontmatter 必填 `layer`，依「誰會用」分：

| layer | 裝在 | 內容 |
|---|---|---|
| `assistant` | Grok Bot（box） | 對話助理（bro、sharpen、in-your-own-words、ketchup、ketchup-video），以及代管開發時怎麼操作 coding agent（use-dev-environment：只教怎麼用 omp via Herdr，不教怎麼開發） |
| `dev-orchestrator` | 只 omp（使用者直接對話的 coding agent） | 派工、設計、寫 brief、驗證、說明程式（poteto-mode、swarm、to-spec、how、why、architect…） |
| `shared` | 全部 | 判斷與寫作原則（box 與 omp 都會用到才放這） |
| `dev-worker` | coding agent 與其 subagent | 只在寫程式時有用 |
| `none` | 不裝 | poteto-help |

另有 `manual: true` 標只由使用者叫起的 skill（`disable-model-invocation` 幾乎全開，不能兼用）。`manual: true` 的 skill 不能是 `dev-worker`；反過來，只在執行程式時有用、不會由使用者叫起也不用於派工驗收的 skill，不放 `dev-orchestrator` / `assistant`。

dev-orchestrator 與 shared 的內文只講角色與層級（「派一個 worker 回報」），harness 專屬寫法用「on omp, …」括註。poteto-mode 整份放 dev-orchestrator，只拿掉明確的 Cursor 綁定，不拆。

box 上的 skill 所有 Grok Bot 共用，無法按 bot 分裝，所以 box 裝 `assistant` + `shared`；`use-dev-environment` 的 description 收窄到「使用者委託寫程式／動 repo」才觸發，一般 bot 不會用到。

## Consequences

- 新 coding agent 加入時，只當執行者就裝 `dev-worker` + `shared`；也會被使用者直接使用就再加 `dev-orchestrator`。
