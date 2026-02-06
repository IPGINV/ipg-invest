$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path $scriptDir -Parent

function Start-App($name, $path, $command) {
  Write-Host "Starting $name..."
  Start-Process -WorkingDirectory $path -FilePath "cmd.exe" -ArgumentList "/c", $command | Out-Null
}

Start-App "API" (Join-Path $root "server") "npm run dev"
Start-App "Info" (Join-Path $root "Info") "npm run dev -- --port 5173"
Start-App "Dashboard" (Join-Path $root "Dashboard") "npm run dev -- --port 5174"
Start-App "Wallet" (Join-Path $root "Wallet") "npm run dev -- --port 5175"
Start-App "Invest-Lending" (Join-Path $root "Invest-Lending") "npm run dev -- --port 5176"
Start-App "Calculator" (Join-Path $root "calculator-app") "npm run dev -- --port 5178"
Start-App "Admin" (Join-Path $root "admin") "npm run dev -- --port 5177"
Start-App "Host" (Join-Path $root "host") "py -m http.server 8080"
