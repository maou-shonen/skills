# plugins/（產物，別手改）

由 `zx scripts/gen-omp-plugins.ts` 從 `skills/` 依 `layer` 複製產生，給 omp marketplace（`.omp-plugin/marketplace.json`）用。要改 skill 請改 `skills/<分類>/<name>/`，再重跑腳本；CI 以 `--check` 檢查同步。
