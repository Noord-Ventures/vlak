/** Shared side-rail geometry across cold loads, client navigation and breakpoints. */
export async function checkSiteRails({ browser, base, fail }) {
  const paths = ["/components/", "/components/reference-range/", "/docs/", "/docs/science/", "/interfaces/"];
  const widths = [900, 1024, 1280, 1440, 1920];
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  page.setDefaultTimeout(10000);
  const railSelector = ".toc-rail, .if-rail";
  const near = (actual, expected) => Math.abs(actual - expected) <= 1;
  const check = async (label, run) => {
    try { await run(); } catch (error) { fail(`site rails ${label}: ${error instanceof Error ? error.message : String(error)}`); }
  };
  const settle = async () => {
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
  };
  const resetScroll = async () => {
    await page.evaluate(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      for (const element of document.querySelectorAll(".toc-rail, .toc, .if-rail")) element.scrollTop = 0;
    });
    await settle();
  };
  const readRail = () => page.evaluate(() => {
    const rail = document.querySelector(".toc-rail, .if-rail");
    if (!rail) throw new Error("No side rail found");
    const firstColumn = rail.matches(".if-rail") ? rail : rail.querySelector(".toc");
    const firstContent = firstColumn?.querySelector(".toc-label, a[href]");
    const firstLink = firstColumn?.querySelector("a[href]");
    if (!firstColumn || !firstContent || !firstLink) throw new Error("No first navigation column, content, or link found");
    const bounds = element => {
      const rect = element.getBoundingClientRect();
      return { x: rect.x, top: rect.top, width: rect.width, height: rect.height };
    };
    const style = getComputedStyle(rail);
    const column = bounds(firstColumn);
    const columnStart = column.top + Number.parseFloat(getComputedStyle(firstColumn).paddingTop);
    return { rail: bounds(rail), column, columnStart, content: bounds(firstContent), link: bounds(firstLink), position: style.position, visible: style.display !== "none" && style.visibility !== "hidden" && rail.getClientRects().length > 0, scrollY: window.scrollY };
  });
  const desktopGeometry = async (width, label) => {
    if (await page.locator(railSelector).count() !== 1) fail(`site rails ${label}: expected one side rail`);
    await resetScroll();
    const atTop = await readRail();
    // The first navigation column starts at the 20px gutter on compact
    // desktop, and exactly one 204px module farther in from 1440px.
    const expectedX = width >= 1440 ? 224 : 20;
    if (!atTop.visible) fail(`site rails ${label}: desktop rail is hidden at ${width}px`);
    if (![atTop.rail.x, atTop.column.x, atTop.content.x, atTop.link.x].every(x => near(x, expectedX))) fail(`site rails ${label}: expected rail, first column, first content and first link at x=${expectedX}; got ${JSON.stringify(atTop)}`);
    if (!near(atTop.rail.top, 0) || !near(atTop.columnStart, 120) || !near(atTop.content.top, 120) || atTop.link.top < atTop.content.top - 1) fail(`site rails ${label}: first column and content must start at y=120 inside a rail at y=0; got ${JSON.stringify(atTop)}`);
    if (atTop.position !== "sticky") fail(`site rails ${label}: rail position is ${atTop.position}, expected sticky`);
    if (await page.locator(".toc-mobile-trigger").isVisible()) fail(`site rails ${label}: mobile contents trigger is visible at ${width}px`);

    const target = await page.evaluate(() => Math.min(400, Math.floor((document.documentElement.scrollHeight - innerHeight) / 2)));
    if (target < 100) {
      fail(`site rails ${label}: page is too short to verify sticky behavior (${target}px test scroll)`);
    } else {
      await page.evaluate(top => window.scrollTo({ top, left: 0, behavior: "instant" }), target);
      await settle();
      const scrolled = await readRail();
      if (!near(scrolled.scrollY, target)) fail(`site rails ${label}: requested ${target}px scroll, reached ${scrolled.scrollY}px`);
      if (!near(scrolled.rail.x, atTop.rail.x) || !near(scrolled.column.x, atTop.column.x) || !near(scrolled.content.x, atTop.content.x) || !near(scrolled.link.x, atTop.link.x) || !near(scrolled.rail.top, 0) || !near(scrolled.columnStart, 120) || !near(scrolled.content.top, 120) || !near(scrolled.link.top, atTop.link.top)) fail(`site rails ${label}: scrolling moved the sticky navigation; got ${JSON.stringify(scrolled)}`);
    }
    await resetScroll();
  };
  const navigate = async (locator, path, width, token) => {
    await Promise.all([
      page.waitForURL(url => url.pathname.replace(/\/+$/, "") === path.replace(/\/+$/, "")),
      locator.click(),
    ]);
    await page.waitForLoadState("networkidle");
    await page.locator(railSelector).waitFor({ state: "attached" });
    if (await page.evaluate(() => window.__siteRailNavigationToken) !== token) fail(`site rails client ${path} ${width}px: navigation reloaded the document, so the retained stylesheet cascade was not tested`);
    await desktopGeometry(width, `client ${path} ${width}px`);
  };
  const cornerLink = path => page.locator(`.corner-nav a[href="${path}"], .corner-nav a[href="${path}/"]`);

  try {
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of paths) await check(`cold ${path} ${width}px`, async () => {
        await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
        await desktopGeometry(width, `cold ${path} ${width}px`);
      });

      // Begin on interfaces so its separate stylesheet is already resident,
      // then keep this document alive across catalogue and docs navigation.
      await check(`client navigation ${width}px`, async () => {
        await page.goto(`${base}/interfaces/`, { waitUntil: "networkidle" });
        const token = `site-rails-${width}`;
        await page.evaluate(value => { window.__siteRailNavigationToken = value; }, token);
        await navigate(cornerLink("/components"), "/components/", width, token);
        await page.locator('[data-toc="groups"]').getByRole("link", { name: "Health", exact: true }).focus();
        const reference = page.locator('[data-toc="items"]').getByRole("link", { name: "Reference range", exact: true });
        await reference.waitFor({ state: "visible" });
        await navigate(reference, "/components/reference-range/", width, token);
        await navigate(cornerLink("/docs"), "/docs/", width, token);
        await navigate(page.locator(".toc-rail").getByRole("link", { name: "Science", exact: true }), "/docs/science/", width, token);
        await navigate(cornerLink("/interfaces"), "/interfaces/", width, token);
      });
    }

    // Include the pixel immediately below the desktop cutoff, as well as
    // a phone viewport. Resize the existing document before each set.
    for (const width of [899, 390]) {
      await page.setViewportSize({ width, height: 844 });
      for (const path of paths) await check(`mobile ${path} ${width}px`, async () => {
        await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
        await settle();
        if (await page.locator(railSelector).count() !== 1) fail(`site rails mobile ${path} ${width}px: expected one hidden side rail`);
        if (await page.locator(railSelector).isVisible()) fail(`site rails mobile ${path} ${width}px: desktop rail remains visible`);
        const trigger = page.locator(".toc-mobile-trigger");
        if (!(await trigger.isVisible())) fail(`site rails mobile ${path} ${width}px: replacement contents trigger is hidden`);
        else {
          const box = await trigger.boundingBox();
          if (!box || box.width < 44 || box.height < 44) fail(`site rails mobile ${path} ${width}px: contents trigger is below 44px`);
        }
      });
    }
  } finally {
    await page.close();
  }
}
