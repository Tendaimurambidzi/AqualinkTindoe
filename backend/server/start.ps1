$env:AGORA_APP_ID="02c4691ff2124a5997025c736f9d6ccf"
$env:AGORA_APP_CERTIFICATE="1a85bc3d65704dc7b49d259c40d0c58f"
$env:PORT="4000"
$env:NO_PROXY="127.0.0.1,localhost,.googleapis.com,firestore.googleapis.com,storage.googleapis.com"
$env:no_proxy=$env:NO_PROXY
Remove-Item Env:HTTP_PROXY -ErrorAction SilentlyContinue
Remove-Item Env:HTTPS_PROXY -ErrorAction SilentlyContinue
Remove-Item Env:ALL_PROXY -ErrorAction SilentlyContinue
Remove-Item Env:GRPC_PROXY -ErrorAction SilentlyContinue
Remove-Item Env:http_proxy -ErrorAction SilentlyContinue
Remove-Item Env:https_proxy -ErrorAction SilentlyContinue
Remove-Item Env:all_proxy -ErrorAction SilentlyContinue
Remove-Item Env:grpc_proxy -ErrorAction SilentlyContinue

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent (Split-Path -Parent $scriptDir)
$serviceAccountPath = Join-Path $repoRoot "firebase\serviceAccountKey.json"

if (Test-Path $serviceAccountPath) {
  $env:GOOGLE_APPLICATION_CREDENTIALS = $serviceAccountPath
  Write-Host "Using Firebase service account: $serviceAccountPath" -ForegroundColor Green
} else {
  Write-Host "Firebase service account not found at $serviceAccountPath" -ForegroundColor Yellow
  Write-Host "Backend will rely on existing Google application default credentials." -ForegroundColor Yellow
}

Write-Host "Starting Drift backend server on port 4000..." -ForegroundColor Cyan
Write-Host "AGORA_APP_ID: $env:AGORA_APP_ID" -ForegroundColor Green
Write-Host "Proxy env cleared for Firebase Admin / Google APIs" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

node index.js
