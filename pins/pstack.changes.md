# pstack → omp 替換

基底：`pins/pstack.pin`（0.15.28）

流程留下。Cursor 機制改成這台 omp 18.10.3 實際有的介面。種類不同的差異寫在 `skills/omp-mechanics`，派工以 `skills/pstack-omp` 的現場工具面為準。

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
| `make-bot-ui` 的 webhook / `api2.cursor.sh` | skill 留下。頁面、本機 server、tailnet 照跑。webhook 那半讀 `skill://omp-mechanics/references/make-bot-ui-on-omp.md`，不要現編。 |
| Graphite `gt` | 不要求。單 PR 走 `gh`。`command -v origin` 成功才用 Origin。 |
