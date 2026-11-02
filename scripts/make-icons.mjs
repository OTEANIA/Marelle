// Regénération facultative : node scripts/make-icons.mjs (nécessite sharp installé).
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const {default:sharp}=await import(process.env.MARELLE_SHARP_MODULE||'sharp');
const svg=await fs.readFile(new URL('../build-resources/icon.svg',import.meta.url));
await sharp(svg).resize(1024,1024).png().toFile(fileURLToPath(new URL('../build-resources/icon.png',import.meta.url)));
console.log('PNG généré ; les fichiers ICO/ICNS prêts à utiliser sont fournis dans build-resources.');
