const fs = require('fs');
const path = require('path');

// Fichiers a traiter
const files = [
    'src/options/options.js',
    'src/content/content-script.js',
    'src/results/results.js'
];

// Pour chaque fichier
files.forEach(filePath => {
    console.log(`\nTraitement de ${filePath}...`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Verifier si l'import existe deja
    if (!content.includes("from '../utils/dom-sanitizer.js'") && !content.includes("from './utils/dom-sanitizer.js'")) {
        // Trouver la derniere ligne d'import
        const importRegex = /^import .+ from .+;$/gm;
        const imports = content.match(importRegex);
        
        if (imports && imports.length > 0) {
            const lastImport = imports[imports.length - 1];
            const lastImportIndex = content.lastIndexOf(lastImport);
            const insertPosition = lastImportIndex + lastImport.length;
            
            // Determiner le chemin relatif correct
            let importPath = '../utils/dom-sanitizer.js';
            if (filePath.startsWith('src/options/') || filePath.startsWith('src/results/') || filePath.startsWith('src/content/')) {
                importPath = '../utils/dom-sanitizer.js';
            }
            
            content = content.slice(0, insertPosition) + 
                      `\nimport { setTrustedHTML } from '${importPath}';` +
                      content.slice(insertPosition);
            modified = true;
            console.log(`  Import ajoute`);
        }
    }
    
    // Compter les occurrences de innerHTML =
    const innerHTMLMatches = content.match(/\.innerHTML\s*=/g);
    if (innerHTMLMatches) {
        console.log(`  ${innerHTMLMatches.length} occurrences de innerHTML trouvees`);
        
        // Remplacer .innerHTML = par setTrustedHTML(element,
        // Pattern: element.innerHTML = value
        // Devient: setTrustedHTML(element, value)
        
        let replacements = 0;
        content = content.replace(
            /(\w+(?:\.\w+|\[['"][^\]]+['"]\])*?)\.innerHTML\s*=\s*(.+?);/g,
            (match, element, value) => {
                replacements++;
                return `setTrustedHTML(${element}, ${value});`;
            }
        );
        
        console.log(`  ${replacements} remplacements effectues`);
        modified = true;
    }
    
    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  Fichier sauvegarde`);
    } else {
        console.log(`  Aucune modification necessaire`);
    }
});

console.log('\nTermine!');

