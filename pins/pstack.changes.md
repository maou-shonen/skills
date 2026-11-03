# pstack → omp 替換

基底：`pins/pstack.pin`（0.15.36）

流程留下。Cursor 機制改成這台 omp 18.10.3 實際有的介面。種類不同的差異寫在本表與該 skill 內的 omp 註記，派工以這台 omp 現場工具面為準。

| Cursor | omp |
|---|---|
| `Task` 的 `model` / `subagent_type` / `readonly` / `run_in_background` | 一次 `task`，項目在 `tasks[]`。`agent` 選角色。沒有逐次 `model`，角色模型在 `~/.omp/agent/config.yml` 的 `task.agentModelOverrides` / `modelRoles`。唯讀寫在 brief，不是欄位。 |
| `~/.cursor/rules/pstack-models.mdc` | 同上那張 map。`/setup-pstack` 寫那裡，不寫規則檔。面板用 `omp models` 回報的每個家族一個模型，不寫死 slug。 |
| cloud agent、`environment`、`cloud_base_branch` | 本機 `isolated: true`。這台 `task.isolation.enabled` 是開的。 |
| `~/.cursor/projects/.../agent-transcripts` | 本程序用 `history://`、`agent://`。落盤在 `~/.omp/agent/sessions/<encoded-cwd>/`。`worktree-audit.sh` 改掃這個桶。 |
| `AskQuestion` | `ask` |
| `/loop` | omp 的 `/loop`。會話外喚醒用 `hub` watcher 或 systemd user timer。 |
| `cursor-team-kit` 的 `control-ui` / `control-cli` / `deslop` | `browser` / `computer`（eval prelude）、`hub` 加 bash、`skill://unslop` 加 `omp cleanse --all` |
| Cursor `create-skill` | `playbooks/authoring-a-skill.md`。`manage_skill` 只寫 `~/.omp/agent/managed-skills`。 |
| `~/.cursor/skills/` | `skill://`，裝在哪裡就解析到哪裡 |
| Bugbot | 判斷留著，另外認 `security-reviewer` 與 review-automation。沒有 Bugbot 時，同一份 `bugbot-triage.md` 用在任何 review bot，含 omp 的 `security-reviewer`。 |
| `make-bot-ui` 的 webhook / `api2.cursor.sh` | skill 留下。頁面、本機 server、tailnet 照跑。webhook 那半 omp 沒有（無 routine store、inbound webhook、secret card），skill 內已加一段註明只跑頁面與 server，不要現編。 |
| Graphite `gt` | 不要求。單 PR 走 `gh`。`command -v origin` 成功才用 Origin。 |
| `poteto-help` 連到 pstack repo 的 `../../README.md`、`../../docs/guide/*` | 改成 `https://github.com/cursor/plugins/blob/main/pstack/` 下的絕對網址（本 repo 沒有那些文件，安裝後是扁平的） |
| Orchestrate 的 `Task` / cloud worker / PR 事件訂閱 | `task` 加 `isolated: true`、`hub` watcher 或 systemd user timer；狀態記在 store 的 `notes.md`（0.15.36 起上游拿掉 `orch` CLI） |
| interrogate 的 `generalPurpose` 對抗者、`interrogate reviewers` 模型行 | 每人一次 `task`（`agent: task`、`isolated: true`），預設兩人；見 ADR-0012 |
| poteto-mode「Code delegates tier by difficulty」「Match the seat to the job」逐次升降 seat | 固定三層 agent：`sonic` / `task` / `deep`（使用者自建），缺 `deep` 退回 `task` 並提醒一次；`setup-pstack` 改成檢查三個 agent，缺 `deep` 時用 `templates/deep.md` 建；見 ADR-0013 |
| 各 skill / playbook「Pick each subagent's seat for the job」與 `seat` 用詞 | 統一改為「Pick each subagent's tier (sonic / task / deep) per the Subagents section」；「fresh/clean/isolated seat」改為同義的 subagent；見 ADR-0013 |
| swarm「model race：每個 arm 一個 agent 檔 + 一條 `task.agentModelOverrides`」 | 移除；swarm 只依層級 spawn，race 仍指相同 brief 的多個 worker；見 ADR-0013 |
| frontmatter（全部 skill） | 加 `layer`（assistant / coordinator / shared / worker / none）與 `manual: true`；見 ADR-0014 |
| swarm / arena / reflect / show-me-your-work / automate-me 的 omp 寫死（`task.maxConcurrency`、`agent: task`、`history://`、`~/.omp/...`） | 改成角色／層級措辭，omp 寫法改括註「on omp, …」；見 ADR-0014 |
| reflect「複製到 `.cursor/skills/` 改副本、不開 PR」 | 不改安裝副本；核准後派 worker 在來源 repo 改並開 PR，不推預設分支、不 merge |
| make-bot-ui「On omp there is no routine store…」 | 改為「On a coding worker…」 |
| poteto-mode / babysit「not Cursor's built-in babysit skill」 | 改為「any other babysit skill」 |
| multi-phase-plan 的 `control-ui` / `control-cli`（`cursor-team-kit`）與「own cloud VM」 | 改為 worker 的 browser／CLI control（on omp：`browser` prelude、`hub` 加 bash），lane 跑在各自隔離 worktree |
| `pstack/agents/poteto-agent.md`、`pstack/agents/comment-sicko.md`（Cursor plugin agents） | 改成 omp agent 檔，放 `setup-pstack/templates/`，由 `setup-pstack` 檢查並複製到 `~/.omp/agent/agents/`（同 `deep.md` 模式）。frontmatter 改 omp 格式（`model: "@task"`、`thinking-level`；poteto-agent 加 `spawns: "*"`），丟 `is_background`；poteto-agent 找 skill 的 `~/.cursor/plugins/` 搜尋改 `skill://poteto-mode` |
| `create-verification-skill` / `maintain-verification-skill` 的專案路徑 `.cursor/skills/verify-*/` | `.omp/skills/verify-*/`（omp 專案層 skill 目錄） |
| `typescript-best-practices` frontmatter `paths:` | `globs:`（02f2ffe「對等替換層」刻意改的，對應 omp 規則的檔案比對欄位；當時漏記） |

## 上游項目紀錄

`zx scripts/follow-pstack.ts audit` 讀這張表：pin 上游每個 `pstack/skills/<skill>` 要在 `skills/follow-pstack/` 有同名資料夾，`pstack/agents/*`、`pstack/automations/*` 要在這裡有一列。狀態只能是 `adopted`、`skipped`、`deferred`（audit 放行）。`pstack/docs/`、`assets/`、`README.md` 不跟、不列（`poteto-help` 改連網址；`docs/harness` 見 ADR-0011）。

| 上游 | 狀態 | 原因 |
|---|---|---|
| `pstack/agents/poteto-agent.md` | deferred | 移植中，見 PR #11（合併後改 adopted：`setup-pstack/templates/`） |
| `pstack/agents/comment-sicko.md` | deferred | 移植中，見 PR #11（合併後改 adopted：`setup-pstack/templates/`） |
| `pstack/automations/benny` | skipped | Cursor automation（Slack 回報分類與修復），omp 沒有對應機制 |
