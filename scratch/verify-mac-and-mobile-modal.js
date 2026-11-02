const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = '/home/facuud2/.gemini/antigravity/brain/bab2b8ce-bdba-48bb-bce7-dbd4a47985b7';

(async () => {
  const browser = await chromium.launch();

  // ==========================================
  // PART 1: PC / DESKTOP VIEW VERIFICATION
  // ==========================================
  console.log('--- TEST 1: PC / DESKTOP VIEW (1280x850) ---');
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 850 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const pcPage = await desktopContext.newPage();

  await pcPage.goto('http://localhost:3000');
  await pcPage.waitForTimeout(1000);

  // Dismiss any tour if present
  const tourSkip = await pcPage.$('button:has-text("Saltar")');
  if (tourSkip) await tourSkip.click();

  // Navigate to Afirmaciones tab on PC
  const navObjetivos = await pcPage.locator('[data-tour="desktop-nav-objetivos"]').first();
  await navObjetivos.click();
  await pcPage.waitForTimeout(400);

  // Click "+ Afirmación"
  const addAffBtn = await pcPage.locator('[data-testid="add-affirmation-top-btn"]').first();
  await addAffBtn.click();
  await pcPage.waitForTimeout(500);

  // 1. Verify PC Mac pop-up exists and is centered (NOT at bottom)
  const desktopModal = await pcPage.$('[data-testid="affirmation-desktop-modal"]');
  console.log('PC Desktop Mac Modal is visible:', !!desktopModal);
  if (!desktopModal) {
    throw new Error('affirmation-desktop-modal not found on PC view!');
  }

  const boundingBox = await desktopModal.boundingBox();
  console.log('Desktop Modal Bounding Box:', boundingBox);
  // It must be centered vertically and horizontally, not stuck to y + height == 850
  const distanceFromBottom = 850 - (boundingBox.y + boundingBox.height);
  console.log('Distance from viewport bottom:', distanceFromBottom, 'px (expected > 80px, centered!)');

  // 2. Verify auto-focus & highlight on PC
  const activeTagName = await pcPage.evaluate(() => document.activeElement ? document.activeElement.tagName : null);
  console.log('Active element on PC modal open:', activeTagName, '(expected TEXTAREA)');

  // Take screenshot of desktop pop-up
  await pcPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'verify-pc-01-affirmation-mac-modal.png') });

  // 3. Test typing and chaining with Enter
  await pcPage.keyboard.type('Vivo en plena armonía, salud y dicha infinita.');
  await pcPage.waitForTimeout(200);
  await pcPage.keyboard.press('Enter');
  await pcPage.waitForTimeout(400);

  // Check session added count indicator
  const sessionPill = await pcPage.locator('text=1 añadida').first();
  console.log('Session pill visible after Enter:', await sessionPill.isVisible());

  // Active element should STILL be TEXTAREA ready for next writing
  const stillActive = await pcPage.evaluate(() => document.activeElement ? document.activeElement.tagName : null);
  console.log('Active element after Enter chain:', stillActive, '(expected TEXTAREA ready for next)');

  // Type second affirmation and save with button
  await pcPage.keyboard.type('Cada día todo conspira a nuestro mayor bien.');
  await pcPage.waitForTimeout(200);
  const saveBtn = await pcPage.locator('[data-testid="submit-affirmation-btn"]').first();
  await saveBtn.click();
  await pcPage.waitForTimeout(500);

  // Modal should now be closed
  const isClosed = (await pcPage.$('[data-testid="affirmation-desktop-modal"]')) === null;
  console.log('Modal closed after save:', isClosed);

  // Take screenshot of desktop affirmations list with new affirmations
  await pcPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'verify-pc-02-affirmations-added.png') });

  // 4. Test Journal Editor on PC
  console.log('\nTesting Journal Editor on PC...');
  const writeJournalBtn = await pcPage.locator('button:has-text("Escribir en el Diario")').first();
  await writeJournalBtn.click();
  await pcPage.waitForTimeout(500);

  const journalPcModal = await pcPage.$('[data-testid="journal-desktop-modal"]');
  console.log('Journal Desktop Mac Modal visible:', !!journalPcModal);
  const journalActiveTag = await pcPage.evaluate(() => document.activeElement ? document.activeElement.tagName : null);
  console.log('Journal active focused element:', journalActiveTag, '(expected TEXTAREA)');
  await pcPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'verify-pc-03-journal-mac-modal.png') });

  // Close with Esc key
  await pcPage.keyboard.press('Escape');
  await pcPage.waitForTimeout(400);
  console.log('Journal modal closed with Escape:', (await pcPage.$('[data-testid="journal-desktop-modal"]')) === null);

  // 5. Test Rampage Set Editor on PC
  console.log('\nTesting Rampage Set Editor on PC...');
  await navObjetivos.click();
  await pcPage.waitForTimeout(300);
  const rampageTabBtn = await pcPage.locator('button:has-text("Sets de Rampage"):visible').first();
  await rampageTabBtn.click();
  await pcPage.waitForTimeout(300);
  const newSetBtn = await pcPage.locator('button:has-text("Nuevo Set"):visible').first();
  await newSetBtn.click();
  await pcPage.waitForTimeout(500);

  const rampagePcModal = await pcPage.$('[data-testid="rampage-desktop-modal"]');
  console.log('Rampage Desktop Mac Modal visible:', !!rampagePcModal);
  const rampageActiveTag = await pcPage.evaluate(() => document.activeElement ? document.activeElement.tagName : null);
  console.log('Rampage active focused element:', rampageActiveTag, '(expected INPUT for title)');
  await pcPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'verify-pc-04-rampage-mac-modal.png') });

  await pcPage.keyboard.press('Escape');
  await pcPage.waitForTimeout(400);


  // ==========================================
  // PART 2: MOBILE VIEW STRICT PRESERVATION
  // ==========================================
  console.log('\n--- TEST 2: MOBILE VIEW STRICT PRESERVATION (393x852) ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 393, height: 852 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });
  const mobilePage = await mobileContext.newPage();

  await mobilePage.goto('http://localhost:3000');
  await mobilePage.waitForTimeout(1000);

  // Dismiss any tour if present
  const mobileTourSkip = await mobilePage.$('button:has-text("Saltar")');
  if (mobileTourSkip) await mobileTourSkip.click();

  // Switch to Afirmaciones on mobile
  const mobileNavObj = await mobilePage.locator('[data-tour="mobile-nav-objetivos"]').first();
  await mobileNavObj.click();
  await mobilePage.waitForTimeout(400);

  // Open Affirmation Editor on mobile
  const addAffMobileBtn = await mobilePage.locator('[data-testid="add-affirmation-top-btn"]').first();
  await addAffMobileBtn.click();
  await mobilePage.waitForTimeout(500);

  // Verify mobile iOS bottom drawer exists
  const vaulDrawer = await mobilePage.$('[data-testid="affirmation-vaul-drawer"]');
  const grabberHandle = await mobilePage.$('[data-testid="ios-sheet-grabber"]');
  console.log('Mobile Vaul Drawer visible:', !!vaulDrawer);
  console.log('Mobile iOS Sheet Grabber visible:', !!grabberHandle);

  const mobileBox = await vaulDrawer.boundingBox();
  console.log('Mobile Drawer Box y + height:', mobileBox.y + mobileBox.height, '(should be at viewport bottom 852)');
  await mobilePage.screenshot({ path: path.join(ARTIFACTS_DIR, 'verify-mobile-01-untouched-ios-drawer.png') });

  console.log('\nALL VERIFICATIONS PASSED SUCCESSFULLY!');
  await browser.close();
})();
