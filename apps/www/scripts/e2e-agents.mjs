// SITE_URL=http://localhost:3000 node scripts/e2e-agents.mjs
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { chromium } from "playwright";

const require = createRequire(import.meta.url);
const base = process.env.SITE_URL || "http://localhost:3000";
const browser = await chromium.launch({
  ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}),
});
const failures = [];

async function checkLayout(page, label) {
  const layout = await page.locator(".am").evaluate(board => {
    const box = board.getBoundingClientRect();
    return {
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      boardOverflow: board.scrollWidth - board.clientWidth,
      heightOverflow: board.scrollHeight - board.clientHeight,
      shortButtons: Array.from(board.querySelectorAll("button")).filter(button => {
        const b = button.getBoundingClientRect();
        return b.width > 0 && b.height > 0 && (b.width < 43.5 || b.height < 43.5);
      }).map(button => button.textContent),
      clippedLabels: Array.from(board.querySelectorAll("button")).filter(button => {
        const b = button.getBoundingClientRect();
        if (!b.width || !b.height || b.bottom < box.top || b.top > box.bottom) return false;
        return button.scrollWidth > button.clientWidth + 1;
      }).map(button => button.textContent),
      footerInside: board.querySelector(".am-footer").getBoundingClientRect().bottom <= box.bottom + 1,
    };
  });
  assert(layout.overflow <= 1, `${label}: page overflow ${layout.overflow}`);
  assert(layout.boardOverflow <= 1, `${label}: board overflow ${layout.boardOverflow}`);
  assert(layout.heightOverflow <= 1, `${label}: board height overflow ${layout.heightOverflow}`);
  assert.deepEqual(layout.shortButtons, [], `${label}: targets smaller than 44px`);
  assert.deepEqual(layout.clippedLabels, [], `${label}: clipped button labels`);
  assert(layout.footerInside, `${label}: footer must remain inside the specimen`);
}

try {
  for (const colorScheme of ["light", "dark"]) {
    for (const width of [320, 390, 768, 1024, 1440, 2082]) {
      const page = await browser.newPage({ viewport: { width, height: 960 }, colorScheme, reducedMotion: "reduce" });
      page.on("pageerror", error => failures.push(error.message));
      const response = await page.goto(`${base}/interfaces/agents/`, { waitUntil: "networkidle" });
      assert(response.ok());
      const board = page.locator(".am");
      await checkLayout(page, `${colorScheme} ${width}px queue`);
      await board.locator(".am-task").filter({ hasText: "Audit keyboard navigation" }).click();
      assert(await board.getByRole("heading", { name: "Audit keyboard navigation" }).isVisible());
      await checkLayout(page, `${colorScheme} ${width}px detail`);
      await board.getByRole("button", { name: /^Output/ }).click();
      assert(await board.getByText("navigation/menu.tsx", { exact: true }).isVisible());
      await board.getByRole("button", { name: "Approve review", exact: true }).click();
      assert(await board.getByText("Work accepted", { exact: true }).isVisible());
      await page.waitForFunction(() => document.activeElement === document.querySelector(".am-detail-head h2"));
      if (await board.getByRole("button", { name: "Tasks", exact: true }).isVisible()) {
        await board.getByRole("button", { name: "Tasks", exact: true }).click();
      }
      await board.getByRole("group", { name: "Filter tasks" }).getByRole("button", { name: "Review", exact: true }).click();
      assert(await board.getByRole("heading", { name: "Nothing waiting for review" }).isVisible());
      await board.getByRole("button", { name: "View all tasks", exact: true }).click();
      await board.locator(".am-task").filter({ hasText: "Refine account settings" }).click();
      await board.getByRole("button", { name: "Pause", exact: true }).click();
      assert.equal(await page.evaluate(() => document.activeElement?.textContent?.trim()), "Resume");
      await page.keyboard.press("Enter");
      assert.equal(await page.evaluate(() => document.activeElement?.textContent?.trim()), "Pause");
      await board.getByRole("button", { name: "New task", exact: true }).click();
      await board.getByLabel("Task name", { exact: true }).fill("Test the search flow");
      await board.getByLabel("Brief", { exact: true }).fill("Check that search works by keyboard at narrow widths.");
      await checkLayout(page, `${colorScheme} ${width}px form`);
      await board.getByRole("button", { name: "Queue task", exact: true }).click();
      assert(await board.getByRole("heading", { name: "Test the search flow" }).isVisible());
      await board.getByRole("button", { name: "Start task", exact: true }).click();
      assert.equal(await board.getByRole("progressbar").getAttribute("aria-valuenow"), "8");
      await board.getByRole("button", { name: /^Output/ }).click();
      assert(await board.getByText("No output yet.", { exact: false }).isVisible());
      await checkLayout(page, `${colorScheme} ${width}px new task`);
      await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
      const accessibility = await page.evaluate(async () => window.axe.run(document.querySelector(".am"), {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
      }));
      assert.deepEqual(accessibility.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), [], `${colorScheme} ${width}px accessibility`);
      await page.close();
      console.log(`${colorScheme} ${width}px: queue, detail, approvals, focus, run controls, new task, and accessibility passed`);
    }
  }
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  await page.goto(`${base}/interfaces/`, { waitUntil: "networkidle" });
  assert.match(await page.locator(".if-tile").first().getAttribute("href"), /\/agents\/?$/);
  await page.locator(".if-tile").first().click();
  await page.waitForURL(/\/interfaces\/agents\/?$/);
  assert(await page.locator(".if-rail a[aria-current='page']").filter({ hasText: "Agent management" }).isVisible());
  for (const link of await page.locator(".if-component-list a").all()) {
    assert((await page.request.get(base + await link.getAttribute("href"))).ok());
  }
  assert.deepEqual(failures, [], "No browser runtime errors");
  console.log("Agent management checks passed");
} finally {
  await browser.close();
}
