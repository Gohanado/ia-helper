const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { bundleForFirefox } = require('./bundle-firefox.js');

// Lire la version depuis manifest.json
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
const version = manifest.version;

console.log('\x1b[36m%s\x1b[0m', 'Creation des packages Chrome et Firefox...');
console.log('\x1b[33m%s\x1b[0m', `\nVersion: ${version}`);

// Nettoyer les anciens packages
if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
}
fs.mkdirSync('dist', { recursive: true });
fs.mkdirSync('dist/chrome', { recursive: true });
fs.mkdirSync('dist/firefox', { recursive: true });

// Fonction pour copier recursivement un dossier
function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Fonction pour retirer type="module" des fichiers HTML
function removeModuleType(htmlContent) {
    return htmlContent.replace(/(<script[^>]*)\s+type="module"([^>]*>)/g, '$1$2');
}

// Fonction pour creer un ZIP depuis un dossier
function createZipFromDir(outputPath, sourceDir) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            console.log('\x1b[32m%s\x1b[0m', `Package cree: ${outputPath} (${archive.pointer()} bytes)`);
            resolve();
        });

        archive.on('error', (err) => reject(err));
        archive.pipe(output);

        // Ajouter tout le contenu du dossier
        archive.directory(sourceDir, false);

        archive.finalize();
    });
}

// === BUILD CHROME ===
console.log('\x1b[33m%s\x1b[0m', '\nBuild Chrome...');

// Copier les fichiers sources
copyDir('src', 'dist/chrome/src');
copyDir('assets', 'dist/chrome/assets');
fs.copyFileSync('manifest.json', 'dist/chrome/manifest.json');

console.log('\x1b[32m%s\x1b[0m', 'Build Chrome termine!');

// === BUILD FIREFOX ===
console.log('\x1b[33m%s\x1b[0m', '\nBuild Firefox...');

// Copier les fichiers sources
copyDir('src', 'dist/firefox/src');
copyDir('assets', 'dist/firefox/assets');

// Copier et modifier le manifest Firefox
const firefoxManifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
firefoxManifest.browser_specific_settings = {
    gecko: {
        id: "ia-helper@badom.ch",
        strict_min_version: "142.0",
        data_collection_permissions: {
            required: ["none"]
        }
    }
};
firefoxManifest.background = {
    scripts: ["src/background/service-worker.js"]
};

fs.writeFileSync('dist/firefox/manifest.json', JSON.stringify(firefoxManifest, null, 2));

// Bundler les fichiers JavaScript pour Firefox (retirer imports/exports)
bundleForFirefox('dist/firefox');

// Retirer type="module" des fichiers HTML pour Firefox
const htmlFiles = [
    'dist/firefox/src/chat/chat.html',
    'dist/firefox/src/options/options.html',
    'dist/firefox/src/results/results.html'
];

htmlFiles.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        content = removeModuleType(content);
        fs.writeFileSync(file, content);
    }
});

console.log('\x1b[32m%s\x1b[0m', 'Build Firefox termine!');

// === CREATION DES PACKAGES ZIP ===
console.log('\x1b[33m%s\x1b[0m', '\nCreation des packages ZIP...');

const chromeZip = `dist/ia-helper-chrome-v${version}.zip`;
const firefoxZip = `dist/ia-helper-firefox-v${version}.zip`;

createZipFromDir(chromeZip, 'dist/chrome')
    .then(() => createZipFromDir(firefoxZip, 'dist/firefox'))
    .then(() => {
        console.log('\x1b[32m%s\x1b[0m', '\nPackages crees avec succes!');
        console.log('\x1b[36m%s\x1b[0m', `  - Chrome:  ${chromeZip}`);
        console.log('\x1b[36m%s\x1b[0m', `  - Firefox: ${firefoxZip}`);
        console.log('\x1b[33m%s\x1b[0m', '\nDossiers de build:');
        console.log('\x1b[36m%s\x1b[0m', `  - dist/chrome/`);
        console.log('\x1b[36m%s\x1b[0m', `  - dist/firefox/`);
    })
    .catch((err) => {
        console.error('\x1b[31m%s\x1b[0m', 'Erreur:', err);
        process.exit(1);
    });

