#!/usr/bin/env zx

// pstack 以 plugin.json 的 version 釘版，sha 用版本現算，不跟 main HEAD。
import { run } from './upstream.mjs'

const root = path.dirname(globalThis.__dirname)

async function readVersion(ctx, sha) {
  const proc = await $`git -C ${ctx.cache} show ${sha}:pstack/.cursor-plugin/plugin.json`.quiet().nothrow()
  if (proc.exitCode !== 0) return null
  const version = JSON.parse(proc.stdout).version
  return typeof version === 'string' && version !== '' ? version : null
}

async function findBump(ctx, version) {
  const log = await $`git -C ${ctx.cache} log origin/main --format=%H -- pstack/.cursor-plugin/plugin.json`.quiet()
  for (const sha of log.stdout.split('\n').map((line) => line.trim()).filter(Boolean)) {
    if ((await readVersion(ctx, sha)) !== version) continue
    const parent = await $`git -C ${ctx.cache} rev-parse ${sha}^`.quiet().nothrow()
    const parentVersion = parent.exitCode === 0 ? await readVersion(ctx, parent.stdout.trim()) : null
    if (parentVersion !== version) return sha
  }
  ctx.die(`找不到 pstack ${version}`)
}

// --claude：跟上游為 Claude Code 產生的樹 harness/pstack/claude-code/，對到 plugins/claude/（同一個 pstack 版號）。
// zx 的 argv 不認布林旗標：`--claude audit` 會把 audit 吃成旗標值，放回位置參數。
if (typeof argv.claude === 'string') argv._.unshift(argv.claude)
const claude = argv.claude !== undefined && argv.claude !== false
const tree = 'harness/pstack/claude-code'

await run({
  name: claude ? 'pstack-claude' : 'pstack',
  root,
  repo: 'https://github.com/cursor/plugins.git',
  cache: path.join(root, '.follow/cursor-plugins'),
  sparse: ['pstack', 'harness/pstack'],
  fetchTags: false,
  localDir: path.join(root, claude ? 'plugins/claude/skills' : 'plugins/omp/skills/pstack'),
  diffPaths: claude ? `${tree}/` : 'pstack/',
  auditRoots: claude ? [`${tree}/skills`, `${tree}/agents`] : ['pstack/skills', 'pstack/agents', 'pstack/automations'],
  versionHelp: '版本是 plugin 版本（0.15.21）或 latest。pin 只存版本號，sha 每次用版本現算，不跟 main HEAD。--claude 改跟 harness/pstack/claude-code/，pin 在 pins/pstack-claude.pin。',
  latestHelp: ' origin/main 上的 pstack/',
  whereLatest: ' main',
  auditHelp: 'audit 檢查該版（省略＝pin）上游每一項都有本地資料夾或 changes.md 最新版本節的引／不引／待定一名，並報過期紀錄；有缺就 exit 1。',
  portHelp: '--port 把補丁路徑改成本地佈局（pstack/skills/X → plugins/omp/skills/pstack/X；--claude 時 harness/pstack/claude-code/Y → plugins/claude/Y），用 git apply --reject 套。',
  portFrom: claude ? /(^|[ \/])harness\/pstack\/claude-code\//g : /(^|[ \/])pstack\/skills\//g,
  portTo: claude ? '$1plugins/claude/' : '$1plugins/omp/skills/pstack/',

  async latestVersion(ctx) {
    const sha = (await $`git -C ${ctx.cache} rev-parse origin/main`.quiet()).stdout.trim()
    const version = await readVersion(ctx, sha)
    if (!version) ctx.die('origin/main 沒有 pstack/.cursor-plugin/plugin.json')
    return version
  },

  shaFor: findBump,

  upstreamItem(file) {
    const base = claude ? tree : 'pstack'
    const rel = file.startsWith(`${base}/`) ? file.slice(base.length + 1) : null
    if (!rel) return null
    let m = rel.match(/^skills\/([^/]+)\/SKILL\.md$/)
    if (m) return { path: `${base}/skills/${m[1]}`, skill: m[1] }
    m = rel.match(/^agents\/([^/]+\.md)$/)
    if (m) return { path: `${base}/agents/${m[1]}`, skill: null }
    m = rel.match(/^automations\/([^/]+)\//)
    return m ? { path: `${base}/automations/${m[1]}`, skill: null } : null
  },

  // skills 全引靠同名資料夾對上，只解析 agents/automations 的上游路徑。
  *parseRecordLine(line) {
    if (!line.startsWith('- ')) return
    const base = claude ? tree : 'pstack'
    for (const quoted of line.match(/`[^`]+`/g) ?? []) {
      const item = quoted.slice(1, -1)
      if (item.includes('*') || item.includes(' ')) continue
      if (!item.startsWith(`${base}/agents/`) && !item.startsWith(`${base}/automations/`)) continue
      yield item.match(new RegExp(`^${base}/automations/[^/]+`))?.[0] ?? item
    }
  },

  adoptedException: false,

  // Claude 版攤平成 skills/<name>，matt 與自撰的 skill 也在同一層，以 frontmatter metadata.source 標記，audit 不算它們。
  async isForeign(name) {
    if (!claude) return false
    const file = path.join(root, 'plugins/claude/skills', name, 'SKILL.md')
    const m = (await fs.readFile(file, 'utf8')).match(/^---\r?\n([\s\S]*?)\r?\n---/)
    const source = m ? YAML.parse(m[1])?.metadata?.source : undefined
    return source !== undefined && source !== 'pstack'
  },
})
