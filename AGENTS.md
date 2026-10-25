## Target

基於流行 skills 做個人化最適配：pstack 管 orchestration（見 `pins/pstack.changes.md`），matt 取 `domain-modeling` 相關鏈（見 `pins/matt.changes.md`）。

## 追蹤

三層分工：`pins/` 釘版本對機制，`docs/adr/` 記為什麼，skill 內不記。

- 對等替換只更新映射表，不寫 ADR。
- ADR 只記 skill 內提示詞的權衡：刪、降級、暫不支持。一決策一檔。repo 本身（目錄、腳本、CI、文件）不寫 ADR。
- 跟進上游先看差，再逐件定層級。權衡無 ADR 不動手。

## 佈局

skill 依來源分類放，見 `docs/layout.md`。安裝後是扁平的：skill 名全 repo 唯一，skill 間連結照上游寫 `../X/`，不加分類層。

跟上游步驟：
1. `zx scripts/follow-<上游>.ts diff latest --port > upstream.diff`，路徑已從上游 `skills/X` 對到本地 `skills/follow-<上游>/X`。
2. `git apply --reject upstream.diff`，逐件定層級（對等替換更新 `pins/*.changes.md`，權衡先寫 ADR）。
3. 新增 skill 加進 `.claude-plugin/plugin.json`，`zx scripts/follow-<上游>.ts apply <版本>` 更新 pin。
4. `zx scripts/check-links.ts` 與 `cd skills/follow-pstack/poteto-mode/scripts && bun test` 都過才提交。

- 上游漂移由 `.github/workflows/follow-upstream.yml` 每日檢查，有差異開 issue 通知，不自動改檔。

