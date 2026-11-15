param(
    [string]$Tag = "tdgid:2026.8.5"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Commit = (git -C $Root rev-parse HEAD).Trim()
$Expected = "4ec0d19b98da3c329781894cd550da95d3033954"

if ($Commit -ne $Expected) {
    throw "TDG.id build must use upstream 2026.8.5 commit $Expected; found $Commit"
}

docker build `
    --file (Join-Path $Root "lifecycle/container/Dockerfile") `
    --tag $Tag `
    --build-arg VERSION=2026.8.5-tdgid `
    --build-arg GIT_BUILD_HASH=$Commit `
    $Root

Write-Host "Built isolated TDG.id image $Tag from $Commit"
