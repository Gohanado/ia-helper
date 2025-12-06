const fs = require('fs');

// Fichiers a traiter
const files = [
    'src/options/options.js',
    'src/content/content-script.js',
    'src/chat/chat.js',
    'src/results/results.js'
];

files.forEach(filePath => {
    console.log(`\nTraitement de ${filePath}...`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Remplacer les patterns: `; par `);
    // Mais seulement quand c'est dans un contexte setTrustedHTML
    const lines = content.split('\n');
    const newLines = [];
    let inSetTrustedHTML = false;
    let bracketCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // Detecter le debut d'un setTrustedHTML
        if (line.includes('setTrustedHTML(')) {
            inSetTrustedHTML = true;
            bracketCount = 0;
        }
        
        if (inSetTrustedHTML) {
            // Compter les parentheses
            for (let char of line) {
                if (char === '(') bracketCount++;
                if (char === ')') bracketCount--;
            }
            
            // Si on trouve `; et qu'on est toujours dans setTrustedHTML
            if (line.trim().endsWith('`;') && bracketCount > 0) {
                line = line.replace(/`;$/, '`);');
                modified = true;
                console.log(`  Ligne ${i + 1}: Correction de \`; en \`);`);
            }
            
            // Si les parentheses sont equilibrees, on sort
            if (bracketCount <= 0) {
                inSetTrustedHTML = false;
            }
        }
        
        newLines.push(line);
    }
    
    if (modified) {
        fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
        console.log(`  Fichier sauvegarde`);
    } else {
        console.log(`  Aucune modification necessaire`);
    }
});

console.log('\nTermine!');

