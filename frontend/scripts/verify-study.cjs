// Run against a local dev server. Set PLAYWRIGHT_MODULE_PATH when using an existing installation.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const output = path.resolve(__dirname, '../../output/room-review');
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] });
  const results = [];
  const errors = [];
  const pass = text => { results.push(text); console.log('PASS', text); };
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    page.on('pageerror', error => { errors.push(error.message); console.error('BROWSER ERROR', error.stack || error.message); });
    const response = await page.goto(process.env.ROOM_URL || 'http://localhost:3000', { waitUntil: 'networkidle', timeout: 90000 });
    assert.equal(response.status(), 200);
    await page.locator('.study-ready').waitFor({ timeout: 45000 });
    assert.ok(await page.locator('.study-object-toolbar option').count() >= 15);
    pass('3D room loads with selectable portfolio objects');
    if (!process.env.ROOM_CORNERS_ONLY) {
    await page.screenshot({ path: path.join(output, 'desktop.png'), fullPage: true });

    await page.locator('.study-object-toolbar select').selectOption('project-ostora');
    await page.getByRole('button', { name: 'Pick up', exact: true }).click();
    await page.getByRole('button', { name: 'Put back', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Rotate selected object right' }).click();
    await page.getByRole('button', { name: 'Put back', exact: true }).click();
    await page.getByRole('button', { name: 'Pick up', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Move selected object right' }).click();
    await page.waitForFunction(() => localStorage.getItem('kardache-interactive-study-v5'));
    pass('Objects can be picked up, rotated, put back, and moved with saved positions');
    await page.getByRole('button', { name: 'Open / read', exact: true }).click();
    await page.locator('dialog[open]').waitFor();
    assert.equal(await page.locator('#document-title').textContent(), 'Ostora');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('dialog[open]').count(), 0);
    pass('Project documents open and close with Escape');

    await page.locator('.study-object-toolbar select').selectOption('lamp');
    await page.getByRole('button', { name: 'Switch off', exact: true }).click();
    await page.locator('main.is-dark').waitFor();
    await page.screenshot({ path: path.join(output, 'lights-off.png'), fullPage: true });
    await page.getByRole('button', { name: 'Switch on', exact: true }).click();
    await page.locator('main.is-lit').waitFor();
    pass('Lamp switches on and off in the 3D scene');

    await page.locator('.study-quick-actions').getByRole('button', { name: /Use computer/ }).click();
    await page.locator('#terminal-command').fill('projects');
    await page.locator('#terminal-command').press('Enter');
    assert.match(await page.locator('.terminal-output').innerText(), /ostora/);
    await page.locator('#terminal-command').fill('open ostora');
    await page.locator('#terminal-command').press('Enter');
    assert.equal(await page.locator('#document-title').textContent(), 'Ostora');
    await page.keyboard.press('Escape');
    pass('Computer terminal lists projects and opens a case by command');

    await page.locator('.study-quick-actions').getByRole('button', { name: /Photos & events/ }).click();
    assert.ok(await page.locator('.journal-cards > button').count() > 0);
    await page.locator('.journal-cards > button').first().click();
    assert.ok((await page.locator('.document-content').innerText()).length > 150);
    await page.keyboard.press('Escape');
    pass('Event journal opens the real event records');

    await page.locator('.study-object-toolbar select').selectOption('desk-chair');
    await page.getByRole('button', { name: 'Sit down', exact: true }).click();
    await page.getByRole('button', { name: 'View room', exact: true }).click();
    await page.locator('.study-object-toolbar select').selectOption('computer');
    await page.getByRole('button', { name: 'Power off', exact: true }).click();
    await page.locator('.study-object-actions').getByRole('button', { name: 'Use computer', exact: true }).click();
    assert.equal(await page.locator('.computer-off').isVisible(), true);
    await page.locator('dialog').getByRole('button', { name: 'Power on', exact: true }).click();
    await page.locator('#terminal-command').waitFor();
    await page.keyboard.press('Escape');
    pass('Office chair offers a seated view and computer power controls the terminal');

    }
    await page.locator('.study-quick-actions').getByRole('button', { name: 'Journey map', exact: true }).click();
    await page.locator('.journey-city-filters').getByRole('button', { name: 'Youssoufia', exact: true }).click();
    assert.ok(await page.locator('.journey-connections button').count() >= 2);
    for (const label of await page.locator('.journey-connections small').allTextContents()) assert.match(label, /Youssoufia/);
    assert.match(await page.locator('.journey-connections').innerText(), /Youcode/);
    assert.doesNotMatch(await page.locator('.journey-connections').innerText(), /ALX/);
    await page.screenshot({ path: path.join(output, 'journey.png') });
    await page.locator('.journey-connections button').first().click();
    assert.equal(await page.locator('#document-title').textContent(), 'Learning, in practice.');
    await page.keyboard.press('Escape');
    pass('Map pins filter actual study locations and open education documents');

    await page.locator('.study-quick-actions').getByRole('button', { name: 'Play chess', exact: true }).click();
    await page.locator('.chess-canvas canvas').waitFor();
    await page.getByRole('button', { name: 'Start / resume clock', exact: true }).click();
    await page.locator('.chess-accessible summary').click();
    await page.locator('[data-square="f2"]').click();
    assert.match(await page.locator('[data-square="f3"]').getAttribute('aria-label'), /legal move/);
    await page.locator('[data-square="f5"]').click();
    assert.match(await page.locator('[data-square="f2"]').getAttribute('aria-label'), /White pawn/);
    for (const [from, to] of [['f2','f3'],['e7','e5'],['g2','g4'],['d8','h4']]) {
      await page.locator(`[data-square="${from}"]`).click(); await page.locator(`[data-square="${to}"]`).click();
    }
    assert.match(await page.locator('.chess-status').innerText(), /Checkmate. Black wins/);
    assert.equal(await page.getByRole('button', { name: 'Start / resume clock', exact: true }).isDisabled(), true);
    await page.getByRole('button', { name: 'Reset game', exact: true }).click();
    await page.getByRole('button', { name: 'Start / resume clock', exact: true }).click();
    await page.waitForTimeout(1200);
    const white = await page.locator('[data-clock="w"]').innerText();
    assert.notEqual(white, '5:00');
    assert.equal(await page.locator('[data-clock="b"]').innerText(), '5:00');
    await page.locator('[data-square="e2"]').click(); await page.locator('[data-square="e4"]').click();
    await page.waitForTimeout(1200);
    assert.notEqual(await page.locator('[data-clock="b"]').innerText(), '5:00');
    await page.getByRole('button', { name: 'Pause clock', exact: true }).click();
    const paused = await page.locator('.chess-clocks').innerText();
    await page.waitForTimeout(1200); assert.equal(await page.locator('.chess-clocks').innerText(), paused);
    await page.locator('.chess-accessible summary').click();
    await page.screenshot({ path: path.join(output, 'chess.png') });
    await page.keyboard.press('Escape');
    await page.locator('.study-quick-actions').getByRole('button', { name: 'Play chess', exact: true }).click();
    assert.equal(await page.locator('.chess-clocks').innerText(), paused);
    await page.keyboard.press('Escape');
    pass('Chess rejects illegal moves, detects checkmate, resets, switches clocks and preserves a paused game');

    await page.locator('.room-nav').getByRole('button', { name: /^CV/ }).click();
    await page.locator('.resume-document').waitFor();
    await page.emulateMedia({ media: 'print' });
    assert.equal(await page.locator('.investigation-header').isVisible(), false);
    await page.pdf({ path: path.join(output, 'cv.pdf'), format: 'A4', printBackground: true });
    await page.emulateMedia({ media: 'screen' });
    await page.keyboard.press('Escape');
    pass('CV is printable with the room hidden');

    await page.getByRole('button', { name: 'Document view', exact: true }).click();
    await page.locator('.interactive-study').waitFor({ state: 'detached' });
    assert.ok(await page.locator('.project-paper-1').isVisible());
    await page.locator('.project-paper-1').click();
    await page.locator('dialog[open]').waitFor();
    await page.keyboard.press('Escape');
    pass('Document view remains available without 3D');

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    mobile.on('pageerror', error => { errors.push(error.message); console.error('BROWSER ERROR', error.stack || error.message); });
    await mobile.goto(process.env.ROOM_URL || 'http://localhost:3000', { waitUntil: 'networkidle', timeout: 90000 });
    assert.equal(await mobile.locator('.interactive-study').count(), 0);
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    await mobile.screenshot({ path: path.join(output, 'mobile.png'), fullPage: true });
    await mobile.locator('.project-paper-1').click();
    await mobile.locator('dialog[open]').waitFor();
    assert.equal(await mobile.locator('#document-title').textContent(), 'Ostora');
    await mobile.getByRole('button', { name: 'Close document', exact: true }).click();
    pass('Phone layout uses readable cards with no horizontal overflow');
    await mobile.getByRole('button', { name: 'Interactive room', exact: true }).click();
    await mobile.locator('.study-ready').waitFor({ timeout: 45000 });
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    await mobile.screenshot({ path: path.join(output, 'mobile-3d.png'), fullPage: true });
    pass('Phone users can opt into the interactive room');
    assert.deepEqual(errors, []);
    pass('No browser JavaScript errors');
  } finally {
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ passed: results, browserErrors: errors }, null, 2));
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
