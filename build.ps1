# Build script pour IA Helper
# Genere les packages Chrome et Firefox avec slashes Unix pour Firefox

param(
    [string]$Target = "all"  # chrome, firefox, all
)

# Utiliser le script Node.js qui cree des ZIPs avec slashes Unix
node scripts/build-zip.js $Target

