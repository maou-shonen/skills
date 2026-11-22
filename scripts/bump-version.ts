#!/usr/bin/env zx

// 由 lefthook pre-commit 在 plugins/ 或 catalog 有 staged 變更時呼叫（lefthook.yml 進版控，mise 裝完跑 lefthook install）。
// 只升 staged 變更碰到的 plugin（source 底下），還沒有 version 的 plugin 補上。

const root = path.dirname(globalThis.__dirname)
const file = path.join(root, '.claude-plugin/marketplace.json')
const market = await fs.readJson(file)
const d = new Date()
const prefix = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
for (const [i, pl] of (market.plugins ?? []).entries()) {
  const source = String(pl.source ?? './').replace(/^\.\//, '') || '.'
  const touched = (await $`git -C ${root} diff --cached --quiet -- ${source}`.nothrow().quiet()).exitCode !== 0
  if (!touched && typeof pl.version === 'string') continue
  const m = typeof pl.version === 'string' && pl.version.match(/^(\d{4}\.\d{4})\.(\d+)$/)
  const next = m && m[1] === prefix ? `${prefix}.${Number(m[2]) + 1}` : `${prefix}.0`
  const rest = Object.fromEntries(Object.entries(pl).filter(([k]) => k !== 'name' && k !== 'version'))
  market.plugins[i] = { name: pl.name, version: next, ...rest }
  echo(`${pl.name}: ${pl.version ?? '(無)'} → ${next}`)
}
await fs.writeFile(file, JSON.stringify(market, null, 2) + '\n')
