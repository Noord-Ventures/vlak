// BASE_URL=http://127.0.0.1:3016 node apps/www/scripts/about-timeline-e2e.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const eraTitles = [
  "Modernist grid",
  "Direct manipulation",
  "Desktop tools",
  "Personal systems",
  "Touch & adaptation",
  "Delegated work",
];
const requiredMilestoneTitles = [
  "MS-DOS & IBM PC",
  "Macintosh / System 1",
  "Windows 1.0",
  "Adobe Illustrator",
  "Adobe Photoshop",
  "Sketch",
  "Figma",
  "Inter",
];
const milestonesPerEra = 9;
const totalMilestones = eraTitles.length * milestonesPerEra;
const layouts = new Map([[320, 1], [390, 1], [768, 3], [1280, 6]]);

async function assertTimeline(page, base, width, theme, auditFailures) {
  const errors = [];
  page.on("pageerror", error => errors.push(`pageerror: ${error.message}`));
  page.on("console", message => { if (message.type() === "error") errors.push(`console: ${message.text()}`); });
  const response = await page.goto(`${base}/about/`, { waitUntil: "networkidle" });
  assert(response?.ok(), `${width}px ${theme}: About must load`);
  assert.equal(await page.locator("html").getAttribute("data-theme"), theme, `${width}px ${theme}: requested theme must be active`);

  const timeline = page.locator("#interface-lineage");
  await timeline.waitFor();
  assert.equal(await timeline.getByRole("heading", { name: "From the page to the agent", exact: true }).count(), 1, `${width}px ${theme}: timeline needs one heading`);
  assert.deepEqual(await timeline.locator(".lineage-era-heading h3").allInnerTexts(), eraTitles, `${width}px ${theme}: six chapters must retain their editorial order`);
  const milestoneCount = await timeline.locator(".lineage-event").count();
  assert.equal(milestoneCount, totalMilestones, `${width}px ${theme}: expected the balanced milestone set`);
  assert.deepEqual(await timeline.locator(".lineage-era").evaluateAll(eras => eras.map(era => era.querySelectorAll(".lineage-event").length)), eraTitles.map(() => milestonesPerEra), `${width}px ${theme}: each chapter needs nine milestones`);
  assert.equal(await timeline.locator(".lineage-register").getByText(`${milestoneCount} milestones · 6 chapters`, { exact: true }).count(), 1, `${width}px ${theme}: register must match the rendered chronology`);
  assert.equal(await timeline.locator(".lineage-illustration svg").count(), 6, `${width}px ${theme}: expected one vignette per chapter`);
  const milestoneTitles = (await timeline.locator(".lineage-event-name").allInnerTexts()).map(title => title.replace(/\s+/g, " "));
  for (const title of requiredMilestoneTitles) assert(milestoneTitles.includes(title), `${width}px ${theme}: missing ${title}`);
  const timelineText = await timeline.textContent() ?? "";
  assert.match(timelineText, /System Software 1\.0/, `${width}px ${theme}: Macintosh system lineage must be explicit`);
  assert.match(timelineText, /MS-DOS/, `${width}px ${theme}: MS-DOS lineage must be explicit`);
  const columns = await timeline.locator(".lineage-eras").evaluate(element => getComputedStyle(element).gridTemplateColumns.split(" ").filter(Boolean).length);
  assert.equal(columns, layouts.get(width), `${width}px ${theme}: timeline must use its intended responsive column count`);
  const eraGeometry = await timeline.locator(".lineage-era").evaluateAll(eras => eras.map(era => {
    const events = era.querySelector(".lineage-events")?.getBoundingClientRect();
    const caption = era.querySelector(".lineage-era-heading p")?.getBoundingClientRect();
    const year = era.querySelector(".lineage-year");
    return {
      eventsTop: events?.top ?? 0,
      captionGap: events && caption ? events.top - caption.bottom : Number.POSITIVE_INFINITY,
      yearMarker: year ? getComputedStyle(year, "::before").content : "missing",
    };
  }));
  assert(eraGeometry.every(era => era.yearMarker === "none"), `${width}px ${theme}: milestone years must not render decorative circles`);
  if (width >= 768) {
    const erasPerRow = width >= 1224 ? 6 : 3;
    for (let index = 0; index < eraGeometry.length; index += erasPerRow) {
      const rowTops = eraGeometry.slice(index, index + erasPerRow).map(era => era.eventsTop);
      assert(Math.max(...rowTops) - Math.min(...rowTops) <= 1, `${width}px ${theme}: chapter event dividers must align within each row ${JSON.stringify(rowTops)}`);
    }
    assert(eraGeometry.every(era => era.captionGap >= 11 && era.captionGap <= 36), `${width}px ${theme}: caption-to-divider space must remain compact ${JSON.stringify(eraGeometry)}`);
  }

  const summaries = timeline.locator("summary");
  const summaryTargets = await summaries.evaluateAll(items => items.map(item => ({ width: item.getBoundingClientRect().width, height: item.getBoundingClientRect().height })));
  assert(summaryTargets.every(target => target.width >= 44 && target.height >= 44), `${width}px ${theme}: every milestone summary needs a 44px target`);
  const citations = timeline.locator(".lineage-detail a");
  assert.equal(await citations.count(), milestoneCount, `${width}px ${theme}: each milestone needs a source`);
  const citationData = await citations.evaluateAll(links => links.map(link => ({ href: link.href, label: link.textContent?.trim() ?? "" })));
  const siteHostname = new URL(base).hostname;
  assert(citationData.every(source => source.label.length > 0 && new URL(source.href).protocol === "https:" && new URL(source.href).hostname !== siteHostname), `${width}px ${theme}: sources must be named external HTTPS citations`);

  await summaries.first().focus();
  await summaries.first().press("Enter");
  assert(await timeline.locator(".lineage-event").first().evaluate(element => element.open), `${width}px ${theme}: keyboard must open a milestone`);
  const visibleCitation = timeline.locator(".lineage-event").first().locator("a");
  const citationRect = await visibleCitation.evaluate(element => element.getBoundingClientRect());
  assert(citationRect.width >= 44 && citationRect.height >= 44, `${width}px ${theme}: the revealed citation needs a 44px target`);
  await summaries.nth(1).focus();
  await summaries.nth(1).press("Enter");
  assert.equal(await timeline.locator(".lineage-event[open]").count(), 1, `${width}px ${theme}: the named disclosure group must keep only one milestone open`);
  assert(await timeline.locator(".lineage-event").nth(1).evaluate(element => element.open), `${width}px ${theme}: keyboard must move the open milestone`);

  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => (await window.axe.run(document, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] },
  })).violations.map(item => `${item.id}: ${item.nodes.slice(0, 4).map(node => node.target.join(" ")).join(", ")}`));
  if (violations.length > 0) auditFailures.push(`${width}px ${theme}: ${violations.join("; ")}`);
  const overflow = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    body: document.body.scrollWidth - document.body.clientWidth,
  }));
  assert(overflow.document <= 1 && overflow.body <= 1, `${width}px ${theme}: horizontal overflow ${JSON.stringify(overflow)}`);
  assert.deepEqual(errors, [], `${width}px ${theme}: JavaScript runtime errors`);
}

async function assertServerRendered(browser, base) {
  const response = await fetch(`${base}/about/`);
  assert(response.ok, "About HTML must load without a browser runtime");
  const html = await response.text();
  assert.equal((html.match(/class="lineage-era"/g) ?? []).length, 6, "HTML must contain all six chapters");
  const milestoneCount = (html.match(/class="lineage-event" name="interface-history"/g) ?? []).length;
  assert.equal(milestoneCount, totalMilestones, "HTML must contain the balanced native disclosure set");
  assert.equal((html.match(/class="lineage-detail"/g) ?? []).length, milestoneCount, "HTML must contain one source detail per milestone");
  assert(new RegExp(`${milestoneCount}(?:<!-- -->)? milestones · 6 chapters`).test(html), "HTML register must match the server-rendered chronology");
  const normalizedHtml = html.replaceAll("\u00a0", " ");
  for (const title of requiredMilestoneTitles) assert(normalizedHtml.includes(title.replaceAll("&", "&amp;")), `HTML must contain ${title}`);
  assert.match(html, /System Software 1\.0/, "HTML must retain the Macintosh system lineage");
  assert.match(html, /MS-DOS/, "HTML must retain the MS-DOS lineage");

  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false, colorScheme: "light" });
  try {
    const page = await context.newPage();
    await page.goto(`${base}/about/`, { waitUntil: "load" });
    const timeline = page.locator("#interface-lineage");
    assert.equal(await timeline.locator(".lineage-event").count(), milestoneCount, "no-JavaScript page must retain all milestones");
    assert.deepEqual(await timeline.locator(".lineage-era").evaluateAll(eras => eras.map(era => era.querySelectorAll(".lineage-event").length)), eraTitles.map(() => milestonesPerEra), "no-JavaScript page must retain nine milestones per chapter");
    assert.equal(await timeline.locator(".lineage-detail a").count(), milestoneCount, "no-JavaScript page must retain all source links");
    const first = timeline.locator("summary").first();
    await first.focus();
    await first.press("Enter");
    assert(await timeline.locator(".lineage-event").first().evaluate(element => element.open), "native disclosure must work without JavaScript");
  } finally {
    await context.close();
  }
}

export async function checkAboutTimeline({ browser, base }) {
  const auditFailures = [];
  await assertServerRendered(browser, base);
  for (const theme of ["light", "dark"]) {
    for (const width of layouts.keys()) {
      const context = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 900 }, reducedMotion: "reduce", colorScheme: theme });
      try {
        const page = await context.newPage();
        await assertTimeline(page, base, width, theme, auditFailures);
      } finally {
        await context.close();
      }
      console.log(`${width}px ${theme}: timeline structure, interaction, sources, axe, runtime, and overflow audited`);
    }
  }
  assert.deepEqual(auditFailures, [], "About timeline accessibility failures");
  console.log("About timeline: SSR/no-JavaScript and all 8 responsive theme combinations passed");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const base = (process.env.BASE_URL || process.env.SITE_URL || "http://127.0.0.1:3016").replace(/\/$/, "");
  const browser = await chromium.launch({
    ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}),
    args: ["--enable-unsafe-swiftshader"],
  });
  try {
    await checkAboutTimeline({ browser, base });
  } finally {
    await browser.close();
  }
}
