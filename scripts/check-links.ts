#!/usr/bin/env zx

// zx CLI 注入 fs、path、echo。每個 plugins/<harness>/ 各自檢查，plugin 之間不互相解析（安裝時各自獨立）。
// 佈局依 harness：
// - omp：skills/<來源>/<skill>/，安裝後扁平。skill 內用相對路徑；跨 skill 一律 skill://<name>[/<相對路徑>]，相對連結跳出 skill 根即失敗。
// - claude：skills/<skill>/，整棵樹原樣安裝（跟上游 pstack 的 Claude 樹）。相對連結照樹解析，只要不跳出 plugin 根；不用 skill://。
// 另查 SKILL.md frontmatter（嚴格 YAML、name/description、name = 資料夾名）、agents/ frontmatter 與
// .claude-plugin/marketplace.json（每個 plugin 的 source 在 plugins/ 下，每個 skill 恰列一次）。
// 不改檔。有任何問題就 exit 1。

const root = path.dirname(globalThis.__dirname)
const pluginsDir = path.join(root, 'plugins')

// 範本裡的示意連結，不是真檔案。
const ignore = new Set([
  'domain-modeling/GLOSSARY-FORMAT.md ./src/ordering/GLOSSARY.md',
  'domain-modeling/GLOSSARY-FORMAT.md ./src/billing/GLOSSARY.md',
  'domain-modeling/GLOSSARY-FORMAT.md ./src/fulfillment/GLOSSARY.md',
])

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

async function checkSkillUri(flat, uri, where) {
  const [skill, ...restParts] = uri.split('/')
  const base = flat.get(skill)
  if (!base) { echo(`skill:// 不存在的 skill ${where}: skill://${uri}`); bad++ }
  else if (restParts.length && !(await fs.pathExists(path.join(base, ...restParts)))) {
    echo(`skill:// 路徑不存在 ${where}: skill://${uri}`)
    bad++
  }
}

// 回傳 skill 名 → 實際資料夾，供 marketplace 對帳。
const layouts = { omp: 'categorized', claude: 'tree' }

async function checkPlugin(harness) {
  const layout = layouts[harness]
  if (!layout) { echo(`未知 harness plugins/${harness}，先在 layouts 登記佈局`); bad++; return new Map() }
  const pluginRoot = path.join(pluginsDir, harness)
  const skillsDir = path.join(pluginRoot, 'skills')
  const flat = new Map()
  if (layout === 'tree' && (await fs.pathExists(skillsDir))) {
    for (const e of await fs.readdir(skillsDir, { withFileTypes: true })) {
      if (e.isDirectory()) flat.set(e.name, path.join(skillsDir, e.name))
    }
  } else if (await fs.pathExists(skillsDir)) {
    for (const cat of await fs.readdir(skillsDir)) {
      if (!(await fs.stat(path.join(skillsDir, cat))).isDirectory()) continue
      for (const e of await fs.readdir(path.join(skillsDir, cat), { withFileTypes: true })) {
        if (!e.isDirectory()) continue // 分類資料夾可放 README.md 等文件
        if (flat.has(e.name)) { echo(`skill 名重複 ${harness}: ${e.name}`); bad++; continue }
        flat.set(e.name, path.join(skillsDir, cat, e.name))
      }
    }
  }

  // frontmatter：嚴格 YAML（zx 的 YAML 即 yaml 套件），必有 name/description，name 等於資料夾名。
  for (const [name, real] of flat) {
    const file = path.join(real, 'SKILL.md')
    if (!(await fs.pathExists(file))) { echo(`缺 SKILL.md ${harness}/${name}`); bad++; continue }
    const m = (await fs.readFile(file, 'utf8')).match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)
    if (!m) { echo(`缺 frontmatter ${harness}/${name}`); bad++; continue }
    let fm
    try { fm = YAML.parse(m[1], { strict: true, uniqueKeys: true }) } catch (e) {
      echo(`frontmatter YAML 錯 ${harness}/${name}: ${String(e.message).split('\n')[0]}`); bad++; continue
    }
    for (const k of ['name', 'description']) {
      if (typeof fm?.[k] !== 'string' || !fm[k].trim()) { echo(`frontmatter 缺 ${k} ${harness}/${name}`); bad++ }
    }
    if (fm?.name !== name) { echo(`name 與資料夾不符 ${harness}/${name}: ${fm?.name}`); bad++ }
    if (fm?.layer !== undefined) { echo(`frontmatter 不該有 layer ${harness}/${name}`); bad++ }
    if (fm?.manual !== undefined) { echo(`frontmatter 不該有 manual ${harness}/${name}`); bad++ }
  }

  // agents/：plugin agents。frontmatter 嚴格 YAML，必有 name/description，name 等於檔名（去 .md），禁用保留名 main/sub。
  const agentsDir = path.join(pluginRoot, 'agents')
  for (const f of (await fs.pathExists(agentsDir)) ? await fs.readdir(agentsDir) : []) {
    if (!f.endsWith('.md')) continue
    const name = f.slice(0, -3)
    const where = `${harness}/agents/${f}`
    const text = await fs.readFile(path.join(agentsDir, f), 'utf8')
    const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)
    if (!m) { echo(`agent 缺 frontmatter ${where}`); bad++; continue }
    let fm
    try { fm = YAML.parse(m[1], { strict: true, uniqueKeys: true }) } catch (e) {
      echo(`agent frontmatter YAML 錯 ${where}: ${String(e.message).split('\n')[0]}`); bad++; continue
    }
    for (const k of ['name', 'description']) {
      if (typeof fm?.[k] !== 'string' || !fm[k].trim()) { echo(`agent frontmatter 缺 ${k} ${where}`); bad++ }
    }
    if (fm?.name !== name) { echo(`agent name 與檔名不符 ${where}: ${fm?.name}`); bad++ }
    if (['main', 'sub'].includes(String(fm?.name ?? '').trim().toLowerCase())) { echo(`agent 名保留字 ${where}`); bad++ }
    const body = text.slice(m[0].length).replace(/^```[\s\S]*?^```/gm, '')
    for (const hit of body.matchAll(/\bskill:\/\/([a-z0-9-]+(?:\/[^\s`'"()<>#,.;:]+)?)/g)) {
      await checkSkillUri(flat, hit[1], where)
    }
  }

  // omp：plugin.json 會讓 omp 把 agents/ 的 model: 當 Claude 別名丟掉，禁加。
  if (harness === 'omp' && (await fs.pathExists(path.join(pluginRoot, '.claude-plugin/plugin.json')))) {
    echo('禁加 plugins/omp/.claude-plugin/plugin.json：會丟掉 agents/ 的 model'); bad++
  }

  if (layout === 'tree') {
    for (const file of await walk(pluginRoot)) {
      const rel = path.relative(pluginRoot, file)
      const inSkill = rel.match(/^skills\/([^/]+)\/(.*)$/)
      const key = inSkill ? `${inSkill[1]}/${inSkill[2]}` : rel
      const text = (await fs.readFile(file, 'utf8')).replace(/^```[\s\S]*?^```/gm, '')
      for (const m of text.matchAll(/\]\(([^)\s#?]+)/g)) {
        const link = m[1]
        if (link.startsWith('skill://')) { echo(`claude 不用 skill:// ${harness}/${rel}: ${link}`); bad++; continue }
        if (/^(https?:|mailto:|<)/.test(link)) continue
        if (ignore.has(`${key} ${link}`)) continue
        const target = path.resolve(path.dirname(file), decodeURI(link))
        if (path.relative(pluginRoot, target).startsWith('..')) { echo(`跳出 plugin 根 ${harness}/${rel}: ${link}`); bad++; continue }
        if (!(await fs.pathExists(target))) { echo(`壞連結 ${harness}/${rel}: ${link}`); bad++ }
      }
    }
    return flat
  }

  for (const [name, real] of flat) {
    for (const file of await walk(real)) {
      const rel = path.relative(real, file) // 安裝後相對 skill 根
      const where = `${harness}/${name}/${rel}`
      const text = (await fs.readFile(file, 'utf8')).replace(/^```[\s\S]*?^```/gm, '')
      for (const m of text.matchAll(/\]\(([^)\s#]+)/g)) {
        const link = m[1]
        if (link.startsWith('skill://')) { await checkSkillUri(flat, link.slice('skill://'.length), where); continue }
        if (/^(https?:|mailto:|<)/.test(link)) continue
        if (ignore.has(`${name}/${rel} ${link}`)) continue
        // 在扁平安裝根下解析：<root>/<name>/<rel>
        const target = path.posix.normalize(path.posix.join(name, path.posix.dirname(rel.split(path.sep).join('/')), link))
        if (target.startsWith('..')) { echo(`跳出安裝根 ${where}: ${link}`); bad++; continue }
        const [skill, ...restParts] = target.split('/')
        if (skill !== name) { echo(`跨 skill 相對連結 ${where}: ${link}，改寫 skill://${target}`); bad++; continue }
        if (!(await fs.pathExists(path.join(real, ...restParts)))) { echo(`壞連結 ${where}: ${link}`); bad++ }
      }
    }
  }
  return flat
}

const harnesses = []
for (const e of await fs.readdir(pluginsDir, { withFileTypes: true })) if (e.isDirectory()) harnesses.push(e.name)
const skillsByHarness = new Map()
for (const h of harnesses) skillsByHarness.set(h, await checkPlugin(h))

// marketplace：每個 plugin 的 source 是 plugins/<harness>，列出的 skill 與資料夾一致（每 skill 恰列一次）。
const market = await fs.readJson(path.join(root, '.claude-plugin/marketplace.json'))
const owner = new Map()
const listed = new Set()
for (const pl of market.plugins ?? []) {
  const source = String(pl.source ?? '')
  const harness = source.match(/^\.\/plugins\/([^/]+)\/?$/)?.[1]
  if (!harness || !harnesses.includes(harness)) { echo(`plugin source 應為 ./plugins/<harness> ${pl.name}: ${source}`); bad++; continue }
  listed.add(harness)
  const base = path.join(root, source)
  if (!pl.skills) { // 沒列 skills：Claude Code 掃預設 skills/，整個 plugin 都算列入
    for (const real of (skillsByHarness.get(harness) ?? new Map()).values()) owner.set(path.resolve(real), pl.name)
    continue
  }
  for (const s of pl.skills ?? []) {
    const dir = path.resolve(base, s)
    if (!(await fs.pathExists(path.join(dir, 'SKILL.md')))) { echo(`列出的路徑不存在 ${pl.name}: ${s}`); bad++; continue }
    if (owner.has(dir)) { echo(`重複列出 ${s}: ${owner.get(dir)}, ${pl.name}`); bad++; continue }
    owner.set(dir, pl.name)
  }
}
for (const [harness, flat] of skillsByHarness) {
  if (!listed.has(harness)) {
    if (flat.size) { echo(`plugins/${harness} 有 skill 但未列入 marketplace`); bad++ }
    continue
  }
  for (const [name, real] of flat) {
    if (!owner.has(path.resolve(real))) { echo(`未列入任何 plugin ${harness}/${name}`); bad++ }
  }
}
echo(bad ? `${bad} 個問題` : '連結全通，frontmatter 與 marketplace 一致')
process.exit(bad ? 1 : 0)
