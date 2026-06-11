param(
  [string]$BaseUrl = "https://sunofox.com",
  [switch]$ExpectKakaoEmailScope
)

$ErrorActionPreference = "Stop"

function Join-SiteUrl {
  param(
    [string]$Root,
    [string]$Path
  )
  return $Root.TrimEnd("/") + "/" + $Path.TrimStart("/")
}

function Assert-HeadOk {
  param([string]$Url)

  try {
    $response = Invoke-WebRequest -Uri $Url -Method Head -MaximumRedirection 0
    if ([int]$response.StatusCode -lt 200 -or [int]$response.StatusCode -ge 400) {
      throw "Unexpected status $($response.StatusCode)"
    }
    Write-Host "[OK] $Url $($response.StatusCode)"
  } catch {
    throw "[FAIL] $Url $($_.Exception.Message)"
  }
}

$statusUrl = Join-SiteUrl $BaseUrl "/api/auth/oauth/status"
$status = Invoke-RestMethod $statusUrl

if (-not $status.ok) {
  throw "OAuth status endpoint returned ok=false"
}

if (-not $status.providers.google.configured) {
  throw "Google OAuth is not configured"
}

if (-not $status.providers.kakao.configured) {
  throw "Kakao OAuth is not configured"
}

$kakaoEmailScope = [bool]$status.providers.kakao.emailScopeRequested

if ($ExpectKakaoEmailScope -and -not $kakaoEmailScope) {
  throw "Kakao email scope was expected, but emailScopeRequested=false"
}

Write-Host "[OK] OAuth status: Google configured=$($status.providers.google.configured), Kakao configured=$($status.providers.kakao.configured), Kakao emailScopeRequested=$kakaoEmailScope"

Assert-HeadOk (Join-SiteUrl $BaseUrl "/login/")
Assert-HeadOk (Join-SiteUrl $BaseUrl "/signup/")
Assert-HeadOk (Join-SiteUrl $BaseUrl "/account/")

Write-Host "[DONE] OAuth surface check completed for $BaseUrl"
