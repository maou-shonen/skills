# matt → omp 替換

基底：`pins/matt.pin`（1.3.2，`mattpocock/skills` tag `v1.3.2`）。

只引 `domain-modeling` 相關鏈。grill 三件（`grilling` / `grill-me` / `grill-with-docs`）不引，用自家 `draft-a-task` / `draft-a-adr` 代（見 ADR-0009）。

| matt | omp |
|---|---|
| `Call the Skill tool with "X"`（本輪實際零命中：`to-*` 無此句式，只有 `draft-a-adr` 自撰句） | `Run the X skill`（即 `skill://X`，沿本地 `architect` 慣用語） |
| 每 skill 下的 `agents/openai.yaml`（純展示名） | 丟掉，本地 skill 無此目錄 |
| `setup-matt-pocock-skills` 寫 `CLAUDE.md` 優先 | 寫 `AGENTS.md`（本 repo 只有它） |
| `glab` / GitLab tracker 模板 | 刪，只留 `gh` + local（見 ADR-0010） |
| `triage` 未引 | Section B 自動跳過（上游本來就這麼設計），`triage-labels.md` 照收 |
| `implement` / `implement-spec`（`tdd` + `code-review` 引用） | 不引：`implement` 被 poteto Feature 覆蓋，`implement-spec` 等真有多 ticket 併發再說；`tdd` 維持 pstack 版一字不動 |
| frontmatter | 加 `layer` 與 `manual`；見 ADR-0014 |
| to-spec / to-tickets「Explore the codebase」 | 改為「dispatch a worker to explore and report back」：協調者不自己讀碼；見 ADR-0014 |
| `wizard`（`skills/engineering/wizard`） | 引為 coordinator（非 manual），`template.sh` 一字不動帶入。角色中立：範圍界定（步驟 1–2）由面對人的 agent 自己問，讀 repo 與撰寫／驗證腳本可自己做或派 worker；交付前自己讀過腳本；`agents/openai.yaml` 丟掉 |
| `to-questionnaire`（`skills/productivity/to-questionnaire`） | 引為 assistant、manual。輸出改寫到自己的 workspace，不寫進 repo；`agents/openai.yaml` 丟掉 |
| `retro`（`skills/engineering/retro`，pin 1.3.2 已含） | 引為 coordinator、manual。`writing-for-agents` 換 `unslop`；session logs 改 harness 歷史（on omp `history://`）；`CLAUDE.md` 改 `AGENTS.md`；reviewer agent + `CODING_STANDARDS.md` 對應到協調者審 worker diff（poteto-mode），判斷題規則提議寫進 review 會讀的 repo docs；選定後派 worker 實作；與 `reflect` 分工（reflect 改 skill、retro 改環境）；`agents/openai.yaml` 丟掉 |
| `research`（`skills/engineering/research`，pin 1.3.2） | 引為 shared，保留模型自動調用。「background agent」改「background worker」，括註 on omp 用 `task`；沒有 repo 時存自己的 workspace；加一句回報後先自己讀檔再轉述；`agents/openai.yaml` 丟掉 |

## 上游項目紀錄

`zx scripts/follow-matt.ts audit` 讀這張表：pin 上游每個 `skills/<分類>/<skill>` 要嘛在 `skills/follow-matt/` 有同名資料夾，要嘛在這裡有一列。狀態只能是 `adopted`、`skipped`、`deferred`（待使用者決定，audit 放行）。只跟 `skills/`；上游其他目錄（`.agents/`、`docs/`、`.claude-plugin/`、`GLOSSARY.md` 等）不跟、不列。

| 上游 | 狀態 | 原因 |
|---|---|---|
| `skills/engineering/ask-matt` | skipped | matt 全套 skill 的導引；我們只引一部分，導引會指向不存在的 skill |
| `skills/engineering/code-review` | skipped | 使用者認同 poteto 近來看法：agent review 多半浪費 token，且此 skill 偏重瑣碎挑剔（2026-11-03 決定） |
| `skills/engineering/diagnosing-bugs` | skipped | 與 pstack `principle-fix-root-causes` 和 poteto-mode 的除錯流程重疊 |
| `skills/engineering/grill-with-docs` | skipped | 用 `draft-a-adr` 代；見 ADR-0009 |
| `skills/engineering/implement` | skipped | 被 poteto Feature 覆蓋 |
| `skills/engineering/implement-spec` | skipped | 等真有多 ticket 併發再說 |
| `skills/engineering/improve-codebase-architecture` | deferred | 依賴 grill 鏈，且需先與 `architect` 比對分工；待使用者決定 |
| `skills/engineering/pr` | skipped | `technical-writing` 已涵蓋 PR 描述 |
| `skills/engineering/research` | adopted | `follow-matt/research`（PR #12） |
| `skills/engineering/tdd` | skipped | 與 pstack `tdd` 同名，留 pstack 版 |
| `skills/engineering/triage` | skipped | 不引；`setup-matt-pocock-skills` Section B 自動跳過 |
| `skills/engineering/wayfinder` | skipped | 與 `figure-it-out`、`to-tickets` 重疊 |
| `skills/engineering/wizard` | adopted | `follow-matt/wizard`（PR #14） |
| `skills/in-progress/chief-of-staff` | skipped | 上游實驗區 |
| `skills/in-progress/claude-handoff` | skipped | 上游實驗區，綁 Claude Code |
| `skills/in-progress/loop-me` | skipped | 上游實驗區 |
| `skills/in-progress/setup-ts-deep-modules` | skipped | 上游實驗區 |
| `skills/in-progress/writing-beats` | skipped | 上游實驗區 |
| `skills/in-progress/writing-fragments` | skipped | 上游實驗區 |
| `skills/in-progress/writing-shape` | skipped | 上游實驗區 |
| `skills/misc/git-guardrails-claude-code` | skipped | 綁 Claude Code hook（ADR-0011） |
| `skills/misc/migrate-to-shoehorn` | skipped | matt 課程專用 |
| `skills/misc/scaffold-exercises` | skipped | matt 課程專用 |
| `skills/misc/setup-pre-commit` | skipped | Husky 專用；retro 提「沒有 guardrail」時由 worker 依 repo 現況做 |
| `skills/productivity/grill-me` | skipped | 見 ADR-0009 |
| `skills/productivity/grilling` | skipped | 見 ADR-0009 |
| `skills/productivity/handoff` | skipped | 各 harness 有自己的交接與 history 機制 |
| `skills/productivity/teach` | skipped | 與 pstack `teach` 同名，留 pstack 版 |
| `skills/productivity/to-questionnaire` | adopted | `follow-matt/to-questionnaire`（PR #14） |
| `skills/productivity/wait-what` | skipped | 與 `bro` 重疊 |
| `skills/productivity/writing-for-agents` | skipped | 用 `unslop` 與 `technical-writing` 代（retro 已換） |
