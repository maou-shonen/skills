#!/usr/bin/env zx

// zx CLI 注入 fs、path、echo。檢查 skills/ 內 Markdown 相對連結，以「安裝後扁平」解析：
// repo 裡 skills/<分類>/<skill>/，安裝後是 <skill>/。跳出 skill 根的 ../X/ 只能指向另一個 skill。
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
  for (const name of await fs.readdir(path.join(skillsDir, cat))) {
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
}

// marketplace：npx skills 以 plugins[].skills 分組，所以清單必須存在；這裡保證它和資料夾一致。
const market = await fs.readJson(path.join(root, '.claude-plugin/marketplace.json'))
const owner = new Map()
for (const pl of market.plugins ?? []) {
  const base = path.join(root, pl.source ?? './')
  for (const s of pl.skills ?? []) {
    const dir = path.resolve(base, s)
    if (!(await fs.pathExists(path.join(dir, 'SKILL.md')))) { echo(`列出的路徑不存在 ${pl.name}: ${s}`); bad++; continue }
    if (owner.has(dir)) { echo(`重複分組 ${s}: ${owner.get(dir)}, ${pl.name}`); bad++; continue }
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
      if (/^(https?:|mailto:|skill:|<)/.test(link)) continue
      if (ignore.has(`${name}/${rel} ${link}`)) continue
      // 在扁平安裝根下解析：<root>/<name>/<rel>
      const target = path.posix.normalize(path.posix.join(name, path.posix.dirname(rel.split(path.sep).join('/')), link))
      if (target.startsWith('..')) { echo(`跳出安裝根 ${name}/${rel}: ${link}`); bad++; continue }
      const [skill, ...restParts] = target.split('/')
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
