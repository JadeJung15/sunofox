param(
  [string]$BaseUrl = "",
  [string]$DistPath = (Join-Path (Get-Location) "dist")
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Net.Http

$episodeArticleMetaMust = @('"@type":"Article"', '"abstract":', '"timeRequired":')
$labelMusicArchive = [string]::Concat([char]0xC74C, [char]0xC545, " ", [char]0xC544, [char]0xCE74, [char]0xC774, [char]0xBE0C)
$labelMusicSee = -join @([char]0xC74C, [char]0xC545, " ", [char]0xBCF4, [char]0xAE30)
$labelStudio = -join @([char]0xC2A4, [char]0xD29C, [char]0xB514, [char]0xC624)
$labelSunoFoxDetail = "SunoFox " + [string]::Concat([char]0xC0C1, [char]0xC138, " ", [char]0xC18C, [char]0xAC1C)

$routes = @(
  @{
    Name = "home"
    Path = "/"
    File = "index.html"
    Must = @("MUSIC TO NOVEL STUDIO", "home-hero-status", "home-novel-facts", "site-footer-nav", "/novels/", "/music/", "/profile/", "https://sunofox.com/", $labelMusicSee, $labelStudio)
  },
  @{
    Name = "novels"
    Path = "/novels/"
    File = "novels/index.html"
    Must = @("EPISODES", "novel-list-toolbar", "novel-list-toolbar-copy", "READ ORDER", "novel-list-featured", "novel-list-actions", "novel-list-summary", "novel-season-status", "novel-season-facts", "novel-season-actions", "novel-reading-path", "novel-reading-card", "novel-episode-tags", "/novels/episode-001/", "/novels/episode-003/", "/novels/episode-005/", "/novels/episode-006/", "novel-world-section", "novel-character-section", "novel-anchor-strip", "novel-card-anchor", "world-palace", "character-adelaine", "BreadcrumbList", "https://sunofox.com/novels/")
  },
  @{
    Name = "episode-001"
    Path = "/novels/episode-001/"
    File = "novels/episode-001/index.html"
    Must = @("EPISODE 01", "novel-reader-summary", "novel-reader-progress", "novel-reader-quicklinks", "episodeBody", "episodeIndex", "episodeOst", "novel-reader-jumpbar", "novel-reader-index", "novel-reader-actions", "article:published_time", "BreadcrumbList", "https://sunofox.com/novels/episode-001/") + $episodeArticleMetaMust + @('"timeRequired":"PT12M"')
  },
  @{
    Name = "episode-002"
    Path = "/novels/episode-002/"
    File = "novels/episode-002/index.html"
    Must = @("EPISODE 02", "novel-reader-summary", "novel-reader-progress", "novel-reader-quicklinks", "episodeBody", "episodeIndex", "episodeOst", "novel-reader-jumpbar", "novel-reader-index", "novel-reader-actions", "article:published_time", "BreadcrumbList", "https://sunofox.com/novels/episode-002/") + $episodeArticleMetaMust + @('"timeRequired":"PT11M"')
  },
  @{
    Name = "episode-003"
    Path = "/novels/episode-003/"
    File = "novels/episode-003/index.html"
    Must = @("EPISODE 03", "novel-reader-summary", "novel-reader-progress", "novel-reader-quicklinks", "episodeBody", "episodeIndex", "episodeOst", "novel-reader-jumpbar", "novel-reader-index", "novel-reader-actions", "article:published_time", "BreadcrumbList", "https://sunofox.com/novels/episode-003/") + $episodeArticleMetaMust + @('"timeRequired":"PT5M"')
  },
  @{
    Name = "episode-004"
    Path = "/novels/episode-004/"
    File = "novels/episode-004/index.html"
    Must = @("EPISODE 04", "novel-reader-summary", "novel-reader-progress", "novel-reader-quicklinks", "episodeBody", "episodeIndex", "episodeOst", "novel-reader-jumpbar", "novel-reader-index", "novel-reader-actions", "article:published_time", "BreadcrumbList", "https://sunofox.com/novels/episode-004/") + $episodeArticleMetaMust + @('"timeRequired":"PT5M"')
  },
  @{
    Name = "episode-005"
    Path = "/novels/episode-005/"
    File = "novels/episode-005/index.html"
    Must = @("EPISODE 05", "novel-reader-summary", "novel-reader-progress", "novel-reader-quicklinks", "episodeBody", "episodeIndex", "episodeOst", "novel-reader-jumpbar", "novel-reader-index", "novel-reader-actions", "article:published_time", "BreadcrumbList", "https://sunofox.com/novels/episode-005/") + $episodeArticleMetaMust + @('"timeRequired":"PT5M"')
  },
  @{
    Name = "episode-006"
    Path = "/novels/episode-006/"
    File = "novels/episode-006/index.html"
    Must = @("EPISODE 06", "data-reader-state=""season-final""", "novel-reader-summary", "novel-reader-progress", "novel-reader-quicklinks", "episodeBody", "episodeIndex", "episodeOst", "novel-reader-jumpbar", "novel-reader-index", "novel-reader-actions", "article:published_time", "BreadcrumbList", "https://sunofox.com/novels/episode-006/") + $episodeArticleMetaMust + @('"timeRequired":"PT5M"')
  },
  @{
    Name = "music"
    Path = "/music/"
    File = "music/index.html"
    Must = @("Music Archive", "music-archive-actions", "music-video-direct-actions", "music-featured-ost-section", "music-release-card", "music-video-feature", "music-video-hub", "music-video-summary", "music-video-anchor-strip", "music-video-u_OwBr3Cstk", "music-video-grid", "music-story-section", "https://www.youtube.com/@sunofox", "https://www.youtube.com/@sunofox/playlists", "https://www.youtube.com/watch?v=u_OwBr3Cstk", "/novels/episode-006/", "https://sunofox.com/music/")
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
    Must = @($labelSunoFoxDetail, "profile-snapshot-section", "profile-snapshot-card", "profile-current-actions", "/novels/", "/music/", "/updates/", "https://sunofox.com/profile/")
  },
  @{
    Name = "updates"
    Path = "/updates/"
    File = "updates/index.html"
    Must = @("SunoFox Updates", "updates-pinned-section", "updates-pinned-actions", "updates-hub-section", "updates-hub-grid", "updates-category-notice", "updates-category-section", "updates-category-grid", "content-roadmap", "updates-roadmap-section", "updates-roadmap-card", "updates-roadmap-visibility", "updates-roadmap-next", "updates-roadmap-disabled", "updates-log-section", "updates-log-list", "/novels/", "/music/", "https://sunofox.com/updates/")
  },
  @{
    Name = "not-found"
    Path = "/__sunofox_not_found_probe__/"
    File = "404.html"
    ExpectedStatus = 404
    Must = @("not-found-page", "not-found-panel", "not-found-actions", $labelMusicArchive, "https://sunofox.com/404.html", "/novels/", "/music/", "noindex, follow")
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

function Get-ExpectedStatus {
  param(
    [hashtable]$Route
  )

  if ([string]::IsNullOrWhiteSpace($BaseUrl) -eq $false -and $Route.ContainsKey("ExpectedStatus")) {
    return [int]$Route["ExpectedStatus"]
  }

  return 200
}

function Read-HttpErrorContent {
  param(
    $Response
  )

  if ($null -eq $Response) {
    return ""
  }

  if ($Response.GetType().FullName -eq "System.Net.Http.HttpResponseMessage") {
    return $Response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
  }

  $stream = $Response.GetResponseStream()
  if ($null -eq $stream) {
    return ""
  }

  $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8)
  try {
    return $reader.ReadToEnd()
  } finally {
    $reader.Dispose()
  }
}

function Get-HttpStatusCode {
  param(
    $Response
  )

  if ($null -eq $Response -or $null -eq $Response.StatusCode) {
    return 0
  }

  return [int]$Response.StatusCode
}

function Get-RouteContent {
  param(
    [hashtable]$Route
  )

  if ([string]::IsNullOrWhiteSpace($BaseUrl) -eq $false) {
    $base = ([string]$BaseUrl).Trim().TrimEnd([char]"/")
    $source = "$base$($Route['Path'])"
    $client = [System.Net.Http.HttpClient]::new()
    $client.Timeout = [TimeSpan]::FromSeconds(30)
    $response = $null

    try {
      $response = $client.GetAsync($source).GetAwaiter().GetResult()
      $bytes = $response.Content.ReadAsByteArrayAsync().GetAwaiter().GetResult()

      return @{
        Status = [int]$response.StatusCode
        Content = [System.Text.Encoding]::UTF8.GetString($bytes)
        Source = $source
      }
    } catch {
      throw
    } finally {
      if ($null -ne $response) {
        $response.Dispose()
      }
      $client.Dispose()
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
      Content = Get-Content -Raw -Encoding UTF8 -LiteralPath $filePath
      Source = $filePath
    }
  }

$results = foreach ($route in $routes) {
  try {
    $payload = Get-RouteContent -Route $route
    $expectedStatus = Get-ExpectedStatus -Route $route
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
      Pass = ($payload.Status -eq $expectedStatus -and $missing.Count -eq 0)
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
