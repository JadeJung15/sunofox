param(
  [string]$BaseUrl = "",
  [string]$DistPath = (Join-Path (Get-Location) "dist")
)

$ErrorActionPreference = "Stop"

$routes = @(
  @{
    Name = "home"
    Path = "/"
    File = "index.html"
    Must = @("MUSIC TO NOVEL STUDIO", "https://sunofox.com/")
  },
  @{
    Name = "novels"
    Path = "/novels/"
    File = "novels/index.html"
    Must = @("EPISODES", "https://sunofox.com/novels/")
  },
  @{
    Name = "episode-006"
    Path = "/novels/episode-006/"
    File = "novels/episode-006/index.html"
    Must = @("EPISODE 06", "https://sunofox.com/novels/episode-006/")
  },
  @{
    Name = "music"
    Path = "/music/"
    File = "music/index.html"
    Must = @("Music Archive", "YouTube / MV 영상 허브", "https://sunofox.com/music/")
  },
  @{
    Name = "album"
    Path = "/music/archive-vol-1/"
    File = "music/archive-vol-1/index.html"
    Must = @("ARCHIVE vol.1", "https://sunofox.com/music/archive-vol-1/")
  },
  @{
    Name = "profile"
    Path = "/profile/"
    File = "profile/index.html"
    Must = @("SunoFox Detail", "https://sunofox.com/profile/")
  },
  @{
    Name = "updates"
    Path = "/updates/"
    File = "updates/index.html"
    Must = @("SunoFox Updates", "https://sunofox.com/updates/")
  },
  @{
    Name = "sitemap"
    Path = "/sitemap-0.xml"
    File = "sitemap-0.xml"
    Must = @("https://sunofox.com/updates/", "https://sunofox.com/novels/episode-006/")
  },
  @{
    Name = "robots"
    Path = "/robots.txt"
    File = "robots.txt"
    Must = @("https://sunofox.com/sitemap-index.xml")
  }
)

function Get-RouteContent {
  param(
    [hashtable]$Route
  )

  if ([string]::IsNullOrWhiteSpace($BaseUrl) -eq $false) {
    $base = ([string]$BaseUrl).Trim().TrimEnd([char]"/")
    $response = Invoke-WebRequest -Uri "$base$($Route['Path'])" -TimeoutSec 30 -UseBasicParsing
    return @{
      Status = [int]$response.StatusCode
      Content = $response.Content
      Source = "$base$($Route['Path'])"
    }
  }

  $filePath = Join-Path $DistPath $Route["File"]
  if (-not (Test-Path -LiteralPath $filePath)) {
    return @{
      Status = "missing"
      Content = ""
      Source = $filePath
    }
  }

  return @{
    Status = 200
    Content = Get-Content -Raw -LiteralPath $filePath
    Source = $filePath
  }
}

$results = foreach ($route in $routes) {
  try {
    $payload = Get-RouteContent -Route $route
    $missing = @()

    foreach ($needle in $route["Must"]) {
      if ($payload.Content -notmatch [regex]::Escape($needle)) {
        $missing += $needle
      }
    }

    [pscustomobject]@{
      Name = $route["Name"]
      Path = $route["Path"]
      Status = $payload.Status
      Pass = ($payload.Status -eq 200 -and $missing.Count -eq 0)
      Missing = ($missing -join " | ")
      Source = $payload.Source
    }
  } catch {
    [pscustomobject]@{
      Name = $route["Name"]
      Path = $route["Path"]
      Status = "error"
      Pass = $false
      Missing = $_.Exception.Message
      Source = if ([string]::IsNullOrWhiteSpace($BaseUrl) -eq $false) {
        "$(([string]$BaseUrl).Trim().TrimEnd([char]'/'))$($route['Path'])"
      } else {
        Join-Path $DistPath $route["File"]
      }
    }
  }
}

$results | Format-Table Name, Path, Status, Pass, Missing -AutoSize

if (($results | Where-Object { -not $_.Pass }).Count -gt 0) {
  exit 1
}
