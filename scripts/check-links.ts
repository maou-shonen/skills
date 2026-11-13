#!/usr/bin/env zx

// zx CLI 注入 fs、path、echo。檢查 skills/ 內 Markdown 連結：
// - skill 自己目錄內的檔案用相對路徑；跨 skill 一律 skill://<name> 或 skill://<name>/<相對路徑>，目標必須存在。
// - 相對連結跳出自己的 skill 根即失敗：安裝後是扁平的，那種路徑會斷。
// 另查 SKILL.md frontmatter（嚴格 YAML、name/description、name = 資料夾名）與
// .claude-plugin/marketplace.json（每個 skill 恰屬一個 plugin、列出的路徑存在）。
// 不改檔。有任何問題就 exit 1。

const root = path.dirname(globalThis.__dirname)
const skillsDir = path.join(root, 'skills')

// 範本裡的示意連結，不是真檔案。
const ignore = new Set([
  'domain-modeling/GLOSSARY-FORMAT.md ./src/ordering/GLOSSARY.md',
  'domain-modeling/GLOSSARY-FORMAT.md ./src/billing/GLOSSARY.md',
  'domain-modeling/GLOSSARY-FORMAT.md ./src/fulfillment/GLOSSARY.md',
  'why/references/synthesizer-prompt.md url',
])

const flat = new Map() // skill 名 → repo 內實際資料夾
for (const cat of await fs.readdir(skillsDir)) {
  for (const e of await fs.readdir(path.join(skillsDir, cat), { withFileTypes: true })) {
    if (!e.isDirectory()) continue // 分類資料夾可放 README.md 等文件
    const name = e.name
    if (flat.has(name)) throw new Error(`skill 名重複：${name}`)
    flat.set(name, path.join(skillsDir, cat, name))
  }
}

async function walk(dir) {
  const out = []
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules') continue
    const p = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...(await walk(p)))
    else if (e.name.endsWith('.md')) out.push(p)
  }
  return out
}

let bad = 0

// frontmatter：嚴格 YAML（zx 的 YAML 即 yaml 套件），必有 name/description，name 等於資料夾名。
for (const [name, real] of flat) {
  const file = path.join(real, 'SKILL.md')
  if (!(await fs.pathExists(file))) { echo(`缺 SKILL.md ${name}`); bad++; continue }
  const m = (await fs.readFile(file, 'utf8')).match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)
  if (!m) { echo(`缺 frontmatter ${name}`); bad++; continue }
  let fm
  try { fm = YAML.parse(m[1], { strict: true, uniqueKeys: true }) } catch (e) {
    echo(`frontmatter YAML 錯 ${name}: ${String(e.message).split('\n')[0]}`); bad++; continue
  }
  for (const k of ['name', 'description']) {
    if (typeof fm?.[k] !== 'string' || !fm[k].trim()) { echo(`frontmatter 缺 ${k} ${name}`); bad++ }
  }
  if (fm?.name !== name) { echo(`name 與資料夾不符 ${name}: ${fm?.name}`); bad++ }
  if (fm?.layer !== undefined) { echo(`frontmatter 不該有 layer ${name}`); bad++ }
  if (fm?.manual !== undefined) { echo(`frontmatter 不該有 manual ${name}`); bad++ }
}

// agents/：plugin agents，omp 掃 <plugin-root>/agents/*.md。frontmatter 嚴格 YAML，
// 必有 name/description，name 等於檔名（去 .md），禁用保留名 main/sub。
for (const f of await fs.readdir(path.join(root, 'agents'))) {
  if (!f.endsWith('.md')) continue
  const name = f.slice(0, -3)
  const file = path.join(root, 'agents', f)
  const m = (await fs.readFile(file, 'utf8')).match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)
  if (!m) { echo(`agent 缺 frontmatter ${f}`); bad++; continue }
  let fm
  try { fm = YAML.parse(m[1], { strict: true, uniqueKeys: true }) } catch (e) {
    echo(`agent frontmatter YAML 錯 ${f}: ${String(e.message).split('\n')[0]}`); bad++; continue
  }
  for (const k of ['name', 'description']) {
    if (typeof fm?.[k] !== 'string' || !fm[k].trim()) { echo(`agent frontmatter 缺 ${k} ${f}`); bad++ }
  }
  if (fm?.name !== name) { echo(`agent name 與檔名不符 ${f}: ${fm?.name}`); bad++ }
  if (['main', 'sub'].includes(String(fm?.name ?? '').trim().toLowerCase())) { echo(`agent 名保留字 ${f}`); bad++ }
}

// .claude-plugin/plugin.json 會讓 omp 把 agents/ 的 model: 當 Claude 別名丟掉，禁加。
if (await fs.pathExists(path.join(root, '.claude-plugin/plugin.json'))) { echo('禁加 .claude-plugin/plugin.json：會丟掉 agents/ 的 model'); bad++ }

// marketplace：單一 maou-dev plugin 全收；這裡保證清單和資料夾一致（每 skill 恰列一次）。
const market = await fs.readJson(path.join(root, '.claude-plugin/marketplace.json'))
const owner = new Map()
for (const pl of market.plugins ?? []) {
  const base = path.join(root, pl.source ?? './')
  for (const s of pl.skills ?? []) {
    const dir = path.resolve(base, s)
    if (!(await fs.pathExists(path.join(dir, 'SKILL.md')))) { echo(`列出的路徑不存在 ${pl.name}: ${s}`); bad++; continue }
    if (owner.has(dir)) { echo(`重複列出 ${s}: ${owner.get(dir)}, ${pl.name}`); bad++; continue }
    owner.set(dir, pl.name)
  }
}
for (const [name, real] of flat) {
  if (!owner.has(path.resolve(real))) { echo(`未列入任何 plugin ${name}`); bad++ }
}
for (const [name, real] of flat) {
  for (const file of await walk(real)) {
    const rel = path.relative(real, file) // 安裝後相對 skill 根
    let text = await fs.readFile(file, 'utf8')
    text = text.replace(/^```[\s\S]*?^```/gm, '')
    for (const m of text.matchAll(/\]\(([^)\s#]+)/g)) {
      const link = m[1]
      if (link.startsWith('skill://')) {
        const [skill, ...restParts] = link.slice('skill://'.length).split('/')
        const base = flat.get(skill)
        if (!base) { echo(`skill:// 不存在的 skill ${name}/${rel}: ${link}`); bad++ }
        else if (restParts.length && !(await fs.pathExists(path.join(base, ...restParts)))) {
          echo(`skill:// 路徑不存在 ${name}/${rel}: ${link}`)
          bad++
        }
        continue
      }
      if (/^(https?:|mailto:|<)/.test(link)) continue
      if (ignore.has(`${name}/${rel} ${link}`)) continue
      // 在扁平安裝根下解析：<root>/<name>/<rel>
      const target = path.posix.normalize(path.posix.join(name, path.posix.dirname(rel.split(path.sep).join('/')), link))
      if (target.startsWith('..')) { echo(`跳出安裝根 ${name}/${rel}: ${link}`); bad++; continue }
      const [skill, ...restParts] = target.split('/')
      if (skill !== name) { echo(`跨 skill 相對連結 ${name}/${rel}: ${link}，改寫 skill://${target}`); bad++; continue }
      const base = flat.get(skill)
      if (!base || !(await fs.pathExists(path.join(base, ...restParts)))) {
        echo(`壞連結 ${name}/${rel}: ${link}`)
        bad++
      }
    }
  }
}
echo(bad ? `${bad} 個問題` : '連結全通，frontmatter 與 marketplace 一致')
process.exit(bad ? 1 : 0)
