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

await run({
  name: 'pstack',
  root,
  repo: 'https://github.com/cursor/plugins.git',
  cache: path.join(root, '.follow/cursor-plugins'),
  sparse: 'pstack',
  fetchTags: false,
  localDir: path.join(root, 'skills/pstack'),
  diffPaths: 'pstack/',
  auditRoots: ['pstack/skills', 'pstack/agents', 'pstack/automations'],
  versionHelp: '版本是 plugin 版本（0.15.21）或 latest。pin 只存版本號，sha 每次用版本現算，不跟 main HEAD。',
  latestHelp: ' origin/main 上的 pstack/',
  whereLatest: ' main',
  auditHelp: 'audit 檢查該版（省略＝pin）上游每一項都有本地資料夾或 changes.md 最新版本節的引／不引／待定一名，並報過期紀錄；有缺就 exit 1。',
  portHelp: '--port 把補丁路徑改成本地分類（pstack/skills/X → skills/pstack/X），用 git apply --reject 套。',
  portFrom: /(^|[ \/])pstack\/skills\//g,
  portTo: '$1skills/pstack/',

  async latestVersion(ctx) {
    const sha = (await $`git -C ${ctx.cache} rev-parse origin/main`.quiet()).stdout.trim()
    const version = await readVersion(ctx, sha)
    if (!version) ctx.die('origin/main 沒有 pstack/.cursor-plugin/plugin.json')
    return version
  },

  shaFor: findBump,

  upstreamItem(file) {
    let m = file.match(/^pstack\/skills\/([^/]+)\/SKILL\.md$/)
    if (m) return { path: `pstack/skills/${m[1]}`, skill: m[1] }
    m = file.match(/^pstack\/agents\/([^/]+\.md)$/)
    if (m) return { path: `pstack/agents/${m[1]}`, skill: null }
    m = file.match(/^pstack\/automations\/([^/]+)\//)
    return m ? { path: `pstack/automations/${m[1]}`, skill: null } : null
  },

  // skills 全引靠同名資料夾對上，只解析 agents/automations 的 `pstack/…` 路徑。
  *parseRecordLine(line) {
    if (!line.startsWith('- ')) return
    for (const quoted of line.match(/`pstack\/[^`]+`/g) ?? []) {
      const item = quoted.slice(1, -1)
      if (item.includes('*') || item.includes(' ')) continue
      if (!item.startsWith('pstack/agents/') && !item.startsWith('pstack/automations/')) continue
      yield item.match(/^pstack\/automations\/[^/]+/)?.[0] ?? item
    }
  },

  adoptedException: false,
})
