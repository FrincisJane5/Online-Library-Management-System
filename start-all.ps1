# start-all.ps1 — Starts Laravel backend, React frontend, and ngrok tunnel
# Usage: .\start-all.ps1
# Requires: ngrok installed and authenticated (ngrok config add-authtoken YOUR_TOKEN)

Write-Host "Starting Laravel backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; php artisan serve --host=0.0.0.0 --port=8000"

Start-Sleep -Seconds 2

Write-Host "Starting React frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run dev"

Start-Sleep -Seconds 3

Write-Host "Starting ngrok tunnel on port 3000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http 3000"

Write-Host ""
Write-Host "All services started!" -ForegroundColor Green
Write-Host "1. Wait for ngrok to show a public URL (e.g. https://xxxx.ngrok-free.app)" -ForegroundColor Yellow
Write-Host "2. Open that URL on any device — the QR code will use it automatically." -ForegroundColor Yellow
Write-Host "3. Share the URL + /LccLibraryAttendance for the attendance form." -ForegroundColor Yellow
