# Claude Code plugin（骨架）

Claude Code 版，與 `plugins/omp/` 各自獨立，不共用檔案、不互相引用。

尚未列入 `.claude-plugin/marketplace.json`：等第一批 skill 放進 `skills/<來源>/<skill>/` 後再加 entry（`source: "./plugins/claude"`），`scripts/check-links.ts` 會擋「有 skill 卻沒列入」的情況。

方向（待定）：

- 紀律層（原則卡、劇本、`unslop`、`technical-writing`）從上游引入。
- 編排層不照搬 omp 版：派工改用 Claude Code 原生機制（subagent 加 `isolation: worktree`、workflow／ultracode、Projects、背景 session），`worker.md` 的守則寫進 agent 檔本文。
- matt 本來就是 Claude Code 原生，盡量貼近上游原文。
