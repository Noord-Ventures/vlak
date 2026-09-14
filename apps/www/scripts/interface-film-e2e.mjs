// Check the emitted export and real local films, never production ingestion.
import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { FILMED_INTERFACE_SLUGS, INTERFACE_FILM_DURATION, INTERFACE_FILM_UPLOAD_DATE } from "../app/interfaces/films.ts";
import { createExportServer } from "./serve-export.mjs";

const out = fileURLToPath(new URL("../out/", import.meta.url));
const screenshots = await mkdtemp(join(tmpdir(), "vlak-interface-film-"));
const server = createExportServer({ root: out });
server.listen(0, "127.0.0.1");
await once(server, "listening");
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch(process.env.PLAYWRIGHT_EXECUTABLE_PATH
  ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : undefined);
const errors = [];
const summaryText = "Watch the 20-second walkthrough";
const videos = html => [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
  .flatMap(([, source]) => JSON.parse(source)).filter(item => item["@type"] === "VideoObject");
const settle = page => page.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))));

try {
  for (const slug of FILMED_INTERFACE_SLUGS) {
    const html = await readFile(join(out, `interfaces/${slug}/index.html`), "utf8");
    const disclosures = [...html.matchAll(/<details\b[^>]*class="[^"]*\bif-film\b[^"]*"[^>]*>/g)];
    assert.equal(disclosures.length, 1, `${slug}: one server-rendered film disclosure`);
    assert(!/\sopen(?:[\s=>])/.test(disclosures[0][0]), `${slug}: film is initially collapsed before hydration`);
    assert(html.includes(summaryText), `${slug}: plainly named disclosure`);
    const overview = html.indexOf('class="if-overview"'), note = html.indexOf('class="if-demo-note"');
    assert(overview >= 0 && note > overview && disclosures[0].index > note, `${slug}: film follows the demo note within the overview`);
    assert(disclosures[0].index < html.indexOf('class="if-used-components"'), `${slug}: film stays in the overview's first column`);
    const film = html.slice(disclosures[0].index).split("</details>")[0];
    const video = film.match(/<video\b[^>]*>/)?.[0];
    assert(video && /\bcontrols(?:[\s=>])/.test(video) && /preload="none"/.test(video) && !/\bautoplay(?:[\s=>])/i.test(video), `${slug}: native controls, no preload and no autoplay`);
    for (const path of [`/interfaces/films/${slug}.mp4`, `/interfaces/films/posters/${slug}.jpg`, "/interfaces/films/captions.vtt"]) {
      assert(film.includes(path), `${slug}: preserved source, poster and captions`);
      assert((await stat(join(out, path))).size > 0, `${path}: nonempty local asset`);
    }
    const metadata = videos(html);
    assert.equal(metadata.length, 1, `${slug}: one VideoObject remains discoverable`);
    assert.equal(metadata[0].contentUrl, `https://vlak.dev/interfaces/films/${slug}.mp4`);
    assert.equal(metadata[0].thumbnailUrl, `https://vlak.dev/interfaces/films/posters/${slug}.jpg`);
    assert.equal(metadata[0].embedUrl, `https://vlak.dev/interfaces/${slug}/`);
    assert.equal(metadata[0].duration, INTERFACE_FILM_DURATION);
    assert.equal(metadata[0].uploadDate, INTERFACE_FILM_UPLOAD_DATE);
  }
  for (const slug of ["calendar", "ios"]) {
    const html = await readFile(join(out, `interfaces/${slug}/index.html`), "utf8");
    assert(!/<details\b[^>]*class="[^"]*\bif-film\b/.test(html), `${slug}: no invented film disclosure`);
    assert.deepEqual(videos(html), [], `${slug}: no invented VideoObject`);
  }

  for (const width of [1440, 390]) for (const colorScheme of ["light", "dark"]) {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 }, colorScheme, reducedMotion: "reduce" });
    const page = await context.newPage();
    page.on("pageerror", error => errors.push(`${width}px ${colorScheme}: ${error.message}`));
    const requests = [];
    page.on("request", request => { if (request.url().includes("/interfaces/films/patient.mp4")) requests.push(request.url()); });
    try {
      await page.goto(`${base}/interfaces/patient/`, { waitUntil: "networkidle" });
      const film = page.locator("details.if-film"), summary = film.locator("summary"), video = film.locator("video");
      assert.equal(await summary.innerText(), summaryText);
      assert.equal(await film.getAttribute("open"), null);
      assert.equal(await video.isVisible(), false);
      assert(await video.evaluate(element => element.paused && !element.autoplay && element.controls && element.preload === "none"));
      assert.equal(requests.length, 0, "Collapsed walkthrough does not request the MP4");
      assert(await film.evaluate(element => {
        const preview = document.querySelector(".if-preview-frame"), note = document.querySelector(".if-overview .if-demo-note");
        return element.parentElement === document.querySelector(".if-overview > div:first-child")
          && Boolean(preview.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING)
          && Boolean(note.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING);
      }), "Working preview comes first; film follows the descriptive note");
      await summary.scrollIntoViewIfNeeded();
      const target = await summary.boundingBox(); assert(target && target.height >= 44 && target.width >= 44, "Disclosure is a 44px target");
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "Collapsed page fits the viewport");
      await page.locator(".if-overview").screenshot({ path: join(screenshots, `${width}-${colorScheme}-closed.png`) });
      await summary.focus(); await page.keyboard.press("Enter");
      await video.waitFor({ state: "visible" });
      assert(await film.evaluate(element => element.open), "Enter opens the native disclosure");
      assert(await summary.evaluate(element => element === document.activeElement), "Disclosure keeps keyboard focus");
      const box = await video.boundingBox(), specimen = await page.locator(".if-specimen").boundingBox();
      assert(box && box.width > 100 && box.height > 50 && box.width <= 592, "Opened video stays small and usable");
      assert(box.width <= specimen.width && (width < 600 || box.width < specimen.width * 0.6), "Walkthrough remains smaller than the live interface");
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "Opened page fits the viewport");
      assert(await video.evaluate(element => element.paused), "Opening does not auto-play");
      await video.evaluate(async element => { element.muted = true; await element.play(); });
      await page.waitForFunction(() => { const video = document.querySelector(".if-film video"); return !video.paused && video.currentTime > 0.2 && video.videoWidth > 0; });
      assert(requests.length > 0, "Playback used the actual local film");
      await film.screenshot({ path: join(screenshots, `${width}-${colorScheme}-open.png`) });
      await summary.focus(); await page.keyboard.press("Space");
      await page.waitForFunction(() => !document.querySelector(".if-film").open && document.querySelector(".if-film video").paused);
      const pausedAt = await video.evaluate(element => element.currentTime);
      await page.keyboard.press("Enter"); await settle(page);
      assert(await video.evaluate(element => element.paused), "Reopening remains paused");
      assert(Math.abs(await video.evaluate(element => element.currentTime) - pausedAt) < 0.1, "Reopening retains playback position without restarting");
      await page.keyboard.press("Space");
      console.log(`${width}px ${colorScheme}: disclosure, 44px target, placement, actual playback and pause-on-close passed`);
    } finally { await context.close(); }
  }

  // Use the production hostname only inside this fully intercepted context,
  // recording the app's collector calls locally rather than sending telemetry.
  const metrics = await browser.newContext();
  await metrics.addInitScript(() => {
    window.__filmEvents = [];
    window.va = (command, value) => { if (command === "event") window.__filmEvents.push(value); };
  });
  await metrics.route("**/*", async route => {
    const url = new URL(route.request().url());
    if (url.origin !== "https://vlak.dev") return route.abort();
    if (url.pathname.startsWith("/_vercel/insights/")) return route.fulfill({ contentType: "text/javascript", body: "" });
    const response = await metrics.request.fetch(`${base}${url.pathname}${url.search}`, { method: route.request().method(), headers: route.request().headers() });
    return route.fulfill({ response });
  });
  try {
    const page = await metrics.newPage();
    page.on("pageerror", error => errors.push(`metrics: ${error.message}`));
    await page.goto("https://vlak.dev/interfaces/patient/?utm_source=linkedin&utm_campaign=walkthrough", { waitUntil: "networkidle" });
    await page.waitForFunction(() => window.__vlakSiteAnalytics);
    const film = page.locator("details.if-film"), summary = film.locator("summary"), video = film.locator("video");
    await summary.click();
    await video.evaluate(async element => { element.muted = true; await element.play(); });
    await page.waitForFunction(() => window.__filmEvents.some(event => event.name === "interface_video_play"));
    await summary.click(); await page.waitForFunction(() => document.querySelector(".if-film video").paused);
    await summary.click(); await video.evaluate(element => element.play()); await settle(page);
    const events = await page.evaluate(() => window.__filmEvents.filter(event => event.name === "interface_video_play"));
    assert.equal(events.length, 1, "Closing/replaying the disclosure counts one play per mount");
    assert.equal(events[0].data.slug, "patient"); assert.equal(events[0].data.channel, "linkedin");
    assert.equal(events[0].data.campaign_name, "walkthrough");
  } finally { await metrics.close(); }

  const plain = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  try {
    const page = await plain.newPage(); await page.goto(`${base}/interfaces/patient/`, { waitUntil: "networkidle" });
    const film = page.locator("details.if-film"), summary = film.locator("summary"), video = film.locator("video");
    assert.equal(await film.getAttribute("open"), null);
    await summary.focus(); await page.keyboard.press("Enter"); await video.waitFor({ state: "visible" });
    assert(await video.evaluate(element => element.controls && !element.autoplay), "Native controls remain available without JavaScript");
    await page.keyboard.press("Space"); assert.equal(await film.getAttribute("open"), null);
  } finally { await plain.close(); }
  assert.deepEqual(errors, [], "No browser runtime errors");
  console.log(`Interface films passed: ${FILMED_INTERFACE_SLUGS.length} closed SSR disclosures with VideoObject, 2 unfilmed routes, desktop/mobile light/dark, no-JavaScript and one-shot analytics. Screenshots: ${screenshots}`);
} finally {
  await browser.close(); server.closeAllConnections(); await new Promise(done => server.close(done));
}
