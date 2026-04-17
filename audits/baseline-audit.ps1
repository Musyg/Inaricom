# Audit baseline Inaricom - sans Lighthouse (reseau + HTML analysis)
$ErrorActionPreference = 'Stop'
$auditDir = 'C:\Users\gimu8\Desktop\Inaricom\audits'
$homepage = Join-Path $auditDir 'homepage.html'

# Metriques reseau curl
Write-Host '=== METRIQUES RESEAU ===' -ForegroundColor Cyan
$fmt = 'DNS:%{time_namelookup}s CONNECT:%{time_connect}s SSL:%{time_appconnect}s TTFB:%{time_starttransfer}s TOTAL:%{time_total}s SIZE:%{size_download}o HTTP:%{http_code}'
$metrics = & curl.exe -s -o $homepage -w $fmt 'https://inaricom.com/'
Write-Host $metrics
Write-Host ''

# Headers reponse
Write-Host '=== HEADERS REPONSE ===' -ForegroundColor Cyan
$headers = & curl.exe -s -I 'https://inaricom.com/'
$headers | Select-String -Pattern '^(HTTP|server|cache|content|cf-|x-|strict-transport|vary|via):' | ForEach-Object { Write-Host $_ }
Write-Host ''

# Analyse contenu HTML
Write-Host '=== ANALYSE HTML HOMEPAGE ===' -ForegroundColor Cyan
$h = Get-Content $homepage -Raw
$sizeKB = [Math]::Round($h.Length / 1024, 2)
$cssCount = ([regex]::Matches($h, '<link[^>]+rel="stylesheet')).Count
$jsCount = ([regex]::Matches($h, '<script')).Count
$imgCount = ([regex]::Matches($h, '<img')).Count
$inlineStyleCount = ([regex]::Matches($h, '<style')).Count
$preloadCount = ([regex]::Matches($h, '<link[^>]+rel="preload')).Count
$hasHttp2 = if ($headers -match 'HTTP/2') { 'Oui' } else { 'Non (HTTP/1.1)' }
$hasCloudflare = if ($headers -match 'cf-|cloudflare') { 'Oui' } else { 'Non' }
$hasHSTS = if ($headers -match 'strict-transport-security') { 'Oui' } else { 'Non' }

Write-Host "HTML size: $sizeKB KB"
Write-Host "CSS files: $cssCount"
Write-Host "Script tags: $jsCount"
Write-Host "Inline styles: $inlineStyleCount"
Write-Host "Preload hints: $preloadCount"
Write-Host "Images: $imgCount"
Write-Host "HTTP/2: $hasHttp2"
Write-Host "Cloudflare CDN: $hasCloudflare"
Write-Host "HSTS: $hasHSTS"

# Extraire les URLs CSS et JS
Write-Host ''
Write-Host '=== RESSOURCES EXTERNES DETECTEES ===' -ForegroundColor Cyan
$cssUrls = [regex]::Matches($h, '<link[^>]+href="([^"]+\.css[^"]*)"') | ForEach-Object { $_.Groups[1].Value }
$jsUrls = [regex]::Matches($h, '<script[^>]+src="([^"]+\.js[^"]*)"') | ForEach-Object { $_.Groups[1].Value }
Write-Host "CSS URLs ($($cssUrls.Count)):"
$cssUrls | ForEach-Object { Write-Host "  - $_" }
Write-Host "JS URLs ($($jsUrls.Count)):"
$jsUrls | ForEach-Object { Write-Host "  - $_" }
