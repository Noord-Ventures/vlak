// Reproducible dimensional film of real Vlak components, without a site build.
// First run: node apps/www/scripts/components-film/capture.mjs
// Then: VLAK_FFMPEG=/path/to/ffmpeg node apps/www/scripts/render-components-video.mjs
// --proof exports 960x540; --stills renders only review frames.
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, stat, writeFile, copyFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { writeScore } from './components-film/sound.mjs';

const directory = path.dirname(fileURLToPath(import.meta.url));
const site = path.resolve(directory, '..');
const three = path.resolve(path.dirname(fileURLToPath(import.meta.resolve('three'))), '..');
const output = path.resolve(process.env.VLAK_VIDEO_OUTPUT ?? path.join(homedir(), 'Movies/Vlak'));
const textureRoot = path.resolve(process.env.VLAK_COMPONENT_TEXTURES ?? path.join(output, 'component-textures'));
const manifest = JSON.parse(await readFile(path.join(textureRoot, 'manifest.json'), 'utf8'));
const proof = process.argv.includes('--proof');
const stills = process.argv.includes('--stills');
const sound = process.argv.includes('--sound') && !stills;
const width = proof ? 960 : 1920;
const height = proof ? 540 : 1080;
const fps = 30, duration = 27, frames = fps * duration;
const name = proof ? 'vlak-components-proof' : 'vlak-components-launch';
const file = path.join(output, name + '.mp4');
const silentFile = sound ? path.join(output, name + '-silent.mp4') : null;
const scoreFile = sound ? path.join(output, name + '-score.wav') : null;
const ffmpeg = process.env.VLAK_FFMPEG ?? 'ffmpeg';
const checkpoints = [.7, 3.2, 7.4, 11.1, 12.8, 17.2, 21.4, 24.2, 26.8].map(t => Math.round(t * fps));
const textures = new Map([...manifest.panels, ...(manifest.fragments ?? [])].map(a => ['/textures/' + a.id + '.png', a.file]));
await mkdir(output, { recursive: true });
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Inter;src:url('/Inter-580.ttf');font-weight:580;font-display:block}
*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#faf8f2;color:#1a1a1a;font-family:Inter,sans-serif;font-weight:580}
#stage,canvas,#veil,#title,#grain{position:absolute;inset:0;width:100%;height:100%;display:block}
#caption{position:absolute;left:4.2vw;bottom:3.6vw;z-index:2;max-width:92vw}
#eyebrow{font-size:1.2vw;letter-spacing:-.015em;margin-bottom:.62vw;color:#686661}
#heading{font-size:3.75vw;letter-spacing:-.046em;line-height:1.1}
#veil{background:#faf8f2;opacity:0}#title{display:flex;align-items:center;justify-content:center;opacity:0}
#title span{font-size:400px;letter-spacing:-.055em;line-height:.9;white-space:nowrap}
#endnote{position:absolute;left:4.2vw;bottom:3.4vw;font-size:1.25vw;opacity:0}
#grain{pointer-events:none;mix-blend-mode:multiply;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 170 170' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.92' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' opacity='.85' filter='url(%23n)'/%3E%3C/svg%3E");background-size:170px 170px;opacity:.025}
.inverse #veil{background:#1a1a1a!important;opacity:1!important}.inverse #title,.inverse #endnote{color:#faf8f2}.inverse #grain{mix-blend-mode:screen}
</style><script type="importmap">{"imports":{"three":"/vendor/three/build/three.module.js","three/addons/":"/vendor/three/examples/jsm/"}}</script></head>
<body><div id="stage"></div><div id="caption"><div id="eyebrow"></div><div id="heading"></div></div><div id="veil"></div><div id="title"><span>Vlak.dev</span></div><div id="endnote">40 new components · 114 in one system</div><div id="grain"></div>
<script type="module">import {createFilm} from '/film/scene.mjs'; window.film={ready:false};try{window.film=await createFilm(${JSON.stringify(manifest)})}catch(error){window.film.error=error.stack}</script></body></html>`;
const types = { '.mjs': 'text/javascript', '.js': 'text/javascript', '.ttf': 'font/ttf', '.png': 'image/png' };
const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  try {
    if (pathname === '/') { response.writeHead(200, { 'Content-Type': 'text/html' }); response.end(html); return; }
    let asset;
    if (textures.has(pathname)) asset = textures.get(pathname);
    else if (pathname === '/Inter-580.ttf') asset = path.join(site, 'app/Inter-580.ttf');
    else if (pathname.startsWith('/film/')) asset = path.join(directory, 'components-film', path.basename(pathname));
    else if (pathname.startsWith('/vendor/three/')) {
      asset = path.resolve(three, pathname.slice('/vendor/three/'.length));
      if (!asset.startsWith(three + path.sep)) throw new Error('Invalid asset');
    }
    if (!asset) throw new Error('Missing asset');
    const info = await stat(asset);
    response.writeHead(200, { 'Content-Type': types[path.extname(asset)] ?? 'application/octet-stream', 'Content-Length': info.size });
    createReadStream(asset).pipe(response);
  } catch { response.writeHead(404); response.end('Not found'); }
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const browser = await chromium.launch({headless:true,channel:'chrome',args:['--enable-unsafe-swiftshader','--disable-background-timer-throttling','--disable-renderer-backgrounding']});
const page = await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
const errors = [];
page.on('pageerror', error => errors.push(error.message));
let encoder;
try {
  await page.goto('http://127.0.0.1:' + server.address().port + '/', {waitUntil:'networkidle'});
  await page.waitForFunction(() => window.film.ready || window.film.error, undefined, {timeout:60000});
  const setup = await page.evaluate(() => ({ready:window.film.ready,error:window.film.error}));
  if (!setup.ready || setup.error || errors.length) throw new Error(JSON.stringify({setup,errors}));
  let encoded;
  if (!stills) {
    encoder = spawn(ffmpeg, ['-y','-hide_banner','-loglevel','warning','-f','image2pipe','-framerate',String(fps),'-vcodec','png','-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','17','-profile:v','high','-level:v','4.1','-g','60','-maxrate','10M','-bufsize','20M','-vf','scale=out_color_matrix=bt709:out_range=tv,format=yuv420p','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-bsf:v','h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0','-movflags','+faststart',silentFile ?? file], {stdio:['pipe','ignore','pipe']});
    let stderr = '';
    encoder.stderr.on('data', chunk => stderr += chunk);
    encoded = new Promise((resolve,reject) => {encoder.on('error',reject);encoder.on('close',code => code === 0 ? resolve() : reject(new Error(stderr)));});
  }
  const begun = Date.now();
  for (const frame of stills ? checkpoints : Array.from({length:frames},(_,i)=>i)) {
    await page.evaluate(frame => window.film.step(frame),frame);
    const bytes = await page.screenshot({type:'png',animations:'allow'});
    if (encoder && !encoder.stdin.write(bytes)) await once(encoder.stdin,'drain');
    if (checkpoints.includes(frame)) await writeFile(path.join(output,name+'-'+String(frame).padStart(4,'0')+'.png'),bytes);
    if (frame % 90 === 0) console.log('Rendered '+frame+'/'+frames+' frames ('+((Date.now()-begun)/1000).toFixed(1)+'s)');
  }
  if (encoder) {encoder.stdin.end();await encoded;}
  if (errors.length) throw new Error(errors.join('\n'));
  if (sound) {
    try {
      await writeScore(scoreFile, duration);
      await new Promise((resolve, reject) => {
        const muxer = spawn(ffmpeg, [
          '-y', '-hide_banner', '-loglevel', 'warning', '-i', silentFile, '-i', scoreFile,
          '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac',
          '-b:a', '192k', '-ar', '48000', '-ac', '2', '-af', 'loudnorm=I=-18:TP=-1.5:LRA=9',
          '-movflags', '+faststart', '-shortest', file,
        ], { stdio: ['ignore', 'ignore', 'pipe'] });
        let stderr = '';
        muxer.stderr.on('data', chunk => stderr += chunk);
        muxer.on('error', reject);
        muxer.on('close', code => code === 0 ? resolve() : reject(new Error(stderr || `FFmpeg mux exited ${code}`)));
      });
    } catch (error) {
      throw new Error(`Soundtrack export failed. The completed silent master remains at ${silentFile}.`, { cause: error });
    }
  }
  await copyFile(path.join(output,name+'-'+String(checkpoints.at(-1)).padStart(4,'0')+'.png'),path.join(output,name+'-cover.png'));
  const components = [...new Set(manifest.panels.flatMap(panel => panel.components))];
  const existingFeatured = components.filter(component => component === 'Sparkline');
  const result = {
    file: stills ? null : file, mode: stills ? 'stills' : 'video', width, height, fps, duration,
    frames: stills ? checkpoints.length : frames,
    releaseTotal: 114, releaseNew: 40, featuredTotal: components.length,
    featuredNew: components.length - existingFeatured.length, existingFeatured, components,
    reviewFrames: checkpoints.map(frame => ({frame,time:frame/fps,file:path.join(output,name+'-'+String(frame).padStart(4,'0')+'.png')})),
    audio:sound,silentFile,
    score:sound ? {file:scoreFile,source:'apps/www/scripts/components-film/sound.mjs',original:true,sampleRate:48000,channels:2,codec:'aac',bitrate:192000,loudnessTargetLUFS:-18,truePeakTargetDBTP:-1.5} : null,
    source:'apps/www/scripts/render-components-video.mjs',
  };
  await writeFile(path.join(output,name+'.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result,null,2));
} finally {
  encoder?.stdin.destroy();
  if (encoder && encoder.exitCode === null) encoder.kill();
  await browser.close();
  server.close();
}
