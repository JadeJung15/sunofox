param(
  [string]$BaseUrl = "",
  [string]$DistPath = (Join-Path (Get-Location) "dist")
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Net.Http

$episodeArticleMetaMust = @('"@type":"Article"', '"abstract":', '"timeRequired":')
$episodeNavigationMust = @(
  'data-reader-action="quick-body"',
  'data-reader-action="quick-index"',
  'data-reader-action="quick-ost"',
  'data-reader-action="jump-list"',
  'data-reader-action="action-list"',
  'data-reader-action="action-ost"'
)
$labelMusicArchive = [string]::Concat([char]0xC74C, [char]0xC545, " ", [char]0xC544, [char]0xCE74, [char]0xC774, [char]0xBE0C)
$labelMusicSee = -join @([char]0xC74C, [char]0xC545, " ", [char]0xBCF4, [char]0xAE30)
$labelStudio = -join @([char]0xC2A4, [char]0xD29C, [char]0xB514, [char]0xC624)
$labelSunoFoxDetail = "SunoFox " + [string]::Concat([char]0xC0C1, [char]0xC138, " ", [char]0xC18C, [char]0xAC1C)
$sitemapPublicMust = @(
  "https://sunofox.com/",
  "https://sunofox.com/novels/",
  "https://sunofox.com/novels/episode-001/",
  "https://sunofox.com/novels/episode-006/",
  "https://sunofox.com/music/",
  "https://sunofox.com/music/archive-vol-1/",
  "https://sunofox.com/profile/",
  "https://sunofox.com/updates/",
  "https://sunofox.com/privacy/",
  "https://sunofox.com/terms/"
)
$sitemapForbiddenMustNot = @(
  "https://sunofox.com/admin",
  "https://sunofox.com/api/",
  "https://sunofox.com/login",
  "https://sunofox.com/signup",
  "https://sunofox.com/mv-studio",
  "https://sunofox.com/account",
  "https://sunofox.com/community",
  "https://sunofox.com/community-post",
  "https://sunofox.com/news",
  "https://sunofox.com/media",
  "https://sunofox.com/series",
  "https://sunofox.com/songs",
  "https://sunofox.com/contact",
  "https://sunofox.com/live",
  "https://sunofox.com/biography",
  "https://sunofox.com/goods",
  "https://sunofox.com/404"
)

$routes = @(
  @{
    Name = "home"
    Path = "/"
    File = "index.html"
    Must = @("ANIME OST STUDIO", "anime-home", "anime-hero", "anime-visual", "anime-now", "anime-routes", "anime-note", "anime-social", "/assets/release-desk/mask-good-girl.jpg", "site-footer-nav", 'data-footer-key="novels"', 'data-footer-key="music"', 'data-footer-key="profile"', 'data-footer-key="updates"', 'data-footer-key="privacy"', 'data-footer-key="terms"', "/novels/", "/music/", "/updates/", "/profile/", "https://sunofox.com/", "https://www.youtube.com/@sunofox", $labelMusicArchive)
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
    Must = @("EPISODE 01", "novel-reader-summary", "novel-reader-progress", "novel-reader-quicklinks", "episodeBody", "episodeIndex", "episodeOst", "novel-reader-jumpbar", "novel-reader-index", "novel-reader-actions", "article:published_time", "BreadcrumbList", "https://sunofox.com/novels/episode-001/") + $episodeArticleMetaMust + $episodeNavigationMust + @('data-reader-action="jump-previous-disabled"', 'data-reader-action="jump-next"', 'data-reader-action="action-next"', '"timeRequired":"PT12M"')
  },
  @{
    Name = "episode-002"
    Path = "/novels/episode-002/"
    File = "novels/episode-002/index.html"
    Must = @("EPISODE 02", "novel-reader-summary", "novel-reader-progress", "novel-reader-quicklinks", "episodeBody", "episodeIndex", "episodeOst", "novel-reader-jumpbar", "novel-reader-index", "novel-reader-actions", "article:published_time", "BreadcrumbList", "https://sunofox.com/novels/episode-002/") + $episodeArticleMetaMust + $episodeNavigationMust + @('data-reader-action="jump-previous"', 'data-reader-action="jump-next"', 'data-reader-action="action-previous"', 'data-reader-action="action-next"', '"timeRequired":"PT11M"')
  },
  @{
    Name = "episode-003"
    Path = "/novels/episode-003/"
    File = "novels/episode-003/index.html"
    Must = @("EPISODE 03", "novel-reader-summary", "novel-reader-progress", "novel-reader-quicklinks", "episodeBody", "episodeIndex", "episodeOst", "novel-reader-jumpbar", "novel-reader-index", "novel-reader-actions", "article:published_time", "BreadcrumbList", "https://sunofox.com/novels/episode-003/") + $episodeArticleMetaMust + $episodeNavigationMust + @('data-reader-action="jump-previous"', 'data-reader-action="jump-next"', 'data-reader-action="action-previous"', 'data-reader-action="action-next"', '"timeRequired":"PT5M"')
  },
  @{
    Name = "episode-004"
    Path = "/novels/episode-004/"
    File = "novels/episode-004/index.html"
    Must = @("EPISODE 04", "novel-reader-summary", "novel-reader-progress", "novel-reader-quicklinks", "episodeBody", "episodeIndex", "episodeOst", "novel-reader-jumpbar", "novel-reader-index", "novel-reader-actions", "article:published_time", "BreadcrumbList", "https://sunofox.com/novels/episode-004/") + $episodeArticleMetaMust + $episodeNavigationMust + @('data-reader-action="jump-previous"', 'data-reader-action="jump-next"', 'data-reader-action="action-previous"', 'data-reader-action="action-next"', '"timeRequired":"PT5M"')
  },
  @{
    Name = "episode-005"
    Path = "/novels/episode-005/"
    File = "novels/episode-005/index.html"
    Must = @("EPISODE 05", "novel-reader-summary", "novel-reader-progress", "novel-reader-quicklinks", "episodeBody", "episodeIndex", "episodeOst", "novel-reader-jumpbar", "novel-reader-index", "novel-reader-actions", "article:published_time", "BreadcrumbList", "https://sunofox.com/novels/episode-005/") + $episodeArticleMetaMust + $episodeNavigationMust + @('data-reader-action="jump-previous"', 'data-reader-action="jump-next"', 'data-reader-action="action-previous"', 'data-reader-action="action-next"', '"timeRequired":"PT5M"')
  },
  @{
    Name = "episode-006"
    Path = "/novels/episode-006/"
    File = "novels/episode-006/index.html"
    Must = @("EPISODE 06", "data-reader-state=""season-final""", 'data-reader-state="season-complete"', "novel-reader-summary", "novel-reader-progress", "novel-reader-quicklinks", "episodeBody", "episodeIndex", "episodeOst", "novel-reader-jumpbar", "novel-reader-index", "novel-reader-actions", "novel-reader-completion", "novel-reader-completion-actions", "article:published_time", "BreadcrumbList", "https://sunofox.com/novels/episode-006/") + $episodeArticleMetaMust + $episodeNavigationMust + @('data-reader-action="jump-previous"', 'data-reader-action="jump-next-disabled"', 'data-reader-action="action-previous"', 'data-reader-action="action-next-disabled"', 'data-reader-action="completion-list"', 'data-reader-action="completion-music"', 'data-reader-action="completion-profile"', '"timeRequired":"PT5M"')
  },
  @{
    Name = "music"
    Path = "/music/"
    File = "music/index.html"
    Must = @("Music Archive", "Anime OST / Story OST", "music-archive-actions", "music-video-direct-actions", "music-featured-ost-section", "music-release-card", "music-video-feature", "music-video-hub", "music-video-summary", "music-video-anchor-strip", "music-video-2KsAbBnf2Lk", "music-video-u_OwBr3Cstk", "music-video-grid", "music-story-section", 'data-video-action="latest"', 'data-video-action="channel"', 'data-video-action="playlists"', 'data-video-feature="2KsAbBnf2Lk"', 'data-video-id="2KsAbBnf2Lk"', 'data-video-card="2KsAbBnf2Lk"', 'data-video-type="Web Novel OST"', "https://www.youtube.com/@sunofox", "https://www.youtube.com/@sunofox/playlists", "https://www.youtube.com/watch?v=u_OwBr3Cstk", "https://www.youtube.com/watch?v=2KsAbBnf2Lk", "/novels/episode-006/", "https://sunofox.com/music/")
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
    Must = @("SunoFox Updates", "updates-pinned-section", "updates-pinned-actions", "updates-hub-section", "updates-hub-grid", "updates-category-notice", "updates-category-section", "updates-category-grid", "content-roadmap", "updates-roadmap-section", "updates-roadmap-card", "updates-roadmap-visibility", "updates-roadmap-next", "updates-roadmap-checklist", "updates-roadmap-disabled", 'data-hub-key="commerce"', 'data-hub-key="community"', 'data-hub-checklist="commerce"', 'data-hub-checklist="community"', 'data-hub-state="waiting"', "/novels/", "/music/", "https://sunofox.com/updates/")
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
    Must = $sitemapPublicMust
    MustNot = $sitemapForbiddenMustNot
  },
  @{
    Name = "robots"
    Path = "/robots.txt"
    File = "robots.txt"
    Must = @("Allow: /", "Disallow: /account", "Disallow: /admin", "Disallow: /api/", "Disallow: /login", "Disallow: /mv-studio", "Disallow: /signup", "https://sunofox.com/sitemap-index.xml")
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

function Get-LocalHeaderPolicyCheck {
  if ([string]::IsNullOrWhiteSpace($BaseUrl) -eq $false) {
    return $null
  }

  $headersPath = Join-Path $DistPath "_headers"
  $requiredHeaders = @(
    "/robots.txt",
    "Cache-Control: no-cache, max-age=0, must-revalidate",
    "CDN-Cache-Control: no-store",
    "Cloudflare-CDN-Cache-Control: no-store",
    "Content-Type: text/plain; charset=utf-8"
  )

  if (-not (Test-Path -LiteralPath $headersPath)) {
    return [pscustomobject]@{
      Name = "headers-robots"
      Path = "/robots.txt"
      Status = "missing"
      Pass = $false
      Missing = "_headers"
      Unexpected = ""
      Source = $headersPath
    }
  }

  $content = Get-Content -Raw -Encoding UTF8 -LiteralPath $headersPath
  $missing = @()

  foreach ($needle in $requiredHeaders) {
    if ($content -notmatch [regex]::Escape($needle)) {
      $missing += $needle
    }
  }

  return [pscustomobject]@{
    Name = "headers-robots"
    Path = "/robots.txt"
    Status = "headers"
    Pass = ($missing.Count -eq 0)
    Missing = ($missing -join " | ")
    Unexpected = ""
    Source = $headersPath
  }
}

$results = foreach ($route in $routes) {
  try {
    $payload = Get-RouteContent -Route $route
    $expectedStatus = Get-ExpectedStatus -Route $route
    $missing = @()
    $unexpected = @()

    foreach ($needle in $route["Must"]) {
      if ($payload.Content -notmatch [regex]::Escape($needle)) {
        $missing += $needle
      }
    }

    if ($route.ContainsKey("MustNot")) {
      foreach ($needle in $route["MustNot"]) {
        if ($payload.Content -match [regex]::Escape($needle)) {
          $unexpected += $needle
        }
      }
    }

    [pscustomobject]@{
      Name = $route["Name"]
      Path = $route["Path"]
      Status = $payload.Status
      Pass = ($payload.Status -eq $expectedStatus -and $missing.Count -eq 0 -and $unexpected.Count -eq 0)
      Missing = ($missing -join " | ")
      Unexpected = ($unexpected -join " | ")
      Source = $payload.Source
    }
  } catch {
    [pscustomobject]@{
      Name = $route["Name"]
      Path = $route["Path"]
      Status = "error"
      Pass = $false
      Missing = $_.Exception.Message
      Unexpected = ""
      Source = if ([string]::IsNullOrWhiteSpace($BaseUrl) -eq $false) {
        "$(([string]$BaseUrl).Trim().TrimEnd([char]'/'))$($route['Path'])"
      } else {
        Join-Path $DistPath $route["File"]
      }
    }
  }
}

$localHeaderPolicyCheck = Get-LocalHeaderPolicyCheck
if ($null -ne $localHeaderPolicyCheck) {
  $results = @($results) + $localHeaderPolicyCheck
}

$results | Format-Table Name, Path, Status, Pass, Missing, Unexpected -AutoSize

$failedResults = @($results | Where-Object { $_.Pass -ne $true })
if ($failedResults.Count -gt 0) {
  exit 1
}
