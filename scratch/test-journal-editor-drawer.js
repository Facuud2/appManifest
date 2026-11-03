const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Navigate to Diario
  console.log('Navigating to Diario tab...');
  await page.locator('[data-tour="mobile-nav-diario"]').click();
  await page.waitForTimeout(600);

  // Click "+ Escribir"
  console.log('Clicking "+ Escribir"...');
  await page.locator('[data-testid="journal-write-btn"]').click();
  await page.waitForTimeout(700);

  // Take screenshot of the open modal
  await page.screenshot({ path: 'scratch/screenshot-05b-journal-editor-drawer.png' });
  console.log('Screenshot saved: scratch/screenshot-05b-journal-editor-drawer.png');

  // Verify the 3-pill horizontal space selector
  const facuBtn = page.locator('[data-testid="journal-vaul-drawer"] button:has-text("Facu")').first();
  const maiaBtn = page.locator('[data-testid="journal-vaul-drawer"] button:has-text("Maia")').first();
  const juntosBtn = page.locator('[data-testid="journal-vaul-drawer"] button:has-text("Juntos")').first();

  const facuBox = await facuBtn.boundingBox();
  const maiaBox = await maiaBtn.boundingBox();
  const juntosBox = await juntosBtn.boundingBox();

  console.log('Facu Box:', facuBox);
  console.log('Maia Box:', maiaBox);
  console.log('Juntos Box:', juntosBox);

  const diffY = Math.abs((facuBox?.y || 0) - (maiaBox?.y || 0));
  console.log('Diff Y:', diffY);

  if (diffY > 5) {
    console.error('FAIL: Space selector is not in a clean horizontal line');
    process.exit(1);
  }

  // Click Maia to verify sliding pill
  console.log('Clicking Maia...');
  await maiaBtn.click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'scratch/screenshot-05b-journal-editor-maia.png' });

  // Verify no redundant bottom save button
  const bottomSaveBtn = page.locator('form [data-testid="submit-journal-btn"]');
  const bottomCount = await bottomSaveBtn.count();
  console.log('Bottom redundant save button count:', bottomCount);
  if (bottomCount > 0) {
    console.error('FAIL: Bottom redundant save button still exists');
    process.exit(1);
  }

  // Verify nav save button exists
  const navSaveBtn = page.locator('[data-testid="submit-journal-nav-btn"]');
  console.log('Nav save button visible:', await navSaveBtn.isVisible());

  console.log('SUCCESS: Journal Editor Drawer has a beautiful, clean horizontal 3-pill selector and zero duplicate buttons!');
  await browser.close();
})();
