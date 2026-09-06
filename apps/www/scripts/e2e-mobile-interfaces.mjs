// Mobile flow checks, not just viewport-overflow checks.
// SITE_URL=http://localhost:3000 node scripts/e2e-mobile-interfaces.mjs
import assert from "node:assert/strict";
import { chromium } from "playwright";

const base = process.env.SITE_URL || "http://localhost:3000";
const slugs = ["agents", "graphics", "render", "drive", "orbit", "frontier", "platforms", "line", "press", "wall", "night", "evening", "room"];
const browser = await chromium.launch({
  ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}),
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const errors = [];

async function fit(page, label) {
  const layout = await page.locator(".if-specimen").evaluate(frame => {
    const screen = frame.getBoundingClientRect();
    const visible = element => !!element.getClientRects().length && getComputedStyle(element).visibility !== "hidden";
    return {
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      frameOverflow: frame.scrollWidth - frame.clientWidth,
      legacyChrome: Array.from(frame.querySelectorAll(".if-v1-status, .if-v1-nav")).filter(visible).length,
      shortTargets: Array.from(frame.querySelectorAll("button, input:not([type='hidden']), select, textarea")).filter(element => {
        if (!visible(element)) return false;
        const rect = element.getBoundingClientRect();
        return rect.width < 43.5 || rect.height < 43.5;
      }).map(element => element.getAttribute("aria-label") || element.textContent?.trim() || element.tagName),
      offscreenDocks: Array.from(frame.querySelectorAll(".cx-mobile-nav, .am-mobile-nav, .sc-dash-mobile-nav, .sc-night-mobile-nav, .sc-wall-mobile-tabs")).filter(visible).filter(element => {
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
    await frame.getByRole("button", { name: "Phone", exact: true }).click();
    await frame.getByRole("button", { name: "Generate", exact: true }).click();
    assert(await frame.getByRole("region", { name: "Wallpaper previews" }).isVisible());
    assert(!(await frame.getByRole("complementary", { name: "Composition direction" }).isVisible()));
    assert.equal(await frame.locator(".cx-results > button:visible").count(), 1);
    await frame.getByRole("group", { name: "Choose composition" }).getByRole("button").nth(1).click();
  }
  if (slug === "render") {
    const nav = frame.getByRole("navigation", { name: "Model workspace" });
    assert(!(await frame.locator(".cx-render > aside").isVisible()));
    await nav.getByRole("button", { name: "Inspector", exact: true }).click();
    assert(await frame.locator(".cx-render > aside").isVisible());
    assert(!(await frame.locator(".cx-render > .cx-workspace").isVisible()));
    await nav.getByRole("button", { name: "Viewport", exact: true }).click();
    assert(await frame.getByRole("navigation", { name: "Viewport tools" }).isVisible());
  }
  if (slug === "drive") {
    const nav = frame.getByRole("navigation", { name: "Vehicle workspace" });
    assert(!(await frame.locator(".cx-ev-panels").isVisible()));
    await nav.getByRole("button", { name: "Controls", exact: true }).click();
    await frame.getByRole("button", { name: "Raise temperature", exact: true }).click();
    assert(!(await frame.locator(".cx-ev-vehicle").isVisible()));
    await nav.getByRole("button", { name: "Media", exact: true }).click();
    assert(await frame.getByText("Fortress Down", { exact: true }).isVisible());
    await frame.getByRole("group", { name: "Playback controls" }).getByRole("button", { name: /pause/i }).click();
    await nav.getByRole("button", { name: "Vehicle", exact: true }).click();
    await frame.getByRole("button", { name: "Journey", exact: true }).click();
    await frame.getByRole("button", { name: "Start route", exact: true }).click();
    assert(await frame.getByRole("button", { name: "End route", exact: true }).isVisible());
  }
  if (slug === "orbit") {
    const nav = frame.getByRole("navigation", { name: "Observation workspace" });
    assert(!(await frame.getByRole("complementary", { name: "Observation assets" }).isVisible()));
    await nav.getByRole("button", { name: "Assets", exact: true }).click();
    await frame.locator(".cx-orbit-asset").filter({ hasText: "Helios-7" }).click();
    await nav.getByRole("button", { name: "Pass details", exact: true }).click();
    assert(await frame.getByRole("region", { name: "Helios-7 pass details" }).isVisible());
    await frame.getByRole("button", { name: "Queue capture", exact: true }).click();
    assert(await frame.getByRole("button", { name: "Capture queued", exact: true }).isVisible());
    await nav.getByRole("button", { name: "Map", exact: true }).click();
    assert(!(await frame.locator(".cx-orbit-inspector").isVisible()));
  }
  if (slug === "frontier") {
    const menu = frame.locator(".cx-frontier-menu-toggle");
    assert(!(await frame.getByRole("navigation", { name: "Company sections" }).isVisible()));
    await menu.click();
    await frame.getByRole("navigation", { name: "Company sections" }).getByRole("button", { name: "Research", exact: true }).click();
    assert(!(await frame.getByRole("navigation", { name: "Company sections" }).isVisible()));
    assert(await frame.getByRole("region", { name: "Research" }).isVisible());
  }
  if (slug === "platforms") {
    assert.equal(await frame.locator(".cx-phone:visible").count(), 1);
    assert(await frame.getByRole("article", { name: "iOS travel app" }).isVisible());
    await frame.getByRole("button", { name: "Android", exact: true }).click();
    assert.equal(await frame.locator(".cx-phone:visible").count(), 1);
    const phone = frame.getByRole("article", { name: "Android travel app" });
    await phone.getByRole("button", { name: "Save trip", exact: true }).click();
    await phone.getByRole("button", { name: "You", exact: true }).click();
    assert(await phone.getByText("Rotterdam trip saved", { exact: true }).isVisible());
  }
  if (slug === "line") {
    await frame.locator('[data-chat="brief"]').click();
    assert(!(await frame.getByRole("complementary", { name: "Chats", exact: true }).isVisible()));
    await frame.getByLabel("Message", { exact: true }).fill("How does the imagery shape the song?");
    await frame.getByRole("button", { name: "Send", exact: true }).click();
    await frame.getByRole("button", { name: "Conversation info", exact: true }).click();
    assert(await frame.getByRole("complementary", { name: "Inspector", exact: true }).isVisible());
    assert(!(await frame.locator(".sc-ai-dock").isVisible()));
    await frame.locator(".sc-ai-inspector-back").click();
    assert(await frame.getByText("How does the imagery shape the song?", { exact: true }).isVisible());
    await frame.getByRole("button", { name: "Back to chats", exact: true }).click();
    assert(await frame.getByRole("complementary", { name: "Chats", exact: true }).isVisible());
  }
  if (slug === "room") {
    await frame.locator('[data-channel="desk"]').click();
    await frame.getByLabel("Message", { exact: true }).fill("The mobile proof is ready.");
    await frame.getByRole("button", { name: "Send", exact: true }).click();
    await frame.locator(".sc-room-msg").first().click();
    assert(!(await frame.getByRole("region", { name: "Channel", exact: true }).isVisible()));
    await frame.getByLabel("Reply in thread", { exact: true }).fill("Reviewed on a phone.");
    await frame.getByRole("button", { name: "Send reply", exact: true }).click();
    assert(await frame.getByText("Reviewed on a phone.", { exact: false }).isVisible());
    await frame.getByRole("button", { name: "Back to conversation", exact: true }).click();
    assert(await frame.locator(".sc-room-msg").filter({ hasText: "The mobile proof is ready." }).isVisible());
    await frame.getByRole("button", { name: "Back to channels", exact: true }).click();
    assert(await frame.locator(".sc-room-rail").isVisible());
  }
  if (slug === "wall") {
    await frame.getByRole("button", { name: "Like Mara’s post", exact: true }).first().click();
    assert.equal(await frame.getByRole("button", { name: "Like Mara’s post", exact: true }).first().getAttribute("aria-pressed"), "true");
    await frame.getByRole("button", { name: "Comments on Mara’s post", exact: true }).first().click();
    assert(!(await frame.locator(".sc-wall-feed").isVisible()));
    await frame.getByLabel("Add a comment", { exact: true }).fill("The composition reads well on a phone.");
    await frame.getByRole("button", { name: "Post comment", exact: true }).click();
    assert(await frame.getByText("The composition reads well on a phone.", { exact: false }).isVisible());
    await frame.locator(".sc-wall-mobile-back").click();
    await frame.getByRole("navigation", { name: "Journal sections" }).getByRole("button", { name: "People", exact: true }).click();
    assert(await frame.locator(".sc-wall-rail").isVisible());
    assert(!(await frame.locator(".sc-wall-feed").isVisible()));
  }
  if (slug === "press") {
    const mobile = frame.getByRole("region", { name: "Mobile production workspace" });
    await mobile.getByRole("button", { name: "This month", exact: true }).click();
    await mobile.getByRole("navigation", { name: "Production sections" }).getByRole("button", { name: "Jobs", exact: true }).click();
    await mobile.locator(".sc-dash-mobile-job").first().click();
    assert(await mobile.getByRole("heading", { name: "Production brief", exact: true }).isVisible());
    await mobile.getByRole("button", { name: "Mark reviewed", exact: true }).click();
    assert(await mobile.getByRole("button", { name: "Undo review", exact: true }).isVisible());
    await mobile.getByRole("button", { name: "Back", exact: true }).click();
    await mobile.getByRole("navigation", { name: "Production sections" }).getByRole("button", { name: "Invoices", exact: true }).click();
    assert(await mobile.getByRole("heading", { name: "Open invoices", exact: true }).isVisible());
  }
  if (slug === "night") {
    await frame.getByRole("navigation", { name: "Dispatch sections" }).getByRole("button", { name: "Vehicles", exact: true }).click();
    await frame.locator(".sc-night-unit").filter({ hasText: "Van 19" }).click();
    assert(!(await frame.locator(".sc-night-rail").isVisible()));
    await frame.getByRole("button", { name: "View trip", exact: true }).click();
    assert(!(await frame.locator(".sc-night-field").isVisible()));
    assert(await frame.getByRole("complementary", { name: "Trip", exact: true }).isVisible());
    await frame.getByRole("button", { name: "Show on map", exact: true }).click();
    assert(await frame.locator(".sc-night-mobile-vehicle").getByRole("heading", { name: "Van 19", exact: true }).isVisible());
  }
  if (slug === "evening") {
    const mobile = frame.getByRole("region", { name: "Mobile food ordering" });
    await mobile.getByRole("button", { name: "Open food filters", exact: true }).click();
    await mobile.getByRole("button", { name: "Vegetarian", exact: true }).click();
    await mobile.getByRole("button", { name: "Reset preferences", exact: true }).click();
    await fit(page, "food filters");
    await mobile.getByRole("button", { name: /Show \d+ kitchens/ }).click();
    await mobile.locator(".sc-food-mobile-store button").first().click();
    await mobile.locator(".sc-food-mobile-dish-row").first().click();
    await mobile.getByRole("button", { name: /Add to bag/ }).click();
    await mobile.getByRole("button", { name: /View bag/ }).click();
    assert(await mobile.getByText("Demo only", { exact: true }).isVisible());
    await mobile.getByRole("button", { name: /Place demo order/ }).click();
    assert(await mobile.getByRole("heading", { name: "Your demo order is ready", exact: true }).isVisible());
    await mobile.getByRole("button", { name: "Keep browsing", exact: true }).click();
    assert(await mobile.getByRole("heading", { name: "Kitchens near you", exact: true }).isVisible());
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
