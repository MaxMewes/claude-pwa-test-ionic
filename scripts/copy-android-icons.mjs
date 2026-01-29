import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgPath = path.join(__dirname, '../public/assets/icon/icon.svg');
const androidResPath = path.join(__dirname, '../android/app/src/main/res');

// Android icon sizes per density
const iconSizes = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

// Foreground sizes for adaptive icons (larger, to allow for masking)
const foregroundSizes = [
  { folder: 'mipmap-mdpi', size: 108 },
  { folder: 'mipmap-hdpi', size: 162 },
  { folder: 'mipmap-xhdpi', size: 216 },
  { folder: 'mipmap-xxhdpi', size: 324 },
  { folder: 'mipmap-xxxhdpi', size: 432 },
];

async function generateAndroidIcons() {
  const svgBuffer = fs.readFileSync(svgPath);

  console.log('Generating Android icons...\n');

  // Generate launcher icons (ic_launcher.png)
  for (const { folder, size } of iconSizes) {
    const outputPath = path.join(androidResPath, folder, 'ic_launcher.png');
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`  Created: ${folder}/ic_launcher.png (${size}x${size})`);
  }

  // Generate round launcher icons (ic_launcher_round.png)
  for (const { folder, size } of iconSizes) {
    const outputPath = path.join(androidResPath, folder, 'ic_launcher_round.png');
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`  Created: ${folder}/ic_launcher_round.png (${size}x${size})`);
  }

  // Generate foreground icons for adaptive icons
  for (const { folder, size } of foregroundSizes) {
    const outputPath = path.join(androidResPath, folder, 'ic_launcher_foreground.png');
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`  Created: ${folder}/ic_launcher_foreground.png (${size}x${size})`);
  }

  console.log('\nAll Android icons generated successfully!');
}

generateAndroidIcons().catch(console.error);
