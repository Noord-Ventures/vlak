import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { webglArgs } from "./e2e-render-controls.mjs";

// Capture the actual EV renderer. The fallback and gallery show the same object as the live scene.
const base = process.env.SITE_URL ?? "http://localhost:3016";
const publicDirectory = fileURLToPath(new URL("../public/interfaces/concepts/", import.meta.url));
const manifestPath = fileURLToPath(new URL("../../../docs/assets/evoque-line-preview-2026-09-08.json", import.meta.url));
const captures = {};
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH, args: webglArgs });
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, reducedMotion: "reduce", deviceScaleFactor: 1 });
  await page.goto(`${base}/interfaces/drive/`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => Object.keys(document.querySelector(".ev") ?? {}).some(key => key.startsWith("__reactProps")));
  const canvas = page.locator(".ev-scene");
  await canvas.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector(".ev-scene")?.dataset.rendered === "true");
  for (const theme of ["light", "dark"]) {
    await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
    await page.waitForFunction(value => {
      const scene=document.querySelector(".ev-scene");return scene?.dataset.theme === value && scene.dataset.settled === "true";
    }, theme);
    await page.mouse.move(0, 0);
    const state = await canvas.evaluate(element => ({ ...element.dataset }));
    assert.equal(state.cameraStyle,"side");assert.equal(state.wheels,"4");assert.equal(await canvas.locator("canvas").count(),1);
    const filename = `evoque-line-side-${theme}-v4.png`;
    const png = await canvas.screenshot({ path: `${publicDirectory}${filename}` });
    captures[theme] = { filename, sha256: createHash("sha256").update(png).digest("hex"), width: png.readUInt32BE(16), height: png.readUInt32BE(20), camera: state.camera, paper:state.paper };
    console.log(`${theme}: ${captures[theme].width} × ${captures[theme].height}, paper ${state.paper}`);
  }
} finally { await browser.close(); }
await writeFile(manifestPath, `${JSON.stringify({
  created:new Date().toISOString(),
  method:"Unretouched Chromium screenshots of the actual Three.js EV scene in its side view, reduced motion.",
  source:"https://sketchfab.com/3d-models/2022-land-rover-range-rover-evoque-034600db0cc94d64a7f3ccb19c7799fa",
  creator:"tonielpro520",license:"https://creativecommons.org/licenses/by/4.0/",
  adaptations:"The original licensed Evoque geometry retains its proportions and silhouette. Selected original body boundaries, creases and wheel ridges are simplified offline. Paper-colored surfaces and sparse outlines omit fine trim, badges, grille mesh and interior detail. Attribution is retained under Components used.",
  rendering:{featureContours:"LineSegments2 / LineMaterial",lineWidthCssPixels:1.2,paperSurfacePolygonOffset:true},
  captureCommand:"SITE_URL=<fresh source or site URL> PLAYWRIGHT_EXECUTABLE_PATH=<Chromium> node apps/www/scripts/capture-vehicle-previews.mjs",
  captures,
},null,2)}\n`);
