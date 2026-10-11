# Getting started

This page takes you from nothing to a site that checks its licence. It takes about ten minutes.

## 1. Deploy

Select **Deploy to Cloudflare**:

<p><a href="https://deploy.workers.cloudflare.com/?url=https://github.com/momardia54/Warden"><img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare"></a></p>

Cloudflare copies the Warden repository to your GitHub account, and creates:

- the **Worker** that serves the dashboard, the API and the check URLs;
- a **D1 database** named `<worker-name>-db`;
- an **R2 bucket** for files, named `<worker-name>-files`;
- a **Cron Trigger** that runs every 10 minutes: it sends webhook events and, once a day, removes old check history.

R2 has to be activated once in your Cloudflare account (Cloudflare asks for a payment method, even for the free tier). Without it, everything works except files and releases, and the dashboard says so.

To deploy from the command line instead, see [Deployment](/deployment).

## 2. Add the admin login

Open your Worker's address. Until the admin login exists, the sign-in page shows what is missing. In the Cloudflare dashboard, open *Workers & Pages*, your Worker, *Settings*, *Variables and Secrets*, and add:

| Name | Type | |
|---|---|---|
| `ADMIN_USERNAME` | Secret | Required |
| `ADMIN_PASSWORD` | Secret, 12 characters or more | Required |
| `SESSION_SECRET` | Secret, for example the output of `openssl rand -hex 32` | Recommended |

Wait a few seconds for the new version to deploy, then sign in. All settings are described in [Configuration](/configuration).

## 3. Use your own domain

Check URLs end up in your customers' sites, so give Warden an address you control: *Workers & Pages*, your Worker, *Settings*, *Domains & Routes*, *Add*, *Custom domain*, for example `licences.example.com`. Changing it later means updating every site.

## 4. Issue a licence

1. **Create an app** for a product you sell to several customers, such as a theme. Its defaults (starting status, duration, site limit) apply to every licence you issue under it. For a one-off client project, skip this and create a standalone licence.
2. **Issue a licence**: *Issue licence* on the app, or *New licence*. Enter the customer and, if you want, allowed domains or a site limit.
3. Open the licence and copy its **check URL** from the *Overview* tab.

![A licence page](/screenshots/licence.jpg)

## 5. Check it from the site

Add a check to the product's code, scheduled about every 12 hours. In WordPress:

```php
function harbor_licence_check( $key ) {
    $url = 'https://licences.example.com/check/' . rawurlencode( $key ) . '?domain=' . rawurlencode( wp_parse_url( home_url(), PHP_URL_HOST ) );
    $res = wp_remote_get( $url, [ 'timeout' => 10 ] );
    if ( is_wp_error( $res ) || wp_remote_retrieve_response_code( $res ) >= 500 ) {
        return null; // Warden unreachable: keep the last known result.
    }
    return json_decode( wp_remote_retrieve_body( $res ), true ); // [ 'valid' => true, 'status' => 'active', 'message' => '' ]
}
```

This minimal version trusts any answer. Before shipping, have the site verify the answer's signature with your installation's **public signing key** (licence page, *Integration* tab, *Public signing key*): copy the key into the site's code once, and it then rejects answers that did not come from your Warden.

Decide in the code what an invalid licence does. Keep the last valid result when Warden cannot be reached, so an outage never takes a customer's site down. [Checking a licence from a site](/guide/checking) covers the response in full, signature verification and JavaScript.

## 6. Next steps

- Ship updates: [Releases and updates](/guide/releases), or [Publishing from GitHub](/guide/repositories) to publish every version tag automatically.
- Connect your payment tool: create an [API key](/reference/api#authentication) and create or renew licences from its webhooks.
- Shape the lifecycle: [Statuses](/guide/statuses) and [Files and release rules](/guide/files), for example a final build released only when a client has paid in full.
- Before going live, read [Security](/project/security) and its hardening checklist.
