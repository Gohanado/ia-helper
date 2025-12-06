const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Lire la version
const version = JSON.parse(fs.readFileSync('version.json', 'utf8')).version;

// Fichiers a inclure
const filesToInclude = [
  'assets',
  'src',
  'CHANGELOG.md',
  'LICENSE',
  'README.md'
];

// Fonction pour creer un ZIP avec des slashes Unix
function createZip(outputPath, manifestPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`Archive created: ${outputPath} (${archive.pointer()} bytes)`);
      resolve();
    });

    archive.on('error', (err) => reject(err));
    archive.pipe(output);

    // Ajouter les fichiers avec des slashes Unix
    filesToInclude.forEach(item => {
      if (fs.existsSync(item)) {
        const stat = fs.statSync(item);
        if (stat.isDirectory()) {
          archive.directory(item, item);
        } else {
          archive.file(item, { name: item });
        }
      }
    });

    // Ajouter le manifest
    archive.file(manifestPath, { name: 'manifest.json' });

    archive.finalize();
  });
}

// Build Chrome
async function buildChrome() {
  console.log(`Building Chrome extension v${version}...`);
  const outputPath = `dist/ia-helper-chrome-v${version}.zip`;
  
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }
  
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }
  
  await createZip(outputPath, 'manifest.json');
  console.log(`Chrome package created: ${outputPath}`);
}

// Build Firefox
async function buildFirefox() {
  console.log(`Building Firefox extension v${version}...`);
  const outputPath = `dist/ia-helper-firefox-v${version}.zip`;
  
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }
  
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }
  
  await createZip(outputPath, 'manifest-firefox.json');
  console.log(`Firefox package created: ${outputPath}`);
}

// Main
async function main() {
  const target = process.argv[2] || 'all';
  
  try {
    switch (target.toLowerCase()) {
      case 'chrome':
        await buildChrome();
        break;
      case 'firefox':
        await buildFirefox();
        break;
      case 'all':
        await buildChrome();
        await buildFirefox();
        console.log('\nAll packages built successfully!');
        console.log(`Chrome: dist/ia-helper-chrome-v${version}.zip`);
        console.log(`Firefox: dist/ia-helper-firefox-v${version}.zip`);
        break;
      default:
        console.log('Usage: node scripts/build-zip.js [chrome|firefox|all]');
    }
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

main();

