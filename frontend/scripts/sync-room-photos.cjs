// Preserve originals in src/data/imgs; publish optimized copies for static export.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const source = path.join(root, 'src/data/imgs');
const destination = path.join(root, 'public/photos');
fs.mkdirSync(destination, { recursive: true });
(async () => {
  let count = 0;
  for (const name of fs.readdirSync(source)) {
    if (!/\.(jpe?g|png|webp)$/i.test(name)) continue;
    const input = path.join(source, name);
    const output = path.join(destination, `${path.parse(name).name}.webp`);
    if (!fs.existsSync(output) || fs.statSync(input).mtimeMs > fs.statSync(output).mtimeMs) {
      await sharp(input).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 84 }).toFile(output);
    }
    count++;
  }
  console.log(`Synced ${count} portfolio photos.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
