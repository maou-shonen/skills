# pstack → omp 替換

基底：`pins/pstack.pin`（0.15.36）。

路徑：上游 `pstack/skills/X` 對本地 `skills/follow-pstack/X`（`diff --port` 已轉好，可直接 `git apply --reject`）。

| Cursor | omp |
|---|---|
| `Task`（`model` / `subagent_type` / `readonly` / `run_in_background`、`tasks[]` 批量） | 一任務一調用（見 ADR-0002）；不選模型（見 ADR-0001），`agent` 選角色；唯讀寫在 brief，不是欄位 |
| `~/.cursor/rules/pstack-models.mdc` | `~/.omp/agent/config.yml` 的 `task.agentModelOverrides` / `modelRoles`；`setup-pstack` 是只寫別名的鏡子（見 ADR-0001、ADR-0004） |
| `setup-pstack` 第 8 步「推薦生成 formal verification skill」 | 不引（本地是 omp 配置鏡子，沒有上游第 6/7 步流程；要推薦時連第 7 步一起補） |
| cloud agent、`environment`、`cloud_base_branch` | 本機 `isolated: true` |
| `~/.cursor/projects/.../agent-transcripts` | 程序內用 `history://`、`agent://`；落盤 `~/.omp/agent/sessions/<encoded-cwd>/`（`worktree-audit.sh` 掃這個桶） |
| `AskQuestion` | `ask` |
| `/loop` 會話外喚醒 | `hub` watcher 或 systemd user timer |
| `control-ui` / `control-cli` / `deslop`（`cursor-team-kit`） | `browser` / `computer`（eval prelude）、`hub` 加 bash、`skill://unslop` 加 `omp cleanse --all` |
| Cursor `create-skill` | `playbooks/authoring-a-skill.md`；`manage_skill` 只寫 `~/.omp/agent/managed-skills` |
| `~/.cursor/skills/` | `skill://`，裝在哪裡就解析到哪裡 |
| Graphite `gt` | 不要求；單 PR 走 `gh`，`command -v origin` 成功才用 Origin |
| `poteto-help` 連 pstack repo 的相對路徑 | 絕對網址（本 repo 沒有那些文件，安裝後是扁平的） |
| `poteto-help` 的 Claude Code 安裝段（+`docs/harness/claude-code.md`） | 不引（不用 Claude Code；要用時從上游 0.15.28 原樣補回該段） |
| `pstack/agents/*.md`（Cursor plugin agents） | `setup-pstack/templates/*.md`，由 `setup-pstack` 裝到 `~/.omp/agent/agents/`（omp agent 格式，跑 `@task`） |
| verification skill 專案路徑 `.cursor/skills/verify-*/` | `.omp/skills/verify-*/`（omp 專案層 skill 目錄） |
| frontmatter `paths:` | `globs:`（omp 規則的檔案比對欄位） |
| frontmatter 與措辭 | 加 `layer` 與 `manual`；內文只講角色與層級，harness 寫法用「on omp, …」括註；worker 不直接面對使用者；Cursor 專屬措辭改中性（`any other X`、`On a coding worker…`）；見 ADR-0014 |

## 上游項目紀錄

`zx scripts/follow-pstack.ts audit` 讀這張表：pin 上游每個 `pstack/skills/<skill>` 要在 `skills/follow-pstack/` 有同名資料夾，`pstack/agents/*`、`pstack/automations/*` 要在這裡有一列。狀態只能是 `adopted`、`skipped`、`deferred`（deferred＝待使用者決定，audit 放行但提醒）。`pstack/docs/`、`assets/`、`README.md` 不跟、不列（`poteto-help` 改連網址；Claude Code 段見上表）。

| 上游 | 狀態 | 原因 |
|---|---|---|
| `pstack/agents/poteto-agent.md` | adopted | `setup-pstack/templates/poteto-agent.md` |
| `pstack/agents/comment-sicko.md` | adopted | `setup-pstack/templates/comment-sicko.md` |
| `pstack/automations/benny` | skipped | Cursor automation（Slack 回報分類與修復），omp 沒有對應機制 |
