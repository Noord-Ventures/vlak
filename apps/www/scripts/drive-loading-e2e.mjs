import assert from "node:assert/strict";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

/** Exercise real source loading, cancellation and fresh-instance recovery through the UI. */
export async function checkDriveLoading({ page, base }) {
  const asset = "**/interfaces/concepts/evoque-monochrome.glb";
  const context = await page.context().browser().newContext({ viewport: page.viewportSize(), reducedMotion: "reduce" });
  const errors = [];
  const fresh = async () => {
    const current = await context.newPage();
    current.on("pageerror", error => errors.push(error.message));
    return current;
  };
  const ready = async current => {
    await current.locator(".ev-scene").scrollIntoViewIfNeeded();
    await current.waitForFunction(() => document.querySelector(".ev-model")?.getAttribute("data-renderer") === "ready" && document.querySelector(".ev-scene")?.dataset.rendered === "true");
    assert.equal(await current.locator(".ev-scene canvas").count(), 1);
  };
  const retry = async current => {
    const button = current.getByRole("button", { name: "Retry 3D view", exact: true });
    await button.focus(); await button.press("Enter"); await ready(current);
  };
  const leave = async current => {
    await current.getByRole("link", { name: "Interfaces", exact: true }).first().click();
    await current.waitForURL("**/interfaces/");
  };
  const delayedLoad = async current => {
    let release, started;
    const began = new Promise(resolve => { started = resolve; });
    const gate = new Promise(resolve => { release = resolve; });
    await current.route(asset, async route => { started(); await gate; await route.continue(); });
    await current.goto(`${base}/interfaces/drive/`, { waitUntil: "domcontentloaded" });
    await current.locator(".ev-scene").scrollIntoViewIfNeeded();
    await began;
    assert.equal(await current.locator(".ev-model").getAttribute("data-renderer"), "loading");
    assert.equal(await current.locator(".ev-scene").getAttribute("data-rendered"), null);
    return async () => {
      const loaded = current.waitForResponse(response => response.url().endsWith("/evoque-monochrome.glb"));
      release(); await (await loaded).finished();
      await current.waitForTimeout(100);
    };
  };
  let phase = "failed request and retry";
  try {
    const failed = await fresh(); let requests = 0;
    await failed.route(asset, route => ++requests === 1 ? route.fulfill({ status: 503, body: "Unavailable" }) : route.continue());
    await failed.goto(`${base}/interfaces/drive/`, { waitUntil: "domcontentloaded" });
    await failed.locator(".ev-scene").scrollIntoViewIfNeeded();
    await failed.locator('.ev-model[data-renderer="fallback"]').waitFor();
    await retry(failed);
    assert.equal(requests, 2, "Retry fetches after an unsuccessful request");
    phase = "cached remount";
    await leave(failed); await failed.goBack(); await failed.waitForURL("**/interfaces/drive/"); await ready(failed);
    assert.equal(requests, 2, "Remounts reuse immutable bytes while creating a fresh scene");

    phase = "malformed source and retry";
    const malformed = await fresh(); let malformedRequests = 0;
    await malformed.route(asset, route => ++malformedRequests === 1 ? route.fulfill({ contentType: "model/gltf-binary", body: "Invalid source response" }) : route.continue());
    await malformed.goto(`${base}/interfaces/drive/`, { waitUntil: "domcontentloaded" });
    await malformed.locator(".ev-scene").scrollIntoViewIfNeeded();
    await malformed.locator('.ev-model[data-renderer="fallback"]').waitFor();
    await retry(malformed);
    assert.equal(malformedRequests, 2, "Invalid source bytes are discarded before retry");

    phase = "unmount during source loading";
    const unmounted = await fresh(), finishUnmounted = await delayedLoad(unmounted);
    await leave(unmounted); await finishUnmounted();
    assert.equal(await unmounted.locator(".ev-scene canvas").count(), 0, "A late source load cannot reattach an unmounted scene");

    phase = "context loss during source loading and retry";
    const lost = await fresh(), finishLost = await delayedLoad(lost);
    await lost.locator(".ev-scene canvas").evaluate(canvas => canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true })));
    await finishLost();
    assert.equal(await lost.locator(".ev-model").getAttribute("data-renderer"), "fallback", "A late asset cannot mark a lost context ready");
    await retry(lost);
    assert.deepEqual(errors, []);
  } catch (error) {
    throw new Error(`Source loading ${phase}: ${error instanceof Error ? error.stack || error.message : String(error)}`);
  } finally { await context.close(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const browser = await chromium.launch({ ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}), args: ["--enable-unsafe-swiftshader"] });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
    await checkDriveLoading({ page, base: process.env.SITE_URL || "http://localhost:3016" });
    console.log("EV source loading, retry, cached remount, cancellation and context-loss recovery passed");
  } finally { await browser.close(); }
}
