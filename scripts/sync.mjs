// Copies the reference pages from the Warden repository into this site, so they have one source: the files in
// Warden are updated with every code change, and this script brings them here. Run it after a Warden change:
//
//   npm run sync                          from the Warden working copy (expects it next to this one: ../Warden),
//                                         for the develop branch of this site: the next version's documentation
//   npm run sync:release                  from Warden's main branch (git fetch first), for the main branch of this
//                                         site: the documentation of the released version, which is what the public site shows
//   WARDEN_DIR=/path/to/Warden npm run sync
//
// Synced pages carry a notice at the top and must be edited in Warden, not here. Relative links are rewritten to
// the page's address on this site, or to the file on GitHub when the target is not a page of the site.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { execFileSync } from "node:child_process"

const here = path.dirname(fileURLToPath(import.meta.url))
const site = path.join(here, "..", "docs")
const warden = path.resolve(process.env.WARDEN_DIR ?? path.join(here, "..", "..", "Warden"))
const GITHUB = "https://github.com/momardia54/Warden/blob/main"

/** Warden file (relative to its root) → page of this site (relative to docs/). */
const PAGES = {
  "docs/checking.md": "guide/checking.md",
  "docs/apps.md": "guide/apps.md",
  "docs/statuses.md": "guide/statuses.md",
  "docs/files.md": "guide/files.md",
  "docs/releases.md": "guide/releases.md",
  "docs/repositories.md": "guide/repositories.md",
  "docs/protection.md": "guide/protection.md",
  "docs/analytics.md": "guide/analytics.md",
  "docs/webhooks.md": "guide/webhooks.md",
  "docs/upgrade-notes.md": "upgrade-notes.md",
  "docs/api.md": "reference/api.md",
  "Security.md": "project/security.md",
  "Roadmap.md": "project/roadmap.md",
  "CHANGELOG.md": "project/changelog.md",
  "Licence.md": "project/licence.md",
}

if (!fs.existsSync(path.join(warden, "package.json"))) {
  console.error(`Warden repository not found at ${warden}. Set WARDEN_DIR to its path.`)
  process.exit(1)
}

const git = (...args) => execFileSync("git", ["-C", warden, ...args], { maxBuffer: 64 * 1024 * 1024 })
// --release reads Warden's main branch as it is on GitHub, whatever is checked out locally.
const ref = process.argv.includes("--release") ? "origin/main" : null
if (ref) git("fetch", "--quiet", "origin", "main")
/** A file of the Warden repository, from `ref` or from the working copy. */
const read = (file) => (ref ? git("show", `${ref}:${file}`) : fs.readFileSync(path.join(warden, file)))
const readText = (file) => read(file).toString("utf8")
const exists = (file) => {
  if (!ref) return fs.existsSync(path.join(warden, file))
  try {
    git("cat-file", "-e", `${ref}:${file}`)
    return true
  } catch {
    return false
  }
}

// A page the source does not have yet (a guide added after the release being synced) is left out, and its copy removed.
for (const [source, target] of Object.entries(PAGES)) {
  if (exists(source)) continue
  console.warn(`Skipped ${source}: not in Warden ${ref ?? "working copy"}.`)
  fs.rmSync(path.join(site, target), { force: true })
  delete PAGES[source]
}

/** Rewrites one Markdown link target found in `source` (a Warden path) for the page at `target` (a site path). */
function rewrite(href, source, target) {
  if (/^(?:[a-z]+:|#|\/)/i.test(href)) return href
  const [file, anchor = ""] = href.split("#")
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(source), file))
  const hash = anchor ? `#${anchor}` : ""
  if (PAGES[resolved]) {
    const relative = path.posix.relative(path.posix.dirname(target), PAGES[resolved])
    return `${relative.startsWith(".") ? relative : `./${relative}`}${hash}`
  }
  if (resolved.startsWith("docs/screenshots/")) return `/screenshots/${path.posix.basename(resolved)}`
  return `${GITHUB}/${resolved}${hash}`
}

/** Titles of the synced pages, so links written as file names ([files.md](files.md)) read as the page's title. */
const TITLES = Object.fromEntries(
  Object.keys(PAGES).map((source) => [source, readText(source).match(/^# (.+)$/m)?.[1]?.trim() ?? null]),
)

/** Link text that is only a file name gets the target page's title. */
function label(text, href, source) {
  if (!/^[\w./-]+\.md$/.test(text)) return text
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(source), href.split("#")[0]))
  return TITLES[resolved] ?? text
}

let pages = 0
for (const [source, target] of Object.entries(PAGES)) {
  const text = readText(source)
  // Links outside code: [text](target) and ![alt](target). Fenced code blocks are left untouched.
  const parts = text.split(/(^```[\s\S]*?^```)/m)
  const body = parts.map((part, i) => (i % 2 === 1 ? part : part.replace(/(!?)\[([^\]]*)\]\(([^)\s]+)\)/g, (_, bang, text, href) => `${bang}[${bang ? text : label(text, href, source)}](${rewrite(href, source, target)})`))).join("")
  const notice = `<!-- Synced from Warden/${source} by scripts/sync.mjs. Edit it there, then run npm run sync. -->\n\n`
  // Every page needs a title; the licence file starts with plain text.
  const title = body.trimStart().startsWith("# ") ? "" : `# ${path.basename(target, ".md").replace(/^./, (c) => c.toUpperCase())}\n\n`
  const out = path.join(site, target)
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, notice + title + body)
  pages++
}

// Screenshots and the logo.
const shots = ref
  ? git("ls-tree", "--name-only", `${ref}:docs/screenshots`).toString("utf8").split("\n").filter(Boolean)
  : fs.readdirSync(path.join(warden, "docs", "screenshots"))
fs.mkdirSync(path.join(site, "public", "screenshots"), { recursive: true })
for (const file of shots) fs.writeFileSync(path.join(site, "public", "screenshots", file), read(`docs/screenshots/${file}`))
fs.writeFileSync(path.join(site, "public", "logo.svg"), read("assets/logo.svg"))

// The version comes from Warden itself. It is released when Warden's main branch on GitHub has it (or a later one);
// the production build refuses to publish documentation of an unreleased version (scripts/check-release.mjs).
const version = JSON.parse(readText("package.json")).version
let releasedVersion = null
try {
  if (!ref) git("fetch", "--quiet", "origin", "main")
  releasedVersion = JSON.parse(git("show", "origin/main:package.json").toString("utf8")).version
} catch {
  console.warn("Could not read Warden's main branch on GitHub: the version is marked as unreleased.")
}
const numbers = (v) => v.split(".").map(Number)
const notAfter = (a, b) => {
  const [x, y] = [numbers(a), numbers(b)]
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] < y[i]
  return true
}
const released = releasedVersion !== null && notAfter(version, releasedVersion)
const source = ref ? `main@${git("rev-parse", "--short", ref).toString("utf8").trim()}` : `working copy (${git("branch", "--show-current").toString("utf8").trim()})`
fs.writeFileSync(path.join(site, ".vitepress", "version.json"), `${JSON.stringify({ version, released, source }, null, 2)}\n`)

console.log(`Synced ${pages} pages, ${shots.length} screenshots and version ${version} (${released ? "released" : "not released"}) from Warden ${source}.`)
