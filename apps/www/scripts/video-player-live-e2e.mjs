// Real providers, without network mocks. Run after deployment:
// SITE_URL=https://vlak.dev node apps/www/scripts/video-player-live-e2e.mjs
// Loathe may report a publisher embedding restriction; Foals and Woodkid must play.
import assert from "node:assert/strict";
import { chromium } from "playwright";

const base = process.env.SITE_URL || "http://localhost:3016";
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: process.env.HEADED !== "1" });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const reports = [];
try {
  await page.goto(`${base}/interfaces/video-player/`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Object.keys(document.querySelector(".vp-file") ?? {}).some(key => key.startsWith("__reactProps")));
  for (const [artist, title, id, allowRestricted] of [["Foals", "Spanish Sahara", "eYoINidnLRQ", false], ["Woodkid", "Iron", "21604065", false], ["Loathe", "Two-Way Mirror", "MSUGmeWqbCY", true]]) {
    const root = page.locator(".vp");
    await root.getByRole("button", { name: `Play ${artist}, ${title}`, exact: true }).click();
    await page.waitForFunction(id => document.querySelector(".vp iframe")?.src.includes(id), id);
    await page.waitForFunction(() => { const root = document.querySelector(".vp"); return root?.getAttribute("data-ready") === "true" || root?.hasAttribute("data-player-error"); }, null, { timeout: 25000 });
    const readyError = await root.getAttribute("data-player-error");
    if (!readyError && await root.getByRole("button", { name: "Play", exact: true }).isEnabled()) await root.getByRole("button", { name: "Play", exact: true }).click();
    await page.waitForFunction(() => {
      const root = document.querySelector(".vp"), slider = root?.querySelector('input[aria-label="Video position"]');
      return root?.hasAttribute("data-player-error") || (root?.getAttribute("data-playing") === "true" && Number(slider?.value) >= 1);
    }, null, { timeout: 25000 });
    const error = await root.getAttribute("data-player-error");
    if (error) {
      assert(allowRestricted && ["101", "150"].includes(error), `${artist} failed with player error ${error}`);
      assert.equal(await root.getByRole("link", { name: "Open on YouTube", exact: true }).getAttribute("href"), `https://www.youtube.com/watch?v=${id}`);
      reports.push({ artist, title, result: "Official embed restriction with direct-link recovery", error });
      continue;
    }
    const duration = Number(await root.getByRole("slider", { name: "Video position", exact: true }).getAttribute("max"));
    assert(duration > 30, `${artist} must report actual full-video duration`);
    await root.getByRole("button", { name: "Pause", exact: true }).click();
    await page.waitForFunction(() => document.querySelector(".vp")?.getAttribute("data-playing") === "false");
    const report = { artist, title, result: "Actual playback and pause verified", duration };
    if (artist === "Woodkid") {
      const slider = root.getByRole("slider", { name: "Video position", exact: true });
      await page.waitForFunction(async () => new window.Vimeo.Player(document.querySelector('.vp iframe')).getPaused());
      if (process.env.DEBUG) await page.evaluate(() => {
        const sdk = new window.Vimeo.Player(document.querySelector('.vp iframe'));
        window.liveVimeoTrace = [];
        const seek = sdk.setCurrentTime.bind(sdk);
        sdk.setCurrentTime = time => { window.liveVimeoTrace.push({ seek: time }); return seek(time).then(result => { window.liveVimeoTrace.push({ resolved: result }); return result; }); };
        for (const event of ["seeking", "seeked", "timeupdate"]) sdk.on(event, payload => window.liveVimeoTrace.push({ event, payload }));
      });
      // Keyboard interaction exercises the visible control without React value-tracker injection.
      await slider.press("Home");
      await page.waitForFunction(async () => (await new window.Vimeo.Player(document.querySelector('.vp iframe')).getCurrentTime()) < 1);
      await page.waitForFunction(() => Number(document.querySelector('input[aria-label="Video position"]')?.value) < 1);
      await slider.press("PageUp");
      await page.waitForFunction(async duration => {
        const sdk = new window.Vimeo.Player(document.querySelector('.vp iframe'));
        return await sdk.getPaused() && Math.abs((await sdk.getCurrentTime()) - duration / 10) < 3;
      }, duration).catch(async error => {
        console.error("Vimeo seek diagnostics", await page.evaluate(async () => {
          const sdk = new window.Vimeo.Player(document.querySelector('.vp iframe'));
          return { time: await sdk.getCurrentTime(), paused: await sdk.getPaused(), slider: document.querySelector('input[aria-label="Video position"]')?.value };
        }), await root.locator(".vp-status").innerText());
        throw error;
      });
      await root.getByRole("combobox", { name: "Video playback speed", exact: true }).selectOption("1.5");
      await page.waitForFunction(async () => (await new window.Vimeo.Player(document.querySelector('.vp iframe')).getPlaybackRate()) === 1.5);
      report.result += ", native seek and 1.5× speed verified";
    }
    reports.push(report);
  }
  console.log(JSON.stringify(reports, null, 2));
} catch (error) {
  console.error("Playback probe state", reports, await page.evaluate(async () => {
    const root = document.querySelector('.vp'), iframe = root?.querySelector('iframe');
    const sdk = iframe?.src.includes('vimeo') ? new window.Vimeo.Player(iframe) : null;
    return { provider: root?.getAttribute('data-provider'), error: root?.getAttribute('data-player-error'), status: root?.querySelector('.vp-status')?.textContent, slider: root?.querySelector('input[aria-label="Video position"]')?.value, time: sdk && await sdk.getCurrentTime(), trace: window.liveVimeoTrace };
  }));
  throw error;
} finally { await browser.close(); }
