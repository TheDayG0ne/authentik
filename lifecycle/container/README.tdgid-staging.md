# TDG.id staging

This directory contains the isolated staging definition for the TDG.id fork.
It uses the pinned upstream `version/2026.8.5` commit
`4ec0d19b98da3c329781894cd550da95d3033954` and never reads the production
Compose directory, database, certificates, or volumes.

## Build

From the repository root:

```powershell
.\scripts\build-tdgid-staging.ps1
```

## Start an empty staging instance

```powershell
Copy-Item lifecycle/container/.env.staging.example lifecycle/container/.env.staging
# Replace the two placeholder secrets in .env.staging.
New-Item -ItemType Directory -Force lifecycle/container/staging-templates | Out-Null
docker compose --env-file lifecycle/container/.env.staging `
  -f lifecycle/container/compose.tdgid-staging.yml up -d
```

The default endpoints are `http://127.0.0.1:19000` and
`https://127.0.0.1:19443`. Do not point a public reverse proxy at these ports
until the complete regression checklist has passed.
