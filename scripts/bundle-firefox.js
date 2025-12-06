const fs = require('fs');
const path = require('path');

/**
 * Bundle simple pour Firefox
 * Concatene les fichiers JS en retirant les imports/exports
 */

// Fonction pour retirer les imports et exports
function removeImportsExports(content, filename) {
    // Retirer les imports
    content = content.replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, '');
    content = content.replace(/^import\s+['"].*?['"];?\s*$/gm, '');

    // Retirer les exports (y compris async)
    content = content.replace(/^export\s+\{[^}]*\};?\s*$/gm, '');
    content = content.replace(/^export\s+(async\s+)?(const|let|var|function|class)\s+/gm, '$1$2 ');
    content = content.replace(/^export\s+default\s+/gm, '');

    return content;
}

// Fonction pour bundler un fichier avec ses dependances
function bundleFile(mainFile, dependencies, outputFile) {
    console.log(`\x1b[36m%s\x1b[0m`, `  Bundling ${mainFile}...`);

    let bundledContent = '// Bundled for Firefox - Auto-generated\n\n';

    // Ajouter les dependances d'abord
    dependencies.forEach(dep => {
        if (fs.existsSync(dep)) {
            const content = fs.readFileSync(dep, 'utf8');
            const cleaned = removeImportsExports(content);
            bundledContent += `// === ${path.basename(dep)} ===\n`;
            bundledContent += cleaned;
            bundledContent += '\n\n';
        }
    });

    // Ajouter le fichier principal
    if (fs.existsSync(mainFile)) {
        const content = fs.readFileSync(mainFile, 'utf8');
        const cleaned = removeImportsExports(content);
        bundledContent += `// === ${path.basename(mainFile)} ===\n`;
        bundledContent += cleaned;
    }

    // Ajouter l'appel a init() si le fichier en a une
    if (bundledContent.includes('async function init()') || bundledContent.includes('function init()')) {
        bundledContent += '\n\n// Auto-init\ninit();\n';
    }

    // Ecrire le fichier bundle
    fs.writeFileSync(outputFile, bundledContent);
    console.log(`\x1b[32m%s\x1b[0m`, `    -> ${outputFile}`);
}

// Fonction pour traiter content-script.js (pas de bundling, juste nettoyage)
function processContentScript(distDir) {
    const contentScriptPath = path.join(distDir, 'src/content/content-script.js');
    if (fs.existsSync(contentScriptPath)) {
        console.log(`\x1b[36m%s\x1b[0m`, `  Processing content-script.js...`);
        let content = fs.readFileSync(contentScriptPath, 'utf8');
        // Pas de modifications pour l'instant - le fichier est deja compatible
        fs.writeFileSync(contentScriptPath, content);
        console.log(`\x1b[32m%s\x1b[0m`, `    -> ${contentScriptPath}`);
    }
}

// Bundler les fichiers pour Firefox
function bundleForFirefox(distDir) {
    console.log('\x1b[33m%s\x1b[0m', '\nBundling des fichiers JavaScript pour Firefox...');

    // Bundle chat.js
    bundleFile(
        'src/chat/chat.js',
        [
            'src/i18n/translations.js',
            'src/config/agents.js',
            'src/utils/dom-sanitizer.js'
        ],
        path.join(distDir, 'src/chat/chat.js')
    );

    // Bundle options.js
    bundleFile(
        'src/options/options.js',
        [
            'src/i18n/translations.js',
            'src/config/agents.js',
            'src/utils/dom-sanitizer.js'
        ],
        path.join(distDir, 'src/options/options.js')
    );

    // Bundle results.js
    bundleFile(
        'src/results/results.js',
        [
            'src/i18n/translations.js',
            'src/utils/dom-sanitizer.js'
        ],
        path.join(distDir, 'src/results/results.js')
    );

    // Traiter content-script.js
    processContentScript(distDir);

    console.log('\x1b[32m%s\x1b[0m', 'Bundling termine!');
}

module.exports = { bundleForFirefox };

