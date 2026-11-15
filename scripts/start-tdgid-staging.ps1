param(
    [string]$Image = "tdgid:2026.8.5",
    [switch]$Rebuild,
    [switch]$Down
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$ContainerDir = Join-Path $Root "lifecycle/container"
$EnvFile = Join-Path $ContainerDir ".env.staging"
$ComposeFile = Join-Path $ContainerDir "compose.tdgid-staging.yml"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker CLI is required. Install/start Docker Desktop or run this script on the staging host with Docker Engine."
}

docker info | Out-Null
if ($LASTEXITCODE -ne 0) {
    throw "Docker is installed but the daemon is not available. Start Docker Desktop/Docker Engine and retry."
}

if ($Down) {
    docker compose --env-file $EnvFile -f $ComposeFile down
    exit 0
}

if (-not (Test-Path $EnvFile)) {
    $password = [Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Maximum 256) }))
    $secret = [Convert]::ToBase64String((1..64 | ForEach-Object { [byte](Get-Random -Maximum 256) }))
    @"
PG_DB=tdgid_staging
PG_USER=tdgid_staging
PG_PASS=$password
AUTHENTIK_SECRET_KEY=$secret
AUTHENTIK_TAG=2026.8.5
AUTHENTIK_IMAGE=$Image
TDGID_HTTP_PORT=19000
TDGID_HTTPS_PORT=19443
"@ | Set-Content -Encoding utf8 $EnvFile
    Write-Host "Created local staging environment: $EnvFile"
}

New-Item -ItemType Directory -Force (Join-Path $ContainerDir "staging-templates") | Out-Null

if ($Rebuild -or -not (docker image inspect $Image 2>$null)) {
    & (Join-Path $PSScriptRoot "build-tdgid-staging.ps1") -Tag $Image
}

docker compose --env-file $EnvFile -f $ComposeFile up -d
docker compose --env-file $EnvFile -f $ComposeFile ps
Write-Host "TDG.id staging: http://127.0.0.1:19000/"
Write-Host "First-run setup: http://127.0.0.1:19000/if/flow/initial-setup/"
