// Mobile flow checks, not just viewport-overflow checks.
// SITE_URL=http://localhost:3000 node scripts/e2e-mobile-interfaces.mjs
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { checkDriveStyle } from "./drive-style-e2e.mjs";

const base = process.env.SITE_URL || "http://localhost:3000";
const allSlugs = ["agents", "graphics", "render", "drive", "orbit", "frontier"];
const slugs = process.env.INTERFACES ? process.env.INTERFACES.split(",").map(slug => slug.trim()).filter(Boolean) : allSlugs;
assert(slugs.length > 0 && slugs.every(slug => allSlugs.includes(slug)), "INTERFACES must contain known interface slugs");
const browser = await chromium.launch({
  ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}),
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const errors = [];

async function fit(page, label) {
  const layout = await page.locator(".if-specimen").evaluate(frame => {
    const screen = frame.getBoundingClientRect();
    const visible = element => !!element.getClientRects().length && getComputedStyle(element).visibility !== "hidden" && !element.closest('[aria-hidden="true"]');
    return {
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      frameOverflow: frame.scrollWidth - frame.clientWidth,
      legacyChrome: Array.from(frame.querySelectorAll(".if-v1-status, .if-v1-nav")).filter(visible).length,
      shortTargets: Array.from(frame.querySelectorAll("button, input:not([type='hidden']), select, textarea")).filter(element => {
        if (!visible(element)) return false;
        const rect = element.getBoundingClientRect();
        return rect.width < 43.5 || rect.height < 43.5;
      }).map(element => element.getAttribute("aria-label") || element.textContent?.trim() || element.tagName),
      offscreenDocks: Array.from(frame.querySelectorAll(".rw-mobile-nav, .ev-mobile-nav, .so-mobile-nav, .wg-mobile-nav, .am-mobile-nav")).filter(visible).filter(element => {
        const rect = element.getBoundingClientRect();
        return rect.bottom > screen.bottom + 1 || rect.left < screen.left - 1 || rect.right > screen.right + 1;
      }).map(element => element.getAttribute("aria-label")),
    };
  });
  assert(layout.pageOverflow <= 1, `${label}: page overflow ${layout.pageOverflow}px`);
  assert(layout.frameOverflow <= 1, `${label}: specimen overflow ${layout.frameOverflow}px`);
  assert.equal(layout.legacyChrome, 0, `${label}: duplicated status/header chrome`);
  assert.deepEqual(layout.shortTargets, [], `${label}: touch targets below 44px`);
  assert.deepEqual(layout.offscreenDocks, [], `${label}: primary navigation outside the screen`);
}

async function flow(page, slug) {
  const frame = page.locator(".if-specimen");
  if (slug === "agents") {
    assert(await frame.locator(".am-mobile-nav").isVisible());
    assert(!(await frame.locator(".am-summary").isVisible()));
    await frame.locator(".am-task").filter({ hasText: "Audit keyboard navigation" }).click();
    assert(!(await frame.locator(".am-header").isVisible()));
    assert(!(await frame.locator(".am-queue").isVisible()));
    await frame.getByRole("button", { name: "Approve review", exact: true }).click();
    assert(await frame.getByText("Work accepted", { exact: true }).isVisible());
    await frame.getByRole("button", { name: "Tasks", exact: true }).click();
    assert(await frame.locator(".am-mobile-nav").isVisible());
  }
  if (slug === "graphics") {
    const nav = frame.getByRole("navigation", { name: "Wallpaper workspace" });
    assert(!(await frame.getByRole("complementary", { name: "Composition direction" }).isVisible()));
    await nav.getByRole("button", { name: "Direction", exact: true }).click();
    await frame.getByLabel("Variation seed").fill("Geometric field for a phone");
    await frame.getByLabel("Canvas format", { exact: true }).selectOption("phone");
    await frame.getByRole("button", { name: "Generate set", exact: true }).click();
    assert(await frame.getByRole("region", { name: "Wallpaper previews" }).isVisible());
    assert(!(await frame.getByRole("complementary", { name: "Composition direction" }).isVisible()));
    assert.equal(await frame.locator(".wg-stage > svg:visible").count(), 1);
    await frame.getByRole("group", { name: "Choose composition" }).getByRole("button").nth(1).click();
  }
  if (slug === "render") {
    const nav = frame.getByRole("navigation", { name: "Model workspace" });
    assert(!(await frame.locator(".rw-inspector").isVisible()));
    await nav.getByRole("button", { name: "Inspector", exact: true }).click();
    assert(await frame.locator(".rw-inspector").isVisible());
    assert(!(await frame.locator(".rw-viewport").isVisible()));
    await nav.getByRole("button", { name: "Viewport", exact: true }).click();
    assert(await frame.getByRole("navigation", { name: "Viewport tools" }).isVisible());
  }
  if (slug === "drive") {
    await checkDriveStyle({ page, base, fail: message => { throw new Error(message); } });
  }
  if (slug === "orbit") {
    const nav = frame.getByRole("navigation", { name: "Observation workspace" });
    assert(!(await frame.getByRole("complementary", { name: "Observation assets" }).isVisible()));
    await nav.getByRole("button", { name: "Assets", exact: true }).click();
    await frame.locator(".so-asset").filter({ hasText: "Helios-7" }).click();
    await nav.getByRole("button", { name: "Pass details", exact: true }).click();
    assert(await frame.getByRole("region", { name: "Helios-7 pass details" }).isVisible());
    await frame.getByRole("button", { name: "Queue capture", exact: true }).click();
    assert(await frame.getByRole("button", { name: "Capture queued", exact: true }).isVisible());
    await nav.getByRole("button", { name: "Map", exact: true }).click();
    assert(!(await frame.locator(".so-pass").isVisible()));
  }
  if (slug === "frontier") {
    const menu = frame.locator(".cx-frontier-menu-toggle");
    assert(!(await frame.getByRole("navigation", { name: "Company sections" }).isVisible()));
    await menu.click();
    await frame.getByRole("navigation", { name: "Company sections" }).getByRole("button", { name: "Research", exact: true }).click();
    assert(!(await frame.getByRole("navigation", { name: "Company sections" }).isVisible()));
    assert(await frame.getByRole("region", { name: "Research" }).isVisible());
  }
  await fit(page, `${slug} after interaction`);
}

try {
  for (const [width, height, colorScheme] of [[320, 568, "dark"], [390, 844, "light"], [430, 932, "dark"], [1024, 900, "dark"]]) {
    const page = await browser.newPage({ viewport: { width, height }, colorScheme, reducedMotion: "reduce", hasTouch: true });
    page.on("pageerror", error => errors.push(error.message));
    for (const slug of slugs) {
      const response = await page.goto(`${base}/interfaces/${slug}/`, { waitUntil: "networkidle" });
      assert(response.ok(), `${slug}: route loads`);
      try {
        await fit(page, `${slug} ${width}×${height}`);
        await flow(page, slug);
      } catch (error) {
        console.error(`${width}×${height} ${slug}: ${error.message}`);
        await page.locator(".if-specimen").screenshot({ path: `/tmp/vlak-mobile-failure-${slug}.png` }).catch(() => {});
        throw error;
      }
      console.log(`${width}×${height} ${colorScheme}: ${slug} mobile flow passed`);
    }
    await page.close();
  }
  assert.deepEqual(errors, [], "No runtime errors during mobile flows");
  console.log("All mobile interface flows passed");
} finally {
  await browser.close();
}
