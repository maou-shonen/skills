## Target

基於流行 skills 來做個人化最適配, 由 [pstack](https://github.com/cursor/plugins/tree/main/pstack) 為基礎,
修改為 oh-my-pi(omp) 適配, 而不是 cursor 適配,
再加上一些 [matt skills](https://github.com/mattpocock/skills) 的有用技巧

## 追蹤

已處理的上游版本在 `pins/<id>.pin`，只存版本號一行（如 `0.15.21`），不存 commit。比對時用版本現算 bump 點，不跟 main HEAD，不吃 repo 噪音。不相容而替換的東西在 `pins/<id>.changes.md`（通用機制映射表，跨 skill 共用）。remote 查得到的內容不另存。

ADR 只記需要權衡的決策：刪功能、降級替代、暫不支持。對等機制替換（改名、改路徑、換同功能工具）只更新 `pins/<id>.changes.md` 表格，不寫 ADR。
每個這類決策是一份 ADR，在 `docs/adr/<nnnn>-<slug>.md`，一決策一檔。改決策就改那檔，不開新檔。編號永不重用，刪掉的號留空。狀態只有兩種：Accepted（現行）或 Superseded（被新檔取代，檔頭註明被誰取代）。決策一律是中文。
三層分工：`pins/<id>.pin` 釘版本，`pins/<id>.changes.md` 對機制，`docs/adr/` 記為什麼。skill 資料夾內不放變更紀錄，刪 skill 就一起丟。

- `zx scripts/follow-pstack.ts diff [版本]`：已處理版本到目標的 `pstack/` 差。省略版本等於 main，`latest` 同義。
- `zx scripts/follow-pstack.ts apply <版本>`：只更新 `pins/pstack.pin`。不改 `skills/`。

跟進上游時：先 `diff` 看新東西，再逐件決定是對等替換（只更新表格）、找替代品、還是刪（後兩者寫 ADR）。無 ADR 不動需要權衡的部分。

其他庫另寫 `scripts/follow-<id>.ts` 與 `pins/<id>.pin`，不寫進 pstack 的 pin。

