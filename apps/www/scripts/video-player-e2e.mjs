import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Deterministic integration fixture for the official iframe API contract.
// This checks our controls and lifecycle, not YouTube streaming availability.
const apiFixture = `
window.videoApiCalls = [];
window.YT = { Player: class {
  constructor(frame, {events}) {
    this.frame = frame; this.events = events; this.time = 0; this.volume = 100; this.muted = false; this.rate = 1; this.state = 5;
    window.videoApiPlayer = this;
    setTimeout(() => events.onReady({target:this}), 0);
  }
  change(state) { this.state = state; this.events.onStateChange({target:this,data:state}); }
  playVideo() { window.videoApiCalls.push('play'); this.change(1); }
  pauseVideo() { window.videoApiCalls.push('pause'); this.change(2); }
  seekTo(time) { window.videoApiCalls.push(['seek',time]); this.time = time; }
  getCurrentTime() { return this.time; }
  getDuration() { return 240; }
  getVideoLoadedFraction() { return .5; }
  getVolume() { return this.volume; }
  setVolume(volume) { this.volume = volume; }
  isMuted() { return this.muted; }
  mute() { this.muted = true; }
  unMute() { this.muted = false; }
  getPlaybackRate() { return this.rate; }
  setPlaybackRate(rate) { this.rate = rate; }
  getAvailablePlaybackRates() { return [.5,1,1.5,2]; }
  getPlayerState() { return this.state; }
  destroy() { window.videoApiCalls.push('destroy'); this.frame.remove(); }
}};
window.onYouTubeIframeAPIReady?.();
`;

const vimeoFixture = `
window.Vimeo = { Player: class {
  constructor(frame) { this.frame=frame; this.listeners={}; this.time=0; this.volume=1; this.muted=false; this.rate=1; this.state=5; window.videoApiPlayer=this; }
  ready() { return Promise.resolve(); }
  on(name,callback) { (this.listeners[name]??=[]).push(callback); }
  emit(name,data={}) { for(const callback of this.listeners[name]??[]) callback(data); }
  getDuration() { return Promise.resolve(225); }
  getCurrentTime() { return Promise.resolve(this.time); }
  getVolume() { return Promise.resolve(this.volume); }
  getMuted() { return Promise.resolve(this.muted); }
  getPlaybackRate() { return Promise.resolve(this.rate); }
  getPaused() { return Promise.resolve(this.state!==1); }
  play() { this.state=1; window.videoApiCalls.push('vimeo-play'); this.emit('play'); return Promise.resolve(); }
  pause() { this.state=2; this.emit('pause'); return Promise.resolve(); }
  setCurrentTime(time) { return new Promise(resolve => setTimeout(() => { this.time=time; this.emit('timeupdate',{seconds:time,duration:225}); resolve(time); }, 350)); }
  setVolume(volume) { if(this.rejectVolume){this.emit('error',{method:'setVolume'});return Promise.reject(new Error('Volume unavailable'));} this.volume=volume; this.emit('volumechange',{volume,muted:this.muted}); return Promise.resolve(volume); }
  setMuted(muted) { this.muted=muted; this.emit('volumechange',{volume:this.volume}); return Promise.resolve(muted); }
  setPlaybackRate(rate) { this.rate=rate; this.emit('playbackratechange',{playbackRate:rate}); return Promise.resolve(rate); }
  destroy() { window.videoApiCalls.push('vimeo-destroy'); this.frame.remove(); return Promise.resolve(); }
}};
`;

export async function checkVideoPlayer({ page, base, fail }) {
  const apiPattern = "https://www.youtube.com/iframe_api", embedPattern = "https://www.youtube.com/embed/**";
  const vimeoApiPattern = "https://player.vimeo.com/api/player.js", vimeoEmbedPattern = "https://player.vimeo.com/video/**", vimeoPosterPattern = "https://i.vimeocdn.com/video/**";
  const configuration = JSON.parse(readFileSync(new URL("../../../vercel.json", import.meta.url), "utf8"));
  const headers = Object.fromEntries(configuration.headers.find(item => item.source === "/(.*)").headers.map(item => [item.key.toLowerCase(), item.value]));
  const documentPattern = `${base}/interfaces/video-player/`;
  const policyUrl = `${base}/__video-csp-check`;
  const posterPattern = "https://i.ytimg.com/vi/MSUGmeWqbCY/hqdefault.jpg";
  try {
    await page.route(apiPattern, route => route.fulfill({ contentType: "application/javascript", body: apiFixture }));
    await page.route(vimeoApiPattern, route => route.fulfill({ contentType: "application/javascript", body: vimeoFixture }));
    await page.route(vimeoEmbedPattern, route => route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Vimeo API integration fixture</title>" }));
    await page.route(embedPattern, route => route.fulfill({ contentType: "text/html", body: '<!doctype html><html lang="en"><title>Official iframe API fixture</title><body style="background:#111;color:#eee">YouTube API integration fixture</body></html>' }));
    await page.goto(documentPattern, { waitUntil: "networkidle" });
    if (page.viewportSize()?.width === 1024) await page.addStyleTag({ content: ".if-specimen { width:620px; max-width:100%; }" });
    const root = page.locator(".vp"), frame = root.locator("iframe");
    await page.waitForFunction(() => document.querySelector(".vp")?.getAttribute("data-ready") === "true");
    const press = async control => { await control.focus(); await control.press("Enter"); };
    const mobile = await root.locator(".vp-mobile-nav").isVisible();
    const playlist = async () => { if (mobile) await press(root.getByRole("navigation", { name: "Video screens" }).getByRole("button", { name: "Playlist", exact: true })); };
    assert.equal(await root.locator('input[type="file"]').count(), 0, "This is a curated music video player");
    assert.equal(await root.locator(".vp-file-list > li").count(), 3);
    assert.equal(await frame.getAttribute("referrerpolicy"), "strict-origin-when-cross-origin");
    const source = new URL(await frame.getAttribute("src"));
    assert.equal(source.origin, "https://www.youtube.com");
    assert.equal(source.pathname, "/embed/eYoINidnLRQ");
    assert.equal(source.searchParams.get("origin"), new URL(base).origin);
    assert.equal(source.searchParams.get("controls"), "1", "YouTube controls remain available");
    assert.equal(source.searchParams.get("playsinline"), "1");
    assert.equal(await root.getAttribute("data-playing"), "false", "Opening the page does not autoplay");
    assert.equal(await root.getByRole("slider", { name: "Video position", exact: true }).getAttribute("max"), "240", "Duration comes from the player API");
    await press(root.getByRole("button", { name: "Play", exact: true }));
    await page.waitForFunction(() => document.querySelector(".vp")?.getAttribute("data-playing") === "true");
    await press(root.getByRole("button", { name: "Pause", exact: true }));
    await root.getByRole("slider", { name: "Video position", exact: true }).fill("42");
    assert.equal(await page.evaluate(() => window.videoApiPlayer.time), 42);
    await root.getByRole("slider", { name: "Video volume", exact: true }).fill("0.4");
    assert.equal(await page.evaluate(() => window.videoApiPlayer.volume), 40, "Volume preference matches the controlled API");
    await press(root.getByRole("button", { name: "Mute video", exact: true }));
    assert.equal(await page.evaluate(() => window.videoApiPlayer.muted), true);
    await root.getByRole("combobox", { name: "Video playback speed", exact: true }).selectOption("1.5");
    await page.waitForFunction(() => document.querySelector('.vp select')?.value === "1.5");
    await press(root.getByRole("button", { name: "Loop", exact: true }));
    await page.evaluate(() => window.videoApiPlayer.change(0));
    assert.equal(await page.evaluate(() => window.videoApiPlayer.time), 0, "Loop seeks through the real API contract");
    assert.equal(await page.evaluate(() => window.videoApiPlayer.state), 1);
    await playlist();
    if (mobile) assert.equal(await page.evaluate(() => window.videoApiPlayer.state), 2, "Opening Playlist pauses hidden playback");
    await press(root.getByRole("button", { name: "Play Loathe, Two-Way Mirror", exact: true }));
    await page.waitForFunction(() => document.querySelector(".vp")?.getAttribute("data-video") === "MSUGmeWqbCY" && document.querySelector(".vp")?.getAttribute("data-ready") === "true");
    assert.equal(await page.evaluate(() => window.videoApiPlayer.volume), 40);
    assert.equal(await page.evaluate(() => window.videoApiPlayer.muted), true);
    assert.equal(await page.evaluate(() => window.videoApiPlayer.rate), 1.5);
    assert(await page.evaluate(() => window.videoApiCalls.includes("destroy")), "Changing films disposes the old player");
    await playlist();
    await press(root.getByRole("button", { name: "Play Woodkid, Iron", exact: true }));
    await page.waitForFunction(() => document.querySelector(".vp")?.getAttribute("data-video") === "21604065" && document.querySelector(".vp")?.getAttribute("data-ready") === "true");
    assert.equal(await root.getAttribute("data-provider"), "vimeo");
    assert.equal(new URL(await frame.getAttribute("src")).origin, "https://player.vimeo.com");
    assert.equal(await root.getByRole("link", { name: "Watch on Vimeo", exact: true }).getAttribute("href"), "https://vimeo.com/21604065");
    await root.getByRole("slider", { name: "Video position", exact: true }).fill("12");
    await page.waitForFunction(() => window.videoApiPlayer.time === 12 && document.querySelector('input[aria-label="Video position"]')?.value === "12");
    await root.getByRole("slider", { name: "Video position", exact: true }).press("Home");
    await page.waitForFunction(() => window.videoApiPlayer.time === 0 && document.querySelector('input[aria-label="Video position"]')?.value === "0");
    await root.getByRole("slider", { name: "Video volume", exact: true }).fill("0.6");
    assert.equal(await page.evaluate(() => window.videoApiPlayer.volume), .6, "Vimeo volume is normalized to its 0–1 range");
    await root.getByRole("combobox", { name: "Video playback speed", exact: true }).selectOption("2");
    await page.waitForFunction(() => window.videoApiPlayer.rate === 2);
    await page.evaluate(() => { window.videoApiPlayer.rejectVolume = true; });
    await root.getByRole("slider", { name: "Video volume", exact: true }).fill("0.2");
    await page.waitForFunction(() => document.querySelector('input[aria-label="Video volume"]')?.value === "0.6");
    assert.equal(await root.getAttribute("data-player-error"), null, "A rejected Vimeo control is not a terminal playback error");
    assert.equal(await page.evaluate(() => window.videoApiPlayer.volume), .6, "Rejected commands preserve the confirmed value");
    await page.evaluate(() => window.videoApiPlayer.emit("error"));
    await root.getByRole("button", { name: "Retry video", exact: true }).waitFor();
    assert.equal(await root.getByRole("link", { name: "Open on Vimeo", exact: true }).getAttribute("href"), "https://vimeo.com/21604065");
    assert.match(await root.locator(".vp-status").textContent(), /Vimeo could not play/);
    await press(root.getByRole("button", { name: "Retry video", exact: true }));
    await page.waitForFunction(() => document.querySelector(".vp")?.getAttribute("data-ready") === "true" && !document.querySelector('.vp-recovery'));
    const full = root.getByRole("button", { name: "Full screen", exact: true });
    if (await full.count()) {
      await press(full); await page.waitForFunction(() => document.fullscreenElement?.classList.contains("vp-viewer"));
      await press(root.getByRole("button", { name: "Exit full screen", exact: true })); await page.waitForFunction(() => !document.fullscreenElement);
    }
    const fit = await root.evaluate(element => ({ overflow: element.scrollWidth - element.clientWidth, short: [...element.querySelectorAll("button,input[type=range],select,summary,a")].filter(control => control.getClientRects().length && getComputedStyle(control).visibility !== "hidden").filter(control => { const box = control.getBoundingClientRect(); return box.width < 43.5 || box.height < 43.5; }).map(control => control.getAttribute("aria-label") || control.textContent) }));
    assert(fit.overflow <= 1, `Video player overflow: ${fit.overflow}`); assert.deepEqual(fit.short, [], "Every video control needs 44px reach");
    // A standalone document exercises the production policy in a browser without
    // Next dev's eval-based source maps, which production correctly disallows.
    await page.route(posterPattern, route => route.fulfill({ contentType: "image/png", body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jR1kAAAAASUVORK5CYII=", "base64") }));
    await page.route(vimeoPosterPattern, route => route.fulfill({ contentType: "image/png", body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jR1kAAAAASUVORK5CYII=", "base64") }));
    await page.route(policyUrl, route => route.fulfill({ contentType: "text/html", headers: { "content-security-policy": headers["content-security-policy"], "referrer-policy": headers["referrer-policy"] }, body: `<!doctype html><html lang="en"><title>Video CSP fixture</title><body><script>window.cspViolations=[];document.addEventListener('securitypolicyviolation',event=>window.cspViolations.push(event.violatedDirective));</script><script src="https://www.youtube.com/iframe_api"></script><iframe title="YouTube policy fixture" referrerpolicy="strict-origin-when-cross-origin" src="https://www.youtube.com/embed/MSUGmeWqbCY" onload="window.frameAllowed=true"></iframe><img alt="" src="https://i.ytimg.com/vi/MSUGmeWqbCY/hqdefault.jpg" onload="window.posterAllowed=true"><script src="https://player.vimeo.com/api/player.js"></script><iframe title="Vimeo policy fixture" src="https://player.vimeo.com/video/21604065" onload="window.vimeoFrameAllowed=true"></iframe><img alt="" src="https://i.vimeocdn.com/video/fixture.jpg" onload="window.vimeoPosterAllowed=true"></body></html>` }));
    await page.goto(policyUrl, { waitUntil: "networkidle" });
    assert.equal(await page.evaluate(() => Boolean(window.YT?.Player && window.frameAllowed && window.posterAllowed && window.Vimeo?.Player && window.vimeoFrameAllowed && window.vimeoPosterAllowed)), true, "Production CSP permits the official API, iframe and thumbnails");
    assert.deepEqual(await page.evaluate(() => window.cspViolations), []);

  } catch (error) { fail(`Video player API integration: ${error instanceof Error ? error.message : String(error)}`); }
  finally { await page.unroute(vimeoApiPattern); await page.unroute(vimeoEmbedPattern); await page.unroute(vimeoPosterPattern); await page.unroute(apiPattern); await page.unroute(embedPattern); await page.unroute(policyUrl); await page.unroute(posterPattern); }
}
