# Configuration

Warden is configured with Worker secrets and bindings. Everything else (statuses, protection rules, GitHub) is set in the dashboard and stored in D1.

## Secrets

Add them under *Workers & Pages*, your Worker, *Settings*, *Variables and Secrets*, or with `npx wrangler secret put <NAME>`.

| Name | Required | Description |
|---|---|---|
| `ADMIN_USERNAME` | Yes | The dashboard's single admin account. |
| `ADMIN_PASSWORD` | Yes | At least 12 characters; the dashboard warns about shorter ones. Changing it ends every session. |
| `SESSION_SECRET` | Recommended | Keys the fingerprint that ties sessions to the admin login, and the hashed addresses used to throttle failed sign-ins. Without it, a value derived from the admin login is used. Generate one with `openssl rand -hex 32`. |

After changing a secret, Cloudflare deploys a new version of the Worker; sign-in can fail for about 20 seconds while it propagates.

## Build variable

| Name | Description |
|---|---|
| `DB_SUFFIX` | Optional. Names the D1 database `<worker-name>-<suffix>` instead of `<worker-name>-db`. 1 to 32 letters, digits, `-` or `_`. Set it before the first deploy. |

## Bindings

Declared in `wrangler.jsonc`; the first deploy creates the resources.

| Binding | Type | Purpose |
|---|---|---|
| `DB` | D1 database | Licences, apps, statuses, activity, settings. |
| `FILES` | R2 bucket | Files and releases. Optional: without it, the dashboard explains how to enable files. |
| `RATE_LIMIT_30` … `RATE_LIMIT_1200` | Rate limiting | One counter per limit value (30, 60, 120, 300, 600 and 1,200 requests a minute). The [Protection](/guide/protection) settings choose which counter each limit uses. |

## Scheduled task

A Cron Trigger runs every day at 03:17 UTC. It:

- deletes check history older than 90 days, and clears the IP address of downloads older than 90 days;
- deletes IP blocklist entries that expired more than 30 days ago, and blocking-rule events older than a day;
- marks publishing jobs that never finished as failed.

## Settings in the dashboard

| Where | What |
|---|---|
| Protection | Rate limits, blocking rules and the allowlist ([Protection](/guide/protection)). |
| Integrations | The GitHub App ([Publishing from GitHub](/guide/repositories)). |
| API keys | Keys for the REST API, with their scope ([API](/reference/api#authentication)). |
| An app | Defaults for new licences, statuses, files and the connected repository. |

## Security headers

The dashboard sends a strict Content Security Policy with a per-request nonce, `X-Frame-Options: DENY` and, over HTTPS, HSTS. Forms can only post to the dashboard itself and to `https://github.com` (for creating the GitHub App). See [Security](/project/security).
