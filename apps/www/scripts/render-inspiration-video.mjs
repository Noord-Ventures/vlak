// Render the real Three.js carousel offline, without the website UI.
// VLAK_FFMPEG=/path/to/ffmpeg node apps/www/scripts/render-inspiration-video.mjs
// Add --proof for a quick 960×540 edit and stills before rendering the master.
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createReadStream } from "node:fs";
import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import ts from "typescript";

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repo = path.resolve(site, "../..");
const three = path.resolve(path.dirname(fileURLToPath(import.meta.resolve("three"))), "..");
const proof = process.argv.includes("--proof");
const width = proof ? 960 : 1920;
const height = proof ? 540 : 1080;
const fps = 30;
const output = process.env.VLAK_VIDEO_OUTPUT ?? path.join(homedir(), "Movies/Vlak");
const ffmpeg = process.env.VLAK_FFMPEG ?? "ffmpeg";
const name = proof ? "vlak-carousel-proof" : "vlak-carousel-twitter";
const file = path.join(output, `${name}.mp4`);
await mkdir(output, { recursive: true });

// Stay in collection order: each transition advances one work, including the wrap.
// The principal spatial works get longer holds; the complete collection is shown.
const durations = [2.7, 1.05, 2.2, 0.8, 0.65, 0.65, 0.65, 0.65, 0.65, 0.65, 0.65, 0.65, 1.85, 0.65, 3, 0.65, 0.8, 0.75, 0.65, 0.65, 1.25, 0.75];
const starts = durations.map((_, i) => durations.slice(0, i).reduce((sum, duration) => sum + duration, 0));
const collectionEnd = durations.reduce((sum, duration) => sum + duration, 0);
const titleStart = collectionEnd + 0.5;
const duration = collectionEnd + 4.5;
const frames = Math.ceil(duration * fps);
const checkpoints = [0.8, 5.1, 12.8, 16.1, 21.7, duration - 0.1].map((time) => Math.round(time * fps));

const modules = new Map();
for (const module of ["scene", "objects", "collection", "dynamics"]) {
  const source = await readFile(path.join(site, "app/inspiration", `${module}.ts`), "utf8");
  modules.set(`/film/${module}`, ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText);
}

const html = `<!doctype html><html><head><meta charset="utf-8"><title>Vlak film render</title>
<style>
@font-face{font-family:Inter;src:url('/film/Inter-580.ttf') format('truetype');font-weight:580;font-display:block}
*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#ededed}
#objects{position:absolute;inset:0}canvas{display:block;width:100%;height:100%}
#veil,#wordmark{position:absolute;inset:0;pointer-events:none;opacity:0}
#veil{background:#ededed}#wordmark{display:flex;align-items:center;justify-content:center}
#wordmark span{display:inline-block;font-family:Inter,sans-serif;font-weight:580;font-size:400px;letter-spacing:-.055em;line-height:.9;white-space:nowrap;color:#1a1a1a}
</style>
<script type="importmap">{"imports":{"three":"/vendor/three/build/three.module.js","three/addons/":"/vendor/three/examples/jsm/"}}</script>
</head><body><div id="objects"></div><div id="veil"></div><div id="wordmark"><span>Vlak.dev</span></div>
<script type="module">
import {createGalleryScene} from '/film/scene';
import {studies} from '/film/collection';
const starts=${JSON.stringify(starts)};
const collectionEnd=${collectionEnd};
const titleStart=${titleStart};
let clock=0,serial=1;
const pending=new Map();
Object.defineProperty(performance,'now',{value:()=>clock});
window.requestAnimationFrame=(callback)=>{const id=serial++;pending.set(id,callback);return id};
window.cancelAnimationFrame=(id)=>pending.delete(id);
const loaded=new Set();
window.film={ready:false,error:null};
const engine=createGalleryScene(document.getElementById('objects'),{
  onSelect(){},
  onStatus(index,status){if(status==='error')window.film.error='Asset failed: '+studies[index].id;else loaded.add(index)},
  onError(){window.film.error='WebGL renderer unavailable'},
});
engine.setReducedMotion(false);
engine.setLighting('daylight');
engine.setZoom(1.12);
const word=document.querySelector('#wordmark span');
await document.fonts.load('580 400px Inter');
word.style.fontSize=(400*innerWidth*.93/word.getBoundingClientRect().width)+'px';
function tick(){clock+=1000/60;const callbacks=[...pending.values()];pending.clear();for(const callback of callbacks)callback(clock)}
let active=-1;
window.film.step=(frame)=>{
  const time=frame/${fps};
  const index=time>=collectionEnd?0:starts.findLastIndex((start)=>time>=start);
  if(index!==active){
    active=index;engine.select(index);engine.setRotating(true);
    engine.setZoom(index===14?1.26:index===2?1.24:index===12?1.14:index===0?1.12:1.04);
  }
  // Two exact 60 Hz simulation steps produce one 30 fps output frame.
  tick();tick();
  const progress=Math.max(0,Math.min(1,(time-titleStart)/1.05));
  const eased=1-Math.pow(1-progress,3);
  document.getElementById('veil').style.opacity=String(eased*.84);
  document.getElementById('wordmark').style.opacity=String(eased);
  word.style.transform='translateY('+((1-eased)*24)+'px) scale('+(0.94+eased*.06)+')';
};
// Resolve the initial layout and camera before the first exported frame.
const waitForAssets=setInterval(()=>{
  if(loaded.size!==studies.length)return;
  clearInterval(waitForAssets);
  for(let i=0;i<120;i++)tick();
  window.film.ready=true;
},25);
</script></body></html>`;

const types = { ".js": "text/javascript", ".ttf": "font/ttf", ".glb": "model/gltf-binary", ".webp": "image/webp", ".png": "image/png" };
const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, "http://localhost").pathname;
  try {
    if (pathname === "/") { response.writeHead(200, { "Content-Type": "text/html" }); response.end(html); return; }
    if (modules.has(pathname)) { response.writeHead(200, { "Content-Type": "text/javascript" }); response.end(modules.get(pathname)); return; }
    let root = path.join(site, "public");
    let relative = pathname;
    if (pathname.startsWith("/vendor/three/")) { root = three; relative = pathname.slice("/vendor/three".length); }
    if (pathname === "/film/Inter-580.ttf") { root = path.join(site, "app"); relative = "/Inter-580.ttf"; }
    const asset = path.resolve(root, `.${relative}`);
    if (!asset.startsWith(`${root}${path.sep}`)) throw new Error("Invalid path");
    const info = await stat(asset);
    response.writeHead(200, { "Content-Type": types[path.extname(asset)] ?? "application/octet-stream", "Content-Length": info.size });
    createReadStream(asset).pipe(response);
  } catch { response.writeHead(404); response.end("Not found"); }
});
server.listen(0, "127.0.0.1");
await once(server, "listening");
const url = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch({
  headless: true,
  channel: "chrome",
  args: ["--enable-unsafe-swiftshader", "--disable-background-timer-throttling", "--disable-renderer-backgrounding"],
});
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: "no-preference" });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
let encoder;
try {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.film?.ready || window.film?.error, undefined, { timeout: 60000 });
  const setup = await page.evaluate(() => ({ ready: window.film.ready, error: window.film.error, label: document.querySelector("#wordmark span").getBoundingClientRect().width }));
  if (!setup.ready || setup.error || errors.length) throw new Error(JSON.stringify({ setup, errors }));
  if (setup.label > width * 0.95 || setup.label < width * 0.9) throw new Error("Wordmark must fit almost the entire frame");
  encoder = spawn(ffmpeg, [
    "-y", "-hide_banner", "-loglevel", "warning", "-f", "image2pipe", "-framerate", String(fps), "-vcodec", "png", "-i", "pipe:0",
    "-an", "-c:v", "libx264", "-preset", "fast", "-crf", "17", "-profile:v", "high", "-level:v", "4.1", "-g", "60",
    "-maxrate", "10M", "-bufsize", "20M", "-vf", "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p",
    "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
    "-bsf:v", "h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0",
    "-movflags", "+faststart", file,
  ], { stdio: ["pipe", "ignore", "pipe"] });
  let encodeError = "";
  encoder.stderr.on("data", (chunk) => { encodeError += chunk.toString(); });
  const encoded = new Promise((resolve, reject) => {
    encoder.on("error", reject);
    encoder.on("close", (code) => code === 0 ? resolve() : reject(new Error(encodeError || `FFmpeg exited ${code}`)));
  });
  const begun = Date.now();
  for (let frame = 0; frame < frames; frame++) {
    await page.evaluate((index) => window.film.step(index), frame);
    const bytes = await page.screenshot({ type: "png", animations: "allow" });
    if (!encoder.stdin.write(bytes)) await once(encoder.stdin, "drain");
    if (checkpoints.includes(frame)) await writeFile(path.join(output, `${name}-${String(frame).padStart(4, "0")}.png`), bytes);
    if (frame % 90 === 0) console.log(`Rendered ${frame}/${frames} frames (${((Date.now() - begun) / 1000).toFixed(1)}s elapsed)`);
  }
  encoder.stdin.end();
  await encoded;
  if (errors.length) throw new Error(errors.join("\n"));
  await copyFile(path.join(output, `${name}-${String(checkpoints.at(-1)).padStart(4, "0")}.png`), path.join(output, `${name}-cover.png`));
  const manifest = { file, width, height, fps, frames, duration: frames / fps, title: "Vlak.dev", ui: false, works: durations.length, audio: false, bytes: (await stat(file)).size, source: path.relative(repo, path.join(site, "app/inspiration/scene.ts")) };
  await writeFile(path.join(output, `${name}.json`), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(JSON.stringify(manifest, null, 2));
} finally {
  encoder?.stdin.destroy();
  if (encoder && encoder.exitCode === null) encoder.kill();
  await browser.close();
  server.close();
}
