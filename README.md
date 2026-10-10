# Warden documentation

The documentation website of [Warden](https://github.com/momardia54/Warden), built with [VitePress](https://vitepress.dev).

## Where the content lives

| Pages | Source |
|---|---|
| Home, introduction, getting started, deployment, configuration, upgrading, local development, architecture | This repository, `docs/` |
| Guides, API reference, security, roadmap, changelog, licence | The Warden repository (`docs/*.md` and the root files), copied by `npm run sync` |

Guides change together with the code, so they are written in the Warden repository. A synced page starts with a comment naming its source; edit it there, never here.

## Commands

Requirements: Node.js 22.

```bash
npm install
npm run sync        # copy the guides from ../Warden (or WARDEN_DIR=/path/to/Warden)
npm run dev         # http://localhost:5173, reloads on change
npm run build       # static site in docs/.vitepress/dist; fails on broken links
npm run preview     # serve the build
npm run deploy      # build and deploy as the static Worker "warden-docs" (wrangler.jsonc)
```

After a change in the Warden repository: `npm run sync`, check the result with `npm run build`, and commit the synced files.

## Licence

MIT, as Warden. See [Licence.md](Licence.md).
