# Sends the backend secrets from backend/.env to the Vercel project "nakra-api".
#
# Run it yourself from the repo root (after the project is connected to GitHub):
#   powershell -ExecutionPolicy Bypass -File scripts\vercel-secrets.ps1
#
# What it sets, for production (main) and for the development branch:
#   JWT_SECRET                      a NEW random value per environment (never the local one)
#   SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / MAIL_FROM     copied from backend/.env
#   SUPERADMIN_EMAIL / SUPERADMIN_PASSWORD                        copied from backend/.env
# Values are stored as "Sensitive": nobody can read them back, not even from the dashboard.
# Changing a value later: run the script again, then redeploy (or push a commit).

$ErrorActionPreference = 'Stop'
$project = 'nakra-api'
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root 'backend\.env'
if (-not (Test-Path $envFile)) { throw "Not found: $envFile" }

# Read KEY=value lines from backend/.env
$values = @{}
Get-Content $envFile -Encoding UTF8 | ForEach-Object {
  if ($_ -match '^([A-Z_]+)=(.*)$') { $values[$Matches[1]] = $Matches[2].Trim().Trim('"') }
}

function New-RandomSecret {
  $bytes = New-Object byte[] 48
  [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  return [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
}

function Set-VercelSecret([string]$name, [string]$value, [string]$target) {
  if ([string]::IsNullOrEmpty($value)) {
    Write-Host "  skip    $name [$target] (empty in backend\.env)" -ForegroundColor Yellow
    return
  }
  $cliArgs = @('env', 'add', $name, '-p', $project, "--value=$value", '--sensitive', '--force', '--yes')
  if ($target -eq 'production') { $cliArgs += @('-e', 'production') }
  else { $cliArgs += @('-e', 'preview', '--git-branch', 'development') }

  $output = & vercel @cliArgs 2>&1 | Out-String
  if ($LASTEXITCODE -ne 0) {
    Write-Host "  FAILED  $name [$target]" -ForegroundColor Red
    Write-Host ($output -replace [regex]::Escape($value), '<hidden>')
    exit 1
  }
  Write-Host "  ok      $name [$target]" -ForegroundColor Green
}

$copied = 'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM', 'SUPERADMIN_EMAIL', 'SUPERADMIN_PASSWORD'

foreach ($target in 'production', 'development') {
  Write-Host "`n$project -> $target" -ForegroundColor Cyan
  Set-VercelSecret 'JWT_SECRET' (New-RandomSecret) $target
  foreach ($name in $copied) { Set-VercelSecret $name $values[$name] $target }
}

Write-Host "`nDone. New values apply to the NEXT deployment (push a commit or redeploy)." -ForegroundColor Cyan
