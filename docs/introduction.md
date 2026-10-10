# What is Warden

Warden is a licence manager you deploy to your own Cloudflare account. It is made for people who sell websites, themes and plugins: it issues licence keys, answers the checks your sites make, and serves the files and updates each licence is entitled to.

![The Warden overview](/screenshots/overview.jpg)

## How it works

1. You issue a **licence** in Warden, from the dashboard or the API. Warden gives it a **licence key** and a **check URL**.
2. The customer's site calls the check URL with its domain and its installed version, for example every 12 hours, and reads the response: `valid`, `status`, `message`, and whether an update is waiting.
3. You change the licence's status, or publish a new release. The next time the site checks, it sees the change and acts on it.

```
GET https://licences.example.com/check/WRD-7K2PX-9QM4T-B8WZR-3HNDV?domain=client-site.org&version=1.3.0
```

```json
{ "valid": true, "status": "active", "message": "", "update": { "current": "1.3.0", "available": true, "latest": { "version": "1.4.0" } } }
```

Warden **creates and manages** licences. **Enforcement lives in the site's code**: you decide what an invalid licence does, for example show a notice, switch a feature off or show a maintenance page. [Checking a licence from a site](/guide/checking) has examples in PHP and JavaScript, including how to verify the response's signature.

## Concepts

| Term | Meaning |
|---|---|
| Licence | A key (`WRD-XXXXX-XXXXX-XXXXX-XXXXX`) with a status, an optional expiry date, allowed domains, a site limit and a message for the site. |
| Check URL | `/check/<licence key>`. Public, authenticated by the key in the address, answered with a signed JSON response. |
| Valid / invalid | A check is valid when the licence's status grants access, its expiry rule has not triggered, and the domain is allowed. |
| App | A product sold to many customers. Its licences share its defaults, its statuses and its files. A licence without an app is standalone. |
| Status | The state of a licence, such as Active, Suspended or Completed. Each status says whether it is valid and what it becomes when the expiry date passes. |
| Site | A domain that checked a licence. A licence with a site limit registers sites on their first check. |
| File | A file in R2 owned by a licence or an app, downloadable while the licence has one of its release statuses. |
| Release | A file with a version. Sites that report their version are offered the latest release they may download. |
| Release source | A GitHub repository connected to an app or licence; each version tag becomes a release. |
| API key | A key (`wk_…`) for the REST API, with the scope read, manage or full. |

## What Warden does not do

- **Take payments.** Your payment tool calls Warden's API, for example from a webhook, to create or renew licences.
- **Send email.** Warden has no mail server; outgoing webhooks are on the [roadmap](/project/roadmap).
- **Make a licence impossible to bypass.** Whoever controls a server can remove the check from the code on it. Warden makes a commercial arrangement clear and visible; it is not copy protection. See [Security](/project/security).

## Requirements

- A Cloudflare account. Warden runs on the Workers free plan; R2 has to be activated once for files.
- For publishing from GitHub: a GitHub account.
- For working on Warden itself: Node.js 22.

Next: [Getting started](/getting-started).
