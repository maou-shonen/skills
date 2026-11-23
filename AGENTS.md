## Target

目的是維護 `maou-shonen` 個人用 agent skills, 基於 pstack 與 matt skills, 並添加了個人偏好

## 結構

- monorepo，一個 harness 一個 plugin：`plugins/omp/`（oh-my-pi 相容，plugin 名 `maou-omp`）、`plugins/claude/`（Claude Code，plugin 名 `maou-claude`）。
- 兩個 plugin 互不引用、不共用檔案；同一份上游在兩邊可以有不同取捨。
- 共用的是上游追蹤：`pins/`、`scripts/`、lefthook。
