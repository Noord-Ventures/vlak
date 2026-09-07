import assert from "node:assert/strict";

function tone() {
  const rate = 48000, count = rate * 30, buffer = Buffer.alloc(44 + count * 2);
  buffer.write("RIFF"); buffer.writeUInt32LE(buffer.length - 8, 4); buffer.write("WAVEfmt ", 8); buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20); buffer.writeUInt16LE(1, 22); buffer.writeUInt32LE(rate, 24); buffer.writeUInt32LE(rate * 2, 28); buffer.writeUInt16LE(2, 32); buffer.writeUInt16LE(16, 34); buffer.write("data", 36); buffer.writeUInt32LE(count * 2, 40);
  for (let index = 0; index < count; index += 1) buffer.writeInt16LE(Math.round(Math.sin(index / rate * 1000 * 2 * Math.PI) * 1000), 44 + index * 2);
  return buffer;
}

/** Instruments real browser nodes; never replaces audio, filters, clocks or samples. */
export async function installMusicAudioAudit(page) {
  await page.addInitScript(() => {
    if (window.__musicAudioAudit) return;
    const Original = window.AudioContext;
    const audit = { contexts: [], filters: [], sources: [], disconnects: 0 };
    window.__musicAudioAudit = audit;
    window.AudioContext = class extends Original {
      constructor(...args) { super(...args); audit.contexts.push(this); }
      createBiquadFilter() { const filter = super.createBiquadFilter(); audit.filters.push(filter); return filter; }
      createMediaElementSource(audio) {
        const source = super.createMediaElementSource(audio), disconnect = source.disconnect.bind(source);
        source.disconnect = (...args) => { audit.disconnects += 1; return disconnect(...args); };
        audit.sources.push(source); return source;
      }
    };
  });
}

export async function checkMusicPlayerSound({ page, base, fail }) {
  try {
    await installMusicAudioAudit(page);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(`${base}/interfaces/music-player/`, { waitUntil: "domcontentloaded" });
    if (page.viewportSize()?.width === 1024) await page.addStyleTag({ content: ".if-specimen { width: 620px; max-width:100%; }" });
    const root = page.locator(".mp-player");
    await root.locator(".mp-track-list > li").first().waitFor();
    const settle = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const press = async control => { await control.focus(); await control.press("Enter"); await settle(); };
    await press(root.getByRole("button", { name: "Select Fortress Down by Loathe", exact: true }));
    await press(root.getByRole("button", { name: "Sound", exact: true }));
    assert.equal(await page.evaluate(() => window.__musicAudioAudit.contexts.length), 0, "Opening Sound must not create an audio context");
    const sound = root.locator(".mp-sound-panel");
    await sound.locator(".mp-analyser").scrollIntoViewIfNeeded();
    assert.equal(await sound.getAttribute("data-level"), "silent");
    await page.waitForFunction(() => document.querySelector(".mp-player")?.dataset.audioCompatibility === "available");
    await press(root.getByRole("group", { name: "Preview playback", exact: true }).getByRole("button", { name: "Play", exact: true }));
    await page.waitForFunction(() => document.querySelector(".mp-player audio")?.currentTime > .3 && document.querySelector(".mp-sound-panel")?.dataset.processing === "processed", null, { timeout: 25000 });
    assert.equal(await root.locator("audio").getAttribute("crossorigin"), "anonymous", "CORS-approved previews must use anonymous media requests");
    await press(root.getByRole("button", { name: "Pause", exact: true }));
    await press(root.getByRole("button", { name: "Sound", exact: true }));
    await root.locator('input[type="file"]').setInputFiles({ name: "personal-1khz.wav", mimeType: "audio/wav", buffer: tone() });
    await settle();
    await press(root.getByRole("button", { name: "Sound", exact: true }));
    await sound.locator(".mp-analyser").scrollIntoViewIfNeeded();
    await press(root.getByRole("group", { name: "Local audio playback", exact: true }).getByRole("button", { name: "Play", exact: true }));
    const expectedLevel = 20 * Math.log10(1000 / 32768 * .7 / Math.sqrt(2));
    await page.waitForFunction(expected => { const value = document.querySelector(".mp-sound-panel")?.dataset.level; return document.querySelector(".mp-player audio")?.currentTime > .3 && value !== "silent" && Math.abs(Number(value) - expected) < .5; }, expectedLevel);
    const baseline = Number(await sound.getAttribute("data-level"));
    const bands = await page.evaluate(() => window.__musicAudioAudit.filters.map(filter => [filter.frequency.value, filter.type]));
    assert.deepEqual(bands, [[80, "lowshelf"], [250, "peaking"], [1000, "peaking"], [4000, "peaking"], [12000, "highshelf"]]);
    assert(await sound.locator("svg rect").evaluateAll(bars => bars.some(bar => Number(bar.getAttribute("height")) > 2)), "A real tone must draw nonzero spectrum bars");
    const mid = root.getByRole("slider", { name: "1 kHz gain", exact: true });
    await mid.focus(); for (let index = 0; index < 6; index += 1) await mid.press("ArrowRight");
    await page.waitForFunction(() => window.__musicAudioAudit.filters[2].gain.value > 5.99);
    const response = await page.evaluate(() => { const magnitude = new Float32Array(1), phase = new Float32Array(1); window.__musicAudioAudit.filters[2].getFrequencyResponse(new Float32Array([1000]), magnitude, phase); return magnitude[0]; });
    assert(Math.abs(20 * Math.log10(response) - 6) < .05, `1 kHz response must increase by 6 dB, got ${response}`);
    await page.waitForFunction(value => Number(document.querySelector(".mp-sound-panel")?.dataset.level) > value + 5.5, baseline);
    const boosted = Number(await sound.getAttribute("data-level"));
    assert(boosted - baseline < 6.5, `Measured tone gain must match filter gain (${boosted - baseline} dB)`);
    await press(root.getByRole("button", { name: "Bypass equalizer", exact: true }));
    await page.waitForFunction(value => Math.abs(Number(document.querySelector(".mp-sound-panel")?.dataset.level) - value) < .5, baseline);
    assert.equal(await mid.inputValue(), "6", "Bypass must retain the draft equalizer setting");
    assert.equal(await mid.isDisabled(), true);
    await press(root.getByRole("button", { name: "Bypass equalizer", exact: true }));
    await press(root.getByRole("button", { name: "Reset equalizer", exact: true }));
    await page.waitForFunction(() => window.__musicAudioAudit.filters.every(filter => Math.abs(filter.gain.value) < .01));
    assert.deepEqual(await root.locator(".mp-eq-bands input").evaluateAll(inputs => inputs.map(input => input.value)), ["0", "0", "0", "0", "0"]);
    const volume = root.getByRole("slider", { name: "Volume", exact: true });
    const originalVolume = Number(await volume.inputValue());
    await volume.focus(); await volume.press("Home");
    for (let index = 0; index < Math.round(originalVolume / 2); index += 1) await volume.press("ArrowRight");
    await page.waitForFunction(value => Number(document.querySelector(".mp-sound-panel")?.dataset.level) < value - 5.5, baseline);
    await press(root.getByRole("button", { name: "Pause", exact: true }));
    await page.waitForFunction(() => document.querySelector(".mp-sound-panel")?.dataset.level === "silent");
    assert.equal(await sound.locator("svg rect").evaluateAll(bars => bars.every(bar => Number(bar.getAttribute("height")) === 0)), true);
    await press(root.getByRole("button", { name: "Play", exact: true }));
    await page.waitForFunction(() => document.querySelector(".mp-player audio")?.paused === false);
    assert.equal(await page.evaluate(() => window.__musicAudioAudit.contexts.length), 1, "Source changes must reuse the one audio context");
    assert.equal(await page.evaluate(() => window.__musicAudioAudit.sources.length), 2, "Each audio element must get only one media source across repeated Play requests");
    assert(await page.evaluate(() => window.__musicAudioAudit.disconnects >= 1), "The replaced preview source must be disconnected");
    if (await root.locator(".mp-mobile-nav").isVisible()) {
      const screens = root.getByRole("navigation", { name: "Listening screens" });
      await press(screens.getByRole("button", { name: "Queue", exact: true }));
      await page.waitForFunction(() => document.querySelector(".mp-sound-panel")?.dataset.level === "silent");
      assert.equal(await root.locator("audio").evaluate(audio => audio.paused), false, "Hidden Sound must stop drawing while audio continues");
      await press(screens.getByRole("button", { name: "Playing", exact: true }));
      await page.waitForFunction(() => document.querySelector(".mp-sound-panel")?.dataset.level !== "silent");
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForFunction(() => document.querySelector(".mp-sound-panel")?.textContent.includes("Visualizer held for reduced motion."));
    assert.equal(await sound.getAttribute("data-level"), "silent");
    assert.equal(await root.locator("audio").evaluate(audio => audio.paused), false, "Reduced motion must not stop requested audio");
    await page.evaluate(() => window.__musicAudioAudit.contexts[0].suspend());
    await page.waitForFunction(() => document.querySelector(".mp-player audio")?.paused === true && document.querySelector(".mp-status")?.textContent.includes("browser paused audio"));
    await press(root.getByRole("button", { name: "Play", exact: true }));
    await page.waitForFunction(() => window.__musicAudioAudit.contexts[0].state === "running" && document.querySelector(".mp-player audio")?.paused === false);
    await press(root.getByRole("button", { name: "Pause", exact: true }));
    const fit = await sound.evaluate(element => ({ overflow: element.scrollWidth - element.clientWidth, targets: [...element.querySelectorAll("button,input[type=range]")].filter(control => { const box = control.getBoundingClientRect(); return box.width < 43.5 || box.height < 43.5; }).map(control => control.getAttribute("aria-label")) }));
    assert(fit.overflow <= 1, `Sound pane overflow ${fit.overflow}`); assert.deepEqual(fit.targets, []);
    return { baseline, boosted, responseDb: 20 * Math.log10(response) };
  } catch (error) { fail(`Music Player sound: ${error instanceof Error ? error.message : String(error)}`); }
}

export async function checkMusicPlayerDirectAudio({ page, base, fail }) {
  const releaseProbes = new Set(), fixture = tone(), served = [];
  let refuseProbes = false;
  // Exercise real native playback without making the pending-probe assertion
  // depend on a third-party media server. The Sound check covers the live CDN.
  const mediaRoute = async route => {
    if (route.request().method() === "GET") {
      served.push(route.request().url());
      return route.fulfill({ status: 200, contentType: "audio/wav", body: fixture });
    }
    if (route.request().method() !== "HEAD") return route.continue();
    if (!refuseProbes) await new Promise(resolve => { releaseProbes.add(resolve); });
    await route.abort("failed").catch(() => {});
  };
  const release = () => { for (const resolve of releaseProbes) resolve(); releaseProbes.clear(); };
  try {
    await installMusicAudioAudit(page);
    await page.route("https://audio-ssl.itunes.apple.com/**", mediaRoute);
    await page.goto(`${base}/interfaces/music-player/`, { waitUntil: "domcontentloaded" });
    if (page.viewportSize()?.width === 1024) await page.addStyleTag({ content: ".if-specimen { width: 620px; max-width:100%; }" });
    const root = page.locator(".mp-player");
    await page.waitForFunction(() => Object.keys(document.querySelector(".mp-track") ?? {}).some(key => key.startsWith("__reactProps")));
    await page.evaluate(() => {
      const nativePlay = HTMLMediaElement.prototype.play;
      window.__musicDirectPlays = [];
      HTMLMediaElement.prototype.play = function (...args) {
        // Chromium exposes the currently executing native handler's event.
        // A delayed request can retain user activation but loses this event.
        const event = window.event;
        const activation = event?.type === "click" ? { trusted: event.isTrusted, keyboard: event.detail === 0 } : null;
        if (this.closest(".mp-player")) window.__musicDirectPlays.push({
          compatibility: this.closest(".mp-player").dataset.audioCompatibility,
          activation, userActive: navigator.userActivation.isActive,
          contexts: window.__musicAudioAudit.contexts.length,
          sources: window.__musicAudioAudit.sources.length,
          source: this.src,
        });
        return nativePlay.apply(this, args);
      };
    });
    const press = async control => { await control.focus(); await control.press("Enter"); };
    await press(root.getByRole("button", { name: "Select Fortress Down by Loathe", exact: true }));
    await press(root.getByRole("button", { name: "Sound", exact: true }));
    const playback = root.getByRole("group", { name: "Preview playback", exact: true });
    // The first source may already have reached its bounded probe timeout while
    // the UI loads. Choose a fresh source beside Play, after opening Sound.
    await press(playback.getByRole("button", { name: "Next track", exact: true }));
    await press(playback.getByRole("button", { name: "Play", exact: true }));
    const first = await page.evaluate(() => window.__musicDirectPlays[0]);
    assert.equal(first?.compatibility, "checking", "First Play must be requested while the fresh HEAD probe is pending");
    assert.deepEqual(first?.activation, { trusted: true, keyboard: true }, "Native Play must run synchronously within the trusted keyboard activation");
    assert.equal(first.userActive, true);
    assert.equal(first.contexts, 0); assert.equal(first.sources, 0);
    const audible = () => page.waitForFunction(() => {
      const audio = document.querySelector(".mp-player audio");
      return audio?.currentTime > .3 && !audio.paused && !audio.muted && audio.volume > 0 && audio.readyState >= 2 && document.querySelector(".mp-sound-panel")?.dataset.processing === "direct";
    }, null, { timeout: 10000 });
    await audible();
    assert.equal(await root.locator("audio").getAttribute("crossorigin"), null, "Direct native media must not require a CORS-enabled response");
    assert.equal(await root.getByRole("slider", { name: "1 kHz gain", exact: true }).isDisabled(), true);
    assert.match(await root.locator(".mp-sound-panel").textContent(), /Direct playback/);
    await press(playback.getByRole("button", { name: "Pause", exact: true }));
    // A refused probe must also permit first Play of a different, fresh element.
    refuseProbes = true; release();
    await press(playback.getByRole("button", { name: "Next track", exact: true }));
    await page.waitForFunction(() => document.querySelector(".mp-player")?.dataset.audioCompatibility === "direct");
    await press(playback.getByRole("button", { name: "Play", exact: true }));
    await audible();
    const second = await page.evaluate(() => window.__musicDirectPlays[1]);
    assert.equal(second?.compatibility, "direct");
    assert.notEqual(first.source, second.source, "The refused case must start a fresh audio element");
    assert.deepEqual(second.activation, { trusted: true, keyboard: true });
    assert.equal(second.userActive, true);
    assert.equal(await page.evaluate(() => window.__musicAudioAudit.contexts.length), 0, "Unverified and refused previews must stay on the native audio path");
    assert.equal(await page.evaluate(() => window.__musicAudioAudit.sources.length), 0, "A CORS-denied preview must not enter a MediaElementSource, which would silence it");
    assert.equal(await page.evaluate(() => window.__musicDirectPlays.length), 2, "Each preview requires its own explicit Play request");
    assert(served.includes(first.source) && served.includes(second.source), "Both cases must decode and play the generated WAV through native media requests");
    await press(playback.getByRole("button", { name: "Pause", exact: true }));
    return { pending: first, refused: second, nativeRequests: served.length };
  } catch (error) { fail(`Music Player direct audio: ${error instanceof Error ? error.message : String(error)}`); }
  finally { release(); await page.unroute("https://audio-ssl.itunes.apple.com/**", mediaRoute); }
}
