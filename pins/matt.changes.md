# matt → omp 替換

基底：`pins/matt.pin`（1.3.2，`mattpocock/skills` tag `v1.3.2`）。

只引 `domain-modeling` 相關鏈。grill 三件（`grilling` / `grill-me` / `grill-with-docs`）不引，用自家 `draft-a-task` / `draft-a-adr` 代（見 ADR-0009）。

| matt | omp |
|---|---|
| `Call the Skill tool with "X"`（本輪實際零命中：`to-*` 無此句式，只有 `draft-a-adr` 自撰句） | `Run the X skill`（即 `skill://X`，沿本地 `architect` 慣用語） |
| 每 skill 下的 `agents/openai.yaml`（純展示名） | 丟掉，本地 skill 無此目錄 |
| `setup-matt-pocock-skills` 寫 `CLAUDE.md` 優先 | 寫 `AGENTS.md`（本 repo 只有它） |
| `glab` / GitLab tracker 模板 | 刪，只留 `gh` + local（見 ADR-0010） |
| `triage` 未引 | Section B 自動跳過（上游本來就這麼設計），`triage-labels.md` 照收 |
| `implement` / `implement-spec`（`tdd` + `code-review` 引用） | 不引：`implement` 被 poteto Feature 覆蓋，`implement-spec` 等真有多 ticket 併發再說；`tdd` 維持 pstack 版一字不動 |
