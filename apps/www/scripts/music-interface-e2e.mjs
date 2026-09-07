import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

async function show(page, name) {
  const nav = page.getByRole("navigation", { name: "Music workspace", exact: true });
  if (await nav.isVisible()) await nav.getByRole("button", { name, exact: true }).click();
}

export async function checkMusicInterface({ page, base, fail }) {
  try {
    await page.goto(`${base}/interfaces/music/`, { waitUntil: "networkidle" });
    await show(page, "Clip");
    const editor = page.getByRole("region", { name: "Clip editor", exact: true });
    const second = editor.getByRole("button", { name: "Step 2", exact: true });
    assert.equal(await second.getAttribute("aria-pressed"), "false");
    await second.focus(); await page.keyboard.press("Space");
    assert.equal(await second.getAttribute("aria-pressed"), "true");
    await page.keyboard.press("ArrowRight");
    assert.equal(await page.locator(":focus").getAttribute("aria-label"), "Step 3");
    await editor.getByRole("button", { name: "Clear", exact: true }).click();
    assert.equal(await editor.locator('[aria-pressed="true"]').count(), 0);
    await page.getByRole("spinbutton", { name: "Tempo", exact: true }).fill("124");
    await editor.getByRole("button", { name: "Undo", exact: true }).click();
    assert.equal(await second.getAttribute("aria-pressed"), "true");
    assert.equal(await page.getByRole("spinbutton", { name: "Tempo", exact: true }).inputValue(), "124", "Clip undo preserves unrelated tempo changes");

    await show(page, "Session");
    await page.getByRole("button", { name: "Launch Open space", exact: true }).click();
    await show(page, "Clip");
    assert.equal(await editor.getByRole("textbox", { name: "Clip name", exact: true }).inputValue(), "Half time");
    await editor.getByRole("textbox", { name: "Clip name", exact: true }).fill("New rhythm");
    await show(page, "Session");
    assert(await page.getByRole("button", { name: "Launch New rhythm, Drum machine", exact: true }).isVisible());

    await page.getByRole("spinbutton", { name: "Tempo", exact: true }).fill("120");
    await page.getByRole("button", { name: "Play session", exact: true }).click();
    await page.waitForFunction(() => document.querySelector('.mu-position')?.textContent.replace(/\s/g, "") !== "01.1.1", null, { timeout: 10000 });
    await page.waitForFunction(() => [...document.querySelectorAll('.mu-mixer meter')].some(meter => meter.value > -55), null, { timeout: 10000 });
    await show(page, "Mixer");
    const channel = page.getByRole("group", { name: "Drum machine channel", exact: true });
    await channel.getByRole("button", { name: "Mute", exact: true }).click();
    assert.equal(await channel.getByRole("button", { name: "Mute", exact: true }).getAttribute("aria-pressed"), "true");
    await channel.getByRole("button", { name: "Mute", exact: true }).click();
    await page.getByRole("button", { name: "Stop playback", exact: true }).click();
    assert(await page.getByRole("button", { name: "Play session", exact: true }).isVisible());

    const saved = page.waitForEvent("download");
    await page.getByRole("button", { name: "Save session", exact: true }).click();
    const project = JSON.parse(readFileSync(await (await saved).path(), "utf8"));
    assert.equal(project.tempo, 120); assert.equal(project.tracks[0].clips[1].name, "New rhythm"); assert.equal(project.tracks[0].active, 1);
    const exported = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export audio", exact: true }).click();
    const audio = readFileSync(await (await exported).path());
    assert.equal(audio.subarray(0, 4).toString(), "RIFF"); assert.equal(audio.subarray(8, 12).toString(), "WAVE");
    assert.equal(audio.readUInt16LE(22), 2); assert.equal(audio.readUInt32LE(24), 44100); assert.equal(audio.readUInt16LE(34), 16);
    assert(audio.length > 1_000_000);
    let peak = 0; for (let offset = 44; offset < audio.length; offset += 2) peak = Math.max(peak, Math.abs(audio.readInt16LE(offset)));
    assert(peak > 1000, "Export should contain audible synthesized audio");
    console.log(`${page.viewportSize().width}px: music editing, transport, real signal, mixer and stereo export passed`);
  } catch (error) { fail(`Music session: ${error.message}`); }
}
