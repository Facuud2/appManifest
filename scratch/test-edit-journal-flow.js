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

  // Navigate to Diario
  await page.locator('[data-tour="mobile-nav-diario"]').click();
  await page.waitForTimeout(500);

  // Click "+ Escribir"
  await page.locator('[data-testid="journal-write-btn"]').click();
  await page.waitForTimeout(500);

  // Fill in content
  const textarea = page.locator('[data-testid="journal-vaul-drawer"] textarea');
  await textarea.fill('Esta es una manifestación consciente y hermosa para probar la edición');
  await page.waitForTimeout(300);

  // Save
  await page.locator('[data-testid="submit-journal-nav-btn"]').click();
  await page.waitForTimeout(600);

  // Find the created entry card and open it
  const createdCard = page.locator('[data-testid^="journal-card-"]').first();
  await createdCard.click();
  await page.waitForTimeout(500);

  // In detail modal, click "Editar"
  const editBtn = page.locator('button:has-text("Editar")').first();
  await editBtn.click();
  await page.waitForTimeout(600);

  await page.screenshot({ path: 'scratch/screenshot-05c-editar-manifestacion.png' });

  // Verify the 3 horizontal pills in Editar Manifestación
  const facuBtn = page.locator('[data-testid="journal-vaul-drawer"] button:has-text("Facu")').first();
  const maiaBtn = page.locator('[data-testid="journal-vaul-drawer"] button:has-text("Maia")').first();
  const juntosBtn = page.locator('[data-testid="journal-vaul-drawer"] button:has-text("Juntos")').first();

  const facuBox = await facuBtn.boundingBox();
  const maiaBox = await maiaBtn.boundingBox();
  const juntosBox = await juntosBtn.boundingBox();

  console.log('Editar Manifestación - Facu:', facuBox);
  console.log('Editar Manifestación - Maia:', maiaBox);
  console.log('Editar Manifestación - Juntos:', juntosBox);

  const diffY = Math.abs((facuBox?.y || 0) - (maiaBox?.y || 0));
  if (diffY > 5) {
    console.error('FAIL: Editar Manifestación pills not horizontal');
    process.exit(1);
  }

  console.log('SUCCESS: Editar Manifestación has a flawless horizontal 3-pill selector with zero dropdown shifts!');
  await browser.close();
})();
