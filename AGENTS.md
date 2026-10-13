## Target

基於流行 skills 來做個人化最適配, 由 [pstack](https://github.com/cursor/plugins/tree/main/pstack) 為基礎,
修改為 oh-my-pi(omp) 適配, 而不是 cursor 適配,
再加上一些 [matt skills](https://github.com/mattpocock/skills) 的有用技巧

## 追蹤

已處理的上游版本在 `pins/<id>.pin`，一行 `<version> <commit>`。不相容而替換的東西在 `pins/<id>.changes.md`（通用機制映射表，跨 skill 共用）。remote 查得到的內容不另存。

每個改動決策是一份 ADR，在 `docs/adr/<nnnn>-<slug>.md`，一決策一檔。改決策就改那檔，不開新檔。狀態只有兩種：Accepted（現行）或 Superseded（被新檔取代，檔頭註明被誰取代）。決策一律是中文。

三層分工：`pins/<id>.pin` 釘版本，`pins/<id>.changes.md` 對機制，`docs/adr/` 記為什麼。skill 資料夾內不放變更紀錄，刪 skill 就一起丟。

- `zx scripts/follow-pstack.ts diff [版本]`：已處理版本到目標的 `pstack/` 差。省略版本等於 main，`latest` 同義。
- `zx scripts/follow-pstack.ts apply <版本>`：只更新 `pins/pstack.pin`。不改 `skills/`。

跟進上游時：先 `diff` 看新東西，再逐件決定是對等替換、找替代品、還是刪。每件有 ADR 記錄原因，無 ADR 不動 `skills/`。

其他庫另寫 `scripts/follow-<id>.ts` 與 `pins/<id>.pin`，不寫進 pstack 的 pin。

