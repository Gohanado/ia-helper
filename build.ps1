# Build script pour IA Helper
# Genere les packages Chrome et Firefox

param(
    [string]$Target = "all"  # chrome, firefox, all
)

$Version = (Get-Content -Path "version.json" | ConvertFrom-Json).version
$DistDir = "dist"

# Creer le dossier dist s'il n'existe pas
if (-not (Test-Path $DistDir)) {
    New-Item -ItemType Directory -Path $DistDir | Out-Null
}

# Fichiers a inclure dans le package
$FilesToInclude = @(
    "assets",
    "src",
    "CHANGELOG.md",
    "LICENSE",
    "README.md"
)

function Build-Chrome {
    Write-Host "Building Chrome extension v$Version..." -ForegroundColor Cyan
    
    $ChromeDir = "$DistDir\ia-helper-chrome-v$Version"
    $ChromeZip = "$DistDir\ia-helper-chrome-v$Version.zip"
    
    # Nettoyer
    if (Test-Path $ChromeDir) { Remove-Item -Recurse -Force $ChromeDir }
    if (Test-Path $ChromeZip) { Remove-Item -Force $ChromeZip }
    
    # Creer le dossier
    New-Item -ItemType Directory -Path $ChromeDir | Out-Null
    
    # Copier les fichiers
    foreach ($file in $FilesToInclude) {
        if (Test-Path $file) {
            Copy-Item -Path $file -Destination $ChromeDir -Recurse
        }
    }
    
    # Copier le manifest Chrome
    Copy-Item -Path "manifest.json" -Destination $ChromeDir
    
    # Creer le ZIP
    Compress-Archive -Path "$ChromeDir\*" -DestinationPath $ChromeZip -Force
    
    Write-Host "Chrome package created: $ChromeZip" -ForegroundColor Green
}

function Build-Firefox {
    Write-Host "Building Firefox extension v$Version..." -ForegroundColor Cyan
    
    $FirefoxDir = "$DistDir\ia-helper-firefox-v$Version"
    $FirefoxZip = "$DistDir\ia-helper-firefox-v$Version.zip"
    
    # Nettoyer
    if (Test-Path $FirefoxDir) { Remove-Item -Recurse -Force $FirefoxDir }
    if (Test-Path $FirefoxZip) { Remove-Item -Force $FirefoxZip }
    
    # Creer le dossier
    New-Item -ItemType Directory -Path $FirefoxDir | Out-Null
    
    # Copier les fichiers
    foreach ($file in $FilesToInclude) {
        if (Test-Path $file) {
            Copy-Item -Path $file -Destination $FirefoxDir -Recurse
        }
    }
    
    # Copier le manifest Firefox (renomme en manifest.json)
    Copy-Item -Path "manifest-firefox.json" -Destination "$FirefoxDir\manifest.json"
    
    # Creer le ZIP
    Compress-Archive -Path "$FirefoxDir\*" -DestinationPath $FirefoxZip -Force
    
    Write-Host "Firefox package created: $FirefoxZip" -ForegroundColor Green
}

# Executer selon la cible
switch ($Target.ToLower()) {
    "chrome" { Build-Chrome }
    "firefox" { Build-Firefox }
    "all" { 
        Build-Chrome
        Build-Firefox
        Write-Host ""
        Write-Host "All packages built successfully!" -ForegroundColor Green
        Write-Host "Chrome: dist\ia-helper-chrome-v$Version.zip"
        Write-Host "Firefox: dist\ia-helper-firefox-v$Version.zip"
    }
    default {
        Write-Host "Usage: .\build.ps1 [-Target chrome|firefox|all]" -ForegroundColor Yellow
    }
}

