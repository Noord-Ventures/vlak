import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

async function show(page, name) {
  const nav = page.getByRole("navigation", { name: "Music workspace", exact: true });
  if (await nav.isVisible()) await nav.getByRole("button", { name, exact: true }).click();
}

export async function checkMusicInterface({ page, base, fail }) {
  try {
    await page.goto(`${base}/interfaces/music/`, { waitUntil: "networkidle" });
    await page.waitForFunction(() => Object.keys(document.querySelector(".mu-controls button") ?? {}).some(key => key.startsWith("__reactProps")));
    const mobileTrack = page.getByRole("combobox", { name: "Track to launch", exact: true });
    if (await mobileTrack.isVisible()) {
      const selectTrack = async name => {
        await mobileTrack.click();
        await page.getByRole("option", { name, exact: true }).click();
      };
      for (const [name, firstClip] of [["Drum machine", "Four on the floor"], ["Closed hats", "In between"], ["Round bass", "Rooted"], ["Soft keys", "Soft edges"]]) {
        await selectTrack(name);
        assert(await page.getByRole("button", { name: `Launch ${firstClip}, ${name}`, exact: true }).isVisible(), `phone launcher cannot reach ${name}`);
        assert.equal(await page.locator(".mu-clip:visible").count(), 4, "phone launcher should present all four clips for the chosen track");
        const fit = await page.locator(".mu-matrix-viewport").evaluate(element => element.scrollWidth - element.clientWidth);
        assert(fit <= 1, "phone launcher still requires panning a desktop matrix");
      }
      const lastClip = page.getByRole("button", { name: "Launch Night air, Soft keys", exact: true });
      await lastClip.click();
      await page.getByRole("heading", { name: "Night air", exact: true }).waitFor({ state: "visible" });
      await page.waitForFunction(() => {
        const viewport = document.querySelector(".mu-workspace")?.getBoundingClientRect();
        const heading = document.querySelector(".mu-editor h2")?.getBoundingClientRect();
        return viewport && heading && heading.top >= viewport.top && heading.bottom <= viewport.bottom;
      });
      assert.equal(await page.getByRole("textbox", { name: "Clip name", exact: true }).inputValue(), "Night air");
      await page.getByRole("button", { name: "Back to session clips", exact: true }).click();
      await page.waitForFunction(() => document.activeElement?.getAttribute("aria-label") === "Launch Night air, Soft keys");
      assert(await lastClip.evaluate(element => {
        const viewport = element.closest(".mu-workspace").getBoundingClientRect(), target = element.getBoundingClientRect();
        return target.top >= viewport.top && target.bottom <= viewport.bottom;
      }), "Back lost the phone launcher's reading position");
      await page.locator(".mu-track-heading:visible").click();
      assert(await page.getByRole("group", { name: "Soft keys channel", exact: true }).isVisible());
      await page.getByRole("button", { name: "Back to session tracks", exact: true }).click();
      await page.waitForFunction(() => document.activeElement?.classList.contains("mu-track-heading"));
      await selectTrack("Drum machine");
      assert(await page.getByRole("status", { name: "Play position", exact: true }).isVisible(), "phone transport hides the actual play position");
    }
    await show(page, "Clip");
    const editor = page.getByRole("region", { name: "Clip editor", exact: true });
    if (await page.getByRole("navigation", { name: "Music workspace", exact: true }).isVisible()) {
      const targets = await editor.locator(".mu-step").evaluateAll(elements => elements.map(element => { const box = element.getBoundingClientRect(); return { x: box.x, y: box.y, right: box.right, width: box.width, height: box.height }; }));
      const pattern = await editor.locator(".mu-pattern-viewport").boundingBox();
      assert(pattern);
      assert.equal(new Set(targets.map(target => Math.round(target.y))).size, 4, "phone step editor is not grouped into four beats");
      assert.equal(targets.length, 16);
      assert(targets.every(target => target.width >= 44 && target.height >= 44 && target.x >= pattern.x && target.right <= pattern.x + pattern.width + 1), "phone step controls are too small or require horizontal panning");
      const sixteenth = editor.getByRole("button", { name: "Step 16", exact: true });
      const previous = await sixteenth.getAttribute("aria-pressed");
      await sixteenth.click();
      assert.notEqual(await sixteenth.getAttribute("aria-pressed"), previous, "the final phone beat is not editable");
      await sixteenth.click();
    }
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
    await page.getByRole("button", { name: "Save project file", exact: true }).click();
    const project = JSON.parse(readFileSync(await (await saved).path(), "utf8"));
    assert.equal(project.schema, "vlak.project"); assert.equal(project.kind, "music");
    assert.equal(project.payload.tempo, 120); assert.equal(project.payload.tracks[0].clips[1].name, "New rhythm"); assert.equal(project.payload.tracks[0].active, 1);
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
