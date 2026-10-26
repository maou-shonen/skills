# 目錄佈局

repo 裡的 skill 依來源分類放。分類只存在於 repo，安裝後是扁平的 `<skill>/`，所以 skill 名全 repo 唯一，skill 之間的連結照上游寫 `../X/`。

| 分類 | 放什麼 |
|---|---|
| `skills/follow-pstack/` | 和 pstack（`cursor/plugins` 的 `pstack/skills/`）同名的 skill，不論本地改了多少 |
| `skills/follow-matt/` | 和 matt（`mattpocock/skills` 的 `skills/<分類>/`）同名的 skill，不論本地改了多少 |
| `skills/compat-omp/` | 為 omp 新寫、上游沒有同名的 skill。目前沒有，資料夾等第一個再建 |
| `skills/own/` | 自撰、與 omp 機制無關的 skill（`draft-a-task`、`draft-a-adr`、`transition-*`） |

判斷順序：先看上游有沒有同名 skill，有就進 `follow-<上游>/`；沒有才看是 omp 專用（`compat-omp/`）還是自撰（`own/`）。

## 跟上游的路徑對應

| 上游 | 本地 |
|---|---|
| `pstack/skills/X` | `skills/follow-pstack/X` |
| `skills/<任意分類>/X`（matt） | `skills/follow-matt/X` |

`scripts/follow-*.ts diff <版本> --port` 輸出已改好路徑的補丁，可直接 `git apply --reject`。上游新增的 skill 也會落在對應的 `follow-*/` 下。

## 檢查

- `zx scripts/check-links.ts`：以扁平安裝解析 skills 內的相對連結，跳出 skill 根的連結只能指向另一個 skill。
- `.claude-plugin/plugin.json` 的 `skills` 寫完整 repo 路徑 `./skills/<分類>/<skill>`。
