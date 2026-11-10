// One fixed map viewport, cached locally. Data and map tiles: OpenStreetMap contributors.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '../public/room');
const cache = path.join(root, 'map-tiles');
const europe = process.argv.includes('--europe');
const zoom = europe ? 4 : 6;
const startX = europe ? 7 : 29;
const startY = europe ? 5 : 25;
const rows = europe ? 2 : 3;
fs.mkdirSync(cache, { recursive: true });
(async () => {
  const layers = [];
  for (let y = startY; y < startY + rows; y++) for (let x = startX; x < startX + 3; x++) {
    const file = path.join(cache, `${zoom}-${x}-${y}.png`);
    if (!fs.existsSync(file)) {
      const response = await fetch(`https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`, { headers: { 'User-Agent': 'KardachePortfolio/1.0 (+https://github.com/kardasch404)' } });
      if (!response.ok) throw new Error(`Map tile ${x}/${y}: ${response.status}`);
      fs.writeFileSync(file, Buffer.from(await response.arrayBuffer()));
    }
    layers.push({ input: file, left: (x - startX) * 256, top: (y - startY) * 256 });
  }
  await sharp({ create: { width: 768, height: rows * 256, channels: 3, background: '#e8dfc7' } }).composite(layers).webp({ quality: 90 }).toFile(path.join(root, europe ? 'morocco-europe-map.webp' : 'morocco-map.webp'));
  console.log('Saved real Morocco map with roads. Required attribution: © OpenStreetMap contributors.');
})().catch(error => { console.error(error); process.exitCode = 1; });
