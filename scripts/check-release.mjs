// Runs before every build. A production build (Workers Builds on the main branch, or DOCS_RELEASE=1) refuses to
// publish documentation of a Warden version that is not released yet, so the public site always matches what the
// Deploy button installs. Synced pages say which version they describe: .vitepress/version.json, written by sync.mjs.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const { version, released, source } = JSON.parse(fs.readFileSync(path.join(here, "..", "docs", ".vitepress", "version.json"), "utf8"))
const production = process.env.WORKERS_CI_BRANCH === "main" || process.env.DOCS_RELEASE === "1"

if (production && !released) {
  console.error(
    `These pages describe Warden ${version} (synced from ${source}), which is not released yet. ` +
      "The main branch publishes the released version only: run `npm run sync:release` on a branch for main, " +
      "or merge develop into main once Warden " + version + " is released.",
  )
  process.exit(1)
}
console.log(`Documentation of Warden ${version}, ${released ? "released" : "not released yet (preview)"}.`)
