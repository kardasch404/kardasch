// Geographic boundaries: Natural Earth (public domain). Paper: generated texture.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'src/data/general.json'), 'utf8'));
const countries = JSON.parse(fs.readFileSync(path.join(root, 'src/data/maps/natural-earth-countries.geojson'), 'utf8'));
const bounds = data.map.viewport.bounds;
const width = 1200, height = 1300;
const mercator = latitude => Math.asinh(Math.tan(latitude * Math.PI / 180));
const project = ([longitude, latitude]) => [(longitude - bounds.west) / (bounds.east - bounds.west) * width, (mercator(bounds.north) - mercator(Math.max(-85, Math.min(85, latitude)))) / (mercator(bounds.north) - mercator(bounds.south)) * height];
const ring = points => points.map((point, index) => { const [x,y] = project(point); return `${index ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`; }).join(' ') + 'Z';
const paths = countries.features.map(feature => {
  const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
  return `<path d="${polygons.map(polygon => polygon.map(ring).join(' ')).join(' ')}" fill="#c29c63" fill-opacity=".23" stroke="#46351f" stroke-width="1.65" stroke-opacity=".85" fill-rule="evenodd"/>`;
}).join('');
const grid = [];
for (let longitude = -10; longitude <= 20; longitude += 5) { const [x] = project([longitude, 40]); grid.push(`<path d="M${x} 24V1276"/>`); }
for (let latitude = 30; latitude < 57; latitude += 5) { const [,y] = project([0, latitude]); grid.push(`<path d="M24 ${y}H1176"/>`); }
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1300"><defs><clipPath id="paper"><rect x="22" y="22" width="1156" height="1256"/></clipPath></defs><g clip-path="url(#paper)"><rect width="1200" height="1300" fill="#4c5240" opacity=".09"/><g fill="none" stroke="#5e4b2e" stroke-width=".7" opacity=".25">${grid.join('')}</g>${paths}</g><rect x="25" y="25" width="1150" height="1250" fill="none" stroke="#4a3823" stroke-width="2" opacity=".55"/><g fill="#4b3825" opacity=".6" font-family="Georgia" font-size="19" letter-spacing="6"><text x="125" y="625" transform="rotate(-90 125 625)">ATLANTIC OCEAN</text><text x="610" y="860" transform="rotate(-14 610 860)">MEDITERRANEAN SEA</text></g><g transform="translate(130 1080)" stroke="#47331f" fill="none" opacity=".7"><circle r="46"/><path d="M0 -62L10 -10L0 62L-10 10ZM-62 0L-10 -10L62 0L10 10Z"/><text x="-6" y="-73" fill="#47331f" stroke="none" font-family="Georgia" font-size="21">N</text></g></svg>`;
(async () => {
  await sharp(path.join(root, 'public/room/atlas-paper.webp')).resize(width, height, { fit: 'fill' }).composite([{ input: Buffer.from(svg), blend: 'multiply' }]).webp({ quality: 92 }).toFile(path.join(root, 'public/room/vintage-atlas.webp'));
  console.log('Saved vintage-atlas.webp with Natural Earth geography.');
})().catch(error => { console.error(error); process.exitCode = 1; });
