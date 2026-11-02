const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = '/home/facuud2/.gemini/antigravity/brain/2290ef0b-4381-48d2-a1a7-33acb48eb77f';

(async () => {
  const browser = await chromium.launch();

  // 1. Desktop Test
  const desktopCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const desktopPage = await desktopCtx.newPage();
  await desktopPage.goto('http://localhost:3000');
  await desktopPage.waitForLoadState('networkidle');
  await desktopPage.waitForTimeout(500);

  // Click on "Nuevo Set" from desktop navigation
  await desktopPage.locator('[data-tour="desktop-nav-objetivos"]').click();
  await desktopPage.waitForTimeout(400);
  await desktopPage.locator('button:has-text("Sets de Rampage")').click();
  await desktopPage.waitForTimeout(400);
  await desktopPage.locator('[data-testid="open-rampage-modal-btn"]').first().click();
  await desktopPage.waitForTimeout(500);

  await desktopPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'fixed-desktop-modal-with-button.png') });
  console.log('✅ Desktop screenshot saved: fixed-desktop-modal-with-button.png');

  // Check if button is visible
  const startBtnVisibleDesktop = await desktopPage.locator('[data-testid="start-ai-rampage-btn"]').isVisible();
  console.log('¿Botón Siguiente visible en Desktop?:', startBtnVisibleDesktop);

  // 2. Mobile Test
  const mobileCtx = await browser.newContext({
    viewport: { width: 393, height: 852 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });
  const mobilePage = await mobileCtx.newPage();
  await mobilePage.goto('http://localhost:3000');
  await mobilePage.waitForLoadState('networkidle');
  await mobilePage.waitForTimeout(500);

  await mobilePage.locator('[data-tour="mobile-nav-objetivos"]').click();
  await mobilePage.waitForTimeout(300);
  await mobilePage.locator('button:has-text("Sets de Rampage")').click();
  await mobilePage.waitForTimeout(300);
  await mobilePage.locator('[data-testid="open-rampage-modal-btn"]').first().click();
  await mobilePage.waitForTimeout(500);

  const headerBtnVisibleMobile = await mobilePage.locator('[data-testid="start-ai-rampage-header-btn"]').isVisible();
  console.log('¿Botón Iniciar en Header visible en Móvil?:', headerBtnVisibleMobile);

  await mobilePage.screenshot({ path: path.join(ARTIFACTS_DIR, 'fixed-mobile-drawer.png') });
  console.log('✅ Mobile screenshot saved: fixed-mobile-drawer.png');

  await browser.close();
})();
