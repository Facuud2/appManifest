const { chromium } = require('playwright');
const path = require('path');

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

  // 1. Go to Objetivos / Afirmaciones
  console.log('Navigating to Objetivos tab...');
  const objetivosTab = page.locator('[data-tour="mobile-nav-objetivos"]');
  if (await objetivosTab.count() > 0) {
    await objetivosTab.click();
    await page.waitForTimeout(600);
  }

  // Take screenshot of Objetivos view
  await page.screenshot({ path: 'scratch/test-objetivos-view.png' });

  // 2. Open first card menu
  const menuBtn = page.locator('button[data-testid^="affirmation-menu-btn-"]').first();
  if (await menuBtn.count() > 0) {
    console.log('Opening card menu...');
    await menuBtn.click();
    await page.waitForTimeout(400);

    await page.screenshot({ path: 'scratch/test-menu-opaque.png' });
    console.log('Menu screenshot saved: scratch/test-menu-opaque.png');

    // 3. Click "Editar afirmación"
    const editBtn = page.locator('button[data-testid^="edit-affirmation-action-"]').first();
    console.log('Clicking Editar afirmación...');
    await editBtn.click();
    await page.waitForTimeout(700);

    // Take screenshot of Editar Decreto drawer
    await page.screenshot({ path: 'scratch/test-editar-decreto-drawer.png' });
    console.log('Editar Decreto screenshot saved: scratch/test-editar-decreto-drawer.png');

    // Check if duplicate button exists
    const bottomSaveBtn = page.locator('form [data-testid="submit-affirmation-btn"]');
    const deleteBtn = page.locator('form button:has-text("Eliminar Decreto")');
    const navSaveBtn = page.locator('[data-testid="submit-affirmation-nav-btn"]');

    console.log('Nav Save Button count:', await navSaveBtn.count());
    console.log('Bottom Save Button count:', await bottomSaveBtn.count());
    console.log('Delete Button count:', await deleteBtn.count());

    // Close drawer
    const cancelBtn = page.locator('button:has-text("Cancelar")').first();
    if (await cancelBtn.count() > 0) {
      await cancelBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 4. Test Journal Editor Modal
  console.log('Navigating to Diario tab...');
  const diarioTab = page.locator('[data-tour="mobile-nav-diario"]');
  if (await diarioTab.count() > 0) {
    await diarioTab.click();
    await page.waitForTimeout(600);

    // Find an entry or click to edit
    const journalArticle = page.locator('article[data-testid^="journal-entry-card-"]').first();
    if (await journalArticle.count() > 0) {
      console.log('Clicking journal entry to inspect detail or edit...');
      await journalArticle.click();
      await page.waitForTimeout(500);

      // In detail modal, look for edit button
      const editJournalBtn = page.locator('button:has-text("Editar")').first();
      if (await editJournalBtn.count() > 0) {
        await editJournalBtn.click();
        await page.waitForTimeout(600);

        await page.screenshot({ path: 'scratch/test-editar-journal-drawer.png' });
        console.log('Editar Journal screenshot saved: scratch/test-editar-journal-drawer.png');

        const navJournalSaveBtn = page.locator('[data-testid="submit-journal-nav-btn"]');
        const bottomJournalSaveBtn = page.locator('form [data-testid="submit-journal-btn"]');
        const deleteJournalBtn = page.locator('form button:has-text("Eliminar Entrada")');

        console.log('Journal Nav Save Button count:', await navJournalSaveBtn.count());
        console.log('Journal Bottom Save Button count:', await bottomJournalSaveBtn.count());
        console.log('Journal Delete Button count:', await deleteJournalBtn.count());
      }
    }
  }

  await browser.close();
  console.log('Test completed successfully.');
})();
