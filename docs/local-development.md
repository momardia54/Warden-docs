# Local development

For changing Warden itself, or trying it without deploying.

## Setup

Requirements: Node.js 22. Newer versions can fail to build some native dependencies.

```bash
git clone https://github.com/momardia54/Warden.git
cd Warden
npm install
printf 'ADMIN_USERNAME="admin"\nADMIN_PASSWORD="a-long-local-password"\n' > .dev.vars
npm run dev
```

`npm run dev` applies the migrations to a local D1 database (in `.wrangler/state`) and starts the dashboard at `http://localhost:5173`. Pass `-- --port 5180` to choose another port. Local R2 and rate limiting are simulated by Wrangler.

## Commands

| Command | Does |
|---|---|
| `npm run dev` | Local server with the local database, reloading on change. |
| `npm test` | Unit and API tests (`node:test`). They run the real migrations and SQL on a SQLite stand-in for D1. |
| `npx react-router typegen && npx tsc -b` | Type check. Generate the route types first. |
| `npm run build` | Production build. Run it before considering a change done: the production build rejects some things the dev server accepts, such as a page importing a server module. |
| `npm run preview` | Build and serve the production build locally. It copies `.dev.vars` into the build, so delete `.dev.vars` before building for a deploy. |

## Seeding data

Create an API key in the dashboard (*API keys*), then use the API to create apps and licences:

```bash
export WARDEN_KEY=wk_...
curl -X POST http://localhost:5173/api/v1/apps -H "Authorization: Bearer $WARDEN_KEY" -H "Content-Type: application/json" \
  -d '{"name":"Harbor Theme","slug":"harbor-theme","default_duration_days":365,"default_max_sites":2}'
curl -X POST http://localhost:5173/api/v1/apps/harbor-theme/licenses -H "Authorization: Bearer $WARDEN_KEY" -H "Content-Type: application/json" \
  -d '{"name":"Maple Dental","customer_email":"office@mapledental.example"}'
```

## Webhooks and the GitHub App

GitHub cannot deliver webhooks to `localhost`, and refuses a GitHub App whose webhook address is local. Test publishing from GitHub on a deployed copy under another Worker name, and delete it (Worker, database and bucket) afterwards.

## Cleaning up

```bash
rm -f .dev.vars
rm -rf .wrangler/state build
```

## Conventions

- Work on the `develop` branch; `main` is what the Deploy button installs.
- A change includes its documentation (the guide in `docs/`, `CHANGELOG.md`, and `Security.md` or `Roadmap.md` when relevant), its tests, and a new migration when the schema changes. Migrations that have been released are never edited.
- Interface text uses one vocabulary: a check is *valid* or *invalid*; protection uses *IP blocklist*, *allowlist*, *rate limit* and *blocking rule*.
