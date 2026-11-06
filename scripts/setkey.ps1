# Saves the key you just copied (the clipboard) into emma\.env.local under the given name.
# The key is never printed. Usage, after copying a key:
#   powershell -ExecutionPolicy Bypass -File "C:\Users\ADMIN\hyperframes claude\emma\scripts\setkey.ps1" ANTHROPIC_API_KEY
param([Parameter(Mandatory = $true)][string]$Name)

$allowed = @{
  'ANTHROPIC_API_KEY'     = 'sk-ant-'
  'STRIPE_SECRET_KEY'     = 'sk_test_'
  'STRIPE_WEBHOOK_SECRET' = 'whsec_'
  'MPESA_CONSUMER_KEY'    = ''
  'MPESA_CONSUMER_SECRET' = ''
  'MPESA_SHORTCODE'       = ''
  'MPESA_PASSKEY'         = ''
}
if (-not $allowed.ContainsKey($Name)) { Write-Host "Unknown name '$Name'. Use one of: $($allowed.Keys -join ', ')" -ForegroundColor Red; exit 1 }

$value = (Get-Clipboard -Raw)
if ($null -eq $value) { $value = '' }
$value = $value.Trim().Trim('"').Trim("'").Trim()
if ($value -eq '') { Write-Host "The clipboard is empty. Copy the key first, then run this again." -ForegroundColor Red; exit 1 }
if ($value -match '\s') { Write-Host "What you copied has spaces or line breaks in it, so it is not a single key. Copy just the key and try again." -ForegroundColor Red; exit 1 }
$prefix = $allowed[$Name]
if ($prefix -and -not $value.StartsWith($prefix)) {
  Write-Host "That does not look like a $Name (it should start with '$prefix'). Nothing was saved. Copy the right key and try again." -ForegroundColor Red; exit 1
}

$file = Join-Path $PSScriptRoot '..\.env.local'
$lines = [System.Collections.Generic.List[string]](Get-Content -LiteralPath $file -Encoding UTF8)
$done = $false
for ($i = 0; $i -lt $lines.Count; $i++) {
  if ($lines[$i] -match "^\s*$([regex]::Escape($Name))\s*=") { $lines[$i] = "$Name=$value"; $done = $true; break }
}
if (-not $done) { $lines.Add("$Name=$value") }
[System.IO.File]::WriteAllLines((Resolve-Path -LiteralPath $file), $lines, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "Saved $Name ($($value.Length) characters)." -ForegroundColor Green
