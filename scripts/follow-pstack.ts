#!/usr/bin/env zx

// zx CLI 注入 $、argv、echo、fs、path。不 import zx：這個 repo 沒有 node_modules。
// 只寫 pins/pstack.pin 與 .follow/ 快取。永不改 skills/。

$.verbose = false

const repo = 'https://github.com/cursor/plugins.git'
const root = path.dirname(globalThis.__dirname)
const pinFile = path.join(root, 'pins/pstack.pin')
const cache = path.join(root, '.follow/cursor-plugins')

const specPattern = /^(?:latest|\d+\.\d+\.\d+|[0-9a-f]{7,40})$/i

function die(msg) {
  echo(`follow-pstack: ${msg}`)
  process.exit(1)
}

function usage() {
  echo(`follow-pstack.ts apply <版本>
follow-pstack.ts diff [版本]

版本是 plugin 版本（0.15.21）、commit，或 latest。
diff 省略版本等於 latest，也就是 origin/main 上的 pstack/。
apply 只更新 pins/pstack.pin。不改 skills/。`)
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
    return { version, sha }
  }
  if (/^[0-9a-f]{7,40}$/i.test(spec)) {
    const parsed = await $`git -C ${cache} rev-parse --verify ${spec}^{commit}`.quiet().nothrow()
    if (parsed.exitCode !== 0) die(`找不到 commit ${spec}`)
    const sha = parsed.stdout.trim()
    const version = await readVersion(sha)
    if (!version) die(`${sha} 沒有 pstack/.cursor-plugin/plugin.json`)
    return { version, sha }
  }
  return { version: spec, sha: await findBump(spec) }
}

async function readPin() {
  if (!(await fs.pathExists(pinFile))) die('尚未記錄已處理版本，先跑 apply')
  const [version, sha] = (await fs.readFile(pinFile, 'utf8')).trim().split(/\s+/)
  if (!version || !/^[0-9a-f]{40}$/.test(sha ?? '')) die('pins/pstack.pin 應為 "<version> <sha>"')
  return { version, sha }
}

async function apply(spec) {
  if (!spec) usage()
  const resolved = await resolve(spec)
  const previous = (await fs.pathExists(pinFile)) ? (await fs.readFile(pinFile, 'utf8')).trim() : ''
  const next = `${resolved.version} ${resolved.sha}`
  await fs.writeFile(pinFile, `${next}\n`)
  echo(`pinned ${next}`)
  if (previous && previous !== next) echo(`was ${previous}`)
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
  process.stdout.write(patch.stdout)
}

const [command, spec, extra] = argv._.map(String)
if (extra) usage()
if (command === 'apply') await apply(spec)
else if (command === 'diff') await diff(spec)
else usage()
