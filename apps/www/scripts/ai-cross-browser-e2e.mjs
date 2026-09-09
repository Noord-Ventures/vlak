// Run against a built site: VLAK_AI_BASE=http://localhost:3210 node scripts/ai-cross-browser-e2e.mjs
// Install matching engines first with: pnpm exec playwright install chromium firefox webkit
import { chromium, firefox, webkit } from "playwright";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { checkAIInteractions } from "./ai-parity-e2e.mjs";

const base = process.env.VLAK_AI_BASE || "http://localhost:3210";
const failures = [];
const results = [];
const ensure = (value, message) => { if (!value) throw new Error(message); };
const checks = process.env.VLAK_AI_CHECKS?.split(",") ?? ["interactions", "capabilities", "recording"];
const widths = process.env.VLAK_AI_WIDTHS?.split(",").map(Number) ?? [1280, 390];

async function voiceFixture() {
  // Use the test toolchain's bundler and existing built package. Nothing is written to generated surfaces.
  const reactRequire = createRequire(new URL("../../../packages/react/package.json", import.meta.url));
  const vitestRequire = createRequire(reactRequire.resolve("vitest/package.json"));
  const viteRequire = createRequire(vitestRequire.resolve("vite/package.json"));
  const { build } = viteRequire("esbuild");
  const output = await build({ entryPoints: [fileURLToPath(new URL("./ai-voice-browser-fixture.jsx", import.meta.url))], bundle: true, write: false, format: "iife", platform: "browser", define: { "process.env.NODE_ENV": '"production"' } });
  const css = readFileSync(new URL("../../../packages/react/dist/vlak-react.css", import.meta.url));
  const server = createServer((request, response) => {
    response.setHeader("Cache-Control", "no-store");
    if (request.url === "/fixture.js") { response.setHeader("Content-Type", "application/javascript"); response.end(output.outputFiles[0].contents); }
    else if (request.url === "/fixture.css") { response.setHeader("Content-Type", "text/css"); response.end(css); }
    else { response.setHeader("Content-Type", "text/html"); response.end('<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Voice recording browser fixture</title><link rel="stylesheet" href="/fixture.css"></head><body><div id="fixture"></div><script src="/fixture.js"></script></body></html>'); }
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  return { base: `http://127.0.0.1:${server.address().port}`, close: () => new Promise(resolve => server.close(resolve)) };
}

async function recording(browser, engine, fixture) {
  const page = await browser.newPage(); page.setDefaultTimeout(10_000);
  try {
    await page.addInitScript(() => {
      window.__streams = []; window.__audioContexts = [];
      Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: {
        getUserMedia: async () => {
          // Real engine MediaRecorder and audio track, but no physical microphone or audible output.
          const context = new AudioContext(); const destination = context.createMediaStreamDestination();
          const oscillator = context.createOscillator(); oscillator.connect(destination); oscillator.start();
          await context.resume(); window.__audioContexts.push(context); window.__streams.push(destination.stream);
          return destination.stream;
        },
      } });
    });
    await page.goto(fixture.base);
    const start = page.getByRole("button", { name: "Start speech input", exact: true });
    await start.waitFor(); await start.click();
    const stop = page.getByRole("button", { name: "Stop speech input", exact: true });
    await stop.waitFor(); await page.waitForTimeout(300); await stop.click();
    await page.getByTestId("transcript").getByText("Recorded audio fixture", { exact: true }).waitFor();
    const proof = await page.evaluate(() => ({ size: window.__recordingProof.size, type: window.__recordingProof.type, stopped: window.__streams.every(stream => stream.getTracks().every(track => track.readyState === "ended")) }));
    ensure(proof.size > 0 && /^audio\//.test(proof.type) && proof.stopped, `recording did not deliver/release real audio: ${JSON.stringify(proof)}`);
    await page.evaluate(() => { window.__delayTranscript = true; });
    await start.click(); await stop.waitFor(); await page.waitForTimeout(300); await stop.click();
    await page.getByRole("button", { name: "Cancel speech input", exact: true }).waitFor();
    await page.getByRole("button", { name: "Unmount input", exact: true }).click();
    const released = await page.evaluate(() => { const aborted = window.__recordingProof.signal.aborted; window.__finishTranscript("Stale transcript"); return aborted && window.__streams.every(stream => stream.getTracks().every(track => track.readyState === "ended")); });
    ensure(released, "unmount does not abort the pending transcription and release audio tracks");
    await page.waitForTimeout(50);
    ensure(await page.getByTestId("transcript").textContent() === "Recorded audio fixture", "late transcription changes the unmounted input's result");
    results.push(`${engine} native recording fallback: ${proof.type}, ${proof.size} bytes, tracks released, late result ignored`);
    console.log(`Passed ${engine} native recording fallback (${proof.type})`);
  } catch (error) { const message = `${engine} native recording fallback: ${error.message}`; failures.push(message); console.error(message); }
  finally { await page.evaluate(() => Promise.all(window.__audioContexts?.map(context => context.close()) || [])).catch(() => {}); await page.close(); }
}

async function capabilities(browser, engine, width) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
  page.setDefaultTimeout(10_000);
  let current = "capabilities";
  const fail = error => { const message = `${engine} ${width}px ${current}: ${error.message}`; failures.push(message); console.error(message); };
  const pageError = error => fail(error);
  page.on("pageerror", pageError);
  const visit = async name => { await page.goto(`${base}/ai/${name}/`, { waitUntil: "networkidle" }); return page.locator(".preview-box"); };
  const navigateToVoiceSelector = async () => {
    if (width < 900) await page.locator(".toc-mobile-trigger").first().click();
    await page.locator(width < 900 ? '.toc-mobile-open a[href="/ai/voice-selector/"]' : 'a[href="/ai/voice-selector/"]:visible').first().click();
    await page.waitForURL("**/ai/voice-selector/");
  };
  const check = async (name, run) => { current = name; try { await run(); const result = `${engine} ${width}px ${name}`; results.push(result); console.log(`Passed ${result}`); } catch (error) { fail(error); } };
  try {
    await check("unavailable capture", async () => {
      await page.addInitScript(() => {
        Object.defineProperty(window, "SpeechRecognition", { configurable: true, value: undefined });
        Object.defineProperty(window, "webkitSpeechRecognition", { configurable: true, value: undefined });
        Object.defineProperty(window, "MediaRecorder", { configurable: true, value: undefined });
        Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: undefined });
      });
      const speech = await visit("speech-input");
      ensure(await speech.getByRole("button", { name: "Start speech input", exact: true }).isDisabled(), "unsupported speech input remains enabled");
      await speech.getByText("Speech input is unavailable. This browser needs an application transcription service.", { exact: true }).waitFor();
      const microphone = await visit("mic-selector");
      ensure(await microphone.getByRole("combobox", { name: "Microphone", exact: true }).isDisabled(), "unsupported microphone selection remains enabled");
      await microphone.getByText("Microphone selection is unavailable in this browser.", { exact: true }).waitFor();
    });

    await check("permission denial and late stream cleanup", async () => {
      await page.addInitScript(() => {
        window.__capture = { requests: 0, stopped: 0, listeners: 0, pending: false };
        const events = new EventTarget();
        const media = {
          enumerateDevices: async () => [{ deviceId: "test-microphone", kind: "audioinput", label: "", groupId: "test" }],
          getUserMedia: () => {
            window.__capture.requests++;
            if (!window.__capture.pending) return Promise.reject(new DOMException("Denied by fixture", "NotAllowedError"));
            return new Promise(resolve => { window.__releaseStream = () => resolve({ getTracks: () => [{ stop: () => { window.__capture.stopped++; } }] }); });
          },
          addEventListener: (...args) => { window.__capture.listeners++; events.addEventListener(...args); },
          removeEventListener: (...args) => { window.__capture.listeners--; events.removeEventListener(...args); },
        };
        Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: media });
      });
      const microphone = await visit("mic-selector");
      const allow = microphone.getByRole("button", { name: "Allow microphone access", exact: true });
      await allow.waitFor();
      ensure(await page.evaluate(() => window.__capture.requests) === 0, "mount requests microphone permission");
      await allow.focus(); await page.keyboard.press("Enter");
      await microphone.getByText("Microphone permission was denied. Allow access in your browser and try again.", { exact: true }).waitFor();
      ensure(await allow.isEnabled(), "denied microphone permission cannot be retried");
      await page.evaluate(() => { window.__capture.pending = true; });
      await allow.click();
      await page.waitForFunction(() => window.__capture.requests === 2);
      // Client navigation preserves the realm so cleanup of a late permission result remains observable.
      await navigateToVoiceSelector();
      await page.evaluate(() => window.__releaseStream());
      await page.waitForFunction(() => window.__capture.stopped === 1 && window.__capture.listeners === 0);
    });

    await check("recognition keyboard and unmount cleanup", async () => {
      await page.addInitScript(() => {
        window.__recognition = { starts: 0, aborts: 0 };
        Object.defineProperty(window, "SpeechRecognition", { configurable: true, value: class {
          start() { window.__recognition.starts++; window.__activeRecognition = this; this.onstart?.(); }
          stop() { this.onend?.(); }
          abort() { window.__recognition.aborts++; }
        } });
      });
      const speech = await visit("speech-input");
      const start = speech.getByRole("button", { name: "Start speech input", exact: true });
      await start.waitFor(); ensure(await page.evaluate(() => window.__recognition.starts) === 0, "recognition starts on mount");
      await start.focus(); await page.keyboard.press("Space");
      await speech.getByRole("button", { name: "Stop speech input", exact: true }).waitFor();
      await page.evaluate(() => window.__activeRecognition.onresult?.({ resultIndex: 0, results: [{ isFinal: true, length: 1, 0: { transcript: "Browser speech fixture" } }] }));
      await speech.getByText("Browser speech fixture", { exact: true }).waitFor();
      await navigateToVoiceSelector();
      ensure(await page.evaluate(() => window.__recognition.aborts === 1 && window.__activeRecognition.onresult === null && window.__activeRecognition.onerror === null), "unmount retains a recognition session or listeners");
    });

    await check("reduced motion and forced colors", async () => {
      await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
      const persona = await visit("persona");
      ensure(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches), "reduced motion emulation is unavailable");
      const motion = await persona.locator(".rs-persona").evaluate(element => [element, ...element.querySelectorAll("*")].every(part => { const style = getComputedStyle(part); return style.animationName === "none" || Number.parseFloat(style.animationDuration) === 0 || style.animationPlayState === "paused"; }));
      ensure(motion, "Persona keeps animating with reduced motion");
      const actions = await visit("response-actions");
      const rate = actions.getByRole("button", { name: "Rate response", exact: true });
      await rate.focus(); await page.keyboard.press("ArrowDown");
      const choice = page.getByRole("menuitemcheckbox", { name: "Helpful response", exact: true });
      await choice.waitFor(); await page.keyboard.press("Enter");
      ensure(await rate.getAttribute("data-feedback") === "positive", "feedback selection fails with accessibility media preferences");
      if (await page.evaluate(() => matchMedia("(forced-colors: active)").matches)) {
        const focus = await rate.evaluate(element => { const style = getComputedStyle(element); return { width: Number.parseFloat(style.outlineWidth), style: style.outlineStyle, color: style.color }; });
        ensure(focus.width >= 1 && focus.style !== "none" && focus.color !== "rgba(0, 0, 0, 0)", `forced-colors focus is not visible: ${JSON.stringify(focus)}`);
      } else results.push(`${engine} does not emulate forced-colors CSS; keyboard/reduced-motion checks still ran`);
    });
  } finally { page.off("pageerror", pageError); await page.close(); }
}

const fixture = checks.includes("recording") ? await voiceFixture() : undefined;
for (const [engine, type] of Object.entries({ chromium, firefox, webkit })) {
  if (process.env.VLAK_AI_ENGINES && !process.env.VLAK_AI_ENGINES.split(",").includes(engine)) continue;
  let browser;
  try {
    browser = await type.launch(engine === "chromium" ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || type.executablePath() } : undefined);
    console.log(`Checking ${engine} ${browser.version()}`);
    if (checks.includes("interactions")) {
      const previous = failures.length;
      await checkAIInteractions({ browser, base, fail: message => { const failure = `${engine}: ${message}`; failures.push(failure); console.error(failure); } });
      if (failures.length === previous) { const result = `${engine} AI interactions at 1280px and 390px`; results.push(result); console.log(`Passed ${result}`); }
    }
    if (checks.includes("capabilities")) for (const width of widths) await capabilities(browser, engine, width);
    if (checks.includes("recording")) await recording(browser, engine, fixture);
  } catch (error) { failures.push(`${engine}: ${error.message}`); }
  finally { await browser?.close(); }
}
await fixture?.close();
console.log(JSON.stringify({ results, failures }, null, 2));
if (failures.length) process.exitCode = 1;
