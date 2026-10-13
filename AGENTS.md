## Target

基於流行 skills 來做個人化最適配, 由 [pstack](https://github.com/cursor/plugins/tree/main/pstack) 為基礎,
修改為 oh-my-pi(omp) 適配, 而不是 cursor 適配,
再加上一些 [matt skills](https://github.com/mattpocock/skills) 的有用技巧

## 追蹤

已處理的上游版本在 `pins/<id>.pin`，一行 `<version> <commit>`。remote 查得到的內容不另存。

- `zx scripts/follow-pstack.ts diff [版本]`：已處理版本到目標的 `pstack/` 差。省略版本等於 main，`latest` 同義。
- `zx scripts/follow-pstack.ts apply <版本>`：只更新 `pins/pstack.pin`。不改 `skills/`。

其他庫另寫 `scripts/follow-<id>.ts` 與 `pins/<id>.pin`，不寫進 pstack 的 pin。

