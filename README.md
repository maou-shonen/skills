# omp-dist（CI 產物，別手改）

由 main 的 `.github/workflows/omp-dist.yml` 跑 `scripts/gen-omp-plugins.ts` 產生。要改 skill 請改 main 的 `skills/<分類>/<name>/`。

```bash
omp plugin marketplace add https://raw.githubusercontent.com/maou-shonen/skills/omp-dist/.omp-plugin/marketplace.json
```
