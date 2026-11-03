#!/usr/bin/env zx

// zx CLI 注入 $、argv、echo、fs、path。不 import zx：這個 repo 沒有 node_modules。
// 只寫 pins/matt.pin 與 .follow/ 快取。永不改 skills/。
// matt 以 package.json 的 version + tag 釘版（v1.3.1），沒有 plugin.json 可現算。

$.verbose = false

const repo = 'https://github.com/mattpocock/skills.git'
const root = path.dirname(globalThis.__dirname)
const pinFile = path.join(root, 'pins/matt.pin')
const changesFile = path.join(root, 'pins/matt.changes.md')
const localDir = path.join(root, 'skills/follow-matt')
const upstreamName = 'matt'
const auditRoots = ['skills']
const cache = path.join(root, '.follow/matt-skills')

const specPattern = /^(?:latest|\d+\.\d+\.\d+)$/i

function die(msg) {
  echo(`follow-matt: ${msg}`)
  process.exit(1)
}

function usage() {
  echo(`follow-matt.ts apply <版本>
follow-matt.ts diff [版本] [--port]
follow-matt.ts audit [版本]

版本是 package.json 版本（1.3.1）或 latest。pin 只存版本號，對應 tag v<版本>。
diff 省略版本等於 latest，也就是最新 v* tag（發版）。main 上同版號的 sha 漂移不算。
apply 只更新 pins/matt.pin。不改 skills/。
audit 檢查該版（省略＝pin）上游每一項都有本地資料夾或 changes.md「上游項目紀錄」表的一列，並報過期紀錄；有缺就 exit 1。
--port 把補丁路徑改成本地分類（skills/<分類>/X → skills/follow-matt/X），用 git apply --reject 套。`)
  process.exit(1)
}

async function ensureCache() {
  await fs.ensureDir(path.dirname(cache))
  if (!(await fs.pathExists(path.join(cache, '.git')))) {
    echo('clone mattpocock/skills')
    await $`git clone --filter=blob:none --sparse ${repo} ${cache}`.quiet()
    await $`git -C ${cache} sparse-checkout set skills`.quiet()
  }
  echo('fetch mattpocock/skills')
  await $`GIT_TERMINAL_PROMPT=0 git -C ${cache} fetch --filter=blob:none --tags origin main`.quiet()
}

async function readVersion(sha) {
  const proc = await $`git -C ${cache} show ${sha}:package.json`.quiet().nothrow()
  if (proc.exitCode !== 0) return null
  const version = JSON.parse(proc.stdout).version
  return typeof version === 'string' && version !== '' ? version : null
}

async function resolve(spec) {
  if (!specPattern.test(spec)) die(`版本格式不對: ${spec}`)
  await ensureCache()
  if (spec === 'latest') {
    // 只認發版：最新 v* tag。main 上同版號的 sha 漂移不算漂移。
    const tags = (await $`git -C ${cache} tag -l v* --sort=-v:refname`.quiet()).stdout
    const tag = tags.split('\n').map((t) => t.trim()).find((t) => /^v\d+\.\d+\.\d+$/.test(t))
    if (!tag) die('找不到 v* tag')
    spec = tag.slice(1)
  }
  const tag = `v${spec}`
  const proc = await $`git -C ${cache} rev-list -n 1 ${tag}`.quiet().nothrow()
  if (proc.exitCode !== 0 || !proc.stdout.trim()) die(`找不到 tag ${tag}`)
  return { version: spec, sha: proc.stdout.trim() }
}

async function readPin() {
  if (!(await fs.pathExists(pinFile))) die('尚未記錄已處理版本，先跑 apply')
  const version = (await fs.readFile(pinFile, 'utf8')).trim()
  if (!/^\d+\.\d+\.\d+$/.test(version)) die('pins/matt.pin 應為版本號一行，如 1.3.1')
  return await resolve(version)
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
  return patch.replace(/^((?:diff --git|---|\+\+\+|rename from|rename to).*)$/gm, (line) =>
    line.replace(/(^|[ \/])skills\/[^/\s]+\/([^/\s]+\/)/g, '$1skills/follow-matt/$2'),
  )
}

async function diff(spec = 'latest') {
  const pin = await readPin()
  const target = await resolve(spec)
  const where = spec === 'latest' ? ' latest-tag' : ''
  echo(`matt ${pin.version} ${pin.sha} → ${target.version} ${target.sha}${where}`)
  const stat = await $`git -C ${cache} diff --stat ${pin.sha} ${target.sha} -- skills/`.quiet()
  if (!stat.stdout.trim()) {
    echo('無變化')
    return
  }
  const commits = await $`git -C ${cache} log --oneline ${pin.sha}..${target.sha} -- skills/`.quiet()
  if (commits.stdout.trim()) {
    echo(commits.stdout.trimEnd())
  }
  process.stdout.write(stat.stdout)
  const patch = await $`git -C ${cache} diff ${pin.sha} ${target.sha} -- skills/`.quiet()
  process.stdout.write(argv.port ? port(patch.stdout) : patch.stdout)
}

// audit：pin（或指定版本）上游的每一項都要有本地 follow-* 資料夾，或在 changes.md「上游項目紀錄」表有一列。
// 表格式：| `上游路徑` | adopted / skipped / deferred | 原因 |。deferred 允許通過，只是提醒待決定。
// 也報反向問題：紀錄指向上游已不存在的路徑、本地 follow-* skill 在上游已不存在。
async function readRecords() {
  const text = await fs.readFile(changesFile, 'utf8')
  const start = text.indexOf('## 上游項目紀錄')
  if (start < 0) die(`${path.relative(root, changesFile)} 缺「## 上游項目紀錄」表`)
  const records = new Map()
  for (const line of text.slice(start).split('\n')) {
    const m = line.match(/^\|\s*`([^`]+)`\s*\|\s*(adopted|skipped|deferred)\s*\|/)
    if (m) records.set(m[1], m[2])
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
  const m = file.match(/^skills\/([^/]+)\/([^/]+)\/SKILL\.md$/)
  return m ? { path: `skills/${m[1]}/${m[2]}`, skill: m[2] } : null
}

const [command, spec, extra] = argv._.map(String)
if (extra) usage()
if (command === 'apply') await apply(spec)
else if (command === 'diff') await diff(spec)
else if (command === 'audit') await audit(spec)
else usage()
