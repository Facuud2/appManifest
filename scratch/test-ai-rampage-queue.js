const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = '/home/facuud2/.gemini/antigravity/brain/2290ef0b-4381-48d2-a1a7-33acb48eb77f';

(async () => {
  console.log('🚀 Iniciando verificación automatizada Playwright en Modo Sandbox IA...');

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 393, height: 852 },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });
  const page = await context.newPage();

  // Telemetry and network monitoring
  const telemetryLogs = [];
  const networkRequests = [];

  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('[AI Telemetry]')) {
      telemetryLogs.push(text);
      console.log('📡', text);
    }
  });

  page.on('request', (req) => {
    const url = req.url();
    if (url.includes('/api/ai/')) {
      const headers = req.headers();
      networkRequests.push({ url, headers, method: req.method() });
      console.log(`🌐 [Request] ${req.method()} ${url} | x-ai-sandbox: ${headers['x-ai-sandbox']}`);
    }
  });

  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('/api/ai/')) {
      try {
        const json = await res.json();
        console.log(`✅ [Response] ${url} -> source: ${json.source}, tokens: ${json.totalTokens}`);
      } catch (_) {}
    }
  });

  // Step 1: Load application and verify Sandbox Mode
  console.log('\n--- 1. CARGA DE LA APP Y VERIFICACIÓN DE SANDBOX ---');
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(600);

  const isWebdriver = await page.evaluate(() => window.navigator.webdriver);
  console.log('navigator.webdriver =', isWebdriver);
  if (!isWebdriver) throw new Error('Se esperaba window.navigator.webdriver === true');

  // Navigate to Mi Espacio -> Ajustes to verify iOS switch
  console.log('Navigating to Mi Espacio -> Ajustes...');
  await page.locator('[data-tour="mobile-nav-espacio"]').click();
  await page.waitForTimeout(400);

  // Click on subtab Ajustes
  const ajustesBtn = page.locator('[data-testid="subtab-settings"]');
  await ajustesBtn.click();
  await page.waitForTimeout(400);

  const sandboxToggle = page.locator('[data-testid="settings-toggle-ai-sandbox"]');
  const hasSandboxToggle = await sandboxToggle.isVisible();
  console.log('Switch "Modo Sandbox IA" visible en Ajustes:', hasSandboxToggle);
  if (!hasSandboxToggle) throw new Error('No se encontró el switch de Modo Sandbox IA en Ajustes');

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, '01-settings-sandbox-toggle.png') });

  // Step 2: Navigate to Afirmaciones -> Sets de Rampage
  console.log('\n--- 2. NAVEGACIÓN A SETS DE RAMPAGE Y MODAL CONFIGURACIÓN ---');
  await page.locator('[data-tour="mobile-nav-objetivos"]').click();
  await page.waitForTimeout(400);

  // Switch to Sets de Rampage segment
  await page.locator('button:has-text("Sets de Rampage")').click();
  await page.waitForTimeout(500);

  // Click "Nuevo Set"
  const newSetBtn = page.locator('[data-testid="open-rampage-modal-btn"]').first();
  await newSetBtn.click();
  await page.waitForTimeout(500);

  // Verify Drawer has opened
  const themeInput = page.locator('[data-testid="rampage-central-theme-input"]');
  const specInput = page.locator('[data-testid="rampage-specifications-input"]');
  const startBtn = page.locator('[data-testid="start-ai-rampage-btn"]');

  if (!(await themeInput.isVisible())) {
    throw new Error('El campo Tema Central no está visible en el drawer');
  }

  console.log('Llenando Tema Central y Especificaciones...');
  await themeInput.fill('Estabilidad financiera y abundancia creativa');
  await specInput.fill('Enfocar en seguridad, disfrute compartido y fluidez sin estrés');
  await page.waitForTimeout(300);

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, '02-rampage-config-drawer.png') });

  // Step 3: Start AI Rampage Queue Session
  console.log('\n--- 3. INICIO DE RAMPAGE AUTOMÁTICO (COLA DINÁMICA 3 EN 3) ---');
  await startBtn.click();
  await page.waitForTimeout(700);

  // Verify first 3 affirmations are loaded (1/3)
  const cardLocator = page.locator('[data-testid="rampage-next-btn"]');
  await cardLocator.waitFor({ state: 'visible', timeout: 5000 });

  const subheaderText1 = await page.locator('text=Afirmación 1 de 3').isVisible();
  console.log('¿Afirmación 1 de 3 visible?:', subheaderText1);
  if (!subheaderText1) throw new Error('No se cargó el lote inicial de 3 afirmaciones');

  const counterInitial = await page.locator('[data-testid="rampage-repeat-counter"]').first().textContent();
  console.log('Contador repetición inicial:', counterInitial);

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, '03-first-affirmation-1-of-3.png') });

  // Step 4: Advance to 2nd Affirmation & Verify Background Prefetch
  console.log('\n--- 4. AVANCE A 2DA AFIRMACIÓN Y DISPARO AUTOMÁTICO DE PREFETCH ---');
  console.log('Pulsando la tarjeta de la afirmación...');
  await cardLocator.click();
  await page.waitForTimeout(300);

  // Counter should increment and we should be on affirmation 2
  await page.waitForTimeout(450); // wait for spring exit transition
  const counterAfterClick = await page.locator('[data-testid="rampage-repeat-counter"]').last().textContent();
  console.log('Contador tras clic (debe ser 1):', counterAfterClick);

  // The prefetch should be triggered automatically because index 1 is penultimate in 3 (3 - 2 = 1)
  console.log('Esperando que el segundo lote (3 más) se anexe a la cola silenciosamente...');
  await page.waitForTimeout(800); // 500ms mock latency + buffer

  const subheaderText2 = await page.locator('text=Afirmación 2 de 6').isVisible();
  console.log('¿Afirmación 2 de 6 visible tras prefetch automático?:', subheaderText2);
  if (!subheaderText2) {
    throw new Error('El prefetch no anexó las 3 nuevas afirmaciones a la cola (se esperaba total 6)');
  }

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, '04-second-affirmation-prefetch-to-6.png') });

  // Step 5: Test Decision Modal (Descartar)
  console.log('\n--- 5. PRUEBA DE FINALIZAR RAMPAGE -> DESCARTAR ---');
  const finishBtn = page.locator('[data-testid="finish-rampage-btn"]');
  await finishBtn.click();
  await page.waitForTimeout(400);

  const decisionModal = page.locator('[data-testid="rampage-decision-modal"]');
  if (!(await decisionModal.isVisible())) {
    throw new Error('El modal de decisión no se mostró al pulsar Finalizar Rampage');
  }

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, '05-decision-modal-summary.png') });

  console.log('Pulsando "Descartar este Rampage"...');
  await page.locator('[data-testid="discard-rampage-set-btn"]').click();
  await page.waitForTimeout(500);

  // Verify modal closed and session ended
  console.log('¿Modal cerrado tras descartar?:', !(await decisionModal.isVisible()));

  // Step 6: Test Decision Modal (Guardar) and Persistence
  console.log('\n--- 6. PRUEBA DE FINALIZAR RAMPAGE -> GUARDAR Y PERSISTENCIA ---');
  await page.locator('[data-testid="open-rampage-modal-btn"]').first().click();
  await page.waitForTimeout(400);

  await page.locator('[data-testid="rampage-central-theme-input"]').fill('Paz Interior y Trascendencia');
  await page.locator('[data-testid="start-ai-rampage-btn"]').click();
  await page.waitForTimeout(700);

  await cardLocator.waitFor({ state: 'visible' });
  // Click once to advance to 2 and trigger prefetch to 6
  await cardLocator.click();
  await page.waitForTimeout(800);

  // Finalizar Rampage
  await page.locator('[data-testid="finish-rampage-btn"]').click();
  await page.waitForTimeout(400);

  console.log('Pulsando "Guardar Set en mi Santuario ✨"...');
  await page.locator('[data-testid="save-rampage-set-btn"]').click();
  await page.waitForTimeout(700);

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, '06-saved-set-toast.png') });

  // Reload page to verify local persistence
  console.log('Recargando página para verificar persistencia en localStorage...');
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(600);

  // Navigate back to Sets de Rampage
  await page.locator('[data-tour="mobile-nav-objetivos"]').click();
  await page.waitForTimeout(300);
  await page.locator('button:has-text("Sets de Rampage")').click();
  await page.waitForTimeout(500);

  const savedSetTitle = await page.locator('text=“Paz Interior y Trascendencia”').isVisible();
  console.log('¿Set guardado presente tras recargar página?:', savedSetTitle);
  if (!savedSetTitle) {
    throw new Error('El set de Rampage no persistió en localStorage tras recargar');
  }

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, '07-persisted-set-after-reload.png') });

  // Step 7: Verify Transcribe Endpoint in Sandbox Mode
  console.log('\n--- 7. VERIFICACIÓN DEL ENDPOINT /api/ai/transcribe ---');
  const transcribeRes = await page.evaluate(async () => {
    // Dummy audio blob
    const dummyBlob = new Blob([new Uint8Array(3000)], { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('audio', dummyBlob, 'test.webm');
    formData.append('previousTextTail', 'Decreto con amor que');

    const res = await fetch('/api/ai/transcribe', {
      method: 'POST',
      headers: { 'x-ai-sandbox': 'true' },
      body: formData,
    });
    return await res.json();
  });

  console.log('Resultado /api/ai/transcribe:', transcribeRes);
  if (transcribeRes.source !== 'SANDBOX_MOCK') {
    throw new Error('El endpoint de transcripción no devolvió SANDBOX_MOCK en modo sandbox');
  }
  if (!transcribeRes.text || transcribeRes.text.length < 5) {
    throw new Error('El endpoint de transcripción no devolvió texto simulado coherente');
  }

  console.log('\n🎉 ¡TODAS LAS PRUEBAS DE PLAYWRIGHT PASARON EXITOSAMENTE CON 0 GASTO DE API!');
  await browser.close();
})();
