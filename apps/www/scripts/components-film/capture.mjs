// Capture compiled Vlak components as 2× PNG faces for the launch film.
// node apps/www/scripts/components-film/capture.mjs
import { createServer } from "node:http";
import { once } from "node:events";
import { createRequire } from "node:module";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const directory = path.dirname(fileURLToPath(import.meta.url));
const site = path.resolve(directory, "../..");
const repo = path.resolve(site, "../..");
const require = createRequire(path.join(site, "package.json"));
const packageRoot = path.dirname(require.resolve("@noorddev/vlak-react"));
const videoOutput = path.resolve(process.env.VLAK_VIDEO_OUTPUT ?? path.join(homedir(), "Movies/Vlak"));
const output = path.resolve(process.env.VLAK_COMPONENT_TEXTURES ?? path.join(videoOutput, "component-textures"));
const pixelRatio = 2;
export const panels = [
  { id: "kanban", name: "Kanban board", width: 850, height: 500, renderWidth: 940, components: ["KanbanBoard"] },
  { id: "audio", name: "Media tools", width: 850, height: 350, renderWidth: 790, components: ["Waveform", "PlaybackControls", "MediaScrubber"] },
  { id: "scheduler", name: "Weekly schedule", width: 850, height: 500, renderWidth: 1180, components: ["Scheduler"] },
  { id: "files", name: "File browser", width: 650, height: 450, renderWidth: 800, components: ["FileBrowser", "TreeView"] },
  { id: "properties", name: "Object properties", width: 500, height: 500, renderWidth: 452, components: ["PropertyGrid", "CanvasControls"] },
  { id: "query", name: "Query builder", width: 850, height: 350, renderWidth: 800, components: ["QueryBuilder"] },
  { id: "composer", name: "Message composer", width: 650, height: 300, renderWidth: 594, components: ["MessageComposer"] },
  { id: "progress", name: "Task progress", width: 500, height: 500, renderWidth: 452, components: ["TaskProgress", "ActivityTimeline"] },
  { id: "metrics", name: "System metrics", width: 500, height: 350, renderWidth: 452, components: ["Metric", "Sparkline"] },
  { id: "selection", name: "Selection tools", width: 650, height: 450, renderWidth: 680, components: ["MultiSelect", "TransferList", "ConnectionStatus"] },
];

const pnpm = path.join(repo, "node_modules/.pnpm");
const esbuildPackage = (await readdir(pnpm)).find(name => name.startsWith("esbuild@"));
if (!esbuildPackage) throw new Error("The workspace's esbuild dependency is missing. Install workspace dependencies first.");
const { build } = await import(pathToFileURL(path.join(pnpm, esbuildPackage, "node_modules/esbuild/lib/main.js")));
const bundled = await build({
  entryPoints: [path.join(directory, "capture/specimens.jsx")], absWorkingDir: site,
  bundle: true, write: false, format: "iife", platform: "browser", target: "chrome120", jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' }, minify: true, logLevel: "silent",
});
const html = `<!doctype html><html lang="en" data-theme="light"><head><meta charset="utf-8"><title>Vlak component capture</title>
<link rel="stylesheet" href="/css/vlak-react.css"><style>
html::before{display:none}html,body{margin:0;min-height:0;overflow:visible;background:var(--bg)}
body{padding:0}#plate{position:relative;overflow:hidden;background:var(--bg);width:850px;height:500px}
#content{position:absolute;left:0;top:0;transform-origin:0 0;box-sizing:border-box}
</style></head><body><div id="plate"></div><script src="/bundle.js"></script></body></html>`;
const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, "http://localhost").pathname;
    if (pathname === "/favicon.ico") { response.writeHead(204); response.end(); return; }
    if (pathname === "/") { response.writeHead(200, { "Content-Type": "text/html" }); response.end(html); return; }
    if (pathname === "/bundle.js") { response.writeHead(200, { "Content-Type": "text/javascript" }); response.end(bundled.outputFiles[0].contents); return; }
    const asset = path.resolve(packageRoot, `.${pathname.replace(/^\/css/, "")}`);
    if (!asset.startsWith(`${packageRoot}${path.sep}`)) throw new Error("Invalid asset path");
    const contents = await readFile(asset);
    response.writeHead(200, { "Content-Type": asset.endsWith(".css") ? "text/css" : "font/woff2" });
    response.end(contents);
  } catch { response.writeHead(404); response.end("Not found"); }
});
await mkdir(output, { recursive: true });
server.listen(0, "127.0.0.1");
await once(server, "listening");
const browser = await chromium.launch({ headless: true, channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, deviceScaleFactor: pixelRatio, colorScheme: "light", reducedMotion: "reduce", locale: "en-GB", timezoneId: "UTC" });
page.setDefaultTimeout(10000);
const cdp = await page.context().newCDPSession(page);
const errors = [];
page.on("pageerror", error => errors.push(error.message));
page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
const manifest = { version: 1, pixelRatio, fragmentPixelRatio: 6, source: "@noorddev/vlak-react compiled exports + package CSS", background: "#FAF8F2", panels: [], fragments: [] };

async function fragment(id, name, selector, sourcePanel, index = 0) {
  const target = page.locator(selector).nth(index);
  const bounds = await target.boundingBox();
  if (!bounds) throw new Error(`Missing fragment ${id}`);
  const file = path.join(output, `${id}.png`);
  const shot = await cdp.send("Page.captureScreenshot", {
    format: "png", fromSurface: true, captureBeyondViewport: true,
    clip: { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height, scale: 1 },
  });
  await writeFile(file, Buffer.from(shot.data, "base64"));
  const bytes = await readFile(file);
  manifest.fragments.push({ id, name, type: "fragment", sourcePanel, file, width: bounds.width, height: bounds.height, pixelWidth: bytes.readUInt32BE(16), pixelHeight: bytes.readUInt32BE(20) });
}

try {
  await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.captureReady);
  await page.evaluate(() => document.fonts.ready);
  for (const panel of panels) {
    await page.evaluate(({ id, width, height, renderWidth }) => {
      const plate = document.getElementById("plate");
      plate.style.width = `${width}px`; plate.style.height = `${height}px`;
      const content = document.getElementById("content");
      content.style.width = `${renderWidth}px`; content.style.transform = "none";
      window.setSpecimen(id);
    }, panel);
    await page.waitForFunction(id => document.querySelector("#content")?.dataset.specimen === id, panel.id);
    if (panel.id === "scheduler") await page.locator(".rs-scheduler-week").waitFor();
    if (panel.id === "files") await page.getByRole("button", { name: "Grid", exact: true }).click();
    if (panel.id === "composer") await page.getByLabel("Attach files", { exact: true }).setInputFiles({ name: "Interaction notes.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\nVlak specimen attachment\n%%EOF") });
    if (panel.id === "selection") {
      await page.getByRole("checkbox", { name: "Luca · Research", exact: true }).focus();
      await page.keyboard.press("Space");
    }
    await page.evaluate(() => document.activeElement?.blur());
    await page.mouse.move(1400, 1000);
    const fit = await page.evaluate(({ width, height }) => {
      const content = document.getElementById("content");
      const naturalWidth = content.scrollWidth;
      const naturalHeight = content.scrollHeight;
      const scale = Math.min(1, (width - 48) / naturalWidth, (height - 48) / naturalHeight);
      content.style.transform = `translate(${(width - naturalWidth * scale) / 2}px, ${(height - naturalHeight * scale) / 2}px) scale(${scale})`;
      return { naturalWidth, naturalHeight, scale };
    }, panel);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const file = path.join(output, `${panel.id}.png`);
    await page.locator("#plate").screenshot({ path: file, animations: "disabled" });
    const png = await readFile(file);
    const pixelWidth = png.readUInt32BE(16), pixelHeight = png.readUInt32BE(20);
    if (pixelWidth !== panel.width * pixelRatio || pixelHeight !== panel.height * pixelRatio) throw new Error(`Incorrect PNG dimensions for ${panel.id}`);
    manifest.panels.push({ ...panel, file, pixelWidth, pixelHeight, fit, bytes: (await stat(file)).size });
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1600, height: 1100, deviceScaleFactor: 6, mobile: false });
    if (panel.id === "kanban") {
      await fragment("kanban-card-type", "Type scale card", ".rs-kanban-card", panel.id);
      await fragment("kanban-card-motion", "Motion card", ".rs-kanban-card", panel.id, 2);
    }
    if (panel.id === "audio") {
      await fragment("playback-controls", "Playback controls", ".rs-playback-controls", panel.id);
      await fragment("pause-button", "Pause button", "button[aria-label='Pause']", panel.id);
      await fragment("waveform", "Waveform bars", ".rs-waveform-stage", panel.id);
    }
    if (panel.id === "properties") await fragment("canvas-controls", "Canvas controls", ".rs-canvas-controls", panel.id);
    if (panel.id === "composer") await fragment("send-button", "Send button", "button[type='submit']", panel.id);
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1600, height: 1100, deviceScaleFactor: pixelRatio, mobile: false });
    console.log(`Captured ${panel.id}: ${pixelWidth}×${pixelHeight}, fit ${fit.scale.toFixed(3)}`);
  }
  if (errors.length) throw new Error(errors.join("\n"));
  await writeFile(path.join(output, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Manifest: ${path.join(output, "manifest.json")}`);
} finally {
  await browser.close();
  server.close();
}
