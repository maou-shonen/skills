# matt → omp 替換

基底：`pins/matt.pin`（1.3.2，`mattpocock/skills` tag `v1.3.2`）。

只引 `domain-modeling` 相關鏈（本地 `skills/follow-matt/` 即全部引入）。

路徑：上游 `skills/<分類>/X` 對本地 `skills/follow-matt/X`（`diff --port` 已轉好，可直接 `git apply --reject`）。

| matt | omp |
|---|---|
| `Call the Skill tool with "X"` | `Run the X skill`（即 `skill://X`，沿本地 `architect` 慣用語） |
| 每 skill 下的 `agents/openai.yaml`（純展示名） | 丟掉，本地 skill 無此目錄 |
| `setup-matt-pocock-skills` 寫 `CLAUDE.md` 優先 | 寫 `AGENTS.md`（本 repo 只有它） |
| `glab` / GitLab tracker 模板 | 刪，只留 `gh` + local（沒裝 glab 也沒需求；真要時從上游原樣拿回） |
| frontmatter 與措辭 | 加 `layer` 與 `manual`；內文只講角色與層級（「派一個 worker 回報」），harness 寫法用「on omp, …」括註；worker 不直接面對使用者；見 ADR-0014 |

## 上游項目紀錄

`zx scripts/follow-matt.ts audit` 讀這張表：pin 上游每個 `skills/<分類>/<skill>` 要嘛在 `skills/follow-matt/` 有同名資料夾，要嘛在這裡有一列。狀態只能是 `adopted`、`skipped`、`deferred`（deferred＝待使用者決定，audit 放行但提醒）；`adopted` 只給無本地同名目錄的項目（有目錄的 audit 自動放行，不必列）。只跟 `skills/`；上游其他目錄（`.agents/`、`docs/`、`.claude-plugin/`、`GLOSSARY.md` 等）不跟、不列。

| 上游 | 狀態 | 原因 |
|---|---|---|
| `skills/engineering/ask-matt` | skipped | 全套導引，會指向未引入的 skill |
| `skills/engineering/code-review` | skipped | agent review 多半浪費 token，且此 skill 偏瑣碎挑剔 |
| `skills/engineering/diagnosing-bugs` | skipped | 與 pstack `principle-fix-root-causes` 和 poteto-mode 的除錯流程重疊 |
| `skills/engineering/grill-with-docs` | skipped | 拷問式訪談太慢，用自撰 `draft-a-task` / `draft-a-adr` 代（只問 load-bearing，高信心自動決） |
| `skills/engineering/implement` | skipped | 被 poteto Feature 覆蓋 |
| `skills/engineering/implement-spec` | skipped | 等真有多 ticket 併發再說 |
| `skills/engineering/improve-codebase-architecture` | deferred | 依賴 grill 鏈，且需先與 `architect` 比對分工；待使用者決定 |
| `skills/engineering/pr` | skipped | `technical-writing` 已涵蓋 PR 描述 |
| `skills/engineering/tdd` | skipped | 與 pstack `tdd` 同名，留 pstack 版 |
| `skills/engineering/triage` | skipped | `setup-matt-pocock-skills` Section B 自動跳過 |
| `skills/engineering/wayfinder` | skipped | 與 `figure-it-out`、`to-tickets` 重疊 |
| `skills/in-progress/chief-of-staff` | skipped | 上游實驗區 |
| `skills/in-progress/claude-handoff` | skipped | 上游實驗區，綁 Claude Code |
| `skills/in-progress/loop-me` | skipped | 上游實驗區 |
| `skills/in-progress/setup-ts-deep-modules` | skipped | 上游實驗區 |
| `skills/in-progress/writing-beats` | skipped | 上游實驗區 |
| `skills/in-progress/writing-fragments` | skipped | 上游實驗區 |
| `skills/in-progress/writing-shape` | skipped | 上游實驗區 |
| `skills/misc/git-guardrails-claude-code` | skipped | 綁 Claude Code hook，這台不用 Claude Code |
| `skills/misc/migrate-to-shoehorn` | skipped | matt 課程專用 |
| `skills/misc/scaffold-exercises` | skipped | matt 課程專用 |
| `skills/misc/setup-pre-commit` | skipped | Husky 專用；retro 提「沒有 guardrail」時由 worker 依 repo 現況做 |
| `skills/productivity/grill-me` | skipped | 同 grill-with-docs，用自撰 `draft-a-task` / `draft-a-adr` 代 |
| `skills/productivity/grilling` | skipped | 同 grill-with-docs，用自撰 `draft-a-task` / `draft-a-adr` 代 |
| `skills/productivity/handoff` | skipped | 各 harness 有自己的交接與 history 機制 |
| `skills/productivity/teach` | skipped | 與 pstack `teach` 同名，留 pstack 版 |
| `skills/productivity/wait-what` | skipped | 與 `bro` 重疊 |
| `skills/productivity/writing-for-agents` | skipped | 用 `unslop` 與 `technical-writing` 代 |
