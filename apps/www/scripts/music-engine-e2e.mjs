import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

export async function checkMusicEngineTail({ page, base, fail }) {
  try {
    await page.goto(`${base}/interfaces/music/`, { waitUntil: "networkidle" });
    await page.getByRole("spinbutton", { name: "Tempo", exact: true }).fill("60");
    await page.getByRole("button", { name: "Launch Soft edges, Soft keys", exact: true }).click();
    const editor = page.getByRole("region", { name: "Clip editor", exact: true });
    const lastStep = editor.getByRole("button", { name: "Step 16", exact: true });
    assert.equal(await lastStep.getAttribute("aria-pressed"), "false");
    await lastStep.click();
    const exported = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export audio", exact: true }).click();
    const audio = readFileSync(await (await exported).path());
    assert.equal(audio.subarray(0, 4).toString(), "RIFF");
    const rate = audio.readUInt32LE(24);
    const frameBytes = audio.readUInt16LE(32);
    const duration = audio.readUInt32LE(40) / frameBytes / rate;
    assert(duration >= 18.25, "Slow-tempo export must include the last keys note's full 2.5-beat release");
    let tailPeak = 0;
    for (let offset = 44 + Math.floor(17.5 * rate) * frameBytes; offset < audio.length; offset += 2) {
      tailPeak = Math.max(tailPeak, Math.abs(audio.readInt16LE(offset)));
    }
    assert(tailPeak > 0, "The keys release must remain in the export beyond the former 1.5-second tail");
    console.log(`${page.viewportSize().width}px: slow-tempo final-step keys release exported in full (${duration}s)`);
  } catch (error) { fail(`Music release tail: ${error.message}`); }
}
