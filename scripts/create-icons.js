// Script pour creer des icones PNG simples
// Utilise la librairie 'canvas' si disponible, sinon cree des fichiers PNG basiques

const fs = require('fs');
const path = require('path');

// Dimensions des icones
const sizes = [16, 32, 48, 128];

// Dossier de destination
const iconsDir = path.join(__dirname, '..', 'assets', 'icons');

// Creation d'un PNG minimal valide (1x1 pixel violet)
// C'est une solution temporaire - les vrais icones devraient etre creees avec un outil graphique
function createMinimalPNG(size) {
  // Header PNG
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // Pour une solution simple, on va creer un fichier avec canvas si disponible
  // Sinon on utilise les SVG qui seront convertis manuellement
  
  console.log(`Pour creer des icones PNG de qualite, veuillez:`);
  console.log(`1. Ouvrir scripts/generate-icons.html dans un navigateur`);
  console.log(`2. Cliquer sur "Telecharger toutes les icones"`);
  console.log(`3. Deplacer les fichiers telecharges dans assets/icons/`);
  console.log(``);
  console.log(`Ou utiliser un outil comme ImageMagick:`);
  console.log(`convert assets/icons/icon${size}.svg assets/icons/icon${size}.png`);
}

// Verification et creation du dossier
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Essayer d'utiliser canvas
try {
  const { createCanvas } = require('canvas');
  
  sizes.forEach(size => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Dessiner le fond avec gradient
    const padding = size * 0.08;
    const radius = size * 0.2;
    
    // Gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    
    // Rectangle arrondi
    ctx.beginPath();
    ctx.roundRect(padding, padding, size - padding * 2, size - padding * 2, radius);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Texte "IA"
    ctx.fillStyle = 'white';
    ctx.font = `bold ${size * 0.4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('IA', size / 2, size / 2 + size * 0.05);
    
    // Sauvegarder le PNG
    const buffer = canvas.toBuffer('image/png');
    const filePath = path.join(iconsDir, `icon${size}.png`);
    fs.writeFileSync(filePath, buffer);
    console.log(`Cree: ${filePath}`);
  });
  
  console.log('\nToutes les icones ont ete creees avec succes!');
  
} catch (e) {
  console.log('La librairie canvas n\'est pas installee.');
  console.log('Installation: npm install canvas');
  console.log('');
  createMinimalPNG(128);
}

