// Render the real Three.js carousel offline, without the website UI.
// VLAK_FFMPEG=/path/to/ffmpeg node apps/www/scripts/render-inspiration-video.mjs
// Add --proof for a quick 960×540 edit and stills before rendering the master.
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createReadStream } from "node:fs";
import { copyFile, mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
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
const renderFile = path.join(output, `${name}.rendering.mp4`);
await mkdir(output, { recursive: true });

// Stay in collection order and leave time to read every designer credit.
// Spatial works and the poster with two individual designers receive longer holds.
const durations = [2.7, 1.6, 2.2, 1.2, 1.1, 1.1, 1.25, 1.1, 1.1, 1.1, 1.1, 1.1, 1.85, 1.35, 3, 1.2, 1.4, 1.2, 1.2, 2, 1.85, 1.2];
const starts = durations.map((_, i) => durations.slice(0, i).reduce((sum, duration) => sum + duration, 0));
const collectionEnd = durations.reduce((sum, duration) => sum + duration, 0);
const titleStart = collectionEnd;
const duration = collectionEnd + 2.2;
const frames = Math.ceil(duration * fps);
const checkpoints = [...starts.map((start, index) => start + Math.min(durations[index] * 0.65, 1.1)), titleStart + 0.2, titleStart + 1, duration - 0.15].map((time) => Math.round(time * fps));

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
#credit{position:absolute;left:5vw;right:5vw;bottom:5.7vh;pointer-events:none;font-family:Inter,sans-serif;font-weight:580;color:#1a1a1a;transform-origin:left bottom}
#designer{margin:0;font-size:4.1vw;letter-spacing:-.045em;line-height:1.05;white-space:nowrap}
#work{margin:1.05vh 0 0;font-size:1.25vw;letter-spacing:-.018em;line-height:1.35;color:#575757}
#wordmark{position:absolute;inset:0;pointer-events:none;opacity:0;background:#dedede;color:#181818;overflow:hidden}
#wordmark span{position:absolute;left:50%;top:50%;display:inline-block;font-family:Inter,sans-serif;font-weight:580;font-size:400px;letter-spacing:-.055em;line-height:.9;white-space:nowrap;transform:translate(-50%,-50%);filter:url(#ink-wear)}
#wordmark .echo{opacity:.52;clip-path:inset(42% -5% 43%);filter:none}
#grain{position:absolute;inset:0;opacity:.62;mix-blend-mode:multiply}
#wordmark::after{content:"";position:absolute;inset:0;opacity:.06;background:repeating-linear-gradient(0deg,transparent 0,transparent 3px,currentColor 3px,currentColor 4px);pointer-events:none}
</style>
<script type="importmap">{"imports":{"three":"/vendor/three/build/three.module.js","three/addons/":"/vendor/three/examples/jsm/"}}</script>
</head><body><div id="objects"></div><div id="credit"><p id="designer"></p><p id="work"></p></div>
<svg width="0" height="0" aria-hidden="true"><defs><filter id="ink-wear" x="-5%" y="-10%" width="110%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".019 .18" numOctaves="3" seed="13" result="grain"/><feDisplacementMap in="SourceGraphic" in2="grain" scale="4" xChannelSelector="R" yChannelSelector="G"/></filter></defs></svg>
<div id="wordmark"><span class="main">Vlak.dev</span><span class="echo" aria-hidden="true">Vlak.dev</span><canvas id="grain"></canvas></div>
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
if(studies.length!==starts.length)throw new Error('Every work needs a film hold and a designer credit');
const credits=studies.map((study,index)=>({
  id:study.id,
  designer:study.id==='co-westerik'?'Wim Crouwel · Magda Tsfaty':study.id==='schiphol-signage'?'Benno Wissing':study.artist,
  work:(['co-westerik','schiphol-signage'].includes(study.id)?'Total Design · ':'')+study.title+' · '+study.year,
  start:starts[index],
}));
window.film.credits=credits;
const engine=createGalleryScene(document.getElementById('objects'),{
  onSelect(){},
  onStatus(index,status){if(status==='error')window.film.error='Asset failed: '+studies[index].id;else loaded.add(index)},
  onError(){window.film.error='WebGL renderer unavailable'},
});
engine.setReducedMotion(false);
engine.setLighting('daylight');
engine.setZoom(1.12);
const credit=document.getElementById('credit');
const designer=document.getElementById('designer');
const work=document.getElementById('work');
const ending=document.getElementById('wordmark');
const word=document.querySelector('#wordmark .main');
const echo=document.querySelector('#wordmark .echo');
const grain=document.getElementById('grain');
grain.width=Math.round(innerWidth/2);grain.height=Math.round(innerHeight/2);
const grainContext=grain.getContext('2d');
const grainPixels=grainContext.createImageData(grain.width,grain.height);
let grainFrame=-1;
await document.fonts.load('580 400px Inter');
word.style.fontSize=(400*innerWidth*.93/word.getBoundingClientRect().width)+'px';
echo.style.fontSize=word.style.fontSize;
function printGrain(frame,dark){
  if(frame===grainFrame)return;
  grainFrame=frame;
  let seed=7919*(frame+31);
  const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296};
  const pixels=grainPixels.data;
  for(let i=0;i<pixels.length;i+=4){
    const shade=random()>.5?255:0;
    pixels[i]=pixels[i+1]=pixels[i+2]=shade;
    pixels[i+3]=random()<.025?95:8+random()*25;
  }
  grainContext.putImageData(grainPixels,0,0);
  grainContext.fillStyle=dark?'rgba(255,255,255,.20)':'rgba(0,0,0,.19)';
  for(let i=0;i<60;i++)grainContext.fillRect(random()*grain.width,random()*grain.height,1+random()*grain.width*.045,random()>.9?1.4:.45);
}
function tick(){clock+=1000/60;const callbacks=[...pending.values()];pending.clear();for(const callback of callbacks)callback(clock)}
let active=-1;
window.film.step=(frame)=>{
  const time=frame/${fps};
  const index=time>=collectionEnd?studies.length-1:starts.findLastIndex((start)=>time>=start);
  if(index!==active){
    active=index;engine.select(index);engine.setRotating(true);
    engine.setZoom(index===14?1.26:index===2?1.24:index===12?1.14:index===0?1.12:1.04);
    designer.textContent=credits[index].designer;
    work.textContent=credits[index].work;
  }
  // Two exact 60 Hz simulation steps produce one 30 fps output frame.
  tick();tick();
  // Introduce the name after the incoming object has crossed into the center.
  const elapsed=time-starts[index];
  const reveal=index===0?1:Math.max(0,Math.min(1,(elapsed-.2)/.12));
  credit.style.opacity=time<titleStart?String(reveal):'0';
  credit.style.transform='translateY('+((1-reveal)*innerHeight*.008)+'px)';
  if(time>=titleStart){
    engine.setRotating(false);
    const endTime=time-titleStart;
    // Three spaced print impressions. Only two palette changes, 750 ms apart.
    const shot=endTime<.7?0:endTime<1.45?1:2;
    const dark=shot===1;
    ending.style.opacity='1';
    ending.style.background=dark?'#181818':'#dedede';
    ending.style.color=dark?'#dedede':'#181818';
    grain.style.mixBlendMode=dark?'screen':'multiply';
    const x=shot===1?-innerWidth*.004:shot===2?innerWidth*.0015:0;
    const y=shot===1?innerHeight*.006:shot===2?-innerHeight*.002:0;
    const scale=shot===1?1.015:shot===2?.993:1;
    word.style.transform='translate(-50%,-50%) translate('+x+'px,'+y+'px) scale('+scale+')';
    echo.style.transform='translate(-50%,-50%) translate('+(x+(shot===1?12:-9)*innerWidth/1920)+'px,'+y+'px) scale('+scale+')';
    printGrain(Math.floor(endTime*6)+shot*100,dark);
  }
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
    "-movflags", "+faststart", renderFile,
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
  // Keep the last usable edit until the new movie has encoded successfully.
  let backup;
  if (await stat(file).catch(() => null)) {
    const backupDirectory = path.join(output, "backups");
    await mkdir(backupDirectory, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    backup = path.join(backupDirectory, `${name}-${stamp}.mp4`);
    await copyFile(file, backup);
  }
  await rename(renderFile, file);
  await copyFile(path.join(output, `${name}-${String(checkpoints.at(-1)).padStart(4, "0")}.png`), path.join(output, `${name}-cover.png`));
  const credits = await page.evaluate(() => window.film.credits);
  const manifest = { file, backup, width, height, fps, frames, duration: frames / fps, title: "Vlak.dev", ending: "Three rough-print impressions with two spaced palette cuts", ui: false, works: durations.length, credits, audio: false, bytes: (await stat(file)).size, source: path.relative(repo, path.join(site, "app/inspiration/scene.ts")) };
  await writeFile(path.join(output, `${name}.json`), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(JSON.stringify(manifest, null, 2));
} finally {
  encoder?.stdin.destroy();
  if (encoder && encoder.exitCode === null) encoder.kill();
  await browser.close();
  server.close();
}
