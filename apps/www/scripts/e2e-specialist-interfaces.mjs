// Fresh production export: SITE_URL=http://localhost:3016 node scripts/e2e-specialist-interfaces.mjs
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { chromium } from "playwright";
import { checkScienceInterfaces } from "./science-interface-e2e.mjs";
import { checkEngineeringInterfaces } from "./engineering-interface-e2e.mjs";
import { checkCareInterfaces } from "./care-interface-e2e.mjs";
import { checkMusicInterface } from "./music-interface-e2e.mjs";
import { checkMusicEngineTail } from "./music-engine-e2e.mjs";

const require = createRequire(import.meta.url);
const axe = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const base = process.env.SITE_URL || "http://localhost:3016";
const slugs = ["microbiology", "genome", "protein", "robotics", "circuitry", "identity", "patient", "music"];
const failures = [];
const fail = message => { failures.push(message); console.error(message); };
const browser = await chromium.launch(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : undefined);
try {
  for (const width of [320, 390, 1024, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: width <= 390 ? 844 : 1000 }, colorScheme: "light", reducedMotion: "reduce", acceptDownloads: true });
    const page = await context.newPage();
    page.on("pageerror", error => fail(`${width}px: ${error.message}`));
    for (const theme of ["light", "dark"]) {
      await page.emulateMedia({ colorScheme: theme });
      for (const slug of slugs) {
        await page.goto(`${base}/interfaces/${slug}/`, { waitUntil: "networkidle" });
        const layout = await page.locator('.if-specimen').evaluate(frame => {
          const visible = el => el.getClientRects().length && getComputedStyle(el).visibility !== "hidden" && !el.closest('[aria-hidden="true"]');
          const target = el => (el.matches('input[type="checkbox"],input[type="radio"]') ? el.closest('label') : el) || el;
          return {
            overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            frameOverflow: frame.scrollWidth - frame.clientWidth,
            main: document.querySelectorAll("main").length,
            h1: document.querySelectorAll("h1").length,
            short: [...frame.querySelectorAll('button, a[href], input:not([type="hidden"]), select, textarea')].filter(visible).map(target).filter(el => { const rect = el.getBoundingClientRect(); return rect.width < 43.5 || rect.height < 43.5; }).map(el => el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 50) || el.tagName),
          };
        });
        if (layout.overflow > 1 || layout.frameOverflow > 1) fail(`${theme} ${width}px ${slug}: overflow ${JSON.stringify(layout)}`);
        if (layout.main !== 1 || layout.h1 !== 1) fail(`${slug}: expected one main and page heading`);
        if (layout.short.length) fail(`${theme} ${width}px ${slug}: targets below44px: ${layout.short.join(', ')}`);
        await page.addScriptTag({ content: axe });
        const result = await page.evaluate(() => window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] }, rules: { region: { enabled: false } } }));
        for (const violation of result.violations) fail(`${theme} ${width}px ${slug}: axe ${violation.id}: ${violation.nodes.slice(0, 3).map(node => node.target).join('; ')}`);
        if (theme === "light" && (width === 390 || width === 1440)) await page.locator('.if-specimen').screenshot({ path: `/tmp/vlak-interface-${slug}-${width}.png` });
      }
      console.log(`${theme} ${width}px: eight specialist interfaces checked for layout and accessibility`);
    }
    await page.emulateMedia({ colorScheme: "light" });
    await checkScienceInterfaces({ page, base, fail });
    await checkEngineeringInterfaces({ page, base, fail });
    await checkCareInterfaces({ page, base, fail });
    await checkMusicInterface({ page, base, fail });
    if (width === 1440) await checkMusicEngineTail({ page, base, fail });
    await context.close();
  }
} finally { await browser.close(); }
if (failures.length) { console.error(`${failures.length} specialist interface failures`); process.exitCode = 1; }
else console.log("All eight specialist interfaces pass light/dark layout, accessibility and complete local flows at four viewport sizes.");
