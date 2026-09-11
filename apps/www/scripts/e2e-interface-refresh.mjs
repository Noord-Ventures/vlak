// Fresh production export: SITE_URL=http://localhost:3016 node scripts/e2e-interface-refresh.mjs
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { chromium } from "playwright";
import { checkDriveStyle } from "./drive-style-e2e.mjs";
import { checkOrbitStyle } from "./orbit-style-e2e.mjs";
import { checkWallpaper } from "./wallpaper-rebuild-e2e.mjs";

const require = createRequire(import.meta.url);
const axe = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const base = process.env.SITE_URL || "http://localhost:3016";
const slugs = (process.env.INTERFACES || "render,drive,orbit,graphics,line,room,wall,evening,press,night,platforms,android,ios,documentation,music-player,video-player,patient,identity,music,agents,microbiology,genome,protein,robotics,circuitry,frontier,microscopy,desktop-os,calendar").split(",");
const failures = [];
const fail = message => { failures.push(message); console.error(message); };
const browser = await chromium.launch({ ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}), args: ["--enable-unsafe-swiftshader"] });
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
          const tooSmall = el => {
            const rect = el.getBoundingClientRect();
            const handset = el.closest('.mo-device[data-platform] .mo-phone')?.closest('.mo-handset');
            // Phone studies are complete scaled drawings. Check logical hit areas
            // inside their handset; the Device/Rotate/Back tools stay physical44px.
            const scale = handset ? handset.getBoundingClientRect().width / handset.offsetWidth : 1;
            return rect.width / scale < 43.5 || rect.height / scale < 43.5;
          };
          return {
            overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            frameOverflow: frame.scrollWidth - frame.clientWidth,
            heightOverflow: frame.scrollHeight - frame.clientHeight,
            main: document.querySelectorAll("main").length,
            h1: document.querySelectorAll("h1").length,
            short: [...frame.querySelectorAll('button, a[href], input:not([type="hidden"]), select, textarea')].filter(visible).map(target).filter(tooSmall).map(el => el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 50) || el.tagName),
          };
        });
        if (layout.overflow > 1 || layout.frameOverflow > 1 || layout.heightOverflow > 1) fail(`${theme} ${width}px ${slug}: overflow ${JSON.stringify(layout)}`);
        if (layout.main !== 1 || layout.h1 !== 1) fail(`${slug}: expected one main and page heading`);
        if (layout.short.length) fail(`${theme} ${width}px ${slug}: targets below44px: ${layout.short.join(', ')}`);
        await page.addScriptTag({ content: axe });
        const result = await page.evaluate(() => window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] }, rules: { region: { enabled: false } } }));
        for (const violation of result.violations) fail(`${theme} ${width}px ${slug}: axe ${violation.id}: ${violation.nodes.slice(0, 3).map(node => node.target).join('; ')}`);
        if (theme === "light" && (width === 390 || width === 1440)) await page.locator('.if-specimen').screenshot({ path: `/tmp/vlak-interface-${slug}-${width}.png` });
      }
      console.log(`${theme} ${width}px: ${slugs.length} interfaces checked for layout and accessibility`);
    }
    await page.emulateMedia({ colorScheme: "light" });
    if (process.env.FLOWS !== "0") {
      if (slugs.includes("drive")) await checkDriveStyle({page,base,fail});
      if (slugs.includes("orbit")) await checkOrbitStyle({page,base,fail});
      if (slugs.includes("graphics")) await checkWallpaper({page,base,fail});
      for (const [routes, file, name] of [
        [["line", "room"], "./chat-rebuild-e2e.mjs", "checkChats"],
        [["wall", "evening"], "./social-food-rebuild-e2e.mjs", "checkSocialFood"],
        [["press", "night"], "./dashboard-fleet-rebuild-e2e.mjs", "checkDashboardFleet"],
        [["platforms"], "./transit-e2e.mjs", "checkTransit"],
        [["android", "ios"], "./mobile-os-e2e.mjs", "checkMobileOS"],
        [["robotics"], "./robotics-three-e2e.mjs", "checkRoboticsThree"],
        [["frontier"], "./athena-e2e.mjs", "checkAthena"],
        [["microscopy"], "./microscopy-interface-e2e.mjs", "checkMicroscopyInterface"],
        [["documentation"], "./documentation-e2e.mjs", "checkDocumentation"],
        [["calendar"], "./calendar-e2e.mjs", "checkCalendar"],
        [["calendar"], "./calendar-popover-e2e.mjs", "checkCalendarPopover"],
        [["desktop-os"], "./desktop-os-e2e.mjs", "checkDesktopOS"],
        [["desktop-os"], "./desktop-utilities-e2e.mjs", "checkDesktopUtilities"],
        [["desktop-os"], "./desktop-editor-e2e.mjs", "checkDesktopEditor"],
        [["desktop-os"], "./desktop-mac-chrome-e2e.mjs", "checkDesktopMacChrome"],
        [["video-player"], "./video-player-e2e.mjs", "checkVideoPlayer"],
        [["music-player"], "./music-player-e2e.mjs", "checkMusicPlayer"],
        [["music-player"], "./music-player-sound-e2e.mjs", "checkMusicPlayerSound"],
        [["music-player"], "./music-player-sound-e2e.mjs", "checkMusicPlayerDirectAudio"],
        [["evening"], "./food-dishes-e2e.mjs", "checkFoodDishes"],
      ]) if (routes.some(slug => slugs.includes(slug))) {
        const check = (await import(file))[name];
        await check({page,base,fail});
      }
    }
    if (width <= 390 && process.env.FLOWS !== "0" && slugs.includes("room") && slugs.includes("evening")) {
      const { checkMobileReturnPaths } = await import("./mobile-return-paths-e2e.mjs");
      await checkMobileReturnPaths({page,base,fail});
    }
    if (width >= 900 && process.env.FLOWS !== "0") {
      const { checkDocsNavPointer } = await import("./docs-nav-pointer-e2e.mjs");
      await checkDocsNavPointer({page,base,fail});
    }
    if (width === 1440 && process.env.FLOWS !== "0" && slugs.includes("ios")) {
      const { checkIOSSystemLayout } = await import("./ios-system-layout-e2e.mjs");
      const variants = await checkIOSSystemLayout({ page, base });
      console.log(`iOS system alignment: ${variants.length} device layouts and rotation camera clearance passed`);
    }
    await context.close();
  }
} finally { await browser.close(); }
if (failures.length) { console.error(`${failures.length} interface refresh failures`); process.exitCode = 1; }
else console.log(`Interface refresh passes light/dark layout and accessibility${process.env.FLOWS === "0" ? "" : " plus local flows"} at four viewport sizes.`);
