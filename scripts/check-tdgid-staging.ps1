param(
    [int]$HttpPort = 19000,
    [int]$Attempts = 30
)

$ErrorActionPreference = "Stop"
$url = "http://127.0.0.1:$HttpPort/if/flow/initial-setup/"

for ($attempt = 1; $attempt -le $Attempts; $attempt++) {
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            $hasAuthentikShell = $response.Content -match "authentik|initial-setup|ak-flow"
            if (-not $hasAuthentikShell) {
                throw "The endpoint returned HTML, but it does not look like an Authentik flow shell."
            }
            Write-Host "TDG.id staging is ready: $url"
            exit 0
        }
    } catch {
        if ($attempt -eq $Attempts) {
            throw "TDG.id staging did not become ready after $Attempts attempts. Check: docker compose --env-file lifecycle/container/.env.staging -f lifecycle/container/compose.tdgid-staging.yml logs server postgresql"
        }
        Start-Sleep -Seconds 2
    }
}
