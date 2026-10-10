# Upgrading

## Versions

Warden follows semantic versioning. Until 1.0.0, a minor version (0.x.0) can change the check response, the API or the data model; each such change is listed under **Changed** or **Removed** in the [changelog](/project/changelog), with what to do. Renamed API fields keep their old name as a deprecated alias until 1.0.0. A patch version (0.x.y) only fixes bugs. The full policy is in [Roadmap and versioning](/project/roadmap#versioning).

Your install's version is shown in the dashboard's account menu and in `/api/v1/openapi.json`.

## Before you upgrade

1. Read the changelog sections between your version and the new one, especially **Changed** and **Removed**.
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
git merge v0.2.0          # the version you upgrade to
git push
```

## Upgrading an install made from the command line

```bash
git fetch --tags
git checkout v0.2.0
npm install
npm run deploy
```

## After the upgrade

- Database migrations run by themselves on the first request. Migrations only move forward; to go back to an older version, restore the backup.
- Reload the dashboard in your browser (Cmd+Shift+R or Ctrl+Shift+R), so it does not keep scripts of the previous version.
- Check URLs, licence keys, API keys and files stay as they were.
