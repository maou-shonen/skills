# matt（Claude Code）

本檔記 Claude Code plugin（`plugins/claude/`，plugin 名 `maou-claude`）的取捨，與 omp 版（`pins/matt.changes.md`）分開。只跟 `skills/engineering/`，`to-questionnaire` 是唯一的例外。

路徑：上游 `skills/<分類>/X` 對本地 `plugins/claude/skills/X`（攤平；`scripts/matt.ts --claude diff --port` 已轉好，可直接 `git apply --reject`）。

`audit`（`scripts/matt.ts --claude audit`）讀最新版本節：上游 `skills/engineering/` 每個 skill 要嘛在本地有 frontmatter `metadata.source: matt` 的同名資料夾，要嘛在不引／待定有名。

原則：matt 本來就是 Claude Code 原生，以上游原文為準；只做「和 pstack、自撰接起來」的適配。pstack 已涵蓋的流程留 pstack，matt 用在 issue／spec／ticket 流程與領域建模。

## 1.3.2

基底：`pins/matt-claude.pin`，tag `v1.3.2`。首次引入。

- 每個 SKILL.md frontmatter 加 `metadata.source: matt`：Claude 版攤平在同一層，audit 靠它分辨來源。
- 每 skill 下的 `agents/openai.yaml`（純展示名）→ 丟掉。
- `triage` 的 grill 步驟（Skill tool 叫 `grilling`、`domain-modeling`）→ 讀 `align-adr` 照做（它就是 align＋domain-modeling）。`align-adr` 設了 `disable-model-invocation`，Skill tool 叫不到，所以用相對連結讀檔，與上游 pstack adapter 的做法一致。
- `improve-codebase-architecture` 的 grilling 迴圈改讀 `align-adr`，描述與小節標題的 grill 字樣同改；呼叫 `codebase-design` 的 Skill tool 原樣（上游讓它可被模型呼叫）。
- `setup-matt-pocock-skills/domain.md` 的 `/grill-with-docs` → `/align-adr`。
- `retro` 的 `writing-for-agents`（未引入）→ pstack `unslop`；改 skill 的建議交給 pstack `reflect`，開頭加一句分工。
- 派 subagent 的地方標上 tier（表在 pstack `poteto-mode` 的 Subagents）：`research` 的背景 agent、`improve-codebase-architecture` 的探索 agent 走 default；`codebase-design` design-it-twice 的平行 sub-agent 走 deep。沒標的話這些 spawn 不會讀到 tier 表，會跟著主 session 的模型跑。
- `setup-matt-pocock-skills` 的兩份 issue-tracker 範本刪 `## Wayfinding operations` 節：只給未引入的 `wayfinder` 用，範本會被抄進使用者 repo 成為雜訊。
- `setup-matt-pocock-skills` 刪 GitLab（`glab` 與 `issue-tracker-gitlab.md`）：沒有需求，真要時從上游原樣拿回。`CLAUDE.md` 優先的邏輯照上游保留（omp 版才改成只寫 `AGENTS.md`）。

引：

- `codebase-design`、`domain-modeling`、`improve-codebase-architecture`、`prototype`、`research`、`retro`、`setup-matt-pocock-skills`、`to-spec`、`to-tickets`、`triage`、`wizard`
- `skills/productivity/to-questionnaire`（唯一的例外，已引入）

不引：

- `ask-matt`：全套導引，會指向未引入的 skill。
- `code-review`：Claude Code 內建 `/code-review`，加上 pstack `interrogate`。
- `diagnosing-bugs`：pstack Bug fix 劇本與 `principle-fix-root-causes` 已涵蓋。
- `grill-with-docs`：用自撰 `align` / `align-adr` 代。
- `implement`：pstack Feature 劇本已涵蓋。
- `implement-spec`：併入自撰 `deliver`（Claude 版的 Current tools 吸收它的派工做法：試跑一張、依 ready set 展開、共用筆記放 repo 外）。合併方式維持 `deliver` 的一單元一 PR，不用 integration branch。上游改它時看 diff 挑改進搬進 `deliver`。
- `pr`：pstack `technical-writing` 已涵蓋 PR 描述。
- `tdd`：與 pstack `tdd` 同名，留 pstack 版（劇本會呼叫）。
- `wayfinder`：與 pstack `figure-it-out`、`to-tickets` 重疊。
