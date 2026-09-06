// End-to-end checks over the exported site (apps/www/out): every catalogue
// page passes axe, the skip link works, the phone menu closes on Escape
// and hands focus back, nothing scrolls sideways at 390px, and controls
// in the previews meet the 44px phone hit size. Chromium via Playwright.
//
//   pnpm --filter www build && node scripts/e2e.mjs
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { chromium } from "playwright";

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const out = fileURLToPath(new URL("../out", import.meta.url));
const { catalogComponents } = await import("@noorddev/vlak");

const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".woff2": "font/woff2", ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml", ".txt": "text/plain", ".md": "text/markdown" };
const server = createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let file = join(out, p);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file)) file = join(out, `${p.replace(/\/$/, "")}.html`);
  if (!existsSync(file)) file = join(out, "404.html");
  res.setHeader("content-type", types[extname(file)] ?? "application/octet-stream");
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;

const failures = [];
const fail = (msg) => failures.push(msg);

/* Every landing page owns a real, page-specific 1200 × 630 social image. */
const socialImages = [];
for (const section of ["components", "interfaces", "docs", "about"]) {
  const image = readFileSync(join(out, section, "opengraph-image"));
  const html = readFileSync(join(out, section, "index.html"), "utf8");
  if (image.toString("ascii", 1, 4) !== "PNG") fail(`${section}: Open Graph image is not a PNG`);
  if (image.readUInt32BE(16) !== 1200 || image.readUInt32BE(20) !== 630) fail(`${section}: Open Graph image is not 1200 × 630`);
  if (!html.includes(`/${section}/opengraph-image`)) fail(`${section}: page does not reference its custom Open Graph image`);
  if (!html.includes(`/${section}/twitter-image`)) fail(`${section}: page does not reference its custom Twitter image`);
  socialImages.push(image.toString("base64"));
}
if (new Set(socialImages).size !== socialImages.length) fail("landing pages reuse the same social image");

const browser = await chromium.launch(
  process.env.PLAYWRIGHT_EXECUTABLE_PATH
    ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
    : undefined,
);

/* axe on every page, desktop. */
const docs = ["", "frameworks/", "theming/", "tokens/", "layers/", "stylex/", "accessibility/", "agents/"].map((d) => `/docs/${d}`);
const pages = ["/", ...docs, "/components/", "/about/", "/interfaces/", "/interfaces/evening/", ...catalogComponents.map((c) => `/components/${c.name}/`)];
const desk = await browser.newPage({ viewport: { width: 1280, height: 900 } });
for (const path of pages) {
  const errors = [];
  desk.once("pageerror", (e) => errors.push(e.message));
  await desk.goto(base + path, { waitUntil: "networkidle" });
  await desk.addScriptTag({ content: axeSource });
  const result = await desk.evaluate(() =>
    axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] }, rules: { region: { enabled: false } } }),
  );
  for (const v of result.violations) {
    fail(`${path}: axe ${v.id} (${v.impact}): ${v.help}\n      ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join("\n      ")}`);
  }
  for (const e of errors) fail(`${path}: page error ${e}`);
  if ((await desk.locator("main").count()) !== 1) fail(`${path}: expected exactly one <main>`);
  if ((await desk.locator('.preview-box .rs-use, .preview-box [data-use], .gallery .rs-use, .gallery [data-use]').count()) !== 0) {
    fail(`${path}: Preview contains an In action composition`);
  }
}

/* Skip link. */
await desk.goto(`${base}/components/dialog/`, { waitUntil: "networkidle" });
await desk.keyboard.press("Tab");
if ((await desk.evaluate(() => document.activeElement?.className)) !== "skip-link") fail("skip link is not the first tab stop");
await desk.keyboard.press("Enter");
if (!(await desk.evaluate(() => location.hash === "#main"))) fail("skip link does not target #main");
await desk.goto(`${base}/components/select/`, { waitUntil: "networkidle" });
const selectBorders = await desk.evaluate(() => {
  const read = (selector) => {
    const style = getComputedStyle(document.querySelector(selector));
    return { width: style.borderTopWidth, style: style.borderTopStyle, color: style.borderTopColor };
  };
  return { preview: read(".preview-box"), trigger: read('.preview-box [role="combobox"]') };
});
for (const [part, border] of Object.entries({ preview: selectBorders.preview, trigger: selectBorders.trigger })) {
  const alpha = Number.parseFloat(border.color.match(/rgba?\([^)]*[, /]([\d.]+)\)$/)?.[1] ?? "1");
  if (border.width !== "1px" || border.style !== "solid" || border.color === "transparent" || alpha < .35) {
    fail(`select ${part}: expected a 1px solid control-border box, got ${border.width} ${border.style} ${border.color}`);
  }
}
/* Closed command dialogs must never paint their empty border in the page. */
await desk.goto(`${base}/components/command/`, { waitUntil: "networkidle" });
const checkClosedCommands = async (when) => {
  const dialogs = await desk.locator("dialog.rs-command-dialog").evaluateAll(elements => elements.map(element => {
    const rect = element.getBoundingClientRect();
    return { open: element.open, display: getComputedStyle(element).display, width: rect.width, height: rect.height };
  }));
  if (dialogs.length !== 2 || dialogs.some(dialog => dialog.open || dialog.display !== "none" || dialog.width !== 0 || dialog.height !== 0)) {
    fail(`command ${when}: closed dialogs paint in the page: ${JSON.stringify(dialogs)}`);
  }
};
await checkClosedCommands("initially");
const commandTrigger = desk.locator(".preview-box").getByRole("button", { name: /Open command/ });
await commandTrigger.click();
const commandDialog = desk.locator("dialog.rs-command-dialog[open]");
await commandDialog.waitFor({ state: "visible" });
if (!(await commandDialog.getByRole("combobox").evaluate(element => element === document.activeElement))) {
  fail("command: opening does not focus the search input");
}
await desk.keyboard.press("Escape");
await commandDialog.waitFor({ state: "hidden" });
await checkClosedCommands("after Escape");
if (!(await commandTrigger.evaluate(element => element === document.activeElement))) fail("command: closing does not restore trigger focus");
/* Checkable menu rows reserve the same inline slot in both states. */
await desk.goto(`${base}/components/dropdown-menu/`, { waitUntil: "networkidle" });
const exportMenu = desk.getByRole("button", { name: "Export", exact: true });
await exportMenu.click();
const notes = desk.getByRole("menuitemcheckbox", { name: "Include notes", exact: true });
const checkRow = () => notes.evaluate(row => {
  const icon = row.querySelector(".rs-menu-item-indicator").getBoundingClientRect();
  const label = row.querySelector(".rs-menu-item-label").getBoundingClientRect();
  return { offset: Math.abs(icon.top + icon.height / 2 - label.top - label.height / 2), labelLeft: label.left };
});
const checkedRow = await checkRow();
await notes.click();
await exportMenu.click();
const uncheckedRow = await checkRow();
if (checkedRow.offset > 1 || uncheckedRow.offset > 1 || checkedRow.labelLeft !== uncheckedRow.labelLeft) {
  fail(`menu checkmark must align inline without moving its label: ${JSON.stringify({ checkedRow, uncheckedRow })}`);
}
await notes.press("Escape");
await desk.goto(`${base}/components/file-browser/`, { waitUntil: "networkidle" });
const folderLabels = await desk.locator(".preview-box .rs-tree-view-label").evaluateAll(labels => labels.map(label => {
  const style = getComputedStyle(label);
  return { text: label.textContent, height: label.getBoundingClientRect().height, lineHeight: Number.parseFloat(style.lineHeight), whiteSpace: style.whiteSpace, overflow: style.textOverflow };
}));
if (folderLabels.length < 2 || folderLabels.some(label => label.whiteSpace !== "nowrap" || label.overflow !== "ellipsis" || label.height > label.lineHeight + 1)) {
  fail(`file browser: folder labels must stay on a single line: ${JSON.stringify(folderLabels)}`);
}
const boxedCrumbs = await desk.locator(".preview-box .rs-file-browser-crumb").evaluateAll(crumbs => crumbs.filter(crumb => getComputedStyle(crumb).borderTopWidth !== "0px" || crumb.getBoundingClientRect().height < 44).length);
if (boxedCrumbs) fail("file browser: breadcrumbs need unboxed text actions with 44px targets");
await desk.goto(`${base}/components/kanban-board/`, { waitUntil: "networkidle" });
const kanbanCards = await desk.locator(".preview-box .rs-kanban-card").evaluateAll(cards => cards.map(card => {
  const title = card.querySelector(".rs-kanban-title").getBoundingClientRect();
  const destination = card.querySelector("select").getBoundingClientRect();
  return { leftOffset: Math.abs(title.left - destination.left), overflow: card.scrollWidth - card.clientWidth, radius: getComputedStyle(card).borderRadius };
}));
if (kanbanCards.length !== 2 || kanbanCards.some(card => card.leftOffset > 1 || card.overflow > 0 || card.radius !== "4px")) {
  fail(`kanban: card titles and controls need one aligned grid: ${JSON.stringify(kanbanCards)}`);
}
await desk.close();

/* Phone. */
const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
for (const path of ["/", "/docs/", "/components/", "/about/", "/interfaces/evening/", ...catalogComponents.map(c => `/components/${c.name}/`)]) {
  await phone.goto(base + path, { waitUntil: "networkidle" });
  const overflow = await phone.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 0) fail(`${path}: horizontal overflow of ${overflow}px at 390px`);
}
await phone.goto(`${base}/components/switch/`, { waitUntil: "networkidle" });
const breadcrumbSpacing = await phone.evaluate(() => {
  const trail = document.querySelector(".site-crumb-bar .rs-crumbs");
  const link = trail.querySelector(".rs-crumbs-link").getBoundingClientRect();
  const slash = trail.querySelector(".rs-crumbs-sep").getBoundingClientRect();
  const title = trail.querySelector(".rs-crumbs-here").getBoundingClientRect();
  return { before: slash.left - link.right, after: title.left - slash.right, linkHeight: link.height };
});
if (breadcrumbSpacing.before < 4 || breadcrumbSpacing.after < 4 || breadcrumbSpacing.linkHeight < 44) {
  fail(`phone: breadcrumb needs space around / and a 44px link target: ${JSON.stringify(breadcrumbSpacing)}`);
}
const switchSize = await phone.evaluate(() => {
  const control = document.querySelector('.preview-box [role="switch"]');
  const hit = control.getBoundingClientRect();
  const rail = getComputedStyle(control, "::before");
  return { width: hit.width, height: hit.height, railWidth: rail.width, railHeight: rail.height };
});
if (switchSize.width < 44 || switchSize.height < 44 || switchSize.railWidth !== "44px" || switchSize.railHeight !== "24px") {
  fail(`phone: switch must have a 44px hit area and slim 44×24px rail: ${JSON.stringify(switchSize)}`);
}
await phone.setViewportSize({ width: 320, height: 844 });
await phone.goto(`${base}/components/notification-center/`, { waitUntil: "networkidle" });
const longBreadcrumb = await phone.evaluate(() => {
  const title = document.querySelector(".site-crumb-bar .rs-crumbs-here");
  const trail = title.parentElement.getBoundingClientRect();
  const box = title.getBoundingClientRect();
  return {
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    fits: box.right <= trail.right + 1 && box.width > 0,
    ellipsis: getComputedStyle(title).textOverflow,
  };
});
if (longBreadcrumb.overflow > 0 || !longBreadcrumb.fits || longBreadcrumb.ellipsis !== "ellipsis") {
  fail(`phone: long breadcrumb must fit the grid and truncate at 320px: ${JSON.stringify(longBreadcrumb)}`);
}
await phone.setViewportSize({ width: 390, height: 844 });
await phone.goto(`${base}/components/toggle/`, { waitUntil: "networkidle" });
const standaloneToggle = phone.locator(".preview-box .rs-toggle");
if (await standaloneToggle.count() !== 1 || await phone.locator(".preview-box .rs-toggle-group").count() !== 0) {
  fail("phone: Toggle preview must render one standalone Toggle, not ToggleGroup");
} else {
  const before = await standaloneToggle.getAttribute("aria-pressed");
  await standaloneToggle.click();
  if (await standaloneToggle.getAttribute("aria-pressed") === before) fail("phone: standalone Toggle preview does not change pressed state");
}
await phone.goto(`${base}/components/toggle-group/`, { waitUntil: "networkidle" });
if (await phone.locator(".preview-box .rs-toggle-group .rs-toggle").count() !== 3) fail("phone: Toggle group preview must retain its three grouped options");
const narrowToggles = await phone.locator('.preview-box .rs-toggle').evaluateAll(controls => controls.filter(control => Number.parseFloat(getComputedStyle(control).paddingInlineStart) < 20).length);
if (narrowToggles) fail("phone: toggle segments must keep 20px horizontal padding");
await phone.goto(`${base}/components/tag-input/`, { waitUntil: "networkidle" });
const tagRemoveSpacing = await phone.locator(".preview-box .rs-tag-input-remove").evaluateAll(buttons => buttons.map(button => {
  const hit = button.getBoundingClientRect();
  const tag = button.closest(".rs-tag-input-tag").getBoundingClientRect();
  return { width: hit.width, height: hit.height, top: hit.top - tag.top, bottom: tag.bottom - hit.bottom, end: tag.right - hit.right };
}));
if (tagRemoveSpacing.length !== 2 || tagRemoveSpacing.some(hit => hit.width < 44 || hit.height < 44 || hit.top < 4 || hit.bottom < 4 || hit.end < 4)) {
  fail(`phone: tag remove controls need inset padding and 44px targets: ${JSON.stringify(tagRemoveSpacing)}`);
}
await phone.getByRole("button", { name: "Remove Research", exact: true }).first().click();
if (await phone.locator(".preview-box .rs-tag-input-tag").count() !== 1) fail("phone: tag remove control does not remove its tag");
if (!(await phone.locator(".preview-box .rs-tag-input-input").evaluate(input => input === document.activeElement))) fail("phone: removing a tag does not return focus to its input");
await phone.goto(`${base}/components/error-summary/`, { waitUntil: "networkidle" });
const errorSummarySpacing = await phone.locator(".preview-box .rs-error-summary").evaluate(summary => {
  const link = summary.querySelector("a");
  const input = document.getElementById(decodeURIComponent(link.hash.slice(1)));
  const field = input.closest(".rs-field") ?? input;
  return { radius: getComputedStyle(summary).borderRadius, gap: field.getBoundingClientRect().top - summary.getBoundingClientRect().bottom, targetHeight: link.getBoundingClientRect().height };
});
if (errorSummarySpacing.radius !== "4px" || errorSummarySpacing.gap < 16 || errorSummarySpacing.targetHeight < 44) {
  fail(`phone: error summary needs rounded framing, field spacing, and a usable link: ${JSON.stringify(errorSummarySpacing)}`);
}
await phone.locator(".preview-box .rs-error-summary-link").click();
if (!(await phone.locator('.preview-box input[type="email"]').evaluate(input => input === document.activeElement))) fail("phone: error summary link does not focus its field");
await phone.goto(`${base}/components/file-browser/`, { waitUntil: "networkidle" });
const fileBrowserStack = await phone.locator(".preview-box .rs-file-browser").evaluate(browser => {
  const tree = browser.querySelector(".rs-file-browser-tree").getBoundingClientRect();
  const content = browser.querySelector(".rs-file-browser-content").getBoundingClientRect();
  return { gap: content.top - tree.bottom, leftOffset: Math.abs(content.left - tree.left) };
});
if (fileBrowserStack.gap < 16 || fileBrowserStack.leftOffset > 1) fail(`phone: file browser tree and content must stack on a shared edge: ${JSON.stringify(fileBrowserStack)}`);
await phone.goto(`${base}/components/select/`, { waitUntil: "networkidle" });
const mobileSelect = await phone.evaluate(() => {
  const preview = document.querySelector('.preview-box [role="combobox"]').getBoundingClientRect();
  const scene = document.querySelector('.rs-scene [role="combobox"]').getBoundingClientRect();
  return {
    previewLeft: Math.round(preview.left),
    sceneLeft: Math.round(scene.left),
    previewRadius: getComputedStyle(document.querySelector('.preview-box [role="combobox"]')).borderRadius,
    sceneRadius: getComputedStyle(document.querySelector('.rs-scene [role="combobox"]')).borderRadius,
  };
});
if (mobileSelect.previewLeft !== mobileSelect.sceneLeft) fail(`phone: Select examples do not share the grid (${mobileSelect.previewLeft}px vs ${mobileSelect.sceneLeft}px)`);
if (mobileSelect.previewRadius !== "4px" || mobileSelect.sceneRadius !== "4px") fail(`phone: Select lost its 4px radius (${mobileSelect.previewRadius}, ${mobileSelect.sceneRadius})`);
await phone.goto(`${base}/components/button/`, { waitUntil: "networkidle" });
const small = await phone.evaluate(() =>
  [...document.querySelectorAll(".preview-box button, .preview-box input:not([type=hidden]), .preview-box a[href], .preview-box [role=option]")]
    .filter((el) => el.getClientRects().length && getComputedStyle(el).visibility !== "hidden")
    .map((el) => [el.tagName + (el.className ? `.${String(el.className).split(" ")[0]}` : ""), el.getBoundingClientRect().height])
    .filter(([, h]) => h > 0 && h < 44),
);
for (const [what, h] of small) fail(`phone: ${what} is ${Math.round(h)}px tall, under the 44px hit size`);
await phone.click(".nav-toggle");
await phone.waitForTimeout(250);
if (!(await phone.evaluate(() => document.activeElement?.closest("#navPanel") != null))) fail("phone menu: focus did not move into the panel");
await phone.keyboard.press("Escape");
await phone.waitForTimeout(250);
if (await phone.evaluate(() => document.querySelector("#navPanel")?.getAttribute("data-open") === "true")) fail("phone menu: Escape did not close it");
if (!(await phone.evaluate(() => document.activeElement?.classList.contains("nav-toggle")))) fail("phone menu: focus did not return to the toggle");
await phone.close();

await browser.close();
server.close();
if (failures.length) {
  console.error(`${failures.length} failure(s)\n\n${failures.map((f) => `  ✗ ${f}`).join("\n")}`);
  process.exit(1);
}
console.log(`e2e ok: ${pages.length} pages pass axe, skip link and phone menu behave, no sideways scroll at 390px`);
