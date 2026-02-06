# Imperial Pure Gold - Скрипт запуска всех приложений
# Использование: powershell -ExecutionPolicy Bypass -File start-all.ps1

Write-Host "🚀 Запуск Imperial Pure Gold - Все приложения" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = $PSScriptRoot

# 1. API Server (обязательно первым)
Write-Host "1️⃣  Запуск API Server (порт 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\server'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 3

# 2. Dashboard
Write-Host "2️⃣  Запуск Dashboard (порт 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\Dashboard'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 2

# 3. Invest-Lending
Write-Host "3️⃣  Запуск Invest-Lending (порт 5182)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\Invest-Lending'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 2

# 4. Info App
Write-Host "4️⃣  Запуск Info App (порт 3002)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\Info'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 2

# 5. Wallet App
Write-Host "5️⃣  Запуск Wallet App (порт 3003)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\Wallet'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "✅ Все приложения запущены!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 URL приложений:" -ForegroundColor Cyan
Write-Host "   API Server:      http://localhost:3001/health" -ForegroundColor White
Write-Host "   Dashboard:       http://localhost:3000" -ForegroundColor White
Write-Host "   Invest-Lending:  http://localhost:5182" -ForegroundColor White
Write-Host "   Info App:        http://localhost:3002" -ForegroundColor White
Write-Host "   Wallet App:      http://localhost:3003" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Для остановки всех приложений закройте все открытые окна PowerShell" -ForegroundColor Yellow
Write-Host ""
