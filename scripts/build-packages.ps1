# Script pour creer les packages Chrome et Firefox
# Usage: .\scripts\build-packages.ps1

Write-Host "Creation des packages Chrome et Firefox..." -ForegroundColor Cyan

# Nettoyer les anciens packages
Write-Host "`nNettoyage des anciens packages..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}
New-Item -ItemType Directory -Force -Path "dist" | Out-Null

# Lire la version depuis manifest.json
$manifest = Get-Content "manifest.json" | ConvertFrom-Json
$version = $manifest.version
Write-Host "Version: $version" -ForegroundColor Green

# === PACKAGE CHROME ===
Write-Host "`nCreation du package Chrome..." -ForegroundColor Yellow
$chromeDir = "dist/chrome"
New-Item -ItemType Directory -Force -Path $chromeDir | Out-Null

# Copier les fichiers
Copy-Item -Path "manifest.json" -Destination $chromeDir
Copy-Item -Path "src" -Destination $chromeDir -Recurse
Copy-Item -Path "assets" -Destination $chromeDir -Recurse

# Creer le ZIP Chrome
$chromeZip = "dist/ia-helper-chrome-v$version.zip"
Push-Location $chromeDir
Compress-Archive -Path "*" -DestinationPath "../../$chromeZip" -Force
Pop-Location
Write-Host "Package Chrome cree: $chromeZip" -ForegroundColor Green

# === PACKAGE FIREFOX ===
Write-Host "`nCreation du package Firefox..." -ForegroundColor Yellow
$firefoxDir = "dist/firefox"
New-Item -ItemType Directory -Force -Path $firefoxDir | Out-Null

# Copier les fichiers
Copy-Item -Path "manifest.json" -Destination $firefoxDir
Copy-Item -Path "src" -Destination $firefoxDir -Recurse
Copy-Item -Path "assets" -Destination $firefoxDir -Recurse

# Modifier le manifest pour Firefox
$firefoxManifestContent = Get-Content "$firefoxDir/manifest.json" -Raw
$firefoxManifest = $firefoxManifestContent | ConvertFrom-Json

# Ajouter les cles specifiques Firefox
$firefoxManifest | Add-Member -NotePropertyName "browser_specific_settings" -NotePropertyValue @{
    gecko = @{
        id = "{ia-helper@badom.ch}"
        strict_min_version = "109.0"
    }
} -Force

# Sauvegarder le manifest modifie avec encodage UTF8 sans BOM
$jsonOutput = $firefoxManifest | ConvertTo-Json -Depth 10
# Remplacer les caracteres echappes Unicode
$jsonOutput = $jsonOutput -replace '\\u003c', '<' -replace '\\u003e', '>'
$Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $False
[System.IO.File]::WriteAllLines("$firefoxDir/manifest.json", $jsonOutput, $Utf8NoBomEncoding)

# Creer le ZIP Firefox
$firefoxZip = "dist/ia-helper-firefox-v$version.zip"
Push-Location $firefoxDir
Compress-Archive -Path "*" -DestinationPath "../../$firefoxZip" -Force
Pop-Location
Write-Host "Package Firefox cree: $firefoxZip" -ForegroundColor Green

# Nettoyer les dossiers temporaires
Write-Host "`nNettoyage..." -ForegroundColor Yellow
Remove-Item -Recurse -Force $chromeDir
Remove-Item -Recurse -Force $firefoxDir

Write-Host "`nPackages crees avec succes!" -ForegroundColor Green
Write-Host "  - Chrome:  $chromeZip" -ForegroundColor Cyan
Write-Host "  - Firefox: $firefoxZip" -ForegroundColor Cyan

