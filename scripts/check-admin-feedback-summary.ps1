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

function Assert-RegexMatch {
  param(
    [string]$Content,
    [string]$Pattern,
    [string]$Label
  )

  if ($Content -notmatch $Pattern) {
    throw "[FAIL] Missing $Label"
  }

  Write-Host "[OK] $Label"
}

$adminHtml = Join-Path $DistDir "admin.html"
$adminIndexHtml = Join-Path $DistDir "admin/index.html"

Assert-FileContains $adminHtml 'id="sf-admin-user-filter-summary"' "member filter summary in /admin.html"
Assert-FileContains $adminHtml 'id="sf-admin-user-filter"' "member filter form in /admin.html"
Assert-FileContains $adminHtml 'id="sf-admin-users"' "member list container in /admin.html"
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
$cssContent = Get-Content -Path $cssFile -Raw
$jsContent = Get-Content -Path $jsFile -Raw

Assert-FileContains $jsFile 'appendAdminResultFeedback' "admin feedback helper"
Assert-FileContains $jsFile 'dataset.feedback' "admin feedback temporary state"
Assert-FileContains $jsFile 'sf-admin-user-filter-summary' "member feedback target"
Assert-FileContains $jsFile '회원 데이터를 불러오는 중입니다.' "member loading feedback copy"
Assert-FileContains $jsFile '회원 데이터를 불러오지 못했습니다.' "member failure feedback copy"

Assert-RegexMatch $cssContent '\.sf-admin-filter-summary\[data-feedback=?["'']?true["'']?\]' "filter feedback CSS state"
Assert-RegexMatch $cssContent '\.sf-admin-body \.sf-admin-filter-summary\[data-feedback=?["'']?true["'']?\]' "dark admin feedback CSS state"
Assert-RegexMatch $cssContent 'prefers-reduced-motion:\s*reduce' "reduced motion media query"
Assert-RegexMatch $cssContent 'transition:\s*none' "reduced motion transition override"

Write-Host "[DONE] Admin feedback summary static check completed."
