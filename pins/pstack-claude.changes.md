# pstack（Claude Code）

本檔記 Claude Code plugin（`plugins/claude/`，plugin 名 `maou-claude`）的取捨。上游是 pstack 為 Claude Code 產生的樹 `harness/pstack/claude-code/`，與 omp 版（`pins/pstack.changes.md`）分開取捨。

路徑：上游 `harness/pstack/claude-code/Y` 對本地 `plugins/claude/Y`（`scripts/pstack.ts --claude diff --port` 已轉好，可直接 `git apply --reject`）。

`audit`（`scripts/pstack.ts --claude audit`）讀最新版本節：上游每個 skill 要在 `plugins/claude/skills/` 有同名資料夾，`agents/*` 要在引／不引／待定有名。frontmatter `metadata.source` 不是 `pstack` 的 skill（matt、自撰）不算本地多出。

原則：先照上游原樣，矛盾之後再逐條修，每條修正記在這裡。

## 0.15.46

基底：`pins/pstack-claude.pin`。首次引入。

- 整棵樹原樣引入：`skills/`、`agents/`、`docs/guide/`、`docs/harness/claude-code.md`（adapter）、`README.md`、`LICENSE` → 引。
- `plugin.json`、`.claude-plugin/plugin.json`（名稱 `pstack`）→ 不引：plugin 名由 marketplace entry 決定（`maou-claude`，`strict: false`）。
- adapter 的命名空間 `pstack:` → `maou-claude:`（Subagent fields 的 `poteto-agent`／`comment-sicko` 兩列、Tools 列的 `/pstack:<name>`）：plugin 改名後原值會派不到 agent、打不出指令。`README.md`、`docs/guide/01-setup.md`、`poteto-help` 裡描述上游安裝方式的 `pstack:` 不改。

- 模型改成三層 tier，取代上游依角色寫 slug、跨廠牌評審席位、`setup-pstack` 預算階梯的整套做法：Claude 只有能力大小（與 ultracode）之分，沒有跨廠牌可選。
  - 表只有一張，在 `poteto-mode` 的 Subagents：mechanical `haiku`／`high`、default `sonnet`／`high`、deep `opus`／`high`（定位 bug 根因、架構與跨模組設計、細緻並行或演算法、綜合、評審）。永不用 `fable`。失敗過一次才把 `effort` 升到 `xhigh`。
  - 評審小組與 race 全部同一層，獨立性來自隔離（各自乾淨 context、互不相見、同題盲做），不靠混廠牌。
  - 跟著改：`arena`（runner 走 default、judge 走 deep，刪 vendor 規則）、`swarm`（default 或 mechanical）、`show-me-your-work`（審 trail 的 subagent 不再要求換廠牌）、Feature／Bug fix／Perf issue／Hillclimb／Refactoring／Eval 劇本裡的「configured X model（default slug）」、`poteto-mode` 的「second opinion 換廠牌」句。
  - `agents/poteto-agent.md` 的 `model: claude-opus-5-5-xhigh-fast` → `model: sonnet`、`effort: high`；`comment-sicko` 補同值。實測：原 slug 在 Claude Code 不被認得，沒傳 `model` 時悄悄退到舊的 Opus 5；改後不傳就跑 Sonnet 5.5，照表傳 deep 跑 Opus 5.5。
  - adapter 的 Models 表與 setup-pstack 節換成「一律照 tier 表、其他 slug 視為過期」；Subagent fields 的 `model:` 列同改。
  - `setup-pstack` 改成鏡子：顯示 tier 表、提醒舊的 `~/.claude/rules/pstack-models.md` 不再被讀，保留上游第 7、8 步的 verification skill 提議；不寫任何 rule。`poteto-help` 裡講 model rule、預算、`/setup-pstack` 寫 rule 的段落同改。
  - `README.md`、`docs/guide/` 對模型預設的敘述未改，以 `poteto-mode` 的 tier 表為準。

引：上游 `harness/pstack/claude-code/skills/` 全引。

- `harness/pstack/claude-code/agents/poteto-agent.md`、`harness/pstack/claude-code/agents/comment-sicko.md` → `agents/`（只改 `model`／`effort`，見上）。
