# matt

只跟 `skills/engineering/`。`to-questionnaire` 是唯一的例外（在 `productivity/`，已引入）。其他分類與目錄一律不跟、不列。

路徑：上游 `skills/engineering/X` 對本地 `skills/follow-matt/X`（`diff --port` 已轉好，可直接 `git apply --reject`）。

`audit` 讀最新版本節：pin 上游 `skills/engineering/` 每個 skill 要嘛在 `skills/follow-matt/` 有同名資料夾，要嘛在不引／待定有名；引列點名的非 engineering 路徑是已引入的例外。待定放行但提醒。

## 1.3.2

基底：`pins/matt.pin`，tag `v1.3.2`。

- `Call the Skill tool with "X"` → `Run the X skill`（即 `skill://X`，沿本地 `architect` 慣用語）。
- 每 skill 下的 `agents/openai.yaml`（純展示名）→ 丟掉，本地 skill 無此目錄。
- `setup-matt-pocock-skills` 寫 `CLAUDE.md` 優先 → 寫 `AGENTS.md`（本 repo 只有它）。
- `glab` / GitLab tracker 模板 → 刪，只留 `gh` + local（沒裝 glab 也沒需求；真要時從上游原樣拿回）。

引：

- `codebase-design`、`domain-modeling`、`prototype`、`research`、`retro`、`setup-matt-pocock-skills`、`to-spec`、`to-tickets`、`wizard`
- `skills/productivity/to-questionnaire`（唯一的例外，已引入）

不引：

- `ask-matt`：全套導引，會指向未引入的 skill。
- `code-review`：agent review 多半浪費 token，且偏瑣碎挑剔。
- `diagnosing-bugs`：與 pstack `principle-fix-root-causes` 和 poteto-mode 除錯流程重疊。
- `grill-with-docs`：拷問式訪談太慢，用自撰 `draft-a-task` / `draft-a-adr` 代（只問 load-bearing，高信心自動決）。
- `implement`：被 poteto Feature 覆蓋。
- `implement-spec`：等多 ticket 併發再說。
- `pr`：`technical-writing` 已涵蓋 PR 描述。
- `tdd`：與 pstack `tdd` 同名，留 pstack 版。
- `triage`：`setup-matt-pocock-skills` Section B 自動跳過。
- `wayfinder`：與 `figure-it-out`、`to-tickets` 重疊。

待定：

- `improve-codebase-architecture`：依賴 grill 鏈，且需先與 `architect` 比對分工。
