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
npm run sync          # copy the guides from the Warden working copy, ../Warden (or WARDEN_DIR=/path/to/Warden)
npm run sync:release  # copy them from Warden's main branch on GitHub: the released version
npm run dev           # http://localhost:5173, reloads on change
npm run build         # static site in docs/.vitepress/dist; fails on broken links
npm run preview       # serve the build
npm run deploy        # build and deploy as the static Worker "warden-docs" (wrangler.jsonc)
```

## Branches and publishing

The site is a Worker connected to this repository (Workers Builds): build command `npm run build`, deploy command `npx wrangler deploy`, production branch `main`.

- **`main` is the public site** and documents the **released** version of Warden, the one the Deploy button installs.
- **`develop`** documents the next version: after a change in the Warden repository, `npm run sync`, check with `npm run build`, and commit the synced files. Pull requests and other branches get preview builds.
- When Warden releases a version, merge `develop` into `main` here as well.

`npm run sync` records the version and whether it is released (Warden's `main` on GitHub has it) in `docs/.vitepress/version.json`. A build of `main` (`WORKERS_CI_BRANCH=main`, or `DOCS_RELEASE=1`) stops with an error when the pages describe an unreleased version, so the public site never documents features an installation does not have. Unreleased builds show the version as "next" in the navigation bar. To publish a fix to the released documentation, branch from `main`, run `npm run sync:release`, and open a pull request into `main`.

## Licence

MIT, as Warden. See [Licence.md](Licence.md).
