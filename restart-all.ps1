# IPG Project - Restart All Services
# Usage: .\restart-all.ps1

$ErrorActionPreference = "Stop"
$projectRoot = $PSScriptRoot

Write-Host "=== Stopping existing processes on project ports ===" -ForegroundColor Yellow
$ports = @(3005, 3000, 3004, 5182)
foreach ($port in $ports) {
    $pids = (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue).OwningProcess | Sort-Object -Unique
    foreach ($pid in $pids) {
        if ($pid -gt 0) {
            Write-Host "  Stopping PID $pid (port $port)..."
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
    }
}
Start-Sleep -Seconds 2

Write-Host "`n=== Starting API (port 3005) ===" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\server'; node index.js" -WindowStyle Minimized

Start-Sleep -Seconds 3

Write-Host "=== Starting Dashboard (port 3000) ===" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\Dashboard'; npm run dev" -WindowStyle Minimized

Write-Host "=== Starting Admin (port 3004) ===" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\admin'; npm run dev" -WindowStyle Minimized

Write-Host "=== Starting Invest-Lending (port 5182) ===" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\Invest-Lending'; npm run dev" -WindowStyle Minimized

Start-Sleep -Seconds 8

Write-Host "`n=== Verification ===" -ForegroundColor Green
$checks = @(
    @{ Name = "API Health"; Url = "http://localhost:3005/health" }
    @{ Name = "Dashboard"; Url = "http://localhost:3000" }
    @{ Name = "Admin"; Url = "http://localhost:3004" }
    @{ Name = "Invest-Lending"; Url = "http://localhost:5182" }
)
foreach ($c in $checks) {
    try {
        $r = Invoke-WebRequest -Uri $c.Url -UseBasicParsing -TimeoutSec 5
        Write-Host "  [OK] $($c.Name) - $($r.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "  [FAIL] $($c.Name) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== Links ===" -ForegroundColor White
Write-Host "  API:       http://localhost:3005"
Write-Host "  Dashboard: http://localhost:3000"
Write-Host "  Login:     http://localhost:3000/login.html"
Write-Host "  Admin:     http://localhost:3004"
Write-Host "  Lending:   http://localhost:5182"
