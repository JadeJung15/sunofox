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
    Must = @("MUSIC TO NOVEL STUDIO", "site-footer-nav", "/novels/", "/music/", "/profile/", "https://sunofox.com/")
  },
  @{
    Name = "novels"
    Path = "/novels/"
    File = "novels/index.html"
    Must = @("EPISODES", "novel-list-toolbar", "novel-list-featured", "novel-list-actions", "novel-list-summary", "novel-reading-path", "novel-reading-card", "novel-episode-tags", "/novels/episode-001/", "/novels/episode-003/", "/novels/episode-005/", "/novels/episode-006/", "novel-world-section", "novel-character-section", "BreadcrumbList", "https://sunofox.com/novels/")
  },
  @{
    Name = "episode-001"
    Path = "/novels/episode-001/"
    File = "novels/episode-001/index.html"
    Must = @("EPISODE 01", "novel-reader-summary", "novel-reader-jumpbar", "novel-reader-index", "novel-reader-actions", "article:published_time", "BreadcrumbList", "https://sunofox.com/novels/episode-001/")
  },
  @{
    Name = "episode-002"
    Path = "/novels/episode-002/"
    File = "novels/episode-002/index.html"
    Must = @("EPISODE 02", "novel-reader-summary", "novel-reader-jumpbar", "novel-reader-index", "novel-reader-actions", "article:published_time", "BreadcrumbList", "https://sunofox.com/novels/episode-002/")
  },
  @{
    Name = "episode-003"
    Path = "/novels/episode-003/"
    File = "novels/episode-003/index.html"
    Must = @("EPISODE 03", "novel-reader-summary", "novel-reader-jumpbar", "novel-reader-index", "novel-reader-actions", "article:published_time", "BreadcrumbList", "https://sunofox.com/novels/episode-003/")
  },
  @{
    Name = "episode-004"
    Path = "/novels/episode-004/"
    File = "novels/episode-004/index.html"
    Must = @("EPISODE 04", "novel-reader-summary", "novel-reader-jumpbar", "novel-reader-index", "novel-reader-actions", "article:published_time", "BreadcrumbList", "https://sunofox.com/novels/episode-004/")
  },
  @{
    Name = "episode-005"
    Path = "/novels/episode-005/"
    File = "novels/episode-005/index.html"
    Must = @("EPISODE 05", "novel-reader-summary", "novel-reader-jumpbar", "novel-reader-index", "novel-reader-actions", "article:published_time", "BreadcrumbList", "https://sunofox.com/novels/episode-005/")
  },
  @{
    Name = "episode-006"
    Path = "/novels/episode-006/"
    File = "novels/episode-006/index.html"
    Must = @("EPISODE 06", "novel-reader-summary", "novel-reader-jumpbar", "novel-reader-index", "novel-reader-actions", "article:published_time", "BreadcrumbList", "https://sunofox.com/novels/episode-006/")
  },
  @{
    Name = "music"
    Path = "/music/"
    File = "music/index.html"
    Must = @("Music Archive", "music-archive-actions", "music-featured-ost-section", "music-release-card", "music-video-feature", "music-video-hub", "music-video-summary", "music-video-grid", "music-story-section", "https://www.youtube.com/@sunofox", "https://www.youtube.com/@sunofox/playlists", "https://www.youtube.com/watch?v=u_OwBr3Cstk", "/novels/episode-006/", "https://sunofox.com/music/")
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
    Must = @("SunoFox Updates", "updates-hub-section", "updates-hub-grid", "content-roadmap", "updates-roadmap-section", "updates-roadmap-card", "updates-roadmap-disabled", "updates-log-section", "updates-log-list", "/novels/", "/music/", "https://sunofox.com/updates/")
  },
  @{
    Name = "sitemap-index"
    Path = "/sitemap-index.xml"
    File = "sitemap-index.xml"
    Must = @("https://sunofox.com/sitemap-0.xml")
  },
  @{
    Name = "sitemap-legacy"
    Path = "/sitemap.xml"
    File = "sitemap.xml"
    Must = @("<sitemapindex", "https://sunofox.com/sitemap-0.xml")
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
    Must = @("Allow: /", "Disallow: /admin", "Disallow: /api/", "Disallow: /login", "Disallow: /mv-studio", "Disallow: /signup", "https://sunofox.com/sitemap-index.xml")
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
