import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { openModel, inspectModel, webglArgs } from "./e2e-render-controls.mjs";

// Capture the real renderer at its stationary home camera, without image processing.
const base = process.env.SITE_URL ?? "http://localhost:3016";
const publicDirectory = fileURLToPath(new URL("../public/interfaces/concepts/", import.meta.url));
const manifestPath = fileURLToPath(new URL("../../../docs/assets/braun-t3-render-preview-2026-09-07.json", import.meta.url));
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const captures = {};
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH, args: webglArgs });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce", deviceScaleFactor: 1 });
  await openModel(page, base);
  const canvas = page.locator(".rw-object-canvas");
  for (const theme of ["light", "dark"]) {
    await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
    await page.waitForFunction(value => document.querySelector(".rw-object-canvas")?.dataset.theme === value, theme);
    await page.getByRole("button", { name: "Reset camera", exact: true }).click();
    await page.waitForFunction(() => { const canvas = document.querySelector(".rw-object-canvas"); return canvas?.dataset.camera === canvas?.dataset.home; });
    await page.mouse.move(0, 0);
    await page.waitForTimeout(300);
    const state = await inspectModel(page);
    assert.equal(state.modelUrl, "/interfaces/concepts/braun-t3-monochrome.glb");
    assert.equal(Number(state.triangles), 32027);
    assert.equal(state.lineInk, theme === "light" ? "525252" : "a2a2a2");
    assert.equal(state.surfaceColor, state.paper);
    assert.equal(state.wireframeMaterials, "0");
    const filename = `braun-t3-line-preview-${theme}-v1.png`;
    const png = await canvas.screenshot({ path: `${publicDirectory}${filename}` });
    captures[theme] = { filename, sha256: createHash("sha256").update(png).digest("hex"), width: png.readUInt32BE(16), height: png.readUInt32BE(20), camera: state.position, target: state.target };
    manifest.colors[theme] = { paper: state.paper, line: state.lineInk };
    console.log(`${theme}: ${captures[theme].width} × ${captures[theme].height}, paper ${state.paper}, line ${state.lineInk}`);
  }
} finally { await browser.close(); }
manifest.refreshed = new Date().toISOString();
manifest.method = "Actual Chromium screenshots of the local Three.js Braun T3 canvas, Fine lines, stationary home camera, reduced motion. No generated or retouched geometry.";
manifest.rendering = { featureContours: "LineSegments2 / LineMaterial", lineWidthCssPixels: 1.05, reverseHullOffsetFraction: 0.00133, paperSurfacePolygonOffset: true, palette: "sceneColor composites --table-alt over --bg" };
manifest.captureCommand = "SITE_URL=<fresh source or site URL> PLAYWRIGHT_EXECUTABLE_PATH=<Chromium> node apps/www/scripts/capture-render-previews.mjs";
manifest.captures = captures;
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
