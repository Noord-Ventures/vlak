// Render individual procedural 3D Vlak components, without screenshot plates.
// node apps/www/scripts/render-components-detail.mjs --proof --stills
// node apps/www/scripts/render-components-detail.mjs --sound
// VLAK_FFMPEG and VLAK_VIDEO_OUTPUT override the encoder and destination.
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createReadStream } from 'node:fs';
import { mkdir, stat, writeFile, copyFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { writeScore, scoreCuts } from './components-film/detail-sound.mjs';

const directory = path.dirname(fileURLToPath(import.meta.url));
const filmRoot = path.join(directory, 'components-film');
const site = path.resolve(directory, '..');
const three = path.resolve(path.dirname(fileURLToPath(import.meta.resolve('three'))), '..');
const output = path.resolve(process.env.VLAK_VIDEO_OUTPUT ?? path.join(homedir(), 'Movies/Vlak'));
const proof = process.argv.includes('--proof');
const stills = process.argv.includes('--stills');
const sound = process.argv.includes('--sound') && !stills;
const width = proof ? 960 : 1920, height = proof ? 540 : 1080;
const fps = 30, filmDuration = 32;
const limitIndex = process.argv.findIndex(arg => arg === '--limit-frames' || arg.startsWith('--limit-frames='));
const limit = limitIndex < 0 ? fps * filmDuration : Number(process.argv[limitIndex].split('=')[1] ?? process.argv[limitIndex + 1]);
if (!Number.isInteger(limit) || limit < 1 || limit > fps * filmDuration) throw new Error('--limit-frames must be an integer from 1 to 960');
const frames = limit, duration = frames / fps;
const partial = frames < fps * filmDuration;
const name = (proof ? 'vlak-components-detail-proof' : 'vlak-components-detail') + (partial ? '-partial' : '');
const file = path.join(output, name + '.mp4');
const silentFile = sound ? path.join(output, name + '-silent.mp4') : null;
const scoreFile = sound ? path.join(output, name + '-score.wav') : null;
const ffmpeg = process.env.VLAK_FFMPEG ?? 'ffmpeg';
const checkpointTimes = [.65, 1.5, 3.1, 5.3, 6.7, 8.2, 10.5, 12.8, 15.1, 17.8, 19.6, 22.1, 24.8, 27.5, 29.4, 31.7];
const checkpoints = [...new Set(checkpointTimes.map(time => Math.round(time * fps)).filter(frame => frame < frames))];
if (!checkpoints.length) checkpoints.push(frames - 1);
await mkdir(output, { recursive: true });
await stat(path.join(filmRoot, 'detail-scene.mjs'));

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Vlak component detail film</title><style>
@font-face{font-family:Inter;src:url('/Inter-580.ttf') format('truetype');font-weight:580;font-display:block}
*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#faf8f2;color:#1a1a1a;font-family:Inter,sans-serif;font-weight:580}
#stage,canvas,#veil,#title,#grain{position:absolute;inset:0;width:100%;height:100%;display:block}
#veil{background:#faf8f2;opacity:0;pointer-events:none}
#title{display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none}
#title span{font-size:400px;letter-spacing:-.055em;line-height:.9;white-space:nowrap}
#endnote{position:absolute;left:4.2vw;bottom:3.4vw;font-size:1.25vw;opacity:0;pointer-events:none}
#grain{pointer-events:none;mix-blend-mode:multiply;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 170 170' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.92' numOctaves='3' seed='17' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' opacity='.85' filter='url(%23n)'/%3E%3C/svg%3E");background-size:170px 170px;opacity:0}
.inverse #veil{background:#1a1a1a}.inverse #title,.inverse #endnote{color:#faf8f2}.inverse #grain{mix-blend-mode:screen}
</style><script type="importmap">{"imports":{"three":"/vendor/three/build/three.module.js","three/addons/":"/vendor/three/examples/jsm/"}}</script></head>
<body><div id="stage"></div><div id="veil"></div><div id="title"><span>Vlak.dev</span></div><div id="endnote">40 new components · 114 in one system</div><div id="grain"></div>
<script type="module">import {createFilm} from '/film/detail-scene.mjs';window.film={ready:false};try{let seed=20260906;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};await document.fonts.load('580 400px Inter');await document.fonts.ready;window.film=await createFilm()}catch(error){window.film={ready:false,error:error.stack??String(error)}}</script></body></html>`;

const types = { '.mjs': 'text/javascript', '.js': 'text/javascript', '.json': 'application/json', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.png': 'image/png', '.glb': 'model/gltf-binary' };
function within(root, relative) {
  const asset = path.resolve(root, relative);
  if (!asset.startsWith(root + path.sep)) throw new Error('Invalid asset path');
  return asset;
}
const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    if (pathname === '/favicon.ico') { response.writeHead(204); response.end(); return; }
    if (pathname === '/') { response.writeHead(200, { 'Content-Type': 'text/html' }); response.end(html); return; }
    let asset;
    if (pathname === '/Inter-580-clean.ttf') asset = path.join(filmRoot, 'Inter-580-clean.ttf');
    else if (pathname === '/Inter-580.ttf' || pathname === '/Inter-Regular.ttf') asset = path.join(site, 'app', pathname.slice(1));
    else if (pathname.startsWith('/film/')) asset = within(filmRoot, pathname.slice('/film/'.length));
    else if (pathname.startsWith('/vendor/three/')) asset = within(three, pathname.slice('/vendor/three/'.length));
    if (!asset) throw new Error('Missing asset');
    const info = await stat(asset);
    response.writeHead(200, { 'Content-Type': types[path.extname(asset)] ?? 'application/octet-stream', 'Content-Length': info.size });
    createReadStream(asset).pipe(response);
  } catch { response.writeHead(404); response.end('Not found'); }
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
let browser, encoder;
const errors = [];
try {
  browser = await chromium.launch({ headless: true, channel: 'chrome', args: ['--enable-unsafe-swiftshader', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('http://127.0.0.1:' + server.address().port + '/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.film?.ready || window.film?.error, undefined, { timeout: 120000 });
  const setup = await page.evaluate(() => ({ ready: window.film.ready, error: window.film.error, step: typeof window.film.step, geometry: window.film.stats }));
  if (!setup.ready || setup.error || setup.step !== 'function' || errors.length) throw new Error(JSON.stringify({ setup, errors }));
  let encoded;
  if (!stills) {
    encoder = spawn(ffmpeg, [
      '-y', '-hide_banner', '-loglevel', 'warning', '-f', 'image2pipe', '-framerate', String(fps), '-vcodec', 'png', '-i', 'pipe:0',
      '-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '17', '-profile:v', 'high', '-level:v', '4.1', '-g', '60',
      '-maxrate', '10M', '-bufsize', '20M', '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
      '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
      '-bsf:v', 'h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0',
      '-movflags', '+faststart', silentFile ?? file,
    ], { stdio: ['pipe', 'ignore', 'pipe'] });
    let stderr = '';
    encoder.stderr.on('data', chunk => { stderr += chunk; });
    encoder.stdin.on('error', () => {});
    encoded = new Promise((resolve, reject) => {
      encoder.on('error', reject);
      encoder.on('close', code => code === 0 ? resolve() : reject(new Error(stderr || `FFmpeg exited ${code}`)));
    });
    encoded.catch(() => {});
    await once(encoder, 'spawn');
  }
  const begun = Date.now();
  for (const frame of stills ? checkpoints : Array.from({ length: frames }, (_, index) => index)) {
    await page.evaluate(async index => { await window.film.step(index); }, frame);
    const bytes = await page.screenshot({ type: 'png', animations: 'allow' });
    if (encoder && !encoder.stdin.write(bytes)) await once(encoder.stdin, 'drain');
    if (checkpoints.includes(frame)) await writeFile(path.join(output, `${name}-${String(frame).padStart(4, '0')}.png`), bytes);
    if (frame % 60 === 0) console.log(`Rendered ${frame}/${frames} frames (${((Date.now() - begun) / 1000).toFixed(1)}s)`);
  }
  if (encoder) { encoder.stdin.end(); await encoded; }
  if (errors.length) throw new Error(errors.join('\n'));
  if (sound) {
    try {
      await writeScore(scoreFile, duration);
      await new Promise((resolve, reject) => {
        const muxer = spawn(ffmpeg, [
          '-y', '-hide_banner', '-loglevel', 'warning', '-i', silentFile, '-i', scoreFile,
          '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2',
          '-af', 'loudnorm=I=-20:TP=-2:LRA=9', '-movflags', '+faststart', '-shortest', file,
        ], { stdio: ['ignore', 'ignore', 'pipe'] });
        let stderr = '';
        muxer.stderr.on('data', chunk => { stderr += chunk; });
        muxer.on('error', reject);
        muxer.on('close', code => code === 0 ? resolve() : reject(new Error(stderr || `FFmpeg mux exited ${code}`)));
      });
    } catch (error) { throw new Error(`Sound export failed. The completed silent master remains at ${silentFile}.`, { cause: error }); }
  }
  const reviewFrames = checkpoints.map(frame => ({ frame, time: frame / fps, file: path.join(output, `${name}-${String(frame).padStart(4, '0')}.png`) }));
  await copyFile(reviewFrames.at(-1).file, path.join(output, name + '-cover.png'));
  const result = {
    file: stills ? null : file, mode: stills ? 'stills' : 'video', width, height, fps, duration, filmDuration,
    frames: stills ? checkpoints.length : frames, partial, proceduralGeometry: true, screenshotPlates: false, geometry:setup.geometry,
    reviewFrames, audio: sound, silentFile,
    score: sound ? { file: scoreFile, source: 'apps/www/scripts/components-film/detail-sound.mjs', original: true, sampleRate: 48000, channels: 2, codec: 'aac', bitrate: 192000, loudnessTargetLUFS: -20, truePeakTargetDBTP: -2, cuts: scoreCuts } : null,
    source: 'apps/www/scripts/render-components-detail.mjs', scene: 'apps/www/scripts/components-film/detail-scene.mjs',
  };
  await writeFile(path.join(output, name + (stills ? '-stills' : '') + '.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result, null, 2));
  await page.evaluate(() => window.film.dispose?.());
} finally {
  encoder?.stdin.destroy();
  if (encoder && encoder.exitCode === null) encoder.kill();
  await browser?.close();
  server.close();
}
