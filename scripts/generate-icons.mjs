import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgPath = path.join(__dirname, '../public/assets/icon/icon.svg');
const outputDir = path.join(__dirname, '../public/assets/icon');

const sizes = [
  { name: 'icon-16.png', size: 16 },
  { name: 'icon-32.png', size: 32 },
  { name: 'icon-48.png', size: 48 },
  { name: 'icon-72.png', size: 72 },
  { name: 'icon-96.png', size: 96 },
  { name: 'icon-128.png', size: 128 },
  { name: 'icon-144.png', size: 144 },
  { name: 'icon-152.png', size: 152 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-384.png', size: 384 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon.png', size: 512 },
  { name: 'favicon.png', size: 64 }
];

async function generateIcons() {
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const svgBuffer = fs.readFileSync(svgPath);

  console.log('Generating PWA icons...\n');

  for (const { name, size } of sizes) {
    const outputPath = path.join(outputDir, name);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`  Created: ${name} (${size}x${size})`);
  }

  // Also copy favicon to public root
  const faviconSrc = path.join(outputDir, 'favicon.png');
  const faviconDest = path.join(__dirname, '../public/favicon.png');
  fs.copyFileSync(faviconSrc, faviconDest);
  console.log('\n  Copied favicon.png to public/');

  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
