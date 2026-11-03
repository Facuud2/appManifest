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
  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Inicio
  await page.screenshot({ path: 'scratch/new-inicio-contrast.png' });
  console.log('1. Saved scratch/new-inicio-contrast.png');

  // 2. Objetivos & Menu
  const objetivosTab = page.locator('[data-tour="mobile-nav-objetivos"]');
  if (await objetivosTab.count() > 0) {
    await objetivosTab.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'scratch/new-objetivos-contrast.png' });
    console.log('2. Saved scratch/new-objetivos-contrast.png');

    // Open card menu
    const menuBtn = page.locator('button[data-testid^="affirmation-menu-btn-"]').first();
    if (await menuBtn.count() > 0) {
      await menuBtn.click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: 'scratch/new-menu-contrast.png' });
      console.log('3. Saved scratch/new-menu-contrast.png');

      // Click edit to open drawer
      const editBtn = page.locator('button[data-testid^="edit-affirmation-action-"]').first();
      await editBtn.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: 'scratch/new-drawer-contrast.png' });
      console.log('4. Saved scratch/new-drawer-contrast.png');

      // Close drawer
      const cancelBtn = page.locator('button:has-text("Cancelar")').first();
      if (await cancelBtn.count() > 0) {
        await cancelBtn.click();
        await page.waitForTimeout(500);
      }
    }
  }

  // 3. Diario
  const diarioTab = page.locator('[data-tour="mobile-nav-diario"]');
  if (await diarioTab.count() > 0) {
    await diarioTab.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'scratch/new-diario-contrast.png' });
    console.log('5. Saved scratch/new-diario-contrast.png');
  }

  // 4. Mi Espacio
  const espacioTab = page.locator('[data-tour="mobile-nav-espacio"]');
  if (await espacioTab.count() > 0) {
    await espacioTab.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'scratch/new-espacio-contrast.png' });
    console.log('6. Saved scratch/new-espacio-contrast.png');
  }

  await browser.close();
  console.log('All contrast tests completed.');
})();
