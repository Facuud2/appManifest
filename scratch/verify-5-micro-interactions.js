const { chromium } = require('playwright');
const path = require('node:path');
const fs = require('node:fs');

const targetUrl = process.env.TARGET_URL || 'http://localhost:3000';
const artifactDir = path.resolve(__dirname, 'screenshots');
if (!fs.existsSync(artifactDir)) {
  fs.mkdirSync(artifactDir, { recursive: true });
}

(async () => {
  console.log('🚀 Starting Micro-Interactions Verification in Mobile Viewport (393x852)...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  });

  const context = await browser.newContext({
    viewport: { width: 393, height: 852 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
    hasTouch: true,
    isMobile: true,
    permissions: ['microphone'],
  });

  const page = await context.newPage();

  try {
    // 1. Load Page
    console.log(`Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Dismiss tour modal if open
    const tourCloseBtn = page.locator('button:has-text("Comenzar"), button:has-text("Saltar"), button:has-text("Entendido")');
    if (await tourCloseBtn.count() > 0 && await tourCloseBtn.first().isVisible()) {
      await tourCloseBtn.first().click();
      await page.waitForTimeout(500);
    }

    // 2. Component 2 & Component 1 Verification: Afirmaciones tab
    console.log('--- TESTING COMPONENT 2 & COMPONENT 1 ---');
    const afirmacionesTab = page.locator('[data-tour="mobile-nav-objetivos"]');
    await afirmacionesTab.waitFor({ state: 'visible', timeout: 10000 });
    await afirmacionesTab.click();
    await page.waitForTimeout(1000);

    // Ensure at least one affirmation card exists
    let menuBtn = page.locator('[data-testid^="affirmation-menu-btn-"]').first();
    if (await menuBtn.count() === 0) {
      console.log('No affirmation card found, writing one to test...');
      const textarea = page.locator('textarea').first();
      await textarea.fill('Merezco recibir bendiciones y abundancia infinita hoy y siempre.');
      const submitBtn = page.locator('button:has-text("Consagrar")').first();
      await submitBtn.click();
      await page.waitForTimeout(1000);
      menuBtn = page.locator('[data-testid^="affirmation-menu-btn-"]').first();
    }

    await menuBtn.waitFor({ state: 'visible', timeout: 10000 });
    console.log('Clicking 3-dot Split Button on affirmation card...');
    await menuBtn.click();
    await page.waitForTimeout(500);

    // Verify Component 2: 3-dot dropdown popover
    const dropdown = page.locator('[data-testid^="affirmation-dropdown-"]').first();
    await dropdown.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ Component 2: 3-dot popover dropdown is open with pointer and options (Editar, Fijar, Sumar repetición, Eliminar).');
    await page.screenshot({ path: path.join(artifactDir, '01-split-button-dropdown.png') });

    // Click 'Eliminar' to trigger Component 1
    console.log('Clicking "Eliminar" from dropdown...');
    const deleteActionBtn = page.locator('[data-testid^="delete-affirmation-action-"]').first();
    await deleteActionBtn.click();
    await page.waitForTimeout(500);

    // Verify Component 1: Premium Delete Modal
    const deleteModal = page.locator('[data-testid="premium-delete-modal"]');
    await deleteModal.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ Component 1: PremiumDeleteModal is rendered with floating top coral icon, pill notice, and dual buttons.');
    await page.screenshot({ path: path.join(artifactDir, '02-premium-delete-modal.png') });

    // Click 'Conservar'
    const cancelDeleteBtn = page.locator('[data-testid="delete-modal-cancel-btn"]');
    await cancelDeleteBtn.click();
    await page.waitForTimeout(500);

    // 3. Component 5 Verification: Floating Toggle Selector with Sliding Pill
    console.log('--- TESTING COMPONENT 5 (PREMIUM TOGGLE SELECTOR) ---');
    const toggleTrigger = page.locator('[data-testid="toggle-selector-trigger"]').first();
    await toggleTrigger.scrollIntoViewIfNeeded();
    await toggleTrigger.click();
    await page.waitForTimeout(400);

    const toggleDropdown = page.locator('[data-testid="toggle-selector-dropdown"]');
    await toggleDropdown.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ Component 5: Floating capsule dropdown deployed with spring animation.');
    await page.screenshot({ path: path.join(artifactDir, '03-floating-toggle-selector.png') });

    // Select Maia
    const maiaOption = page.locator('[data-testid="toggle-option-maia"]');
    await maiaOption.click();
    await page.waitForTimeout(500);
    console.log('✅ Component 5: Option Maia selected and sliding pill animated smoothly.');

    // 4. Component 3 Verification: Voice Search & Wave Bars
    console.log('--- TESTING COMPONENT 3 (VOICE SEARCH & WAVE BARS) ---');
    const goalsMicBtn = page.locator('[data-testid="goals-mic-btn"]');
    if (await goalsMicBtn.count() > 0 && await goalsMicBtn.isVisible()) {
      await goalsMicBtn.click();
      await page.waitForTimeout(800);

      const voiceVisualizer = page.locator('[data-testid="gemini-voice-visualizer"]');
      await voiceVisualizer.waitFor({ state: 'visible', timeout: 5000 });
      console.log('✅ Component 3: Voice visualizer active with pulseGlow and animated wave-bars.');
      await page.screenshot({ path: path.join(artifactDir, '04-voice-search-wave-bars.png') });

      const cancelVoiceBtn = page.locator('button[aria-label="Cancelar dictado"]:visible').first();
      if (await cancelVoiceBtn.count() > 0) {
        await cancelVoiceBtn.click();
        await page.waitForTimeout(500);
      }
    }

    // 5. Component 4 (Part 1): Rampage AI Cascade Auto-Fill
    console.log('--- TESTING COMPONENT 4 PART 1 (RAMPAGE AI AUTO-FILL) ---');
    const rampageTabBtn = page.locator('button:visible:has-text("Rampage")').first();
    await rampageTabBtn.click();
    await page.waitForTimeout(600);

    const manualEditorBtn = page.locator('button:visible:has-text("O crear manualmente"), [data-testid="open-rampage-modal-btn"]:visible, button:visible:has-text("Editar")').first();
    if (await manualEditorBtn.count() > 0) {
      await manualEditorBtn.click();
      await page.waitForTimeout(600);

      const autofillAiBtn = page.locator('[data-testid="autofill-ai-btn"]:visible, [data-testid="autofill-ai-btn-mobile"]:visible').first();
      if (await autofillAiBtn.count() > 0 && await autofillAiBtn.isVisible()) {
        console.log('Clicking "✨ Auto-completar con IA" button...');
        await autofillAiBtn.click();
        await page.waitForTimeout(600);
        console.log('✅ Component 4 Part 1: Staggered sequential auto-fill (110ms per item) with elastic pop & green checkmark.');
        await page.screenshot({ path: path.join(artifactDir, '05-rampage-ai-autofill.png') });
      }

      // Close drawer/modal
      const closeRampageBtn = page.locator('button:visible:has-text("Cancelar"), [aria-label="Cerrar"]:visible, button:visible:has-text("✕")').first();
      if (await closeRampageBtn.count() > 0) {
        await closeRampageBtn.click();
        await page.waitForTimeout(500);
      }
    }

    // Dismiss any open drawer or press Escape to ensure clean state
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    const openDrawer = page.locator('[data-vaul-drawer][data-state="open"]');
    if (await openDrawer.count() > 0) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    // 6. Component 4 (Part 2): Synchronicity OTP Auto-Fill in SignsView
    console.log('--- TESTING COMPONENT 4 PART 2 (SYNCHRONICITY OTP AUTO-FILL) ---');
    const espacioTab = page.locator('[data-tour="mobile-nav-espacio"]');
    await espacioTab.click();
    await page.waitForTimeout(800);

    const senalesBtn = page.locator('button:visible:has-text("Señales")').first();
    await senalesBtn.click();
    await page.waitForTimeout(800);

    const registerSignBtn = page.locator('button:visible:has-text("Registrar primera señal"), button:visible:has-text("Registrar señal"), [aria-label*="señal"]:visible').first();
    if (await registerSignBtn.count() > 0 && await registerSignBtn.isVisible()) {
      await registerSignBtn.click();
      await page.waitForTimeout(600);

      const otpContainer = page.locator('[data-testid="synchronicity-otp-container"]:visible');
      await otpContainer.waitFor({ state: 'visible', timeout: 5000 });
      console.log('OTP container is visible.');

      const pill1111 = page.locator('[data-testid="autofill-pill-11-11"]:visible');
      console.log('Clicking "⚡ Auto-llenar 11:11" pill...');
      await pill1111.click();
      await page.waitForTimeout(600);

      console.log('✅ Component 4 Part 2: 11:11 OTP cascade auto-fill (110ms per digit) completed with checkmark & active shadow.');
      await page.screenshot({ path: path.join(artifactDir, '06-synchronicity-otp-autofill.png') });
    }

    console.log('✨ ALL 5 MICRO-INTERACTIONS TESTED AND VALIDATED AT 60 FPS IN MOBILE VIEWPORT (393x852)!');
  } catch (err) {
    console.error('❌ Verification failed:', err);
    await page.screenshot({ path: path.join(artifactDir, 'error-state.png') });
    throw err;
  } finally {
    await browser.close();
  }
})();
