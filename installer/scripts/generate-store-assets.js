'use strict';

const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const installerRoot = path.resolve(__dirname, '..');
const sourceIcon = path.join(installerRoot, 'build', 'icon.png');
const outputDirectory = path.join(installerRoot, 'build', 'appx');

const squareAssets = [
  ['StoreLogo.png', 50],
  ['Square44x44Logo.png', 44],
  ['Square150x150Logo.png', 150]
];

async function generateAssets() {
  fs.mkdirSync(outputDirectory, { recursive: true });

  for (const [fileName, size] of squareAssets) {
    await sharp(sourceIcon)
      .resize(size, size, { fit: 'contain' })
      .png()
      .toFile(path.join(outputDirectory, fileName));
  }

  const wideIcon = await sharp(sourceIcon)
    .resize(130, 130, { fit: 'contain' })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 310,
      height: 150,
      channels: 4,
      background: '#0b1220'
    }
  })
    .composite([{ input: wideIcon, left: 90, top: 10 }])
    .png()
    .toFile(path.join(outputDirectory, 'Wide310x150Logo.png'));

  console.log(`Risorse Microsoft Store generate in ${outputDirectory}`);
}

generateAssets().catch((error) => {
  console.error(`Generazione risorse Store fallita: ${error.message}`);
  process.exit(1);
});
