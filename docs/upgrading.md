# Upgrading

## Versions

Warden follows semantic versioning. Until 1.0.0, a minor version (0.x.0) can change the check response, the API or the data model; each such change is listed under **Changed** or **Removed** in the [changelog](/project/changelog), with what to do. Renamed API fields keep their old name as a deprecated alias until 1.0.0. A patch version (0.x.y) only fixes bugs. The full policy is in [Roadmap and versioning](/project/roadmap#versioning).

Your install's version is shown in the dashboard's account menu and in `/api/v1/openapi.json`.

## Build 0.6.0

Version 0.6.0 adds a release limit per track and an optional Worker secret for the signing key, and corrects outdated and up-to-date sites. Migrations run by themselves and site code needs no change. Read the [upgrade notes](/upgrade-notes) before upgrading.

## Build 0.5.0

Version 0.5.0 adds multiple tagged apps under one key, independent statuses, shared or separate expiry dates, and licence templates. Migration 0016 converts existing standalone projects and custom release overrides into apps while preserving keys, signing keys, package data and old download links.

Update management clients to read each entry in `apps`. Existing migrated licences use the tag `default`; before adding another app, update site checks and downloads to select that tag explicitly. Read [0.4 to 0.5](/upgrade-notes) for the full migration and compatibility notes.

A version tag identifies a build. The Deploy button and public documentation use `main`, so a build prepared on `develop` becomes the default through the release pull requests. Preview documentation stays marked as next until Warden's `main` contains that version.

## Before you upgrade

1. Read the [upgrade notes](/upgrade-notes) for each version between yours and the new one: they list what to change in site code, API clients and bookmarks. The [changelog](/project/changelog) has every change.
2. Export the database:

   ```bash
   npx wrangler d1 export <worker-name>-db --remote --output warden-backup.sql
   ```

   D1's Time Travel can also restore the database to any minute of the last 7 days (30 on the paid plan).

## Upgrading an install made with the Deploy button

Releases are tagged `vX.Y.Z` in the Warden repository.

The button copied Warden to a repository in your GitHub account, and Workers Builds deploys every push to it. Bring in the new version, then push:

```bash
git clone https://github.com/<you>/<your-copy>.git && cd <your-copy>
git remote add upstream https://github.com/momardia54/Warden.git
git fetch upstream --tags
git merge v0.5.0          # the version you upgrade to
git push
```

## Upgrading an install made from the command line

```bash
git fetch --tags
git checkout v0.5.0
npm install
npm run deploy
```

## After the upgrade

- Database migrations run by themselves on the first request. Migrations only move forward; to go back to an older version, restore the backup.
- Reload the dashboard in your browser (Cmd+Shift+R or Ctrl+Shift+R), so it does not keep scripts of the previous version.
- Check the upgrade notes for response-shape changes. Version 0.5.0 preserves existing keys and file links, but management responses use per-app entries and multi-app site checks must select the intended tag.
