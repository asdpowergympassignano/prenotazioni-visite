// Genera assets/logo-data.js dal file SVG ufficiale (nessuna modifica alla geometria).
const fs = require('fs');
const path = require('path');
const svg = fs.readFileSync(path.join(__dirname, 'assets/logo_rosso_sfondo_nero.svg'), 'utf8');
fs.writeFileSync(path.join(__dirname, 'assets/logo-data.js'),
  '// File generato da build-logo-data.js: non modificare a mano.\nwindow.LOGO_SVG = ' + JSON.stringify(svg) + ';\n');
console.log('assets/logo-data.js scritto (' + svg.length + ' byte di SVG)');
