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
2. The licence is read by its key. Its tag selects an app attachment, or all attachments when omitted. Each uses its app's status definitions.
3. Each attachment's effective status is computed: the stored status, or the status its expiry rule points to once the shared or separate expiry date and the effective grace period have passed.
4. The domain is checked against the allowed domains and the site limit.
5. When the site sent `?version=`, the newest release it may download is compared with it.
6. The response, which names the licence key, the domain and the site's nonce, is signed with the installation's Ed25519 key (`X-Warden-Signature-Ed25519` over the raw body, with `X-Warden-Key-Id`; the deprecated HMAC header is still added until 1.0.0) and returned. The check, a newly registered site and the caller's address are recorded after the response is sent, and the blocking rules are evaluated then.

## Data model

| Table | Holds |
|---|---|
| `licenses` | Key, expiry mode and shared date, grace override, allowed domains, shared site limit, customer and notes. Legacy columns remain for compatibility. |
| `license_apps` | Tagged app attachments, selected statuses, separate expiry dates, grace/message overrides and event markers. |
| `license_templates` | Reusable tag slots, optional default apps and expiry mode. |
| `activation_versions` | Installed version per attachment and domain. |
| `apps` | Products, with defaults for new licences and a grace period for all of their licences. |
| `statuses` | App status definitions. No rows means built-in defaults. Legacy API-created standalone sets remain supported until 1.0. |
| `files` | App-owned files and releases: release rule, version, channel, release notes, SHA-256, withdrawal. |
| `activations` | Shared domain slots, with the last caller address. Per-tag versions live in activation_versions. |
| `activity` | Checks, downloads and changes per licence. Checks are kept 90 days. |
| `api_keys` | SHA-256 hashes of API keys, with their scope. |
| `sessions`, `login_attempts` | Dashboard sign-in. |
| `ip_blocks`, `ip_events`, `refused_requests` | IP blocklist, events read by the blocking rules, counts of blocked and rate-limited requests. |
| `settings` | Protection settings, the GitHub App's credentials, and the signing key (private key as a JWK; only the public key is ever shown). |
| `release_sources`, `source_imports` | Connected repositories and the tags they published. |
| `webhooks`, `webhook_deliveries` | Outgoing webhooks, and the outbox of their deliveries with each one's state and last result. |

Migrations are bundled into the Worker and applied on the first request after a deploy.

## Source layout

```
workers/app.ts                  entry point: migrations, routing, the scheduled task (every 10 minutes)
app/routes/                     dashboard pages
app/components/                 dashboard components
app/lib/                        logic shared by the server, the dashboard and the tests
app/server/check.server.ts      the check endpoint
app/server/signing.server.ts    the installation's Ed25519 signing key
app/server/webhooks.server.ts   outgoing webhooks: endpoints, the outbox, delivery and retries
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

Migration 0016 moves standalone projects and licence-owned releases to project apps. A migrated project app can inherit a base app's releases for statuses not overridden by its own tracks, preserving earlier custom-build behaviour without copying R2 objects. Checks sign the selected app and tag as well as the key, domain and nonce.
