param(
  [Parameter(Mandatory=$true)] [string]$Path,
  [Parameter(Mandatory=$false)] [string]$TimestampUrl = "http://timestamp.digicert.com",
  [Parameter(Mandatory=$false)] [string]$CertThumbprint,
  [Parameter(Mandatory=$false)] [string]$PfxPath,
  [Parameter(Mandatory=$false)] [string]$PfxPassword
)

if (-not (Test-Path $Path)) {
  Write-Error "File not found: $Path"
  exit 1
}

if ($CertThumbprint) {
  & signtool sign /sha1 $CertThumbprint /tr $TimestampUrl /td SHA256 /fd SHA256 $Path
}
elseif ($PfxPath) {
  & signtool sign /f $PfxPath /p $PfxPassword /tr $TimestampUrl /td SHA256 /fd SHA256 $Path
}
else {
  Write-Error "Specify either -CertThumbprint or -PfxPath"
  exit 1
}

Write-Host "Signed $Path" -ForegroundColor Green
