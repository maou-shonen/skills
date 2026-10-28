# ADR-0012：interrogate 改成實跑證明，取代 lens 分工

- Status: Accepted
- Date: 2026-10-28
- Supersedes: ADR-0007

## Context

pstack 0.15.36 重寫 interrogate：審查者變成對抗者，每個 finding 都要附實際跑過的指令與輸出，lead 親自重跑才保留；多模型打分、四桶分類、agreement map 與 references 全拿掉。ADR-0007 的 lens 分工是為了在 ADR-0001/0003 下補「模型多樣性」這個信號來源，新版不再靠多樣性，靠的是可重跑的證據。

## Decision

照上游收。對抗者用 arena Phase A 3–4 與 Phase B 派出，每人一次 `task`、`isolated: true`、自己的 worktree，預設兩人，範圍跨多區再加。lead 依 arena Phase F 重跑每個 finding，只留輸出真的顯示失敗且違反意圖的；同根因合併。lens 分工、席位計分與 `references/` 全刪。

## Consequences

- ADR-0007 的降級不再存在：信號來源從「不同席位獨立提出」換成「lead 重跑重現」，與模型是否多樣無關，ADR-0001/0003 不受影響。
- 沒跑過的意見（風格、命名、結構、假設性風險）不再出現在 interrogate 輸出；要這類意見改用其他 review skill。
- 成本上升：每個對抗者要建 worktree 並實跑，lead 要逐一重跑。
