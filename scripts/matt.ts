#!/usr/bin/env zx

// matt 以 tag v<版本> 釘版，只認發版。
import { run } from './upstream.mjs'

const root = path.dirname(globalThis.__dirname)

// --claude：同一份上游、另一套取捨，對到 plugins/claude/skills/<skill>（攤平），pin 在 pins/matt-claude.pin。
// zx 的 argv 不認布林旗標：`--claude audit` 會把 audit 吃成旗標值，放回位置參數。
if (typeof argv.claude === 'string') argv._.unshift(argv.claude)
const claude = argv.claude !== undefined && argv.claude !== false

await run({
  name: claude ? 'matt-claude' : 'matt',
  root,
  repo: 'https://github.com/mattpocock/skills.git',
  cache: path.join(root, '.follow/matt-skills'),
  sparse: 'skills',
  fetchTags: true,
  localDir: path.join(root, claude ? 'plugins/claude/skills' : 'plugins/omp/skills/matt'),
  diffPaths: 'skills/engineering',
  auditRoots: 'skills/engineering',
  versionHelp: '版本是 package.json 版本（1.3.1）或 latest。pin 只存版本號，對應 tag v<版本>。',
  latestHelp: '最新 v* tag（發版）。main 上同版號的 sha 漂移不算',
  whereLatest: ' latest-tag',
  auditHelp: 'audit 檢查該版（省略＝pin）上游 engineering 每一項都有本地資料夾或 changes.md 最新版本節的不引／待定一名，並報過期紀錄；有缺就 exit 1。',
  portHelp: '--port 把補丁路徑改成本地佈局（skills/<分類>/X → plugins/omp/skills/matt/X；--claude 時 → plugins/claude/skills/X），用 git apply --reject 套。',
  portFrom: /(^|[ \/])skills\/[^/\s]+\/([^/\s]+\/)/g,
  portTo: claude ? '$1plugins/claude/skills/$2' : '$1plugins/omp/skills/matt/$2',

  async latestVersion(ctx) {
    // 只認發版：最新 v* tag。main 上同版號的 sha 漂移不算漂移。
    const tags = (await $`git -C ${ctx.cache} tag -l v* --sort=-v:refname`.quiet()).stdout
    const tag = tags.split('\n').map((t) => t.trim()).find((t) => /^v\d+\.\d+\.\d+$/.test(t))
    if (!tag) ctx.die('找不到 v* tag')
    return tag.slice(1)
  },

  async shaFor(ctx, version) {
    const tag = `v${version}`
    const proc = await $`git -C ${ctx.cache} rev-list -n 1 ${tag}`.quiet().nothrow()
    if (proc.exitCode !== 0 || !proc.stdout.trim()) ctx.die(`找不到 tag ${tag}`)
    return proc.stdout.trim()
  },

  upstreamItem(file) {
    const m = file.match(/^skills\/([^/]+)\/([^/]+)\/SKILL\.md$/)
    return m ? { path: `skills/${m[1]}/${m[2]}`, skill: m[2] } : null
  },

  // 每項 `名` 開頭（一行多名用頓號併列也行）；`名：` 釋義行只取首名。
  *parseRecordLine(line) {
    if (!line.startsWith('- `')) return
    const names = line.match(/`[^`]+`/g) ?? []
    const list = /^-\s*`[^`]+`：/.test(line) ? names.slice(0, 1) : names
    for (const quoted of list) {
      const skill = quoted.slice(1, -1)
      if (/[\s（）]/.test(skill)) continue
      yield skill.includes('/') ? skill : `skills/engineering/${skill}`
    }
  },

  adoptedException: true, // 引列點名的非 engineering 路徑是已引入的例外，不算過期。

  // Claude 版與 pstack、自撰攤平在同一層，只有 frontmatter metadata.source: matt 的算本地 matt skill。
  async isForeign(name) {
    if (!claude) return false
    const file = path.join(root, 'plugins/claude/skills', name, 'SKILL.md')
    const m = (await fs.readFile(file, 'utf8')).match(/^---\r?\n([\s\S]*?)\r?\n---/)
    return (m ? YAML.parse(m[1])?.metadata?.source : undefined) !== 'matt'
  },
})
