# pstack

本檔記 omp plugin（`plugins/omp/`）的取捨；Claude 版開始跟上游時另開一份。

路徑：上游 `pstack/skills/X` 對本地 `plugins/omp/skills/pstack/X`（`diff --port` 已轉好，可直接 `git apply --reject`）。

`audit` 讀最新版本節：pin 上游每個 `pstack/skills/<skill>` 要在 `plugins/omp/skills/pstack/` 有同名資料夾，`pstack/agents/*`、`pstack/automations/*` 要在引／不引／待定有名。待定放行但提醒。

## 0.15.48

基底：`pins/pstack.pin`。替換規則沿用 0.15.36 節。

- 新增 `reframe`（0.15.47 新增、0.15.48 補「描述可能指多個問題時先列出兩三個候選與區分訊號，挑最可能的」）：從使用者自己的檔案與描述出發，給 8–12 個依影響排序的專家術語（各附對應描述片段、實際專案連結並親自確認、能拿來跟 agent 要什麼），從 2–3 個鄰近領域借詞並說明類比在哪裡斷，點出沒提到但該在意的事，最後用新詞改寫描述；只在使用者打 `/reframe` 時跑 → 引（SKILL.md 原樣，無模型或 Cursor 專屬內容）。
- `poteto-help` 的路由表加 `/reframe` 一列 → 引（連結照本地規則寫 `skill://reframe`）。
- 沒有 agent、automation 被新增或移除；沒有模型路由變更。

引：上游 `pstack/skills/` 全引（本地 `skills/pstack/` 即全部）。

- `pstack/agents/poteto-agent.md`、`pstack/agents/comment-sicko.md` → `agents/`（`poteto-agent` 的 `model` 欄位不引）。

不引：

- `pstack/automations/benny`：Cursor automation（Slack 回報分類與修復），omp 無對應機制。

`pstack/docs/`、`assets/`、`README.md`、`.cursor-plugin/plugin.json`、`plugin.json` 不跟、不列（README 與 `docs/guide/02-poteto-mode.md` 的 `/reframe` 介紹都在這些路徑）。

## 0.15.46

基底：`pins/pstack.pin`。替換規則沿用 0.15.36 節。

- `statechart` 支援原生 Windows 與 TLC 的 `\r\n` 行尾：行讀取改切 `\r?\n`；group kill 與 janitor 不再經 `/bin/sh`（新增 `scripts/kill.ts`、`scripts/janitor.ts`）；janitor 放過被 Windows 重用的 pid；java／mise 以 `windowsHide` 啟動；SKILL.md 補原生 Windows 用 `node --disable-warning=ExperimentalWarning` 直接跑 `statechart.ts` 的一句；新增 `cli.test.ts`、`messages.test.ts` 測試 → 引（腳本、測試與 SKILL.md 原樣，本地與上游無分歧）。
- Gemini panel 席改跑 `gemini-4-neon-xhigh`（0.15.44、0.15.45：`arena` runners／cross-judge 預設、`poteto-mode` 的 Gemini 檔位規則與 diverse panel 行、`setup-pstack` 的舊預設遷移與 budget 對 Gemini 的換算）→ 不引：沿用「不選模型」，skill 側不寫 slug，`setup-pstack` 是 omp 配置鏡子。
- 沒有 skill、agent、automation 被新增或移除。

引：上游 `pstack/skills/` 全引（本地 `skills/pstack/` 即全部）。

- `pstack/agents/poteto-agent.md`、`pstack/agents/comment-sicko.md` → `agents/`（`poteto-agent` 的 `model` 欄位不引）。

不引：

- `pstack/automations/benny`：Cursor automation（Slack 回報分類與修復），omp 無對應機制。

`pstack/docs/`、`assets/`、`README.md`、`.cursor-plugin/plugin.json`、`plugin.json` 不跟、不列（README 與 `docs/harness/claude-code.md` 的 Gemini 檔位改動都在這些路徑）。

## 0.15.43

基底：`pins/pstack.pin`。替換規則沿用 0.15.36 節。

- principle 葉子（attack-the-premise、boundary-discipline、build-the-lever、explain-the-number、fix-root-causes、foundational-thinking、make-operations-idempotent、minimize-reader-load、model-the-domain、prove-it-works、separate-before-serializing-shared-state、sequence-verifiable-units、test-behavior-not-implementation、type-system-discipline）、`unslop`、`technical-writing` 縮短 → 引；只換上游文字，`skill://` 連結照舊。
- `architect` 縮成短 brief：先 trace、畫兩種形狀、挑 state 單一 owner 的那個；大型或有爭議的設計改走 `arena`；刪 `references/`（design-red-flags、rationale-template、runner-prompt） → 引。
- `arena`：runner／judge 步驟縮短 → 部分引：只引 judge 敘述（隔離、Phase D 閱讀時評分、起不來就略過並說明）與 Phase A 的「同配置重複」句；`~/.cursor/rules/pstack-models.mdc` 的 `arena runners` / `cross-judge pool` 清單、預設 slug、vendor 判斷 → 不引（不選模型）。Phase B 維持「一候選一個 `task` 調用」，不採「同一則訊息 `run_in_background`」。
- `reflect` 併成單檔、不再起 subagent：自己讀整份 transcript，只留六個月後仍成立且改變未來行為的發現，分 Accepted／Rejected／Backlog 並等核准才改 skill；刪三個 reviewer 與 synthesizer 的 `references/` → 引。transcript 走 `history://`；核准前顯示的複本位置 `.cursor/skills/…` 改為 `.omp/skills/<skill>/` 或 `~/.omp/agent/skills/<skill>/`。
- `poteto-mode`：觸發縮成十條短句；Subagents、Writing the reply、Playbooks 縮短；刪 Comments 段；Orchestrate playbook 與 `scripts/check-plan.mjs`（含測試與 `package.json` 的 test 指令）移除，program 規模工作改走 `figure-it-out`（本地已有） → 引。刪掉的 omp 版觸發（ask 分流、throughput checkpoint、bugbot 單條、broken skill 單條）隨上游一併刪除。模型選擇段（Defaults for every `Task` call、Fable 例外、Match the model to the job、no role above xhigh、`# defaults: 3` 提示）→ 不引：本地 Subagents 維持三層 tier 表（sonic／task／deep）。
- 新增 `poteto-mode/worker.md` → 引為同名檔：每個被啟動的 agent 第一行讀它。omp 端寫成 `Read skill://poteto-mode/worker.md before anything else.`（skill URI 吃子路徑，裝在哪都解析得到，不必傳絕對路徑）；「不得呼叫會向人提問的工具」明寫 `ask`。其餘規則（bar 即全部門檻、只因失敗或使用者會踩到的 bug 才擋、PR 開 ready、標題與 40 行內本文標題順序、證據放檔案或 PR comment）原樣。
- playbooks 縮短或改字（Opening a PR、Babysit、Multi-phase plan 與其他）→ 引：Babysit 改條列、刪「取代 Cursor 內建 babysit」與 `/loop` 句；Multi-phase plan 縮成五步並刪 `check-plan` 與十 lane 驗證骨架；Opening a PR 只留 worktree、小 commit、標題本文格式、ready 開 PR，`/deslop` 仍改 `unslop` skill＋`omp cleanse --all`，刪「subagent 開 PR 後不 babysit」段。各 playbook 的 model 預設行（`claude-opus-5-5-xhigh-fast` 等）與「fast／standard 速度」措辭 → 不引（不選模型，維持 tier 寫法）。
- `recall`、`show-me-your-work`、`swarm`、`automate-me`、`figure-it-out`、`no-comments`、`benchmark-checklist`、`poteto-help`：移除速度檔位、vendor 用語、Orchestrate 說明 → 引；`swarm workers` 模型行與 pstack-models.mdc 讀法 → 不引。
- `setup-pstack`：`# defaults: 3` 標記、budget 階梯（large／medium／small 對應 xhigh／high／medium）、退役角色清單、舊規則遷移 → 不引：全都綁 `~/.cursor/rules/pstack-models.mdc`；本地是 omp 配置鏡子，沒有那個檔，早已捨棄舊 per-role 行，且 budget 沿用「尚不支援」。只把詞彙對齊上游（去掉 `unlimited`，上游已無 xhigh 以上檔位）。
- `pstack/agents/poteto-agent.md` 新增 `model: claude-opus-5-5-xhigh-fast` → 不引：不選模型，本地維持 `model: "@task"`。
- Opus 5.5 xhigh-fast 預設、不超過 xhigh、Opus 優先路由 → 不引：同上。
- 沒有 skill 被新增或移除（`worker.md` 是 poteto-mode 內的檔案），`figure-it-out` 本地已有。

引：上游 `pstack/skills/` 全引（本地 `skills/pstack/` 即全部）。

- `pstack/agents/poteto-agent.md`、`pstack/agents/comment-sicko.md` → `agents/`（`poteto-agent` 的 `model` 欄位不引）。

不引：

- `pstack/automations/benny`：Cursor automation（Slack 回報分類與修復），omp 無對應機制。

`pstack/docs/`、`assets/`、`README.md`、`.cursor-plugin/plugin.json`、`plugin.json` 不跟、不列（README、guide 與 Claude Code adapter 的跟進都在這些路徑）。

## 0.15.42

基底：`pins/pstack.pin`。替換規則沿用 0.15.36 節。

- `how` 縮成單檔：一個唯讀 subagent 帶短 brief 探索並解說，刪複雜度分流、explorer、explainer 與 `references/` → 引；那席走 `task`，唯讀寫在 brief。
- `why` 縮成一段：從 commit 與 PR 討論作答、線索薄才擴大來源、引作者原話、標推論、說紀錄答不了什麼；刪 investigator、synthesizer、輸出格式與 `references/` → 引。
- poteto-mode 不再路由 `how`（刪觸發行）；playbooks（investigation／feature／bug-fix／hillclimb／perf-issue／refactoring）、architect、no-comments、`comment-sicko` 改「自己 trace 程式碼」→ 引。routed skill 清單去掉 `how`、`why`。
- recall 不再借 `why` 的 investigator → 每個來源一個 `task` investigator（全工具，MCP 可用；不寫檔）。
- blast-radius、teach 刪掉指向 `why` 舊步驟的句子 → 引。
- sharpen 改寫後的 prompt 要 agent 對實驗能決定的選擇先做 prototype、依觀察推薦；產品與偏好選擇留給使用者 → 引。
- reflect synthesizer 的漂移範例改成函式改名 → 引。
- statechart：SANY 讀不了 spec 時回報行列；箭頭從 parent 邊框進入 → 引（腳本與測試原樣）。
- 預設模型換成 Fable 5.2／Opus 5.5／Gemini 4 Carbon、arena 跨評改按 vendor、Fable／Gemini 檔位註記、`# defaults: 2` 標記、setup-pstack 刪 how／why 角色 → 不引：沿用「不選模型」，skill 側不寫 slug，`setup-pstack` 是 omp 配置鏡子。

引：上游 `pstack/skills/` 全引（本地 `skills/pstack/` 即全部）。

- `pstack/agents/poteto-agent.md`、`pstack/agents/comment-sicko.md` → `agents/`。

不引：

- `pstack/automations/benny`：Cursor automation（Slack 回報分類與修復），omp 無對應機制。

`pstack/docs/`、`assets/`、`README.md` 不跟、不列（`poteto-help` 改連網址）。

## 0.15.36

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
