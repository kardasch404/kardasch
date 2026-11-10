const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const output = path.resolve(root, '../output/room-review');
const data = JSON.parse(fs.readFileSync(path.join(root, 'src/data/general.json'), 'utf8'));

(async () => {
  const results = [];
  const errors = [];
  const pass = message => { results.push(message); console.log('PASS', message); };
  for (const photo of data.mediaLibrary) assert.ok(fs.existsSync(path.join(root, 'public', photo.src)), photo.src);
  assert.deepEqual(data.locations.filter(location => location.countryCode === 'MA').map(location => location.id).sort(), ['casablanca', 'youssoufia']);
  assert.equal(data.events.find(event => event.id === 'youcode-sofrecom-hackathon').date.year, null);
  assert.ok(data.presentations.every(entry => entry.locationId === 'youssoufia'));
  assert.equal(data.mediaLibrary.length, 10);
  assert.deepEqual(data.board.photos.map(photo => photo.id).sort(), data.mediaLibrary.map(photo => photo.id).sort());
  pass('All 10 photo files resolve; only Casablanca and Youssoufia are Morocco pins; unknown year remains null');
  const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.env.ROOM_URL || 'http://localhost:3000', { waitUntil: 'networkidle', timeout: 90000 });
    await page.locator('.room-controls').getByRole('button', { name: 'Photos & events', exact: true }).click();
    await page.locator('.journal-cards button').first().waitFor();
    assert.equal(await page.locator('.journal-cards button').count(), data.presentations.length + data.events.length);
    await page.locator('.journal-cards').getByRole('button', { name: /React Testing Library & Jest/ }).click();
    assert.equal(await page.locator('.event-photo-gallery img').count(), 2);
    await page.waitForFunction(() => [...document.querySelectorAll('.event-photo-gallery img')].every(img => img.complete && img.naturalWidth > 0));
    await page.screenshot({ path: path.join(output, 'real-photos-mobile.png'), fullPage: true });
    await page.keyboard.press('Escape');
    pass('Journal reads general.json and the RTL album displays both real photos');

    await page.locator('.room-controls').getByRole('button', { name: 'Journey map', exact: true }).click();
    assert.equal(await page.locator('.journey-pin').count(), 3);
    assert.equal(await page.locator('.journey-route').isVisible(), true);
    await page.locator('.journey-category-filters').getByRole('button', { name: 'Presentations', exact: true }).click();
    assert.equal(await page.locator('.journey-pin').count(), 2);
    assert.equal(await page.locator('.journey-route').count(), 0);
    assert.equal(await page.locator('.journey-connections button').count(), data.presentations.length);
    await page.locator('.journey-city-filters').getByRole('button', { name: 'Youssoufia', exact: true }).click();
    assert.equal(await page.locator('.journey-connections button').count(), data.presentations.length);
    await page.locator('.journey-city-filters').getByRole('button', { name: 'Casablanca', exact: true }).click();
    assert.equal(await page.locator('.journey-connections button').count(), 0);
    await page.locator('.journey-category-filters').getByRole('button', { name: 'Education', exact: true }).click();
    await page.locator('.journey-city-filters').getByRole('button', { name: 'Youssoufia', exact: true }).click();
    assert.equal(await page.locator('.journey-connections button').count(), 2);
    for (const label of await page.locator('.journey-connections small').allTextContents()) assert.match(label, /Youssoufia/);
    await page.locator('.journey-category-filters').getByRole('button', { name: 'Future goal', exact: true }).click();
    assert.equal(await page.locator('.future-pin').isVisible(), true);
    assert.match(await page.locator('.journey-future-card').innerText(), /future destination/);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    await page.screenshot({ path: path.join(output, 'germany-goal-mobile.png'), fullPage: true });
    await page.keyboard.press('Escape');
    pass('All seven presentations belong to Youssoufia; the Germany circle and thread follow the goal filters');

    await page.locator('.room-controls').getByRole('button', { name: 'Photos & events', exact: true }).click();
    await page.locator('.journal-cards').getByRole('button', { name: /Hackathon YouCode/ }).click();
    assert.match(await page.locator('.document-content').innerText(), /year not specified/);
    await page.getByRole('button', { name: /Open project/ }).click();
    assert.equal(await page.locator('#document-title').innerText(), 'MediLink AI');
    await page.keyboard.press('Escape');
    pass('Hackathon retains its unknown year and opens the matching MediLink project');

    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator('.study-ready').waitFor({ timeout: 60000 });
    assert.equal(await page.locator('.study-object-toolbar option[value^="photo-"]').count(), 10);
    assert.equal(await page.locator('.study-object-toolbar option[value^="project-"]').count(), data.projects.length);
    assert.equal(await page.locator('.study-object-toolbar option[value^="event-"]').count(), data.presentations.length + data.events.length);
    for (const photo of data.mediaLibrary) {
      await page.locator('.study-object-toolbar select').selectOption(`photo-${photo.id}`);
      await page.getByRole('button', { name: 'Open / read', exact: true }).click();
      await page.locator('dialog[open]').waitFor();
      assert.ok(await page.locator(`dialog img[src="${photo.src}"]`).count() > 0, `Photo opens its related record: ${photo.id}`);
      await page.keyboard.press('Escape');
    }
    pass('All 10 board photos open their related records; all 8 projects and 9 topic cards are selectable');
    await page.locator('.study-object-toolbar select').selectOption('event-react-testing-library-jest');
    await page.getByRole('button', { name: 'Open / read', exact: true }).click();
    assert.equal(await page.locator('.event-photo-gallery img').count(), 2);
    await page.keyboard.press('Escape');
    await page.locator('.study-quick-actions').getByRole('button', { name: /Use computer/ }).click();
    await page.locator('#terminal-command').fill('map'); await page.locator('#terminal-command').press('Enter');
    assert.equal(await page.locator('.journey-pin').count(), 3);
    await page.screenshot({ path: path.join(output, 'germany-map-desktop.png') });
    await page.keyboard.press('Escape');
    await page.screenshot({ path: path.join(output, 'room-with-photos.png'), fullPage: true });
    pass('Physical photo documents and the computer open the same archive and map');
    assert.deepEqual(errors, []);
    pass('No browser errors');
  } finally {
    fs.writeFileSync(path.join(output, 'general-results.json'), JSON.stringify({ passed: results, errors }, null, 2));
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
