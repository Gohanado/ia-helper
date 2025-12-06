const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

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

// Fonction pour creer un ZIP
function createZip(outputPath, sourceDir, manifestModifier) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            console.log('\x1b[32m%s\x1b[0m', `Package cree: ${outputPath} (${archive.pointer()} bytes)`);
            resolve();
        });

        archive.on('error', (err) => reject(err));
        archive.pipe(output);

        // Copier manifest.json avec modifications eventuelles
        let manifestContent = fs.readFileSync(path.join(sourceDir, 'manifest.json'), 'utf8');
        let manifestJson = JSON.parse(manifestContent);
        
        if (manifestModifier) {
            manifestJson = manifestModifier(manifestJson);
        }
        
        archive.append(JSON.stringify(manifestJson, null, 2), { name: 'manifest.json' });

        // Ajouter src/
        archive.directory(path.join(sourceDir, 'src'), 'src');

        // Ajouter assets/
        archive.directory(path.join(sourceDir, 'assets'), 'assets');

        archive.finalize();
    });
}

// === PACKAGE CHROME ===
console.log('\x1b[33m%s\x1b[0m', '\nCreation du package Chrome...');
const chromeZip = `dist/ia-helper-chrome-v${version}.zip`;

createZip(chromeZip, '.', null)
    .then(() => {
        // === PACKAGE FIREFOX ===
        console.log('\x1b[33m%s\x1b[0m', '\nCreation du package Firefox...');
        const firefoxZip = `dist/ia-helper-firefox-v${version}.zip`;

        return createZip(firefoxZip, '.', (manifest) => {
            // Ajouter browser_specific_settings pour Firefox
            manifest.browser_specific_settings = {
                gecko: {
                    id: "ia-helper@badom.ch",
                    strict_min_version: "109.0"
                }
            };

            // Firefox MV3 necessite scripts au lieu de service_worker
            manifest.background = {
                scripts: ["src/background/service-worker.js"]
            };

            return manifest;
        });
    })
    .then(() => {
        console.log('\x1b[32m%s\x1b[0m', '\nPackages crees avec succes!');
        console.log('\x1b[36m%s\x1b[0m', `  - Chrome:  ${chromeZip}`);
        console.log('\x1b[36m%s\x1b[0m', `  - Firefox: dist/ia-helper-firefox-v${version}.zip`);
    })
    .catch((err) => {
        console.error('\x1b[31m%s\x1b[0m', 'Erreur:', err);
        process.exit(1);
    });

