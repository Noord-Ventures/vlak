import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, isAbsolute, join, resolve } from "node:path";
import { chromium } from "../apps/www/node_modules/playwright/index.mjs";
import { interfaceStarters } from "../apps/www/app/starters/catalog.ts";

const output = process.argv[2];
if (!output || !isAbsolute(output)) throw new Error("Pass the absolute export directory printed by verify-interface-starters.mjs");
const prefix = process.argv[3] ?? "/";
if (!prefix.startsWith("/") || !prefix.endsWith("/") || prefix.includes("..")) throw new Error("The optional hosting prefix must begin and end with a slash");
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json", ".glb": "model/gltf-binary", ".md": "text/markdown", ".woff2": "font/woff2" };
const button = (page, name) => page.getByRole("button", { name, exact: true });
const text = (page, name) => page.getByRole("textbox", { name, exact: true });
async function toggle(control) {
  const before = await control.getAttribute("aria-pressed");
  assert(["true", "false"].includes(before), "Toggle exposes its state");
  await control.click();
  assert.notEqual(await control.getAttribute("aria-pressed"), before);
}
async function area(page, selector) {
  const target = page.locator(selector).first();
  await target.waitFor({ state: "visible" });
  const box = await target.boundingBox();
  assert(box && box.width >= 100 && box.height >= 100, `${selector}: usable work area, not a collapsed preview`);
}
async function localAsset(page, base, path, signature) {
  const response = await page.request.get(`${base}${path}`);
  assert(response.ok(), `${path}: bundled asset loads from the hosting prefix`);
  const body = await response.body();
  assert(body.length > 0, `${path}: bundled asset is not empty`);
  if (signature) assert.equal(body.subarray(0, signature.length).toString(), signature, `${path}: expected asset format`);
  return body;
}

// Every entry gets a real state change, not just a successful first paint.
const journeys = {
  ios: async page => {
    await page.getByLabel("Device", { exact: true }).selectOption("iphone-duo");
    await button(page, "Open display").click();
    await page.locator('.mo-device[data-posture="expanded"]').waitFor();
    await button(page, "Open Control Center").click();
    await page.locator('.mo-phone[data-overlay="quick"]').waitFor();
    await button(page, "Home").click(); await button(page, "Open Photos").click();
    await page.waitForFunction(() => Array.from(document.querySelectorAll(".mo-phone img")).some(image => image.complete && image.naturalWidth > 0));
  },
  android: async page => {
    await button(page, "Open Quick Settings").click();
    await page.locator('.mo-phone[data-overlay="quick"]').waitFor();
  },
  calendar: async page => {
    await button(page, "New event").click(); await page.getByRole("dialog").waitFor();
    await page.keyboard.press("Escape"); assert.equal(await page.getByRole("dialog").count(), 0);
  },
  reconciliation: async page => {
    for (const [index, name, last] of [[0, "left.csv", "Beta"], [1, "right.csv", "Gamma"]]) {
      await page.locator('.rc-source input[type="file"]').nth(index).setInputFiles({ name, mimeType: "text/csv", buffer: Buffer.from(`id,name\n1,Alpha\n2,${last}\n`) });
      await page.getByRole("heading", { name, exact: true }).waitFor();
    }
    await button(page, "Compare exact keys").click();
    await page.getByText("Exact comparison complete. Review exception groups, then export a fixed result revision.", { exact: true }).waitFor();
  },
  line: async page => {
    await button(page, "New conversation").click(); await text(page, "Message").fill("Plan a starter smoke test");
    await button(page, "Send").click();
    await page.getByText("Message added. A local template response is ready.", { exact: true }).waitFor();
    assert.match(await page.locator('.ac-message[data-role="assistant"]').innerText(), /Plan a starter smoke test/);
  },
  agents: async page => {
    await page.locator(".am-task").filter({ hasText: "Audit keyboard navigation" }).click();
    await button(page, "Approve review").click(); await page.getByText("Work accepted", { exact: true }).waitFor();
  },
  microbiology: async page => {
    await button(page, "Open notebook").click(); await text(page, "Observation note").fill("Review the supplied source record.");
    await button(page, "Save note").click(); await page.getByText("Review the supplied source record.", { exact: true }).waitFor();
    assert.equal(await text(page, "Observation note").inputValue(), "");
  },
  genome: async page => {
    await button(page, "Annotate locus").click(); await text(page, "Locus annotation").fill("Check this local locus.");
    await button(page, "Save annotation").click(); await page.getByText("Check this local locus.", { exact: true }).waitFor();
  },
  protein: async page => {
    await button(page, "Edit sequence").click(); await text(page, "Residue sequence").fill("GASGAAGASGAGGASGAG");
    await text(page, "Variant name").fill("Starter review draft"); await button(page, "Save variant").click();
    await page.getByRole("region", { name: "Variant comparison", exact: true }).getByRole("heading", { name: "Starter review draft", exact: true }).waitFor();
    assert.equal((await page.locator(".pr-difference-count strong").textContent()).trim(), "01");
  },
  robotics: async page => {
    await page.locator(".rb-joint-row").filter({ hasText: "Elbow" }).click();
    await page.getByRole("spinbutton", { name: "Elbow draft target (deg)", exact: true }).fill("-25");
    await button(page, "Request targets").click(); await button(page, "Confirm simulation").click();
    await page.getByText("Reported: -25 deg", { exact: true }).waitFor();
  },
  circuitry: async page => {
    const pad = page.locator(".cb-pad-marker").nth(2); await pad.click(); assert.equal(await pad.getAttribute("aria-pressed"), "true");
    await button(page, "Assistant").click(); await button(page, "Prepare proposal").click();
    await text(page, "Proposed net name").fill("Starter rail"); await text(page, "Change note").fill("Local naming review.");
    await button(page, "Apply proposal").click(); assert.match(await page.locator(".cb-selection").textContent(), /Starter rail/);
  },
  identity: async page => {
    await text(page, "Full name").fill("Avery Morgan"); await button(page, "Continue to evidence").click();
    await page.getByRole("heading", { name: "A little supporting evidence", exact: true }).waitFor();
    await button(page, "Attach sample portrait: Portrait photograph").click(); await button(page, "Attach sample address: Proof of address").click();
    assert(await button(page, "Review application").isEnabled());
  },
  patient: async page => {
    await page.locator(".pt-rail nav:visible,.pt-mobile-nav:visible").getByRole("button", { name: "Care", exact: true }).click();
    const questions = page.getByRole("checkbox", { name: "Write down your questions", exact: true }); await questions.focus(); await page.keyboard.press("Space"); assert(await questions.isChecked());
    await button(page, "Record sample as taken: Sample medication").click(); await page.getByText("Recorded as taken locally", { exact: true }).waitFor();
  },
  music: async page => {
    const step = button(page, "Step 2"); await toggle(step); await button(page, "Clear").click();
    assert.equal(await page.locator('.mu-steps [aria-pressed="true"]').count(), 0); await button(page, "Undo").click();
    assert.equal(await step.getAttribute("aria-pressed"), "true");
  },
  microscopy: async page => {
    await page.locator('.mc[data-ready="true"]').waitFor(); await button(page, "Edit position").click();
    await page.getByRole("spinbutton", { name: "X coordinate amount", exact: true }).fill("13.75");
    await button(page, "Apply position").click(); await page.getByText("Working value: 13.75 µm", { exact: true }).waitFor();
  },
  graphics: async page => {
    await page.getByLabel("Variation seed").fill("Starter geometric field"); await page.getByLabel("Canvas format", { exact: true }).selectOption("phone");
    await button(page, "Generate set").click(); await page.getByRole("region", { name: "Wallpaper previews" }).waitFor();
    await page.getByRole("group", { name: "Choose composition" }).getByRole("button").nth(1).click();
    assert.equal(await page.locator(".wg-stage > svg:visible").count(), 1);
  },
  render: async (page, base) => {
    await area(page, ".rw-model-host"); await localAsset(page, base, "interfaces/concepts/braun-t3-monochrome.glb", "glTF");
    await page.waitForFunction(() => ["ready", "error"].includes(document.querySelector(".rw")?.dataset.viewerStatus), undefined, { timeout: 35000 });
    if (await page.locator(".rw").getAttribute("data-viewer-status") === "ready") {
      await area(page, ".rw-object-canvas"); await page.waitForFunction(() => Number(document.querySelector(".rw-object-canvas")?.dataset.renderedTriangles) > 0);
      await toggle(button(page, "Show mesh"));
    } else {
      await page.getByText(/unavailable/i).first().waitFor();
      assert(await page.locator(".rw-object-viewport").getByRole("button").isVisible(), "WebGL failure offers recovery");
      await page.getByRole("treeitem", { name: "Viewport", exact: true }).click(); await page.getByRole("heading", { name: "Viewport settings", exact: true }).waitFor();
    }
  },
  drive: async (page, base) => {
    await area(page, ".ev-model"); await localAsset(page, base, "interfaces/concepts/evoque-monochrome.glb", "glTF");
    JSON.parse((await localAsset(page, base, "interfaces/concepts/evoque-feature-lines.json")).toString());
    await page.waitForFunction(() => ["ready", "fallback"].includes(document.querySelector(".ev-model")?.dataset.renderer), undefined, { timeout: 25000 });
    if (await page.locator(".ev-model").getAttribute("data-renderer") === "ready") await area(page, ".ev-model canvas");
    else assert(await page.locator(".ev-scene-fallback img").evaluate(image => image.complete && image.naturalWidth > 0), "WebGL fallback uses its bundled illustration");
    await toggle(button(page, "Door lock")); await toggle(button(page, "Lights"));
  },
  orbit: async page => {
    await page.locator(".so-asset").filter({ hasText: "Helios-7" }).click(); await button(page, "Queue capture").click(); await button(page, "Capture queued").waitFor();
  },
  frontier: async (page, base) => {
    await area(page, ".athena-portrait"); JSON.parse((await localAsset(page, base, "interfaces/concepts/athena-lines.json")).toString());
    await page.waitForFunction(() => { const portrait = document.querySelector(".athena-portrait"); return portrait?.dataset.ready === "true" || portrait?.dataset.failed === "true"; }, undefined, { timeout: 25000 });
    if (await page.locator(".athena-portrait").getAttribute("data-ready") === "true") await area(page, ".athena-canvas canvas");
    else assert(await page.locator(".athena-fallback").isVisible(), "WebGL failure retains the local portrait fallback");
    await page.getByRole("navigation", { name: "Company sections", exact: true }).getByRole("button", { name: "Research", exact: true }).click();
    await page.getByRole("region", { name: "Research", exact: true }).waitFor();
  },
  platforms: async page => {
    const from = page.getByRole("combobox", { name: "From", exact: true }); const before = await from.innerText();
    await button(page, "Swap stations").click(); assert.notEqual(await from.innerText(), before);
    await button(page, "Find routes").click(); await page.locator(".tr-trip").first().click();
    await page.getByRole("region", { name: "Journey details", exact: true }).waitFor();
    await button(page, "Save journey").click(); assert.equal(await button(page, "Journey saved").getAttribute("aria-pressed"), "true");
  },
  documentation: async page => {
    await area(page, ".dc-workspace"); await button(page, "Write the state you know").click();
    await page.getByRole("heading", { name: "Write the state you know", exact: true }).waitFor(); assert.equal(await page.locator(".dc").getAttribute("data-view"), "article");
    const paragraph = page.locator(".dc-article-section p").first(); const size = await paragraph.evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize));
    await button(page, "Reader settings").click(); await button(page, "Increase text size").click();
    assert(await paragraph.evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize)) > size);
  },
  "music-player": async page => {
    await toggle(button(page, "Favorite Fortress Down")); await page.getByRole("group", { name: "Library filter" }).getByRole("button", { name: "Favorites", exact: true }).click();
    assert.equal(await page.locator(".mp-track").count(), 1);
    await page.getByRole("group", { name: "Preview playback", exact: true }).getByRole("button", { name: "Play", exact: true }).click();
    await page.locator(".mp-status").filter({ hasText: /unavailable|could not start/ }).waitFor(); await page.locator(".mp-cover-fallback").first().waitFor();
  },
  "video-player": async page => {
    await page.locator(".vp-status").filter({ hasText: /could not connect/ }).waitFor(); await button(page, "Play Woodkid, Iron").click();
    await page.locator('.vp[data-video="21604065"]').waitFor(); await page.locator(".vp-status").filter({ hasText: /could not connect/ }).waitFor();
    assert.equal(await page.getByRole("link", { name: "Watch on Vimeo", exact: true }).getAttribute("href"), "https://vimeo.com/21604065");
    assert.equal(await page.locator(".vp").getAttribute("data-ready"), "false", "Offline player must not pretend playback is ready");
  },
  "desktop-os": async page => {
    await page.getByRole("tab", { name: "Mac OS", exact: true }).click(); await area(page, '.dos[data-platform="mac"]');
    const desktop = page.locator('.dos[data-platform="mac"]');
    const launch = async name => { await desktop.locator(".dos-apps-trigger:visible").first().click(); await desktop.getByRole("dialog").getByRole("button", { name, exact: true }).click(); };
    await launch("Calculator"); const calculator = desktop.locator('.dos-window[data-app="calculator"][data-front="true"]');
    await text(calculator, "Calculation").fill("(24 + 6) / 3"); await text(calculator, "Calculation").press("Enter"); assert.equal(await calculator.locator("output").textContent(), "10");
    await launch("Browser"); const web = desktop.locator('.dos-window[data-app="browser"][data-front="true"]');
    for (const [name, path] of [["Getting started", "docs/guide.md"], ["Design tokens", "docs/tokens.md"], ["The design brief", "design.md"]]) {
      const response = page.waitForResponse(response => response.url().endsWith(`/${path}`) && response.ok());
      await button(web, name).first().click(); await response;
      await web.getByRole("article", { name, exact: true }).locator("pre").filter({ hasText: "Vlak" }).waitFor();
    }
  },
  press: async page => {
    await button(page, "Month").click(); await page.locator(".pd-job").filter({ hasText: "Exhibition guide" }).click();
    await text(page, "Review note").fill("Starter review recorded."); await button(page, "Mark reviewed").click(); assert.match(await page.locator(".pd-detail-action").textContent(), /Reviewed locally/);
  },
  wall: async page => { const like = button(page, "Like Inez’s post").first(); await toggle(like); assert.equal((await like.textContent()).trim(), "9"); },
  night: async page => {
    await area(page, ".fm-map-stage"); assert.equal(await page.locator(".fm-map-view").getAttribute("data-map-status"), "preview", "Without a public token the map uses its local schematic");
    await text(page, "Search vehicles").fill("Truck 19"); await page.locator(".fm-vehicle").filter({ hasText: "Truck 19" }).click(); assert.equal(await page.locator(".fm-map-marker").count(), 1);
    await button(page, "View trip").click(); await text(page, "Dispatch note").fill("Loading bay checked locally."); await button(page, "Save note").click(); await page.getByText("Note saved locally", { exact: true }).waitFor();
  },
  evening: async page => {
    await button(page, "Open Joe's Kitchen menu").click(); await button(page, "View Grilled chicken filet large").click(); await button(page, "Increase quantity").click();
    assert.equal(await page.getByRole("spinbutton", { name: "Quantity", exact: true }).inputValue(), "2"); await button(page, "Add to bag · €30.00").click(); assert.equal(await page.locator(".fo-line-quantity").textContent(), "2");
  },
  room: async page => {
    await page.locator('[data-channel="studio"]').click(); await page.locator('[data-message="s1"] .tc-open-thread').click();
    await text(page, "Reply in thread").fill("The starter handoff is ready."); await text(page, "Reply in thread").press("Control+Enter"); await page.locator(".tc-reply").filter({ hasText: "The starter handoff is ready." }).waitFor();
  },
};
assert.deepEqual(Object.keys(journeys).sort(), interfaceStarters.map(starter => starter.slug).sort(), "Every starter needs an explicit interaction smoke test");
const requested = process.env.STARTER_SLUGS?.split(",").filter(Boolean);
if (requested) assert(requested.length && requested.every(slug => slug in journeys), "STARTER_SLUGS must contain known starters");
const starters = interfaceStarters.filter(starter => !requested || requested.includes(starter.slug));

// Deliberately offline. Only these documented media sources are expected;
// any other remote request is a regression, not an implicitly allowed dependency.
function documentedMedia(slug, raw) {
  const url = new URL(raw);
  if (slug === "music-player") return url.protocol === "https:" && (
    (url.hostname === "is1-ssl.mzstatic.com" && url.pathname.startsWith("/image/thumb/Music")) ||
    (url.hostname === "audio-ssl.itunes.apple.com" && url.pathname.startsWith("/itunes-assets/AudioPreview") && url.pathname.endsWith(".m4a"))
  );
  if (slug === "video-player") return url.protocol === "https:" && (
    (url.hostname === "i.ytimg.com" && /^\/vi\/(MSUGmeWqbCY|eYoINidnLRQ)\/hqdefault\.jpg$/.test(url.pathname)) ||
    (url.hostname === "i.vimeocdn.com" && url.pathname === "/video/139202680-d7c9d4a9bee7b25171b2cec24c0008491f087e0db1004ccec6d869300b1c9dc3-d_295x166") ||
    (url.hostname === "www.youtube.com" && ["/iframe_api", "/embed/MSUGmeWqbCY", "/embed/eYoINidnLRQ"].includes(url.pathname)) ||
    (url.hostname === "player.vimeo.com" && ["/api/player.js", "/video/21604065"].includes(url.pathname))
  );
  return false;
}
const browser = await chromium.launch({ ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}), args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const failures = [];
try {
  for (const { slug } of starters) {
    const directory = join(output, `vlak-${slug}`, "dist");
    assert((await stat(join(directory, "index.html"))).isFile(), `${slug}: build output exists`);
    const server = createServer(async (request, response) => {
      try {
        const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
        if (!pathname.startsWith(prefix)) throw new Error("Outside hosting prefix");
        const path = resolve(directory, pathname.slice(prefix.length) || "index.html");
        if (!path.startsWith(`${directory}/`) || !(await stat(path)).isFile()) throw new Error("Not found");
        response.writeHead(200, { "content-type": mime[extname(path)] ?? "application/octet-stream" }); response.end(await readFile(path));
      } catch { response.writeHead(404); response.end("Not found"); }
    });
    await new Promise(done => server.listen(0, "127.0.0.1", done));
    const origin = `http://127.0.0.1:${server.address().port}`;
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce", serviceWorkers: "block" });
    const page = await context.newPage(); page.setDefaultTimeout(12000);
    const errors = [], failed = [], external = [], blockedMedia = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("response", response => { if (response.url().startsWith(`${origin}/`) && response.status() >= 400) failed.push(response.url()); });
    page.on("requestfailed", request => { if (request.url().startsWith(`${origin}/`) && request.failure()?.errorText !== "net::ERR_ABORTED") failed.push(`${request.url()}: ${request.failure()?.errorText}`); });
    await context.route("**/*", async route => {
      const url = route.request().url();
      if (url.startsWith(`${origin}/`) || /^(blob:|data:|about:)/.test(url)) return route.continue();
      (documentedMedia(slug, url) ? blockedMedia : external).push(url); await route.abort("internetdisconnected");
    });
    try {
      const base = `${origin}${prefix}`; const response = await page.goto(base, { waitUntil: "networkidle" }); assert(response?.ok(), `${slug}: starter page loads`);
      await area(page, ".starter"); await area(page, ".starter > :first-child"); await journeys[slug](page, base);
      await page.screenshot({ path: join(output, `${slug}-smoke.png`) });
      await page.setViewportSize({ width: 390, height: 844 });
      await page.emulateMedia({ colorScheme: "dark" });
      await page.reload({ waitUntil: "networkidle" });
      await page.evaluate(() => { document.documentElement.dataset.theme = "dark"; });
      await area(page, ".starter > :first-child");
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${slug}: no horizontal page overflow at 390px`);
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      assert.deepEqual(errors, [], `${slug}: runtime errors`); assert.deepEqual(failed, [], `${slug}: failed local asset requests`); assert.deepEqual(external, [], `${slug}: undocumented external requests`);
      if (["music-player", "video-player"].includes(slug)) assert(blockedMedia.length > 0, `${slug}: offline media behavior was actually exercised`);
      await page.screenshot({ path: join(output, `${slug}-smoke-narrow-dark.png`) });
      console.log(`${slug}: interaction, local assets and narrow/dark layout passed at ${prefix}${blockedMedia.length ? `; ${blockedMedia.length} documented media requests deliberately blocked, fallback passed` : "; no network dependencies"}`);
    } catch (error) {
      failures.push(`${slug}: ${error.message}\n${[...errors, ...failed, ...external].join("\n")}`); await page.screenshot({ path: join(output, `${slug}-smoke-failed.png`) }).catch(() => {}); console.error(failures.at(-1));
    } finally { await context.close(); await new Promise(done => server.close(done)); }
  }
} finally { await browser.close(); }
assert.deepEqual(failures, [], "All standalone starter journeys must pass");
console.log(`${starters.length} standalone starter interactions passed at ${prefix}.`);
