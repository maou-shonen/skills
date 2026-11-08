// 上游追蹤共用核心：matt.ts / pstack.ts 只傳配置與鉤子。
// zx 注入 $、argv、echo、fs、path；相對 import，不需 node_modules。
// 只寫 pins/<name>.pin 與 .follow/ 快取。永不改 skills/。

let fetched = false // 每次執行只 fetch 一次（diff 會解兩次版）

export async function run(c) {
  const pinFile = path.join(c.root, `pins/${c.name}.pin`)
  const changesFile = path.join(c.root, `pins/${c.name}.changes.md`)
  const shortRepo = c.repo.replace('https://github.com/', '').replace(/\.git$/, '')
  const ctx = { die, cache: c.cache }

  function die(msg) {
    echo(`${c.name}: ${msg}`)
    process.exit(1)
  }

  function usage() {
    echo(`${c.name}.ts apply <版本>
${c.name}.ts diff [版本] [--port]
${c.name}.ts audit [版本]

${c.versionHelp}
diff 省略版本等於 latest，也就是${c.latestHelp}。
apply 只更新 pins/${c.name}.pin。不改 skills/。
${c.auditHelp}
${c.portHelp}`)
    process.exit(1)
  }

  async function ensureCache() {
    await fs.ensureDir(path.dirname(c.cache))
    if (!(await fs.pathExists(path.join(c.cache, '.git')))) {
      echo(`clone ${shortRepo}`)
      await $`git clone --filter=blob:none --sparse ${c.repo} ${c.cache}`.quiet()
      await $`git -C ${c.cache} sparse-checkout set ${c.sparse}`.quiet()
    }
    if (fetched) return
    fetched = true
    echo(`fetch ${shortRepo}`)
    if (c.fetchTags) await $`GIT_TERMINAL_PROMPT=0 git -C ${c.cache} fetch --filter=blob:none --tags origin main`.quiet()
    else await $`GIT_TERMINAL_PROMPT=0 git -C ${c.cache} fetch --filter=blob:none origin main`.quiet()
  }

  async function resolve(spec) {
    if (!/^(?:latest|\d+\.\d+\.\d+)$/i.test(spec)) die(`版本格式不對: ${spec}`)
    await ensureCache()
    const version = spec === 'latest' ? await c.latestVersion(ctx) : spec
    return { version, sha: await c.shaFor(ctx, version) }
  }

  async function readPin() {
    if (!(await fs.pathExists(pinFile))) die('尚未記錄已處理版本，先跑 apply')
    const version = (await fs.readFile(pinFile, 'utf8')).trim()
    if (!/^\d+\.\d+\.\d+$/.test(version)) die(`pins/${c.name}.pin 應為版本號一行`)
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
      line.replace(c.portFrom, c.portTo),
    )
  }

  async function diff(spec = 'latest') {
    const pin = await readPin()
    const target = await resolve(spec)
    const where = spec === 'latest' ? c.whereLatest : ''
    echo(`${c.name} ${pin.version} ${pin.sha} → ${target.version} ${target.sha}${where}`)
    const stat = await $`git -C ${c.cache} diff --stat ${pin.sha} ${target.sha} -- ${c.diffPaths}`.quiet()
    if (!stat.stdout.trim()) {
      echo('無變化')
      return
    }
    const commits = await $`git -C ${c.cache} log --oneline ${pin.sha}..${target.sha} -- ${c.diffPaths}`.quiet()
    if (commits.stdout.trim()) {
      echo(commits.stdout.trimEnd())
    }
    process.stdout.write(stat.stdout)
    const patch = await $`git -C ${c.cache} diff ${pin.sha} ${target.sha} -- ${c.diffPaths}`.quiet()
    process.stdout.write(argv.port ? port(patch.stdout) : patch.stdout)
  }

  // audit：上游每項要有本地同名資料夾，或 changes.md 最新 ## 節的引／不引／待定一名；另報過期紀錄與本地多出。
  // 格式：引：／不引：／待定：段落下條列，鉤子 parseRecordLine 抽上游路徑。只讀第一個 ## 節。
  async function readRecords() {
    const text = await fs.readFile(changesFile, 'utf8')
    const head = text.match(/^## (?!#)\S[^\n]*$/m)
    if (!head) die(`pins/${c.name}.changes.md 缺版本節`)
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
      if (!status) continue
      for (const item of c.parseRecordLine(line)) records.set(item, status)
    }
    return records
  }

  async function audit(spec) {
    const target = spec ? await resolve(spec) : await readPin()
    const files = (await $`git -C ${c.cache} ls-tree -r --name-only ${target.sha} -- ${c.auditRoots}`.quiet()).stdout
    const items = new Map() // 上游路徑 → 本地 skill 名（非 skill 為 null）
    for (const file of files.split('\n').filter(Boolean)) {
      const item = c.upstreamItem(file)
      if (item) items.set(item.path, item.skill)
    }
    const local = new Set(await fs.readdir(c.localDir))
    const records = await readRecords()
    const missing = []
    const deferred = []
    for (const [item, skill] of items) {
      if (skill && local.has(skill)) continue
      const status = records.get(item)
      if (!status) missing.push(item)
      else if (status === 'deferred') deferred.push(item)
    }
    const staleRecords = [...records.keys()].filter((item) => !items.has(item) && !(c.adoptedException && records.get(item) === 'adopted'))
    const upstreamSkills = new Set([...items.values()].filter(Boolean))
    if (c.adoptedException) {
      for (const [item, status] of records) {
        if (status === 'adopted' && !items.has(item)) upstreamSkills.add(item.split('/').pop())
      }
    }
    const orphans = [...local].filter((skill) => !upstreamSkills.has(skill))
    echo(`${c.name} ${target.version} ${target.sha}：上游 ${items.size} 項`)
    for (const item of deferred) echo(`待決定 ${item}`)
    for (const item of missing) echo(`缺紀錄 ${item}`)
    for (const item of staleRecords) echo(`過期紀錄 ${item}`)
    for (const skill of orphans) echo(`本地多出 ${skill}（上游已無同名）`)
    if (missing.length || staleRecords.length || orphans.length) process.exit(1)
    echo('audit 通過')
  }

  const [command, spec, extra] = argv._.map(String)
  if (extra) usage()
  if (command === 'apply') await apply(spec)
  else if (command === 'diff') await diff(spec)
  else if (command === 'audit') await audit(spec)
  else usage()
}
