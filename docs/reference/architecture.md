# Architecture

Warden is one Cloudflare Worker. It serves three kinds of traffic, in this order:

| Path | Served by | Authentication |
|---|---|---|
| `/check/<key>`, `/download/<key>[/<file>]` | The public endpoints, after the IP blocklist and rate limits | The licence key in the address |
| `/hooks/github-app`, `/hooks/github/<source>` | Webhooks of connected repositories | The delivery's HMAC signature |
| `/api/v1/…` | The REST API | An API key (`Authorization: Bearer wk_…`) |
| Everything else | The dashboard (React Router, server-rendered) | A session cookie |

The public endpoints and the API never use cookies.

## Stack

- **Runtime:** Cloudflare Workers.
- **Dashboard:** React Router 7 in framework mode with server rendering, Tailwind CSS and shadcn/ui.
- **Data:** Cloudflare D1 (SQLite). **Files:** Cloudflare R2.
- **Rate limits:** Workers rate limiting bindings.
- **Language:** TypeScript throughout. **Tests:** `node:test`, with the real migrations and SQL running on a SQLite stand-in for D1.

## Request flow of a check

1. The guard looks up the caller's address in the IP blocklist (cached for 30 seconds per instance) and applies the rate limits. A blocked caller receives 403, a limited one 429, before any licence is read.
2. The licence is read by its key, with the status set that applies to it (its app's, its own, or the defaults).
3. The effective status is computed: the stored status, or the status its expiry rule points to once the expiry date has passed.
4. The domain is checked against the allowed domains and the site limit.
5. When the site sent `?version=`, the newest release it may download is compared with it.
6. The response is signed (`X-Warden-Signature`: HMAC-SHA256 of the body, keyed with the licence key) and returned. The check, a newly registered site and the caller's address are recorded after the response is sent, and the blocking rules are evaluated then.

## Data model

| Table | Holds |
|---|---|
| `licenses` | Key, status, expiry date, allowed domains, site limit, app, customer, public message, internal notes. |
| `apps` | Products, with defaults for new licences. |
| `statuses` | Custom status sets of an app or a standalone licence. No rows means the built-in defaults. |
| `files` | Files and releases of a licence or an app: release rule, version, channel, release notes, SHA-256, withdrawal. |
| `activations` | Sites registered by checks, with the version and address each reported last. |
| `activity` | Checks, downloads and changes per licence. Checks are kept 90 days. |
| `api_keys` | SHA-256 hashes of API keys, with their scope. |
| `sessions`, `login_attempts` | Dashboard sign-in. |
| `ip_blocks`, `ip_events`, `refused_requests` | IP blocklist, events read by the blocking rules, counts of blocked and rate-limited requests. |
| `settings` | Protection settings and the GitHub App's credentials. |
| `release_sources`, `source_imports` | Connected repositories and the tags they published. |

Migrations are bundled into the Worker and applied on the first request after a deploy.

## Source layout

```
workers/app.ts                  entry point: migrations, routing, the daily scheduled task
app/routes/                     dashboard pages
app/components/                 dashboard components
app/lib/                        logic shared by the server, the dashboard and the tests
app/server/check.server.ts      the check endpoint and its signature
app/server/download.server.ts   gated downloads
app/server/files.server.ts      R2 storage, checksums, releases
app/server/guard.server.ts      IP blocklist and rate limits on the public endpoints
app/server/sources.server.ts    publishing from repositories
app/server/github-app.server.ts the GitHub App: tokens and repositories
app/server/api.server.ts        the REST API
app/server/openapi.server.ts    /api/v1/openapi.json
migrations/                     D1 schema, applied in order
tests/                          node:test suites
```

The source is on [GitHub](https://github.com/momardia54/Warden).
