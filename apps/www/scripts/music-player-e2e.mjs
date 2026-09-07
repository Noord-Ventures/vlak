import assert from "node:assert/strict";

function wave(seconds = 1.6) {
  const count = Math.floor(seconds * 8000), buffer = Buffer.alloc(44 + count * 2);
  buffer.write("RIFF"); buffer.writeUInt32LE(buffer.length - 8, 4); buffer.write("WAVEfmt ", 8); buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20); buffer.writeUInt16LE(1, 22); buffer.writeUInt32LE(8000, 24); buffer.writeUInt32LE(16000, 28); buffer.writeUInt16LE(2, 32); buffer.writeUInt16LE(16, 34); buffer.write("data", 36); buffer.writeUInt32LE(count * 2, 40);
  for (let index = 0; index < count; index += 1) buffer.writeInt16LE(Math.round(Math.sin(index / 8000 * 220 * 2 * Math.PI) * 1000), 44 + index * 2);
  return buffer;
}

export async function checkMusicPlayer({ page, base, fail }) {
  try {
    await page.goto(`${base}/interfaces/music-player/`, { waitUntil: "domcontentloaded" });
    if (page.viewportSize()?.width === 1024) await page.addStyleTag({ content: ".if-specimen { width: 620px; max-width:100%; }" });
    const root = page.locator(".mp-player");
    await root.locator(".mp-track-list > li").first().waitFor();
    const settle = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const press = async control => { await control.focus(); await control.press("Enter"); await settle(); };
    const mobile = await root.locator(".mp-mobile-nav").isVisible();
    const screen = async name => {
      if (mobile) await press(root.getByRole("navigation", { name: "Listening screens" }).getByRole("button", { name, exact: true }));
      else if (name === "Queue" && !await root.locator(".mp-queue").isVisible()) await press(root.locator(".mp-queue-toggle"));
      else if (name === "Library" && !await root.locator(".mp-library").isVisible()) await press(root.getByRole("button", { name: "Close queue", exact: true }));
    };
    assert.equal(await root.locator(".mp-track-list > li").count(), 23);
    await press(root.getByRole("button", { name: "Favorite Fortress Down", exact: true }));
    await press(root.getByRole("group", { name: "Library filter" }).getByRole("button", { name: "Favorites", exact: true }));
    assert.equal(await root.locator(".mp-track-list > li").count(), 1);
    await press(root.getByRole("button", { name: "Select Fortress Down by Loathe", exact: true }));
    await screen("Playing");
    assert.equal(await root.locator("audio").evaluate(audio => audio.paused), true, "Selecting a preview must not autoplay");
    const preview = root.getByRole("group", { name: "Preview playback", exact: true });
    await press(preview.getByRole("button", { name: "Play", exact: true }));
    await page.waitForFunction(() => { const audio = document.querySelector(".mp-player audio"); return audio && !audio.paused && audio.currentTime > .3 && audio.duration > 29 && audio.duration < 31; }, null, { timeout: 25000 });
    assert.equal(await root.getAttribute("data-playing"), "true");
    await press(preview.getByRole("button", { name: "Pause", exact: true }));
    const seek = root.getByRole("slider", { name: "Preview position", exact: true });
    await seek.focus(); await seek.press("ArrowRight"); await settle();
    assert(await root.locator("audio").evaluate(audio => audio.currentTime > .3), "Seek must change actual audio position");
    await press(root.getByRole("button", { name: "Mute audio", exact: true }));
    assert.equal(await root.locator("audio").evaluate(audio => audio.muted), true);
    await press(preview.getByRole("button", { name: "Play", exact: true }));
    await root.locator("audio").evaluate(audio => { audio.currentTime = audio.duration - .08; });
    await page.waitForFunction(() => document.querySelector(".mp-player audio")?.ended === true);
    assert.equal(await root.locator(".mp-title h2").textContent(), "Fortress Down", "Preview completion must retain the selected track");
    assert.equal(await root.locator("audio").evaluate(audio => audio.paused), true, "Preview completion must stop");
    assert.match(await root.locator(".mp-status").textContent(), /Preview finished/);
    await root.locator('input[type="file"]').setInputFiles({ name: "personal-a.wav", mimeType: "audio/wav", buffer: wave(2.2) });
    await settle();
    const local = root.getByRole("group", { name: "Local audio playback", exact: true });
    await press(local.getByRole("button", { name: "Play", exact: true }));
    await page.waitForFunction(() => { const audio = document.querySelector(".mp-player audio"); return audio?.currentTime > .15 && audio.src.startsWith("blob:"); });
    assert.equal(await root.locator("audio").evaluate(audio => audio.muted), true, "Mute preference must survive source replacement");
    await press(local.getByRole("button", { name: "Pause", exact: true }));
    await screen("Queue");
    await press(root.getByRole("button", { name: "Move Fortress Down down", exact: true }));
    assert.match(await root.locator(".mp-queue-scroll li").nth(1).textContent(), /Fortress Down/);
    await press(root.getByRole("button", { name: "Remove Fortress Down from queue", exact: true }));
    assert.equal(await root.locator(".mp-queue-scroll li").count(), 22);
    await press(root.getByRole("button", { name: "Restore playlist order", exact: true }));
    assert.equal(await root.locator(".mp-queue-scroll li").count(), 23);
    await press(root.getByRole("button", { name: "Select queued Silk In the Strings", exact: true }));
    await screen("Playing");
    await root.locator('input[type="file"]').setInputFiles({ name: "personal-b.wav", mimeType: "audio/wav", buffer: wave(2) });
    await settle();
    await screen("Queue");
    await press(root.getByRole("button", { name: "Repeat local audio: off", exact: true }));
    await screen("Playing");
    await press(root.getByRole("group", { name: "Local audio playback", exact: true }).getByRole("button", { name: "Play", exact: true }));
    await page.waitForFunction(() => document.querySelector(".mp-player audio")?.currentTime > .1);
    await root.locator("audio").evaluate(audio => { audio.currentTime = audio.duration - .05; });
    await page.waitForFunction(() => { const audio = document.querySelector(".mp-player audio"); return audio && !audio.paused && audio.currentTime > .08 && audio.currentTime < 1; });
    assert.equal(await root.locator(".mp-title h2").textContent(), "Silk In the Strings", "Repeat one must replay the local file");
    await press(root.getByRole("group", { name: "Local audio playback", exact: true }).getByRole("button", { name: "Pause", exact: true }));
    await screen("Queue");
    await press(root.getByRole("button", { name: "Repeat local audio: one", exact: true }));
    await press(root.getByRole("button", { name: "Select queued Fortress Down", exact: true }));
    await screen("Playing");
    await press(root.getByRole("group", { name: "Local audio playback", exact: true }).getByRole("button", { name: "Play", exact: true }));
    await page.waitForFunction(() => document.querySelector(".mp-player audio")?.currentTime > .1);
    await root.locator("audio").evaluate(audio => { audio.currentTime = audio.duration - .05; });
    await page.waitForFunction(() => document.querySelector(".mp-title h2")?.textContent === "Silk In the Strings" && document.querySelector(".mp-player audio")?.currentTime > .1);
    assert.equal(await root.locator("audio").evaluate(audio => !audio.paused && audio.src.startsWith("blob:")), true, "Only attached local files may advance automatically");
    await press(root.getByRole("group", { name: "Local audio playback", exact: true }).getByRole("button", { name: "Pause", exact: true }));
    await press(root.getByRole("button", { name: "Use preview", exact: true }));
    assert.equal(await root.locator("audio").evaluate(audio => audio.src.startsWith("https://audio-ssl.itunes.apple.com/")), true);
    assert.equal(await root.locator("audio").evaluate(audio => audio.paused), true, "Switching back to a preview must never autoplay");
    await screen("Library");
    await press(root.getByRole("group", { name: "Library filter" }).getByRole("button", { name: "All tracks", exact: true }));
    await root.getByRole("textbox", { name: "Search tracks", exact: true }).fill("Kiasmos");
    await settle(); assert.equal(await root.locator(".mp-track-list > li").count(), 1);
    await root.getByRole("textbox", { name: "Search tracks", exact: true }).fill(""); await settle();
    const fit = await root.evaluate(element => ({ overflow: element.scrollWidth - element.clientWidth, targets: [...element.querySelectorAll("button,input[type=range],a")].filter(control => control.getClientRects().length && getComputedStyle(control).visibility !== "hidden").filter(control => { const box = control.getBoundingClientRect(); return box.width < 43.5 || box.height < 43.5; }).map(control => control.getAttribute("aria-label") || control.textContent) }));
    assert(fit.overflow <= 1, `Music player overflow ${fit.overflow}`); assert.deepEqual(fit.targets, [], "Music controls need 44px reach");
  } catch (error) { fail(`Music Player: ${error instanceof Error ? error.message : String(error)}`); }
}
