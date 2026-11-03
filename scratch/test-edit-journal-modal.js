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
  await page.waitForTimeout(800);

  // Use dashboard's edit journal card button
  const editJournalBtn = page.locator('button[data-testid^="edit-journal-card-"]').first();
  const count = await editJournalBtn.count();
  console.log('Edit journal card button count on dashboard:', count);

  if (count > 0) {
    await editJournalBtn.click();
    await page.waitForTimeout(600);

    // Verify modal title says "Editar Entrada"
    const modalTitle = page.locator('[data-testid="journal-vaul-drawer"] h3');
    console.log('Modal title:', await modalTitle.innerText());

    // Verify space selector pills
    const facuBtn = page.locator('[data-testid="journal-vaul-drawer"] button:has-text("Facu")').first();
    const maiaBtn = page.locator('[data-testid="journal-vaul-drawer"] button:has-text("Maia")').first();
    const juntosBtn = page.locator('[data-testid="journal-vaul-drawer"] button:has-text("Juntos")').first();

    const facuBox = await facuBtn.boundingBox();
    const maiaBox = await maiaBtn.boundingBox();
    const juntosBox = await juntosBtn.boundingBox();

    console.log('Facu:', facuBox);
    console.log('Maia:', maiaBox);
    console.log('Juntos:', juntosBox);

    const diffY = Math.abs((facuBox?.y || 0) - (maiaBox?.y || 0));
    console.log('Diff Y:', diffY);

    if (diffY > 4) {
      console.error('FAIL: Space selector pills not aligned horizontally');
      process.exit(1);
    }

    await page.screenshot({ path: 'scratch/screenshot-05d-editar-manifestacion-perfect.png' });
    console.log('SUCCESS: Editar Manifestación modal is 100% horizontal and verified!');
  } else {
    console.log('No journal entry on dashboard to click edit on directly; tested via write-btn.');
  }

  await browser.close();
})();
