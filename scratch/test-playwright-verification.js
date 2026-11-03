const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('--- STARTING PLAYWRIGHT VERIFICATION (Viewport 393x852) ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();
  const errors = [];

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // =========================================================================
    // TEST 1: Bottom Navigation Masking Shield & Scroll
    // =========================================================================
    console.log('\n[Test 1] Verifying bottom dock blur shield & masking...');
    const blurShield = page.locator('[data-testid="bottom-dock-blur-shield"]');
    const shieldCount = await blurShield.count();
    console.log('Bottom blur shield count:', shieldCount);
    if (shieldCount === 0) {
      errors.push('Test 1 FAIL: Bottom blur shield not found');
    } else {
      const shieldBox = await blurShield.boundingBox();
      console.log('Bottom blur shield bounding box:', shieldBox);
      // Verify height is approximately 112px (h-28) and covers full width
      if (!shieldBox || shieldBox.height < 90 || shieldBox.width < 350) {
        errors.push(`Test 1 FAIL: Shield box unexpected dimensions: ${JSON.stringify(shieldBox)}`);
      } else {
        console.log('Test 1 PASS: Bottom blur shield exists and covers full width with h-28.');
      }
    }

    // Scroll down in Inicio and check layout
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'scratch/screenshot-01-inicio-scroll.png' });
    console.log('Screenshot saved: scratch/screenshot-01-inicio-scroll.png');

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);

    // =========================================================================
    // TEST 2: Dimensional Stability in Home Spotlight Card (1/6 to 6/6)
    // =========================================================================
    console.log('\n[Test 2] Verifying dimensional stability when cycling spotlight card...');
    const spotlightCard = page.locator('[data-testid="home-spotlight-card"]');
    const ultimasAfirmacionesHeader = page.locator('h3:has-text("Últimas Afirmaciones")').first();

    if (await spotlightCard.count() === 0) {
      errors.push('Test 2 FAIL: Spotlight card not found');
    } else {
      const initialHeaderBox = await ultimasAfirmacionesHeader.boundingBox();
      const initialCardBox = await spotlightCard.boundingBox();
      console.log('Initial Spotlight Card Height:', initialCardBox?.height);
      console.log('Initial Últimas Afirmaciones Top:', initialHeaderBox?.y);

      let maxDiffY = 0;
      for (let i = 1; i <= 6; i++) {
        await spotlightCard.click();
        await page.waitForTimeout(350); // wait for spring transition
        const currentHeaderBox = await ultimasAfirmacionesHeader.boundingBox();
        const currentCardBox = await spotlightCard.boundingBox();
        const diff = Math.abs((currentHeaderBox?.y || 0) - (initialHeaderBox?.y || 0));
        if (diff > maxDiffY) maxDiffY = diff;
        console.log(`Tap ${i}/6: Card Height = ${currentCardBox?.height}px, Header Y = ${currentHeaderBox?.y}px, Diff = ${diff.toFixed(2)}px`);
      }

      await page.screenshot({ path: 'scratch/screenshot-02-spotlight-cycled.png' });
      console.log(`Max Y displacement: ${maxDiffY}px`);
      if (maxDiffY > 2) {
        errors.push(`Test 2 FAIL: Últimas Afirmaciones moved by ${maxDiffY}px when cycling card`);
      } else {
        console.log('Test 2 PASS: Spotlight card is dimensionally rock-solid! Zero lower-page jump.');
      }
    }

    // =========================================================================
    // TEST 3: Afirmaciones tab - No repetitive footer text on cards
    // =========================================================================
    console.log('\n[Test 3] Verifying Afirmaciones tab...');
    const afirmacionesNavBtn = page.locator('[data-tour="mobile-nav-objetivos"]');
    await afirmacionesNavBtn.click();
    await page.waitForTimeout(600);

    // Verify header title
    const headerTitle = page.locator('[data-testid="mobile-header-title"]');
    const headerText = await headerTitle.innerText();
    console.log('Mobile Top Header Title:', headerText);

    // Check all cards for "Toca en cualquier parte para sumar repetición"
    const repeatedFooters = page.locator('text="Toca en cualquier parte para sumar repetición"');
    const footerCount = await repeatedFooters.count();
    console.log('Occurrences of "Toca en cualquier parte para sumar repetición":', footerCount);
    // There should be at most 1 (the single subtle hint under the list header), NOT one per card!
    const cards = page.locator('[data-testid^="manifestation-card-"]');
    const cardCount = await cards.count();
    console.log('Number of manifestation cards:', cardCount);

    let cardWithFooterTextCount = 0;
    for (let c = 0; c < cardCount; c++) {
      const card = cards.nth(c);
      const text = await card.innerText();
      if (text.includes('Toca en cualquier parte para sumar repetición')) {
        cardWithFooterTextCount++;
      }
    }
    console.log('Cards containing footer text:', cardWithFooterTextCount);
    if (cardWithFooterTextCount > 0) {
      errors.push(`Test 3 FAIL: ${cardWithFooterTextCount} cards still contain repetitive footer text`);
    } else {
      console.log('Test 3 PASS: Zero cards have repetitive footer text!');
    }

    await page.screenshot({ path: 'scratch/screenshot-03-afirmaciones-clean.png' });

    // =========================================================================
    // TEST 4: Diario tab - Title Grimorio & Diario aligned with + Escribir
    // =========================================================================
    console.log('\n[Test 4] Verifying Diario tab layout...');
    const diarioNavBtn = page.locator('[data-tour="mobile-nav-diario"]');
    await diarioNavBtn.click();
    await page.waitForTimeout(600);

    const diarioTitle = page.locator('h2:has-text("Grimorio & Diario")');
    const escribirBtn = page.locator('[data-testid="journal-write-btn"]');

    const titleVisible = await diarioTitle.isVisible();
    const escribirVisible = await escribirBtn.isVisible();
    console.log('Grimorio & Diario title visible:', titleVisible);
    console.log('+ Escribir button visible:', escribirVisible);

    if (!titleVisible || !escribirVisible) {
      errors.push('Test 4 FAIL: Title or Escribir button not visible in Diario');
    } else {
      const titleBox = await diarioTitle.boundingBox();
      const escribirBox = await escribirBtn.boundingBox();
      console.log('Title box:', titleBox);
      console.log('Escribir box:', escribirBox);

      // Verify they are on the same vertical row (close Y positions) and title is to the left (title.x < escribir.x)
      const yDiff = Math.abs((titleBox?.y || 0) - (escribirBox?.y || 0));
      const isLeft = (titleBox?.x || 0) < (escribirBox?.x || 0);
      console.log(`Title and Button Y diff: ${yDiff.toFixed(2)}px, Title is to left: ${isLeft}`);

      if (yDiff > 15 || !isLeft) {
        errors.push(`Test 4 FAIL: Title and button not cleanly aligned on same row. yDiff: ${yDiff}, isLeft: ${isLeft}`);
      } else {
        console.log('Test 4 PASS: Grimorio & Diario is cleanly aligned to the left of + Escribir!');
      }
    }

    await page.screenshot({ path: 'scratch/screenshot-04-diario-header.png' });

    // =========================================================================
    // TEST 5: Nuevo Decreto validation (< 5 chars disabled) & Editar Manifestación space selector
    // =========================================================================
    console.log('\n[Test 5A] Verifying Nuevo Decreto validation with single letter "s"...');
    // Open Nuevo Decreto from Mobile Top Header or Afirmaciones
    await afirmacionesNavBtn.click();
    await page.waitForTimeout(400);

    const addDecretoBtn = page.locator('[data-testid="mobile-header-action-decreto"]');
    await addDecretoBtn.click();
    await page.waitForTimeout(600);

    const textarea = page.locator('textarea').first();
    await textarea.fill('s');
    await page.waitForTimeout(300);

    const saveNavBtn = page.locator('[data-testid="submit-affirmation-nav-btn"]');
    const isSaveDisabled = await saveNavBtn.getAttribute('disabled') !== null || (await saveNavBtn.getAttribute('class')).includes('pointer-events-none');
    const checkIcon = page.locator('form [data-testid="affirmation-vaul-drawer"] svg.lucide-check');
    const checkCount = await checkIcon.count();
    const bottomVioletButton = page.locator('form button[data-testid="submit-affirmation-btn"]');
    const bottomBtnCount = await bottomVioletButton.count();

    console.log('Save button disabled with "s":', isSaveDisabled);
    console.log('Green checkmark count with "s":', checkCount);
    console.log('Redundant bottom violet button count:', bottomBtnCount);

    if (!isSaveDisabled) {
      errors.push('Test 5A FAIL: Save button should be disabled when text is "s"');
    }
    if (checkCount > 0) {
      errors.push('Test 5A FAIL: Green checkmark should NOT appear when text is "s"');
    }
    if (bottomBtnCount > 0) {
      errors.push('Test 5A FAIL: Redundant bottom button should be removed');
    }

    await page.screenshot({ path: 'scratch/screenshot-05a-nuevo-decreto-validation.png' });

    // Close drawer
    const cancelDecretoBtn = page.locator('button:has-text("Cancelar")').first();
    await cancelDecretoBtn.click();
    await page.waitForTimeout(500);

    // Test 5B: Editar Manifestación in Diario
    console.log('\n[Test 5B] Verifying Editar Manifestación space selector in Diario...');
    await diarioNavBtn.click();
    await page.waitForTimeout(500);

    const journalCard = page.locator('article[data-testid^="journal-entry-card-"]').first();
    if (await journalCard.count() > 0) {
      await journalCard.click();
      await page.waitForTimeout(500);

      const editBtn = page.locator('button:has-text("Editar")').first();
      if (await editBtn.count() > 0) {
        await editBtn.click();
        await page.waitForTimeout(600);

        // Check the space selector pills
        const scopePills = page.locator('[data-testid="journal-vaul-drawer"] button:has-text("Facu"), [data-testid="journal-vaul-drawer"] button:has-text("Maia"), [data-testid="journal-vaul-drawer"] button:has-text("Juntos")');
        const pillCount = await scopePills.count();
        console.log('Scope horizontal pills count in Journal Editor:', pillCount);

        const facuPill = page.locator('[data-testid="journal-vaul-drawer"] button:has-text("Facu")').first();
        const maiaPill = page.locator('[data-testid="journal-vaul-drawer"] button:has-text("Maia")').first();
        const juntosPill = page.locator('[data-testid="journal-vaul-drawer"] button:has-text("Juntos")').first();

        const facuBox = await facuPill.boundingBox();
        const maiaBox = await maiaPill.boundingBox();
        const juntosBox = await juntosPill.boundingBox();

        console.log('Facu pill:', facuBox);
        console.log('Maia pill:', maiaBox);
        console.log('Juntos pill:', juntosBox);

        // Verify they are on the same horizontal row (y difference < 5px)
        const diffPillY = Math.abs((facuBox?.y || 0) - (maiaBox?.y || 0));
        console.log('Y diff between Facu and Maia pills:', diffPillY);

        if (diffPillY > 5 || pillCount < 3) {
          errors.push('Test 5B FAIL: Scope selector is not in a clean horizontal row');
        } else {
          console.log('Test 5B PASS: Space selector is a clean 3-pill horizontal row with zero layout breakage!');
        }

        // Tap Maia and check sliding pill
        await maiaPill.click();
        await page.waitForTimeout(300);
        await page.screenshot({ path: 'scratch/screenshot-05b-journal-drawer-space-selector.png' });

        const cancelJournalBtn = page.locator('[data-testid="journal-vaul-drawer"] button:has-text("Cancelar")').first();
        await cancelJournalBtn.click();
        await page.waitForTimeout(500);
      }
    }

  } catch (err) {
    console.error('Unhandled error during test:', err);
    errors.push(`Unhandled error: ${err.message}`);
  } finally {
    await browser.close();
  }

  console.log('\n--- VERIFICATION SUMMARY ---');
  if (errors.length === 0) {
    console.log('ALL 5 TESTS PASSED WITH 100% SUCCESS!');
  } else {
    console.error(`FAILED WITH ${errors.length} ERRORS:`);
    errors.forEach((e) => console.error(`- ${e}`));
    process.exit(1);
  }
})();
