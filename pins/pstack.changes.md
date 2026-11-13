# pstack

路徑：上游 `pstack/skills/X` 對本地 `skills/pstack/X`（`diff --port` 已轉好，可直接 `git apply --reject`）。

`audit` 讀最新版本節：pin 上游每個 `pstack/skills/<skill>` 要在 `skills/pstack/` 有同名資料夾，`pstack/agents/*`、`pstack/automations/*` 要在引／不引／待定有名。待定放行但提醒。

## 0.15.36

基底：`pins/pstack.pin`。

- `Task` 的 `model` 欄位、`~/.cursor/rules/pstack-models.mdc` → 不選模型：omp task 無此欄位。每席跑配置給的模型（未配跑父模型），角色用 agent 名隔離；slug 只在 `~/.omp/agent/config.yml` 的 `modelRoles` / `task.agentModelOverrides`，skill 側永不出現；`setup-pstack` 是只寫別名的鏡子。
- `Task` 的 `tasks[]` 批量 → 一任務一調用：omp 批量把 `context` 渲染進每席 system prompt，寫一次各付一次；各席自帶 brief 同時發，有依賴拆步，共享背景走 `local://` 自讀。
- `subagent_type` / `readonly` / `run_in_background` → `agent` 選角色；唯讀寫在 brief，不是欄位。
- panel 獨立性靠不同模型家族 → 席位隔離：單一錢包配不出雙家族；看不到彼此、同題盲做、各自回報。
- poteto-mode「Match the seat to the job」逐次升降 seat → 固定三層（機械 `sonic` / 程式 `task` / 判斷 `deep`，見該 skill 表）：逐次判斷讓 agent 反覆猶豫；缺 `deep` 退回 `task`。
- interrogate 的 lens 分工、席位計分、`references/` → 實跑證明：對抗者每個 finding 附實際跑過的指令與輸出，lead 親自重跑才保留；同根因合併。沒跑過的意見（風格、命名、結構、假設性風險）不收，改用其他 review skill。
- `setup-pstack` 第 8 步「推薦生成 formal verification skill」→ 不引（本地是 omp 配置鏡子，沒有上游第 6/7 步流程；要推薦時連第 7 步一起補）。
- cloud agent、`environment`、`cloud_base_branch` → 本機 `isolated: true`。
- `~/.cursor/projects/.../agent-transcripts` → 程序內用 `history://`、`agent://`；落盤 `~/.omp/agent/sessions/<encoded-cwd>/`。
- `AskQuestion` → `ask`。
- `/loop` 會話外喚醒 → `hub` watcher 或 systemd user timer。
- `control-ui` / `control-cli` / `deslop`（`cursor-team-kit`）→ `browser` / `computer`（eval prelude）、`hub` 加 bash、`skill://unslop` 加 `omp cleanse --all`。
- Cursor `create-skill` → `playbooks/authoring-a-skill.md`；`manage_skill` 只寫 `~/.omp/agent/managed-skills`。
- `~/.cursor/skills/` → `skill://`，裝在哪裡就解析到哪裡。
- 跨 skill 引用一律 `skill://<skill>`，指向另一個 skill 裡的檔案用 `skill://<skill>/<相對路徑>`（omp 的 skill URI 吃子路徑，解析到該 skill 根）。`../<skill>/SKILL.md` 在安裝後扁平佈局下會斷，`check-links` 直接擋；正文用粗體提到 skill 當「去載入它」的指標時，也寫成 `[**<skill>**](skill://<skill>)`。
- Graphite `gt` → 不要求；單 PR 走 `gh`，`command -v origin` 成功才用 Origin。
- `poteto-help` 連 pstack repo 的相對路徑 → 絕對網址（本 repo 沒有那些文件，安裝後是扁平的）。
- `poteto-help` 的 Claude Code 安裝段（+`docs/harness/claude-code.md`）→ 不引（不用 Claude Code；要用時從上游 0.15.28 原樣補回該段）。
- `pstack/agents/*.md`（Cursor plugin agents）→ `agents/*.md`（plugin root 下；omp agent 格式，跑 `@task`）。自加 `deep`（bundled `task.md` 本文、跑 `@deep`；omp 更新 `task.md` 時重同步）。
- verification skill 專案路徑 `.cursor/skills/verify-*/` → `.omp/skills/verify-*/`（omp 專案層 skill 目錄）。
- frontmatter `paths:` → `globs:`（omp 規則的檔案比對欄位）。
- frontmatter 與措辭：內文只講角色與層級，harness 寫法用「on omp, …」括註；worker 不直接面對使用者；Cursor 專屬措辭改中性（`any other X`、`On a coding worker…`）。

引：上游 `pstack/skills/` 全引（本地 `skills/pstack/` 即全部）。

- `pstack/agents/poteto-agent.md`、`pstack/agents/comment-sicko.md` → `agents/`。

不引：

- `pstack/automations/benny`：Cursor automation（Slack 回報分類與修復），omp 無對應機制。

`pstack/docs/`、`assets/`、`README.md` 不跟、不列（`poteto-help` 改連網址）。
