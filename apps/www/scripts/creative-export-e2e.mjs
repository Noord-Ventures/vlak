import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium } from "playwright";

const base = (process.env.BASE_URL ?? "http://127.0.0.1:3016").replace(/\/$/, "");
const browser = await chromium.launch(process.env.PLAYWRIGHT_EXECUTABLE_PATH
  ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
  : undefined);

function pngSize(bytes) {
  assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", "export must have a PNG signature");
  assert.equal(bytes.subarray(12, 16).toString("ascii"), "IHDR", "PNG must begin with an IHDR chunk");
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

function wavHeader(bytes) {
  assert(bytes.length >= 44, "WAV export must include a complete header");
  assert.equal(bytes.subarray(0, 4).toString("ascii"), "RIFF");
  assert.equal(bytes.subarray(8, 12).toString("ascii"), "WAVE");
  assert.equal(bytes.subarray(12, 16).toString("ascii"), "fmt ");
  assert.equal(bytes.readUInt16LE(20), 1, "WAV must use integer PCM");
  assert.equal(bytes.readUInt16LE(22), 2, "WAV must be stereo");
  assert.equal(bytes.readUInt32LE(24), 44_100);
  assert.equal(bytes.readUInt16LE(34), 16, "WAV must use 16-bit samples");
  assert.equal(bytes.subarray(36, 40).toString("ascii"), "data");
  assert.equal(bytes.readUInt32LE(4) + 8, bytes.length, "RIFF length must cover the full file");
  assert.equal(bytes.readUInt32LE(40) + 44, bytes.length, "data length must cover every PCM frame");
  let leftEnergy = 0; let rightEnergy = 0;
  for (let offset = 44; offset < bytes.length; offset += 4) {
    leftEnergy += Math.abs(bytes.readInt16LE(offset));
    rightEnergy += Math.abs(bytes.readInt16LE(offset + 2));
  }
  assert(leftEnergy > 0 && rightEnergy > 0, "the restored solo channel must render audible stereo PCM");
  assert(leftEnergy > rightEnergy * 1.1, "the restored left pan must be present in the rendered PCM");
}

async function downloaded(page, click) {
  const event = page.waitForEvent("download", { timeout: 30_000 });
  await click();
  const download = await event;
  const path = await download.path();
  assert(path, `download ${download.suggestedFilename()} did not produce a local file`);
  return { bytes: await readFile(path), filename: download.suggestedFilename(), path };
}

async function projectFile(page, tools) {
  const item = await downloaded(page, () => tools.getByRole("button", { name: "Save project file" }).click());
  return { ...item, project: JSON.parse(item.bytes.toString("utf8")) };
}

async function restoreFile(page, tools, path) {
  await tools.locator('input[type="file"]').setInputFiles(path);
  const dialog = page.locator("dialog[open]");
  await dialog.getByRole("heading", { name: /^Open .+\?$/ }).waitFor();
  await dialog.getByRole("button", { name: "Open project" }).click();
  await dialog.waitFor({ state: "hidden" });
}

async function pixelFingerprint(page, bytes) {
  return page.evaluate(async encoded => {
    const raw = atob(encoded);
    const data = new Uint8Array(raw.length);
    for (let index = 0; index < raw.length; index++) data[index] = raw.charCodeAt(index);
    const image = await createImageBitmap(new Blob([data], { type: "image/png" }));
    const canvas = document.createElement("canvas");
    canvas.width = 96; canvas.height = 96;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Canvas fingerprint context unavailable");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    image.close();
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let hash = 2166136261;
    for (const value of pixels) { hash ^= value; hash = Math.imul(hash, 16777619); }
    return hash >>> 0;
  }, bytes.toString("base64"));
}

async function checkWallpaper(context) {
  const page = await context.newPage();
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob = function delayed(callback, ...args) {
      return original.call(this, blob => window.setTimeout(() => callback(blob), 200), ...args);
    };
  });
  await page.goto(`${base}/interfaces/graphics/`, { waitUntil: "networkidle" });
  await page.getByRole("region", { name: "Project files" }).waitFor();
  const tools = page.getByRole("region", { name: "Project files" });
  const name = page.getByLabel("Project name");
  const format = page.getByLabel("Canvas format");
  await name.fill("Field Notes / September");
  await page.getByLabel("Variation seed").fill("A measured field with a vermilion signal and broad open space.");
  await format.selectOption("desktop");
  await page.getByRole("button", { name: "Generate set" }).click();
  await page.getByRole("button", { name: "Signal study" }).click();

  const saved = await projectFile(page, tools);
  assert.equal(saved.project.title, "Field Notes / September");
  assert.equal(saved.project.payload.format, "desktop");
  assert.equal(saved.project.payload.selected, 2);
  assert.equal(saved.project.payload.generation, 1);
  assert.equal(saved.project.payload.results.length, 3);

  const desktopEvent = page.waitForEvent("download", { timeout: 30_000 });
  await page.getByRole("button", { name: "Export 6K" }).click();
  await name.fill("Renamed while PNG renders");
  await format.selectOption("phone");
  const desktopDownload = await desktopEvent;
  const desktopPath = await desktopDownload.path();
  assert(desktopPath);
  const desktop = { bytes: await readFile(desktopPath), filename: desktopDownload.suggestedFilename() };
  assert.match(desktop.filename, /^field-notes-september-desktop-r[0-9a-f]{8}-composition-3\.png$/);
  assert.deepEqual(pngSize(desktop.bytes), { width: 6144, height: 3840 });

  const phone = await downloaded(page, () => page.getByRole("button", { name: "Export 6K" }).click());
  assert.match(phone.filename, /^renamed-while-png-renders-phone-r[0-9a-f]{8}-composition-3\.png$/);
  assert.notEqual(phone.filename.match(/-r[0-9a-f]{8}-/)?.[0], desktop.filename.match(/-r[0-9a-f]{8}-/)?.[0], "changed content must receive a different export revision");
  assert.deepEqual(pngSize(phone.bytes), { width: 3456, height: 6144 });
  await format.selectOption("widescreen");
  const widescreen = await downloaded(page, () => page.getByRole("button", { name: "Export 6K" }).click());
  assert.deepEqual(pngSize(widescreen.bytes), { width: 6144, height: 3456 });

  await page.getByLabel("Variation seed").fill("A different project that must be replaced.");
  await page.getByRole("button", { name: "Generate set" }).click();
  await restoreFile(page, tools, saved.path);
  assert.equal(await name.inputValue(), "Field Notes / September", "the envelope title must be restored");
  assert.equal(await format.inputValue(), "desktop");
  assert.equal(await page.getByRole("button", { name: "Signal study" }).getAttribute("aria-pressed"), "true");
  const reopened = await projectFile(page, tools);
  assert.deepEqual(reopened.project.payload, saved.project.payload, "save/open must preserve selected format and generated geometry");
  const reopenedPng = await downloaded(page, () => page.getByRole("button", { name: "Export 6K" }).click());
  assert.equal(reopenedPng.filename, desktop.filename, "the restored project must retain its export revision filename");
  assert.deepEqual(pngSize(reopenedPng.bytes), { width: 6144, height: 3840 });
  assert.equal(await pixelFingerprint(page, reopenedPng.bytes), await pixelFingerprint(page, desktop.bytes), "reopened geometry must render the same pixels in one browser");
  await page.close();
}

async function checkMusic(context) {
  const page = await context.newPage();
  await page.addInitScript(() => {
    const original = OfflineAudioContext.prototype.startRendering;
    OfflineAudioContext.prototype.startRendering = async function delayed() {
      const rendered = await original.call(this);
      await new Promise(resolve => window.setTimeout(resolve, 200));
      return rendered;
    };
  });
  await page.goto(`${base}/interfaces/music/`, { waitUntil: "networkidle" });
  const tools = page.getByRole("region", { name: "Project files" });
  await tools.waitFor();
  const sessionName = page.getByLabel("Session name");
  await sessionName.fill("Export Session Snapshot");

  await page.locator(".mu-track-heading").nth(0).click();
  const drums = page.getByRole("group", { name: "Drum machine channel" });
  await drums.getByLabel("Pan").fill("37");
  await drums.getByRole("button", { name: "Mute" }).click();
  await page.locator(".mu-track-heading").nth(1).click();
  const hats = page.getByRole("group", { name: "Closed hats channel" });
  await hats.getByLabel("Pan").fill("-44");
  await hats.getByRole("button", { name: "Solo" }).click();

  const saved = await projectFile(page, tools);
  assert.equal(saved.project.payload.name, "Export Session Snapshot");
  assert.deepEqual(saved.project.payload.tracks[0].channel, { gain: -4, pan: 37, muted: true, solo: false });
  assert.deepEqual(saved.project.payload.tracks[1].channel, { gain: -14, pan: -44, muted: false, solo: true });

  await page.getByRole("button", { name: "Play session" }).click();
  await page.getByRole("button", { name: "Stop playback" }).waitFor({ timeout: 8_000 });
  await restoreFile(page, tools, saved.path);
  await page.getByRole("button", { name: "Play session" }).waitFor();
  await page.getByText("Audio engine stopped", { exact: true }).waitFor();
  await page.waitForTimeout(300);
  assert.equal(await page.getByRole("button", { name: "Stop playback" }).count(), 0, "import must not resume playback later");

  const reopened = await projectFile(page, tools);
  assert.deepEqual(reopened.project.payload.tracks.map(track => track.channel), saved.project.payload.tracks.map(track => track.channel), "mute, solo and pan must survive restore");

  const wavEvent = page.waitForEvent("download", { timeout: 30_000 });
  await page.getByRole("button", { name: "Export audio" }).click();
  await sessionName.fill("Renamed while audio renders");
  const wavDownload = await wavEvent;
  const wavPath = await wavDownload.path();
  assert(wavPath);
  const wav = await readFile(wavPath);
  assert.equal(wavDownload.suggestedFilename(), "export-session-snapshot-session.wav");
  wavHeader(wav);
  await page.close();
}

const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 900 } });
try {
  await checkWallpaper(context);
  await checkMusic(context);
  console.log("Creative export E2E passed: wallpaper projects/PNG snapshots and music restore/WAV snapshots verified.");
} finally {
  await context.close();
  await browser.close();
}
