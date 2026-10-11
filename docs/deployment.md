# Deployment

Warden is one Cloudflare Worker with a D1 database, an R2 bucket and a Cron Trigger. There are two ways to deploy it.

## With the Deploy button

The [Deploy to Cloudflare](https://deploy.workers.cloudflare.com/?url=https://github.com/momardia54/Warden) button copies the repository to your GitHub account, connects it to Workers Builds and deploys it. Later pushes to that copy deploy automatically. Then add the admin secrets ([Getting started](/getting-started#_2-add-the-admin-login)).

## From the command line

Requirements: Node.js 22 and a Cloudflare account.

```bash
git clone https://github.com/momardia54/Warden.git
cd Warden
npm install
npx wrangler login
npm run deploy
```

`npm run deploy` builds Warden and runs `wrangler deploy`. On the first deploy, Wrangler creates the D1 database `<worker-name>-db` and the R2 bucket `<worker-name>-files` and binds them. Then add the secrets; Wrangler asks for each value, so it never appears in your shell history:

```bash
npx wrangler secret put ADMIN_USERNAME
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put SESSION_SECRET     # openssl rand -hex 32
```

::: warning Build without local secrets
`npm run preview` copies `.dev.vars` into the build. Delete `.dev.vars` before a build you deploy, so local test credentials never reach production.
:::

## Preview builds of pull requests

When the Worker is connected to a GitHub repository, Cloudflare builds every push and, for pull requests and branches other than the production branch, creates a **preview** with `wrangler preview`. Warden's `wrangler.jsonc` has a `previews` block that gives previews rate limit counters of their own.

A preview has **no database and no file storage**: Cloudflare does not create them for previews automatically, and production's must never be used by unreleased code. A preview therefore shows a "Preview without a database" notice instead of the dashboard. A passing preview build confirms the code builds and uploads; merge the pull request to deploy it to production.

To skip previews entirely, turn off builds for non-production branches in the build settings of your Worker in the Cloudflare dashboard.

## The database

There is no migration step. The Worker applies the bundled migrations to D1 on the first request after a deploy, and records them in D1's `d1_migrations` table, the same one `wrangler d1 migrations` uses.

## Several installs in one account

Each install needs its own Worker name: the database and bucket are named after it. With the Deploy button, choose the name on Cloudflare's setup page; with the command line, change `name` in `wrangler.jsonc`. To name the database differently, set the build variable `DB_SUFFIX` (letters, digits, `-` and `_`, up to 32 characters): the database is then named `<worker-name>-<suffix>`.

## Custom domain

Add one under *Workers & Pages*, your Worker, *Settings*, *Domains & Routes*. Check URLs and download links contain the address, so choose it before issuing licences. The GitHub App, if you use it, is also registered with this address; see [Publishing from GitHub](/guide/repositories).

## Removing an install

Delete the Worker, then the D1 database and the R2 bucket, in the Cloudflare dashboard. Deleting the Worker also deletes its secrets. If you created a GitHub App, delete it on GitHub as well.

## Limits of the Cloudflare free plan

| Resource | What it means for Warden |
|---|---|
| Worker requests (100,000 a day) | Checks, downloads, API calls and dashboard pages together. A site checking every 12 hours uses 2 a day. |
| Request body (100 MB) | The largest file you can upload or publish from GitHub. |
| D1 (5 million rows read a day) | The dashboard's analytics read the check history; large installs may prefer the paid plan. |
| R2 (10 GB stored) | Files and releases. Downloads from R2 are not charged for egress. |

Figures are Cloudflare's published limits at the time of writing; check Cloudflare's pricing pages for current values.
