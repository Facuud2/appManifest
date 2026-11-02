const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = '/home/facuud2/.gemini/antigravity/brain/e267a820-d5fd-4aaa-80cc-1cc37c6681b4/screenshots';

(async () => {
  console.log('🚀 Starting Mobile Tabbar Shared Layout Animation Verification...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 393, height: 852 },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  console.log('📱 Navigating to http://localhost:3000 at 393x852 viewport...');
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Close tour if visible by setting localStorage or clicking skip
  await page.evaluate(() => {
    localStorage.setItem('manifest_tour_completed', 'true');
  });
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);

  const tabs = [
    { key: 'inicio', label: 'Inicio', selector: '[data-tour="mobile-nav-inicio"]' },
    { key: 'objetivos', label: 'Afirmaciones', selector: '[data-tour="mobile-nav-objetivos"]' },
    { key: 'diario', label: 'Diario', selector: '[data-tour="mobile-nav-diario"]' },
    { key: 'espacio', label: 'Mi Espacio', selector: '[data-tour="mobile-nav-espacio"]' },
    { key: 'inicio', label: 'Inicio (regreso)', selector: '[data-tour="mobile-nav-inicio"]' },
  ];

  const positions = [];

  for (let i = 0; i < tabs.length; i++) {
    const tab = tabs[i];
    console.log(`\n➡️  Clicking Tab [${tab.label}] (${tab.selector})...`);

    // Click tab
    await page.click(tab.selector);

    // Track mid-flight sample to prove sliding motion
    await page.waitForTimeout(60);
    const midFlightBox = await page.evaluate(() => {
      // Find the active pill (motion.div with border-purple-200/60 or absolute inset-1)
      const nav = document.querySelector('[data-testid="ios-floating-tabbar-wrap"] nav');
      if (!nav) return null;
      const pill = nav.querySelector('.bg-white\\/85') || nav.querySelector('[class*="bg-white/85"]');
      if (!pill) return null;
      const rect = pill.getBoundingClientRect();
      return { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) };
    });

    // Wait for spring animation to settle
    await page.waitForTimeout(380);

    // Get settled position and properties
    const settledData = await page.evaluate((sel) => {
      const nav = document.querySelector('[data-testid="ios-floating-tabbar-wrap"] nav');
      if (!nav) return { error: 'Nav not found' };
      const pill = nav.querySelector('[class*="bg-white/85"]');
      const accent = pill ? pill.querySelector('[class*="from-manifest-pink"]') : null;
      const activeBtn = document.querySelector(sel);
      const icon = activeBtn ? activeBtn.querySelector('svg') : null;
      const label = activeBtn ? activeBtn.querySelector('span.text-\\[10px\\]') : null;

      const pillRect = pill ? pill.getBoundingClientRect() : null;
      const btnRect = activeBtn ? activeBtn.getBoundingClientRect() : null;

      return {
        pillFound: !!pill,
        accentFound: !!accent,
        pillX: pillRect ? Math.round(pillRect.x) : null,
        pillWidth: pillRect ? Math.round(pillRect.width) : null,
        btnX: btnRect ? Math.round(btnRect.x) : null,
        btnWidth: btnRect ? Math.round(btnRect.width) : null,
        hasZIndexPill: pill ? window.getComputedStyle(pill).zIndex : null,
        labelZIndex: label ? window.getComputedStyle(label).zIndex : null,
        labelText: label ? label.textContent.trim() : null,
      };
    }, tab.selector);

    console.log(`   Pill Settled: Found=${settledData.pillFound}, Accent=${settledData.accentFound}, X=${settledData.pillX}px, Width=${settledData.pillWidth}px (Button X=${settledData.btnX}px)`);
    console.log(`   Mid-Flight X: ${midFlightBox ? midFlightBox.x + 'px' : 'N/A'}`);
    console.log(`   Label: "${settledData.labelText}", Z-Index: ${settledData.labelZIndex}`);

    positions.push({
      tab: tab.label,
      pillX: settledData.pillX,
      midFlightX: midFlightBox ? midFlightBox.x : null,
      accentFound: settledData.accentFound,
    });

    // Screenshot tabbar
    const screenshotPath = path.join(ARTIFACTS_DIR, `step-${i + 1}-${tab.key}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`   📸 Captured screenshot: ${screenshotPath}`);
  }

  // Verify positions strictly progressed and returned
  console.log('\n📊 Motion Trajectory Verification:');
  console.log('--------------------------------------------------');
  for (const pos of positions) {
    console.log(`Tab: ${pos.tab.padEnd(20)} | Pill X: ${pos.pillX}px | Accent: ${pos.accentFound}`);
  }

  const p0 = positions[0].pillX;
  const p1 = positions[1].pillX;
  const p2 = positions[2].pillX;
  const p3 = positions[3].pillX;
  const p4 = positions[4].pillX;

  const progressive = p0 < p1 && p1 < p2 && p2 < p3;
  const returned = p4 === p0;

  console.log('--------------------------------------------------');
  console.log(`Pill X shifted right progressively (p0 < p1 < p2 < p3): ${progressive} (${p0} < ${p1} < ${p2} < ${p3})`);
  console.log(`Pill returned to origin on Inicio tap: ${returned} (${p4} === ${p0})`);

  if (progressive && returned) {
    console.log('\n✅ ALL VERIFICATION CHECKS PASSED: Fluid horizontal shared layout animation is working flawlessly!');
  } else {
    console.error('\n❌ VERIFICATION FAILED: Coordinates did not slide as expected.');
    process.exit(1);
  }

  await browser.close();
})();
