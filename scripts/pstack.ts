#!/usr/bin/env zx

// zx CLI 注入 $、argv、echo、fs、path。不 import zx：這個 repo 沒有 node_modules。
// 只寫 pins/pstack.pin 與 .follow/ 快取。永不改 skills/。

$.verbose = false

const repo = 'https://github.com/cursor/plugins.git'
const root = path.dirname(globalThis.__dirname)
const pinFile = path.join(root, 'pins/pstack.pin')
const changesFile = path.join(root, 'pins/pstack.changes.md')
const localDir = path.join(root, 'skills/pstack')
const upstreamName = 'pstack'
const auditRoots = ['pstack/skills', 'pstack/agents', 'pstack/automations']
const cache = path.join(root, '.follow/cursor-plugins')

const specPattern = /^(?:latest|\d+\.\d+\.\d+)$/i

function die(msg) {
  echo(`pstack: ${msg}`)
  process.exit(1)
}

function usage() {
  echo(`pstack.ts apply <版本>
pstack.ts diff [版本] [--port]
pstack.ts audit [版本]

版本是 plugin 版本（0.15.21）或 latest。pin 只存版本號，sha 每次用版本現算，不跟 main HEAD。
diff 省略版本等於 latest，也就是 origin/main 上的 pstack/。
apply 只更新 pins/pstack.pin。不改 skills/。
audit 檢查該版（省略＝pin）上游每一項都有本地資料夾或 changes.md 最新版本節的引／不引／待定一名，並報過期紀錄；有缺就 exit 1。
--port 把補丁路徑改成本地分類（pstack/skills/X → skills/pstack/X），用 git apply --reject 套。`)
  process.exit(1)
}

async function ensureCache() {
  await fs.ensureDir(path.dirname(cache))
  if (!(await fs.pathExists(path.join(cache, '.git')))) {
    echo('clone cursor/plugins')
    await $`git clone --filter=blob:none --sparse ${repo} ${cache}`.quiet()
    await $`git -C ${cache} sparse-checkout set pstack`.quiet()
  }
  echo('fetch cursor/plugins')
  await $`GIT_TERMINAL_PROMPT=0 git -C ${cache} fetch --filter=blob:none origin main`.quiet()
}

async function readVersion(sha) {
  const proc = await $`git -C ${cache} show ${sha}:pstack/.cursor-plugin/plugin.json`.quiet().nothrow()
  if (proc.exitCode !== 0) return null
  const version = JSON.parse(proc.stdout).version
  return typeof version === 'string' && version !== '' ? version : null
}

async function findBump(version) {
  const log = await $`git -C ${cache} log origin/main --format=%H -- pstack/.cursor-plugin/plugin.json`.quiet()
  for (const sha of log.stdout.split('\n').map((line) => line.trim()).filter(Boolean)) {
    if ((await readVersion(sha)) !== version) continue
    const parent = await $`git -C ${cache} rev-parse ${sha}^`.quiet().nothrow()
    const parentVersion = parent.exitCode === 0 ? await readVersion(parent.stdout.trim()) : null
    if (parentVersion !== version) return sha
  }
  die(`找不到 pstack ${version}`)
}

async function resolve(spec) {
  if (!specPattern.test(spec)) die(`版本格式不對: ${spec}`)
  await ensureCache()
  if (spec === 'latest') {
    const sha = (await $`git -C ${cache} rev-parse origin/main`.quiet()).stdout.trim()
    const version = await readVersion(sha)
    if (!version) die(`origin/main 沒有 pstack/.cursor-plugin/plugin.json`)
    return { version, sha: await findBump(version) }
  }
  return { version: spec, sha: await findBump(spec) }
}

async function readPin() {
  if (!(await fs.pathExists(pinFile))) die('尚未記錄已處理版本，先跑 apply')
  const version = (await fs.readFile(pinFile, 'utf8')).trim()
  if (!/^\d+\.\d+\.\d+$/.test(version)) die('pins/pstack.pin 應為版本號一行，如 0.15.21')
  await ensureCache()
  return { version, sha: await findBump(version) }
}

async function apply(spec) {
  if (!spec) usage()
  const resolved = await resolve(spec)
  const previous = (await fs.pathExists(pinFile)) ? (await fs.readFile(pinFile, 'utf8')).trim() : ''
  await fs.writeFile(pinFile, `${resolved.version}\n`)
  echo(`pinned ${resolved.version}`)
  if (previous && previous !== resolved.version) echo(`was ${previous}`)
}

// --port：把補丁路徑改成本 repo 的分類佈局，可直接 git apply --reject。
function port(patch) {
  return patch.replace(/^((?:diff --git|---|\+\+\+|rename from|rename to|similarity).*)$/gm, (line) =>
    line.replace(/(^|[ \/])pstack\/skills\//g, '$1skills/pstack/'),
  )
}

async function diff(spec = 'latest') {
  const pin = await readPin()
  const target = await resolve(spec)
  const where = spec === 'latest' ? ' main' : ''
  echo(`pstack ${pin.version} ${pin.sha} → ${target.version} ${target.sha}${where}`)
  const stat = await $`git -C ${cache} diff --stat ${pin.sha} ${target.sha} -- pstack/`.quiet()
  if (!stat.stdout.trim()) {
    echo('無變化')
    return
  }
  const commits = await $`git -C ${cache} log --oneline ${pin.sha}..${target.sha} -- pstack/`.quiet()
  if (commits.stdout.trim()) {
    echo(commits.stdout.trimEnd())
  }
  process.stdout.write(stat.stdout)
  const patch = await $`git -C ${cache} diff ${pin.sha} ${target.sha} -- pstack/`.quiet()
  process.stdout.write(argv.port ? port(patch.stdout) : patch.stdout)
}


// audit：pin（或指定版本）上游的每一項都要有本地 pstack 資料夾，或在 changes.md 最新版本節的引／不引／待定有名。
// 格式：引：／不引：／待定：段落下條列，`` `pstack/…` `` 路徑。只讀第一個 ## 節。
// 也報反向問題：紀錄指向上游已不存在的路徑、本地 pstack skill 在上游已不存在。
async function readRecords() {
  const text = await fs.readFile(changesFile, 'utf8')
  const head = text.match(/^## (?!#)\S[^\n]*$/m)
  if (!head) die(`${path.relative(root, changesFile)} 缺版本節`)
  const body = text.slice(head.index + head[0].length)
  const next = body.search(/^## (?!#)/m)
  const section = next < 0 ? body : body.slice(0, next)
  const records = new Map()
  let status = null
  for (const line of section.split('\n')) {
    const head = line.match(/^(引|不引|待定)：/)
    if (head) {
      status = head[1] === '引' ? 'adopted' : head[1] === '待定' ? 'deferred' : 'skipped'
      continue
    }
    if (!status || !line.startsWith('- ')) continue
    for (const quoted of line.match(/`pstack\/[^`]+`/g) ?? []) {
      const item = quoted.slice(1, -1)
      if (item.includes('*') || item.includes(' ')) continue
      if (!item.startsWith('pstack/agents/') && !item.startsWith('pstack/automations/')) continue
      records.set(item.match(/^pstack\/automations\/[^/]+/)?.[0] ?? item, status)
    }
  }
  return records
}

async function audit(spec) {
  const target = spec ? await resolve(spec) : await readPin()
  const files = (await $`git -C ${cache} ls-tree -r --name-only ${target.sha} -- ${auditRoots}`.quiet()).stdout
  const items = new Map() // 上游路徑 → 本地 skill 名（非 skill 為 null）
  for (const file of files.split('\n').filter(Boolean)) {
    const item = upstreamItem(file)
    if (item) items.set(item.path, item.skill)
  }
  const local = new Set(await fs.readdir(localDir))
  const records = await readRecords()
  const missing = []
  const deferred = []
  for (const [item, skill] of items) {
    if (skill && local.has(skill)) continue
    const status = records.get(item)
    if (!status) missing.push(item)
    else if (status === 'deferred') deferred.push(item)
  }
  const staleRecords = [...records.keys()].filter((item) => !items.has(item))
  const upstreamSkills = new Set([...items.values()].filter(Boolean))
  const orphans = [...local].filter((skill) => !upstreamSkills.has(skill))
  echo(`${upstreamName} ${target.version} ${target.sha}：上游 ${items.size} 項`)
  for (const item of deferred) echo(`待決定 ${item}`)
  for (const item of missing) echo(`缺紀錄 ${item}`)
  for (const item of staleRecords) echo(`過期紀錄 ${item}`)
  for (const skill of orphans) echo(`本地多出 ${skill}（上游已無同名）`)
  if (missing.length || staleRecords.length || orphans.length) process.exit(1)
  echo('audit 通過')
}

function upstreamItem(file) {
  let m = file.match(/^pstack\/skills\/([^/]+)\/SKILL\.md$/)
  if (m) return { path: `pstack/skills/${m[1]}`, skill: m[1] }
  m = file.match(/^pstack\/agents\/([^/]+\.md)$/)
  if (m) return { path: `pstack/agents/${m[1]}`, skill: null }
  m = file.match(/^pstack\/automations\/([^/]+)\//)
  return m ? { path: `pstack/automations/${m[1]}`, skill: null } : null
}

const [command, spec, extra] = argv._.map(String)
if (extra) usage()
if (command === 'apply') await apply(spec)
else if (command === 'diff') await diff(spec)
else if (command === 'audit') await audit(spec)
else usage()
