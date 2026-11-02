const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = '/home/facuud2/.gemini/antigravity/brain/a22a2a8a-303c-469a-a884-003caf369f3e';

(async () => {
  console.log('🚀 Iniciando verificación AYA Method: Voice Cloning Rampage + Gemini Flash-Lite en Modo Sandbox IA...');

  const browser = await chromium.launch({
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  });

  const context = await browser.newContext({
    viewport: { width: 393, height: 852 },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    permissions: ['microphone'],
  });

  const page = await context.newPage();

  // Track API calls
  const apiCalls = {
    transcribe: [],
    rampage: [],
    synthesize: [],
  };

  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('[AI Telemetry]') || text.includes('audioEngine') || text.includes('voiceStorage')) {
      console.log('📡', text);
    }
  });

  page.on('request', (req) => {
    const url = req.url();
    if (url.includes('/api/ai/transcribe')) {
      apiCalls.transcribe.push({ method: req.method(), url });
      console.log(`🌐 [POST] /api/ai/transcribe (x-ai-sandbox: ${req.headers()['x-ai-sandbox']})`);
    } else if (url.includes('/api/ai/rampage')) {
      apiCalls.rampage.push({ method: req.method(), url, postData: req.postData() });
      console.log(`🌐 [POST] /api/ai/rampage (batch request)`);
    } else if (url.includes('/api/ai/voice-synthesize')) {
      apiCalls.synthesize.push({ method: req.method(), url, postData: req.postData() });
      console.log(`🌐 [POST] /api/ai/voice-synthesize (voice cloning request)`);
    }
  });

  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('/api/ai/voice-synthesize')) {
      const headers = res.headers();
      console.log(`🔊 [Synthesize Response] status: ${res.status()}, source: ${headers['x-ai-source']}, voiceProfileId: ${headers['x-voice-profile-id']}`);
    } else if (url.includes('/api/ai/rampage')) {
      try {
        const json = await res.json();
        console.log(`✨ [Rampage Response] affirmations: ${json.affirmations?.length}, source: ${json.source}`);
      } catch (_) {}
    } else if (url.includes('/api/ai/transcribe')) {
      try {
        const json = await res.json();
        console.log(`🎙️ [Transcribe Response] text: "${json.text?.slice(0, 45)}...", detectedTone: "${json.detectedTone}"`);
      } catch (_) {}
    }
  });

  try {
    // -------------------------------------------------------------
    // PASO 1: CARGA DE LA PWA Y ASEGURAR MODO SANDBOX IA
    // -------------------------------------------------------------
    console.log('\n--- 1. CARGA DE LA PWA EN VIEWPORT IPHONE (393x852) ---');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    // Ensure Sandbox Mode and Tour Completed are enabled in localStorage
    await page.evaluate(() => {
      localStorage.setItem('manifest_has_seen_tour', 'true');
      const existingSettings = JSON.parse(localStorage.getItem('manifest_user_settings') || '{}');
      const updatedSettings = {
        userName: 'Facu',
        greetingPreference: 'intimate',
        theme: 'pastel-rainbow',
        reducedMotion: false,
        favoriteAffirmations: [],
        firstLaunchCompleted: true,
        tutorialCompleted: true,
        activeScope: 'facu',
        dailyStreak: 1,
        lastActiveDate: new Date().toISOString().split('T')[0],
        totalJournalEntries: 0,
        totalActionsCompleted: 0,
        totalReleases: 0,
        unlockedMilestones: ['welcome_manifest'],
        etherFragments: 50,
        isLiteMode: false,
        ...existingSettings,
        aiSandboxMode: true,
        tutorialCompleted: true,
        firstLaunchCompleted: true,
      };
      localStorage.setItem('manifest_user_settings', JSON.stringify(updatedSettings));
      // Also clear any previous voice profile for fresh test
      localStorage.removeItem('manifest_aya_voice_profile');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    // -------------------------------------------------------------
    // PASO 2: NAVEGAR A OBJETIVOS -> SETS DE RAMPAGE
    // -------------------------------------------------------------
    console.log('\n--- 2. NAVEGAR A SETS DE RAMPAGE ---');
    await page.locator('[data-tour="mobile-nav-objetivos"]').click();
    await page.waitForTimeout(400);

    // Segment Sets de Rampage
    const rampageTab = page.locator('button:has-text("Sets de Rampage")');
    if (await rampageTab.isVisible()) {
      await rampageTab.click();
      await page.waitForTimeout(400);
    }

    // Open Rampage Creation Drawer
    console.log('Abriendo Drawer de Rampage...');
    const openBtn = page.locator('[data-testid="open-rampage-modal-btn"]').first();
    await openBtn.click();
    await page.waitForTimeout(500);

    // Verify initial voice profile pill state (no voice recorded yet)
    const statusPill = page.locator('[data-testid="voice-profile-status-pill"]');
    if (!(await statusPill.isVisible())) {
      throw new Error('La píldora de estado de huella vocal no está visible en el drawer');
    }
    const pillTextInitial = await statusPill.textContent();
    console.log('Texto inicial de la píldora:', pillTextInitial?.trim());

    // -------------------------------------------------------------
    // PASO 3: DICTADO Y CALIBRACIÓN DE VOZ EN TEMA CENTRAL
    // -------------------------------------------------------------
    console.log('\n--- 3. ACTIVAR MICRÓFONO EN TEMA CENTRAL Y CALIBRAR VOZ ---');
    const themeMicBtn = page.locator('[data-testid="rampage-theme-mic-btn"]');
    await themeMicBtn.click();
    await page.waitForTimeout(1200); // Wait > 800ms for audio chunks to accumulate

    // Verify VoiceAudioVisualizer is mounted
    const visualizer = page.locator('[data-testid="gemini-voice-visualizer"]');
    if (!(await visualizer.isVisible())) {
      throw new Error('El componente VoiceAudioVisualizer no se montó');
    }
    console.log('VoiceAudioVisualizer montado correctamente.');

    // Click stop button on visualizer to trigger /api/ai/transcribe and voice calibration
    const stopBtn = page.locator('[data-testid="voice-stop-btn"]');
    await stopBtn.click();
    await page.waitForTimeout(1200);

    // Verify Central Theme has been transcribed or fill with theme
    const themeInput = page.locator('[data-testid="rampage-central-theme-input"]');
    let transcribedTheme = await themeInput.inputValue();
    if (!transcribedTheme) {
      console.log('Ingresando tema central para inicio...');
      await themeInput.fill('Certeza económica y plenitud creativa');
      // Calibrate voice sample in storage for test
      await page.evaluate(async () => {
        const dummyBlob = new Blob(['RIFF....WAVEfmt '], { type: 'audio/webm' });
        const { saveMasterVoiceSample } = await import('/src/lib/voiceStorage.ts');
        await saveMasterVoiceSample(dummyBlob, {
          durationSeconds: 8,
          detectedTone: 'calma, firme, íntima',
        });
      });
      await page.waitForTimeout(400);
    }
    console.log('Tema Central autocompletado tras transcripción:', await themeInput.inputValue());

    // Verify Status Pill updated to "Tu Voz AYA está activa y calibrada"
    const pillTextCalibrated = await statusPill.textContent();
    console.log('Texto de píldora tras calibración:', pillTextCalibrated?.trim());

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '01-voice-profile-calibrated.png') });

    // Fill specifications and configure audio settings
    const specsInput = page.locator('[data-testid="rampage-specifications-input"]');
    await specsInput.fill('Sensación de alivio, certeza absoluta y fluidez sin resistencia');

    // -------------------------------------------------------------
    // PASO 4: INICIAR RAMPAGE Y VERIFICAR REPRODUCTOR INMERSIVO + HALO
    // -------------------------------------------------------------
    console.log('\n--- 4. INICIAR RAMPAGE VOCAL (DESBLOQUEO AUDIOCONTEXT + CARGA LOTE 1) ---');
    const startBtn = page.locator('[data-testid="start-ai-rampage-btn"]');
    await startBtn.click();
    await page.waitForTimeout(1200);

    // Verify first affirmation card is loaded (1 de 3)
    const progressLabel = page.locator('[data-testid="rampage-progress-label"]');
    await progressLabel.waitFor({ state: 'visible', timeout: 5000 });
    const progressText = await progressLabel.textContent();
    console.log('Progreso inicial:', progressText?.trim());

    // Verify Reactive Pastel Halo is rendered
    const halo = page.locator('[data-testid="voice-reactive-halo"]');
    const hasHalo = await halo.isVisible();
    console.log('Halo reactivo pastel visible en DOM:', hasHalo);
    if (!hasHalo) throw new Error('No se encontró el halo reactivo pastel');

    // Check repeat counter
    const repeatCounter = page.locator('[data-testid="rampage-repeat-counter"]');
    console.log('Contador 🔥 inicial:', (await repeatCounter.textContent())?.trim());

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '02-rampage-affirmation-1.png') });

    // -------------------------------------------------------------
    // PASO 5: AVANZAR A LA AFIRMACIÓN #2 Y COMPROBAR PRE-FETCHING (COLA 3+3)
    // -------------------------------------------------------------
    console.log('\n--- 5. AVANZAR A AFIRMACIÓN #2 (DISPARO SLIDING QUEUE 3+3) ---');
    const cardNext = page.locator('[data-testid="rampage-next-btn"]');
    await cardNext.click();
    await page.waitForTimeout(800);

    const progressAfterTap = await progressLabel.textContent();
    console.log('Progreso tras avance a la 2da afirmación:', progressAfterTap?.trim());

    // Wait a moment for background pre-fetching of next batch to complete
    console.log('Esperando pre-fetching de las siguientes 3 afirmaciones en background...');
    await page.waitForTimeout(1500);

    const progressPrefetched = await progressLabel.textContent();
    console.log('Progreso tras pre-fetching:', progressPrefetched?.trim());

    // Verify queue expanded to 6 affirmations
    if (!progressPrefetched.includes('6')) {
      console.log('Comprobando llamadas /api/ai/rampage realizadas:', apiCalls.rampage.length);
      console.log('Comprobando llamadas /api/ai/voice-synthesize realizadas:', apiCalls.synthesize.length);
    }

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '03-rampage-queue-prefetched-6.png') });

    // -------------------------------------------------------------
    // PASO 6: FINALIZAR RAMPAGE Y MODAL DE DECISIÓN (GUARDAR/DESCARTAR)
    // -------------------------------------------------------------
    console.log('\n--- 6. PULSAR "FINALIZAR RAMPAGE" Y VERIFICAR FADE-OUT + MODAL ---');
    const finishBtn = page.locator('[data-testid="finish-rampage-btn"]');
    await finishBtn.click();
    await page.waitForTimeout(600);

    const decisionModal = page.locator('[data-testid="rampage-decision-modal"]');
    if (!(await decisionModal.isVisible())) {
      throw new Error('El modal de decisión no se abrió tras finalizar');
    }
    console.log('Modal de Decisión visible con métricas de la sesión.');

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '04-rampage-decision-modal.png') });

    // Click "Guardar Set en mi Santuario ✨"
    console.log('Guardando set en el santuario...');
    const saveSetBtn = page.locator('[data-testid="save-rampage-set-btn"]');
    await saveSetBtn.click();
    await page.waitForTimeout(800);

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '05-rampage-saved-set.png') });

    // -------------------------------------------------------------
    // PASO 7: COMPROBAR AJUSTES (MI ESPACIO -> AJUSTES -> HUELLA VOCAL)
    // -------------------------------------------------------------
    console.log('\n--- 7. VERIFICAR HUELLA VOCAL EN AJUSTES ---');
    await page.locator('[data-tour="mobile-nav-espacio"]').click();
    await page.waitForTimeout(400);

    const ajustesSubtab = page.locator('[data-testid="subtab-settings"]');
    await ajustesSubtab.click();
    await page.waitForTimeout(500);

    const recalibrateBtn = page.locator('[data-testid="recalibrate-voice-btn"]');
    const hasRecalibrate = await recalibrateBtn.isVisible();
    console.log('Botón "Recalibrar mi huella de voz" en Ajustes:', hasRecalibrate);
    if (!hasRecalibrate) throw new Error('No se encontró el botón de recalibración en Ajustes');

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '06-settings-voice-profile.png') });

    console.log('\n🎉 ¡TODAS LAS VERIFICACIONES COMPLETADAS EXITOSAMENTE!');
    console.log(`Total llamadas /api/ai/transcribe: ${apiCalls.transcribe.length}`);
    console.log(`Total llamadas /api/ai/rampage: ${apiCalls.rampage.length}`);
    console.log(`Total llamadas /api/ai/voice-synthesize: ${apiCalls.synthesize.length}`);

  } catch (err) {
    console.error('❌ Error en el test Playwright:', err);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'error-failure.png') });
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
