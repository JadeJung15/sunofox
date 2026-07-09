param(
  [string]$DistDir = "dist"
)

$ErrorActionPreference = "Stop"

function Assert-FileContains {
  param(
    [string]$Path,
    [string]$Pattern,
    [string]$Label
  )

  if (-not (Test-Path $Path)) {
    throw "[FAIL] Missing file for $Label`: $Path"
  }

  $content = Get-Content -Path $Path -Raw
  if ($content -notmatch [regex]::Escape($Pattern)) {
    throw "[FAIL] Missing $Label in $Path"
  }

  Write-Host "[OK] $Label"
}

$adminHtml = Join-Path $DistDir "admin.html"
$adminIndexHtml = Join-Path $DistDir "admin/index.html"

Assert-FileContains $adminHtml 'id="admin-oauth"' "admin OAuth panel in /admin.html"
Assert-FileContains $adminHtml 'id="sf-admin-oauth-status"' "OAuth status container in /admin.html"
Assert-FileContains $adminHtml 'data-admin-refresh="oauth"' "OAuth refresh button in /admin.html"
Assert-FileContains $adminIndexHtml '/admin.html' "admin route redirect target in /admin/index.html"
Assert-FileContains $adminIndexHtml 'window.location.replace' "admin route redirect script in /admin/index.html"

$adminMarkup = Get-Content -Path $adminHtml -Raw
$cssMatch = [regex]::Match($adminMarkup, 'href="(?<href>/css/sf-auth\.[^"]+\.css)"')
$jsMatch = [regex]::Match($adminMarkup, 'src="(?<src>/js/sfAuth\.[^"]+\.js)"')

if (-not $cssMatch.Success) {
  throw "[FAIL] Versioned auth CSS link was not found in $adminHtml"
}

if (-not $jsMatch.Success) {
  throw "[FAIL] Versioned auth JS link was not found in $adminHtml"
}

$cssFile = Join-Path $DistDir ($cssMatch.Groups["href"].Value.TrimStart("/") -replace '/', [IO.Path]::DirectorySeparatorChar)
$jsFile = Join-Path $DistDir ($jsMatch.Groups["src"].Value.TrimStart("/") -replace '/', [IO.Path]::DirectorySeparatorChar)

Assert-FileContains $cssFile '.sf-admin-oauth-grid' "OAuth grid CSS"
Assert-FileContains $cssFile '.sf-admin-oauth-card' "OAuth card CSS"
Assert-FileContains $jsFile 'loadAdminOAuthStatus' "OAuth status loader"
Assert-FileContains $jsFile 'Kakao email scope' "Kakao email scope label"
Assert-FileContains $jsFile 'data-admin-refresh' "admin refresh binding"

Write-Host "[DONE] Admin OAuth panel static check completed."
