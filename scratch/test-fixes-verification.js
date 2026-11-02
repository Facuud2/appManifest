const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = '/home/facuud2/.gemini/antigravity/brain/b82a72c7-8e1f-4c79-9958-3668674d97bb';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 393, height: 852 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });
  const page = await context.newPage();

  console.log('1. Loading application at http://localhost:3000...');
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(600);

  // Set seed data so we have realistic affirmations and rampage sets
  await page.evaluate(() => {
    const sampleAffirmations = [
      {
        id: 'aff-user-1',
        userId: 'facu',
        author: 'Facu',
        text: 'Paso la navidad tomando alcohol y riéndome de una forma única en casa de Maia.',
        pinned: true,
        order: 1,
        repeatCount: 6,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'aff-user-2',
        userId: 'facu',
        author: 'Facu',
        text: 'Soy invitado por Maia los sábados a sus planes.',
        pinned: true,
        order: 2,
        repeatCount: 2,
        createdAt: new Date(Date.now() - 10000).toISOString(),
      },
      {
        id: 'aff-user-3',
        userId: 'facu',
        author: 'Facu',
        text: 'Soy Dios. Esta es MI realidad.',
        pinned: true,
        order: 3,
        repeatCount: 5,
        createdAt: new Date(Date.now() - 20000).toISOString(),
      },
      {
        id: 'aff-user-4',
        userId: 'facu',
        author: 'Facu',
        text: 'Cada día mi convicción se multiplica.',
        pinned: true,
        order: 4,
        repeatCount: 4,
        createdAt: new Date(Date.now() - 30000).toISOString(),
      },
      {
        id: 'aff-user-5',
        userId: 'facu',
        author: 'Facu',
        text: 'Todo conspira a mi favor.',
        pinned: true,
        order: 5,
        repeatCount: 1,
        createdAt: new Date(Date.now() - 40000).toISOString(),
      },
    ];
    localStorage.setItem('manifest_has_seen_tour', 'true');
    localStorage.setItem('manifest_affirmations', JSON.stringify(sampleAffirmations));
    localStorage.setItem('manifest_user_settings', JSON.stringify({
      activeScope: 'facu',
      hasSeenOnboarding: true,
      tutorialCompleted: true,
      unlockedMilestones: ['welcome_manifest', 'first_action'],
      etherFragments: 50,
      dailyStreak: 3,
    }));
  });

  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(600);

  // VERIFICATION 1: First pinned card positioning and scroll down / up
  console.log('\n--- VERIFICATION 1: Position of first pinned affirmation & scroll ---');
  const cards = await page.$$('[data-testid^="manifestation-card-"]');
  console.log('Total rendered cards:', cards.length);
  const card0 = cards[0];
  const card1 = cards[1];
  const box0 = await card0.boundingBox();
  const box1 = await card1.boundingBox();
  console.log('Card 0 bottom:', box0.y + box0.height, 'Card 1 top:', box1.y);
  const gap = box1.y - (box0.y + box0.height);
  console.log('Gap between card 0 and 1:', gap, 'px (expected ~10px, positive and no overlap!)');

  // Scroll all the way down and back up
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);

  const box0AfterScroll = await card0.boundingBox();
  console.log('Card 0 after full scroll down and up y:', box0AfterScroll.y, '(expected matches original:', box0.y, ')');
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'verify-01-first-card-stable-position.png') });

  // VERIFICATION 2 & 3: Rampage Set Editor layout & trailing empty card drop
  console.log('\n--- VERIFICATION 2 & 3: Rampage Set Editor layout & empty card drop ---');
  // Switch to Afirmaciones tab
  await page.click('[data-tour="mobile-nav-objetivos"]');
  await page.waitForTimeout(400);

  // Click on "Sets de Rampage" switch
  const rampageTabBtn = await page.locator('button:has-text("Sets de Rampage"):visible').first();
  await rampageTabBtn.click();
  await page.waitForTimeout(400);

  // Click "Nuevo Set"
  const newSetBtn = await page.locator('button:has-text("Nuevo Set"):visible').first();
  await newSetBtn.click();
  await page.waitForTimeout(600);

  // Verify modal is open and has clean layout
  const drawer = await page.$('[data-testid="rampage-vaul-drawer"]');
  console.log('Rampage drawer visible:', !!drawer);

  // Fill title
  await page.fill('input[placeholder="Ej: Abundancia, Paz Serena, Éxito"]', 'Paz Total y Abundancia');

  // Fill first affirmation
  await page.fill('textarea[placeholder="Escribe la afirmación para esta secuencia..."]', 'Yo elijo la paz y la claridad suprema.');

  // Click "Añadir afirmación" to add card #2
  const addCardBtn = await page.locator('[data-testid="rampage-add-affirmation-btn"]');
  await addCardBtn.click();
  await page.waitForTimeout(300);

  // Fill second affirmation
  const textareas = await page.$$('textarea[placeholder="Escribe la afirmación para esta secuencia..."]');
  await textareas[1].fill('Mi abundancia es natural e infinita.');

  // Click "Añadir afirmación" to add card #3, but leave card #3 EMPTY!
  await addCardBtn.click();
  await page.waitForTimeout(300);
  const textareasCount = (await page.$$('textarea[placeholder="Escribe la afirmación para esta secuencia..."]')).length;
  console.log('Textareas count before submit (including empty trailing):', textareasCount);

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'verify-02-rampage-modal-with-empty-trailing.png') });

  // Click "Crear Set de Rampage"
  const submitBtn = await page.locator('button:has-text("Crear Set de Rampage"):visible');
  await submitBtn.click();
  await page.waitForTimeout(800);

  // Check saved rampage sets in localStorage
  const savedSets = await page.evaluate(() => JSON.parse(localStorage.getItem('manifest_rampage_sets') || '[]'));
  console.log('Saved sets count:', savedSets.length);
  if (savedSets.length > 0) {
    const lastSet = savedSets[savedSets.length - 1];
    console.log('Last set title:', lastSet.title);
    console.log('Last set affirmation count (empty trailing must be stripped):', lastSet.affirmations.length);
    console.log('Affirmations in saved set:', lastSet.affirmations.map(a => a.text));
  }

  // Check if milestone celebration modal appeared for first Rampage set creation
  const celebrationModalAfterCreate = await page.$('[data-testid="success-celebration-modal"]');
  if (celebrationModalAfterCreate) {
    const celebrationTitle = await page.$eval('[data-testid="success-celebration-modal"] h3', el => el.textContent);
    console.log('Gambling achievement celebration unlocked:', celebrationTitle);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'verify-02b-rampage-creator-achievement-modal.png') });
    // Close celebration modal to proceed
    const secondaryCta = await page.$('[data-testid="celebration-secondary-cta"]');
    if (secondaryCta) {
      await secondaryCta.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(400);
  }

  // VERIFICATION 4: Active dirty check on Edit without changes vs with changes
  console.log('\n--- VERIFICATION 4: Dirty detection on Edit modal ---');
  // Go to Inicio tab
  await page.click('[data-tour="mobile-nav-inicio"]');
  await page.waitForTimeout(400);

  // Click edit button on first card
  const editBtn = await page.locator('button[title="Editar manifestación"]').first();
  await editBtn.click();
  await page.waitForTimeout(500);

  // Modal is open. DO NOT CHANGE ANYTHING! Click "Guardar Cambios"
  const saveAffBtn = await page.locator('button:has-text("Guardar Cambios"):visible');
  await saveAffBtn.click();
  await page.waitForTimeout(500);

  // Verify no toast appeared for no changes
  const toastsNoChange = await page.$$('[data-testid="toast-container"] > div');
  console.log('Toasts count when saving without changes:', toastsNoChange.length, '(expected 0)');

  // Now open edit again, make an actual change, and save
  await editBtn.click();
  await page.waitForTimeout(500);
  const editTextarea = await page.locator('textarea[name="text"]:visible');
  await editTextarea.fill('Paso la navidad tomando alcohol y disfrutando una hermosa fiesta única.');
  await saveAffBtn.click();
  await page.waitForTimeout(500);

  // Verify gentle toast appeared and celebration modal DID NOT appear
  const celebrationModal = await page.$('[data-testid="success-celebration-modal"]');
  console.log('Celebration modal appeared on edit:', !!celebrationModal, '(expected false!)');
  const toastText = await page.evaluate(() => {
    const t = document.querySelector('[data-testid="toast-container"]');
    return t ? t.textContent : '';
  });
  console.log('Toast on legitimate change:', toastText, '(expected "Afirmación actualizada")');

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'verify-03-edit-active-change-toast.png') });

  console.log('\nALL VERIFICATIONS COMPLETE!');
  await browser.close();
})();
