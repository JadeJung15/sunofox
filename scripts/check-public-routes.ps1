param(
  [string]$BaseUrl = "",
  [string]$DistPath = (Join-Path (Get-Location) "dist")
)

$ErrorActionPreference = "Stop"
$routes = @(
  @{ Name="home"; Path="/"; File="index.html"; Must=@('id="novel"','id="about"','id="filmography"','id="studio"','data-nav-key="novel"','data-nav-key="about"','data-nav-key="filmography"','data-nav-key="studio"','SF Studio') },
  @{ Name="novels"; Path="/novels/"; File="novels/index.html"; Must=@('novel-catalog','episode-catalog','/novels/episode-001/','/novels/episode-006/') },
  @{ Name="episode-001"; Path="/novels/episode-001/"; File="novels/episode-001/index.html"; Must=@('EPISODE 01','article:published_time') },
  @{ Name="episode-002"; Path="/novels/episode-002/"; File="novels/episode-002/index.html"; Must=@('EPISODE 02','article:published_time') },
  @{ Name="episode-003"; Path="/novels/episode-003/"; File="novels/episode-003/index.html"; Must=@('EPISODE 03','article:published_time') },
  @{ Name="episode-004"; Path="/novels/episode-004/"; File="novels/episode-004/index.html"; Must=@('EPISODE 04','article:published_time') },
  @{ Name="episode-005"; Path="/novels/episode-005/"; File="novels/episode-005/index.html"; Must=@('EPISODE 05','article:published_time') },
  @{ Name="episode-006"; Path="/novels/episode-006/"; File="novels/episode-006/index.html"; Must=@('EPISODE 06','article:published_time') },
  @{ Name="privacy"; Path="/privacy/"; File="privacy/index.html"; Must=@('PRIVACY POLICY','https://sunofox.com/privacy/') },
  @{ Name="terms"; Path="/terms/"; File="terms/index.html"; Must=@('TERMS','https://sunofox.com/terms/') },
  @{ Name="login"; Path="/login"; File="login.html"; Must=@('SunoFox Studio','OWNER WORKSPACE','provider=google','next=/mv-studio') },
  @{ Name="sitemap"; Path="/sitemap-0.xml"; File="sitemap-0.xml"; Must=@('https://sunofox.com/','https://sunofox.com/novels/','https://sunofox.com/privacy/','https://sunofox.com/terms/'); MustNot=@('/music/','/profile/','/updates/','/signup','/account','/admin','/login','/mv-studio') },
  @{ Name="robots"; Path="/robots.txt"; File="robots.txt"; Must=@('Allow: /','Disallow: /account','Disallow: /admin','Disallow: /api/','Disallow: /login','Disallow: /mv-studio','https://sunofox.com/sitemap-index.xml'); MustNot=@('Disallow: /signup') }
)

$redirects = @(
  @{ Path='/profile/'; Status=301; Location='/#about' },
  @{ Path='/music/'; Status=301; Location='/#filmography' },
  @{ Path='/music/archive-vol-1/'; Status=301; Location='/#filmography' },
  @{ Path='/updates/'; Status=301; Location='/' },
  @{ Path='/signup'; Status=302; Location='/login?next=/mv-studio' },
  @{ Path='/account'; Status=302; Location='/mv-studio' },
  @{ Path='/admin'; Status=302; Location='/mv-studio' }
)

$results = @()
if ([string]::IsNullOrWhiteSpace($BaseUrl)) {
  foreach ($route in $routes) {
    $file = Join-Path $DistPath $route.File
    $exists = Test-Path -LiteralPath $file
    $content = if ($exists) { Get-Content -Raw -Encoding UTF8 -LiteralPath $file } else { '' }
    $missing = @($route.Must | Where-Object { $content -notmatch [regex]::Escape($_) })
    $unexpected = if ($route.MustNot) { @($route.MustNot | Where-Object { $content -match [regex]::Escape($_) }) } else { @() }
    $status = if ($exists) { 200 } else { 'missing' }
    $results += [pscustomobject]@{ Name=$route.Name; Path=$route.Path; Status=$status; Pass=($exists -and $missing.Count -eq 0 -and $unexpected.Count -eq 0); Missing=($missing -join ' | '); Unexpected=($unexpected -join ' | ') }
  }
  $redirectText = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $DistPath '_redirects')
  foreach ($rule in $redirects) {
    $needle = "$($rule.Path) $($rule.Location) $($rule.Status)"
    $rulePresent = $redirectText -match [regex]::Escape($needle)
    $results += [pscustomobject]@{ Name="redirect"; Path=$rule.Path; Status='config'; Pass=$rulePresent; Missing=if($rulePresent){''}else{$needle}; Unexpected='' }
  }
} else {
  Add-Type -AssemblyName System.Net.Http
  $handler = [System.Net.Http.HttpClientHandler]::new(); $handler.AllowAutoRedirect = $false
  $client = [System.Net.Http.HttpClient]::new($handler); $client.Timeout = [TimeSpan]::FromSeconds(30)
  try {
    foreach ($route in $routes) {
      $response = $client.GetAsync("$($BaseUrl.TrimEnd('/'))$($route.Path)").GetAwaiter().GetResult()
      $content = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
      $missing = @($route.Must | Where-Object { $content -notmatch [regex]::Escape($_) })
      $unexpected = if ($route.MustNot) { @($route.MustNot | Where-Object { $content -match [regex]::Escape($_) }) } else { @() }
      $results += [pscustomobject]@{ Name=$route.Name; Path=$route.Path; Status=[int]$response.StatusCode; Pass=([int]$response.StatusCode -eq 200 -and $missing.Count -eq 0 -and $unexpected.Count -eq 0); Missing=($missing -join ' | '); Unexpected=($unexpected -join ' | ') }
      $response.Dispose()
    }
    foreach ($rule in $redirects) {
      $response = $client.GetAsync("$($BaseUrl.TrimEnd('/'))$($rule.Path)").GetAwaiter().GetResult()
      $location = [string]$response.Headers.Location
      $decodedLocation = [uri]::UnescapeDataString($location)
      $results += [pscustomobject]@{ Name='redirect'; Path=$rule.Path; Status=[int]$response.StatusCode; Pass=([int]$response.StatusCode -eq $rule.Status -and $decodedLocation -like "*$($rule.Location)*"); Missing=if($decodedLocation -like "*$($rule.Location)*") {''} else {$rule.Location}; Unexpected=$location }
      $response.Dispose()
    }
    foreach ($path in @('/api/auth/signup','/api/auth/login','/api/auth/profile','/api/admin/users','/api/community/posts','/api/community/reports','/api/posts','/api/contact')) {
      $response = $client.GetAsync("$($BaseUrl.TrimEnd('/'))$path").GetAwaiter().GetResult()
      $results += [pscustomobject]@{ Name='retired-api'; Path=$path; Status=[int]$response.StatusCode; Pass=([int]$response.StatusCode -eq 404); Missing='404'; Unexpected='' }
      $response.Dispose()
    }
  } finally { $client.Dispose(); $handler.Dispose() }
}

$results | Format-Table Name,Path,Status,Pass,Missing,Unexpected -AutoSize
if (@($results | Where-Object { -not $_.Pass }).Count -gt 0) { exit 1 }
