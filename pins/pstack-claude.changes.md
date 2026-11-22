# pstack（Claude Code）

本檔記 Claude Code plugin（`plugins/claude/`，plugin 名 `maou`）的取捨。上游是 pstack 為 Claude Code 產生的樹 `harness/pstack/claude-code/`，與 omp 版（`pins/pstack.changes.md`）分開取捨。

路徑：上游 `harness/pstack/claude-code/Y` 對本地 `plugins/claude/Y`（`scripts/pstack.ts --claude diff --port` 已轉好，可直接 `git apply --reject`）。

`audit`（`scripts/pstack.ts --claude audit`）讀最新版本節：上游每個 skill 要在 `plugins/claude/skills/` 有同名資料夾，`agents/*` 要在引／不引／待定有名。frontmatter `metadata.source` 不是 `pstack` 的 skill（matt、自撰）不算本地多出。

原則：先照上游原樣，矛盾之後再逐條修，每條修正記在這裡。

## 0.15.46

基底：`pins/pstack-claude.pin`。首次引入。

- 整棵樹原樣引入：`skills/`、`agents/`、`docs/guide/`、`docs/harness/claude-code.md`（adapter）、`README.md`、`LICENSE` → 引。
- `plugin.json`、`.claude-plugin/plugin.json`（名稱 `pstack`）→ 不引：plugin 名由 marketplace entry 決定（`maou`，`strict: false`）。
- adapter 的命名空間 `pstack:` → `maou:`（Subagent fields 的 `poteto-agent`／`comment-sicko` 兩列、Tools 列的 `/pstack:<name>`）：plugin 改名後原值會派不到 agent、打不出指令。`README.md`、`docs/guide/01-setup.md`、`poteto-help` 裡描述上游安裝方式的 `pstack:` 不改。

已知矛盾，待修：

- `agents/poteto-agent.md` 的 `model: claude-opus-5-5-xhigh-fast` 是 Cursor slug，Claude Code 不認得。adapter 要求每次 spawn 都傳 `model`／`effort` 蓋掉它。模型策略尚未決定（Claude 只有能力大小與 ultracode 之分，和 pstack 依角色、跨家族選模型的前提不同）。
- `setup-pstack` 會寫 `~/.claude/rules/pstack-models.md`；同上，等模型策略決定。

引：上游 `harness/pstack/claude-code/skills/` 全引。

- `harness/pstack/claude-code/agents/poteto-agent.md`、`harness/pstack/claude-code/agents/comment-sicko.md` → `agents/`（原樣）。
