---
layout: home

hero:
  name: Warden
  text: Licences and updates for the sites you sell
  tagline: A self-hosted licence manager on Cloudflare Workers, D1 and R2. Give every licence a key and a check URL, control its status, its sites and its downloads, and publish updates from a dashboard, an API or a GitHub tag.
  actions:
    - theme: brand
      text: Get started
      link: /getting-started
    - theme: alt
      text: What is Warden
      link: /introduction
    - theme: alt
      text: API reference
      link: /reference/api

features:
  - title: A check URL per licence
    details: The customer's site calls its check URL and reads valid, status and message, in a signed response. Enforcement stays in your code, so you decide what an invalid licence does.
    link: /guide/checking
    linkText: Checking a licence
  - title: Apps and site limits
    details: Sell a product to many customers with defaults for every new licence, or license a single project. Limit how many sites a licence may run on.
    link: /guide/apps
    linkText: Apps
  - title: Statuses you define
    details: Pending, Active, Completed and more, or your own, each with an expiry rule, a colour and a message to the site.
    link: /guide/statuses
    linkText: Statuses
  - title: Releases and updates
    details: Upload a build with a version and every site that reports its version is offered the update, with release notes and a SHA-256 checksum. Stable and beta channels.
    link: /guide/releases
    linkText: Releases
  - title: Publishing from GitHub
    details: Connect GitHub once and push a version tag. Warden downloads the repository, repacks it with a fixed folder name and publishes it as a release.
    link: /guide/repositories
    linkText: Publishing from GitHub
  - title: Protection and analytics
    details: IP blocklist, rate limits and automatic blocking rules for the public endpoints, and daily charts of checks, active sites and downloads.
    link: /guide/protection
    linkText: Protection
---

<div class="home-screenshot">

![The Warden dashboard: licence counts, checks of the last 30 days, licences that need attention and apps](/screenshots/overview.jpg)

</div>
