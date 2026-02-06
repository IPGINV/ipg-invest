$ErrorActionPreference = 'Stop'

$installer = Join-Path $env:TEMP 'postgresql-16.11-1-windows-x64.exe'
if (-not (Test-Path $installer)) {
  Invoke-WebRequest -Uri 'https://get.enterprisedb.com/postgresql/postgresql-16.11-1-windows-x64.exe' -OutFile $installer
}

Start-Process -FilePath $installer -ArgumentList '--mode unattended --unattendedmodeui none --superpassword postgres --servicename postgresql-x64-16 --serverport 5432 --prefix C:\PostgreSQL\16 --datadir C:\PostgreSQL\16\data' -Verb RunAs -Wait
