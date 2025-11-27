$env:AGORA_APP_ID="02c4691ff2124a5997025c736f9d6ccf"
$env:AGORA_APP_CERTIFICATE="1a85bc3d65704dc7b49d259c40d0c58f"
$env:PORT="4000"

Write-Host "Starting Drift backend server on port 4000..." -ForegroundColor Cyan
Write-Host "AGORA_APP_ID: $env:AGORA_APP_ID" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

node index.js
