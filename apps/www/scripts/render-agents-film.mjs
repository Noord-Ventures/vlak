// Render Vlak's actual agent interface and native interactions with film motion.
// node apps/www/scripts/render-agents-film.mjs --proof --stills
// node apps/www/scripts/render-agents-film.mjs --sound
// VLAK_FFMPEG and VLAK_VIDEO_OUTPUT override the encoder and destination.
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createReadStream } from "node:fs";
import { mkdir, stat, writeFile, copyFile, readdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";
import {
	writeScore,
	scoreCuts,
	landingCues,
	soundSource,
} from "./agent-film/sound.mjs";

import { filmDuration } from "./agent-film/timeline.mjs";

const directory = path.dirname(fileURLToPath(import.meta.url));
const filmRoot = path.join(directory, "agent-film");
const site = path.resolve(directory, "..");
const repo = path.resolve(site, "../..");
const require = createRequire(path.join(site, "package.json"));
const packageRoot = path.dirname(require.resolve("@noorddev/vlak-react"));
const componentCss = require.resolve("@noorddev/vlak/css/components.css");
const pnpm = path.join(repo, "node_modules/.pnpm");
const esbuildPackage = (await readdir(pnpm)).find((name) =>
	name.startsWith("esbuild@"),
);
if (!esbuildPackage)
	throw new Error("Install workspace dependencies before rendering");
const { build } = await import(
	pathToFileURL(
		path.join(pnpm, esbuildPackage, "node_modules/esbuild/lib/main.js"),
	)
);
const bundled = await build({
	entryPoints: [path.join(filmRoot, "film.jsx")],
	absWorkingDir: site,
	bundle: true,
	write: false,
	format: "iife",
	platform: "browser",
	target: "chrome120",
	jsx: "automatic",
	define: { "process.env.NODE_ENV": '"production"' },
	minify: true,
	logLevel: "silent",
});
const output = path.resolve(
	process.env.VLAK_VIDEO_OUTPUT ??
		path.join(homedir(), "Movies/Vlak/agent-assembly"),
);
const proof = process.argv.includes("--proof");
const stills = process.argv.includes("--stills");
const sound = process.argv.includes("--sound") && !stills;
const width = proof ? 960 : 1920,
	height = proof ? 540 : 1080;
const fps = 30;
const limitIndex = process.argv.findIndex(
	(arg) => arg === "--limit-frames" || arg.startsWith("--limit-frames="),
);
const limit =
	limitIndex < 0
		? fps * filmDuration
		: Number(
				process.argv[limitIndex].split("=")[1] ?? process.argv[limitIndex + 1],
			);
if (!Number.isInteger(limit) || limit < 1 || limit > fps * filmDuration)
	throw new Error(
		`--limit-frames must be an integer from 1 to ${fps * filmDuration}`,
	);
const frames = limit,
	duration = frames / fps;
const partial = frames < fps * filmDuration;
const name =
	"vlak-agents-interface" +
	(proof ? "-proof" : "") +
	(partial ? "-partial" : "");
const file = path.join(output, name + ".mp4");
const silentFile = sound ? path.join(output, name + "-silent.mp4") : null;
const scoreFile = sound ? path.join(output, name + "-score.wav") : null;
const ffmpeg = process.env.VLAK_FFMPEG ?? "ffmpeg";
const checkpointTimes = [
	0.4, 0.65, 0.9, 1.3, 2, 2.8, 3.4, 4.15, 4.55, 5.2, 5.8, 6.3, 6.9, 7.6, 8.1,
	9.4, 9.8, 10.05, 10.5, 11.5, 13.9, 16.3, 17.4, 18.8, 20.5, 23.3, 23.8, 24.3,
	24.8, 27.5, 29.35, 29.7, 30.05, 30.6, 31.6, 34.5, 36.2, 37.2, 39.7,
];
const checkpoints = [
	...new Set(
		checkpointTimes
			.map((time) => Math.round(time * fps))
			.filter((frame) => frame < frames),
	),
];
if (!checkpoints.length) checkpoints.push(frames - 1);
await mkdir(output, { recursive: true });
await stat(path.join(filmRoot, "film.jsx"));

const html = `<!doctype html><html lang="en" data-theme="light"><head><meta charset="utf-8"><title>Vlak · Agent management</title>
<link rel="stylesheet" href="/css/vlak-react.css"><link rel="stylesheet" href="/core-components.css"><link rel="stylesheet" href="/agent-scene.css"><style>
html::before{display:none}html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:var(--bg)}
#world{position:absolute;left:0;top:0;width:1920px;height:1080px;transform-origin:0 0}
#agent-camera{position:absolute;left:0;top:0;transform-origin:0 0}
#agent-interface{width:1180px;height:772px;zoom:3;container-type:inline-size;transform-origin:0 0}
#film-type{position:absolute;left:0;top:0;width:1920px;height:1080px;pointer-events:none;color:var(--text)}
#film-name{position:absolute;left:72px;top:64px;font-size:22px;letter-spacing:-.025em;line-height:1.2}
#film-wordmark{position:absolute;left:72px;top:55px;font-size:116px;line-height:1;letter-spacing:-.055em}
#film-path{position:absolute;right:72px;top:145px;font-size:20px;line-height:1.2;color:var(--text-secondary)}
</style></head><body><div id="world"><div id="agent-camera"><div id="agent-interface"></div></div><div id="film-type"><div id="film-name">Agent management</div><div id="film-wordmark">Vlak.dev</div><div id="film-path">/interfaces/agents</div></div></div><script src="/bundle.js"></script></body></html>`;

const types = {
	".css": "text/css",
	".mjs": "text/javascript",
	".js": "text/javascript",
	".json": "application/json",
	".ttf": "font/ttf",
	".woff2": "font/woff2",
	".png": "image/png",
	".glb": "model/gltf-binary",
};
function within(root, relative) {
	const asset = path.resolve(root, relative);
	if (!asset.startsWith(root + path.sep)) throw new Error("Invalid asset path");
	return asset;
}
const server = createServer(async (request, response) => {
	try {
		const pathname = new URL(request.url, "http://localhost").pathname;
		if (pathname === "/favicon.ico") {
			response.writeHead(204);
			response.end();
			return;
		}
		if (pathname === "/") {
			response.writeHead(200, { "Content-Type": "text/html" });
			response.end(html);
			return;
		}
		if (pathname === "/bundle.js") {
			response.writeHead(200, { "Content-Type": "text/javascript" });
			response.end(bundled.outputFiles[0].contents);
			return;
		}
		let asset;
		if (pathname === "/core-components.css") asset = componentCss;
		if (pathname === "/agent-scene.css")
			asset = path.join(site, "app/interfaces/agents/scene.css");
		if (pathname.startsWith("/css/"))
			asset = within(packageRoot, pathname.slice("/css/".length));
		if (!asset) throw new Error("Missing asset");
		const info = await stat(asset);
		response.writeHead(200, {
			"Content-Type": types[path.extname(asset)] ?? "application/octet-stream",
			"Content-Length": info.size,
		});
		createReadStream(asset).pipe(response);
	} catch {
		response.writeHead(404);
		response.end("Not found");
	}
});
server.listen(0, "127.0.0.1");
await once(server, "listening");
let browser, encoder;
const errors = [];
try {
	browser = await chromium.launch({
		headless: true,
		channel: "chrome",
		args: [
			"--enable-unsafe-swiftshader",
			"--disable-background-timer-throttling",
			"--disable-renderer-backgrounding",
		],
	});
	const page = await browser.newPage({
		viewport: { width, height },
		deviceScaleFactor: 2,
		colorScheme: "light",
		reducedMotion: "reduce",
		locale: "en-GB",
		timezoneId: "UTC",
	});
	page.on("pageerror", (error) => errors.push(error.message));
	page.on("console", (message) => {
		if (message.type() === "error") errors.push(message.text());
	});
	await page.goto("http://127.0.0.1:" + server.address().port + "/", {
		waitUntil: "networkidle",
	});
	await page.waitForFunction(
		() => window.film?.ready || window.film?.error,
		undefined,
		{ timeout: 120000 },
	);
	const setup = await page.evaluate(() => ({
		ready: window.film.ready,
		error: window.film.error,
		step: typeof window.film.step,
		geometry: window.film.stats,
	}));
	if (!setup.ready || setup.error || setup.step !== "function" || errors.length)
		throw new Error(JSON.stringify({ setup, errors }));
	let encoded;
	if (!stills) {
		encoder = spawn(
			ffmpeg,
			[
				"-y",
				"-hide_banner",
				"-loglevel",
				"warning",
				"-f",
				"image2pipe",
				"-framerate",
				String(fps),
				"-vcodec",
				"png",
				"-i",
				"pipe:0",
				"-an",
				"-c:v",
				"libx264",
				"-preset",
				"fast",
				"-crf",
				"17",
				"-profile:v",
				"high",
				"-level:v",
				"4.1",
				"-g",
				"60",
				"-maxrate",
				"10M",
				"-bufsize",
				"20M",
				"-vf",
				"scale=out_color_matrix=bt709:out_range=tv,format=yuv420p",
				"-color_primaries",
				"bt709",
				"-color_trc",
				"bt709",
				"-colorspace",
				"bt709",
				"-bsf:v",
				"h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0",
				"-movflags",
				"+faststart",
				silentFile ?? file,
			],
			{ stdio: ["pipe", "ignore", "pipe"] },
		);
		let stderr = "";
		encoder.stderr.on("data", (chunk) => {
			stderr += chunk;
		});
		encoder.stdin.on("error", () => {});
		encoded = new Promise((resolve, reject) => {
			encoder.on("error", reject);
			encoder.on("close", (code) =>
				code === 0
					? resolve()
					: reject(new Error(stderr || `FFmpeg exited ${code}`)),
			);
		});
		encoded.catch(() => {});
		await once(encoder, "spawn");
	}
	const begun = Date.now();
	for (const frame of stills
		? checkpoints
		: Array.from({ length: frames }, (_, index) => index)) {
		await page.evaluate(async (index) => {
			await window.film.step(index);
		}, frame);
		const bytes = await page.screenshot({
			type: "png",
			scale: "css",
			animations: "allow",
		});
		if (encoder && !encoder.stdin.write(bytes))
			await once(encoder.stdin, "drain");
		if (checkpoints.includes(frame))
			await writeFile(
				path.join(output, `${name}-${String(frame).padStart(4, "0")}.png`),
				bytes,
			);
		if (frame % 60 === 0)
			console.log(
				`Rendered ${frame}/${frames} frames (${((Date.now() - begun) / 1000).toFixed(1)}s)`,
			);
	}
	if (encoder) {
		encoder.stdin.end();
		await encoded;
	}
	if (errors.length) throw new Error(errors.join("\n"));
	if (sound) {
		try {
			await writeScore(scoreFile, duration);
			await new Promise((resolve, reject) => {
				const muxer = spawn(
					ffmpeg,
					[
						"-y",
						"-hide_banner",
						"-loglevel",
						"warning",
						"-i",
						silentFile,
						"-i",
						scoreFile,
						"-map",
						"0:v:0",
						"-map",
						"1:a:0",
						"-c:v",
						"copy",
						"-c:a",
						"aac",
						"-b:a",
						"192k",
						"-ar",
						"48000",
						"-ac",
						"2",
						"-af",
						"loudnorm=I=-20:TP=-2:LRA=9",
						"-movflags",
						"+faststart",
						"-shortest",
						file,
					],
					{ stdio: ["ignore", "ignore", "pipe"] },
				);
				let stderr = "";
				muxer.stderr.on("data", (chunk) => {
					stderr += chunk;
				});
				muxer.on("error", reject);
				muxer.on("close", (code) =>
					code === 0
						? resolve()
						: reject(new Error(stderr || `FFmpeg mux exited ${code}`)),
				);
			});
		} catch (error) {
			throw new Error(
				`Sound export failed. The completed silent master remains at ${silentFile}.`,
				{ cause: error },
			);
		}
	}
	const reviewFrames = checkpoints.map((frame) => ({
		frame,
		time: frame / fps,
		file: path.join(output, `${name}-${String(frame).padStart(4, "0")}.png`),
	}));
	await copyFile(
		reviewFrames.at(-1).file,
		path.join(output, name + "-cover.png"),
	);
	const result = {
		file: stills ? null : file,
		mode: stills ? "stills" : "video",
		width,
		height,
		fps,
		duration,
		filmDuration,
		frames: stills ? checkpoints.length : frames,
		partial,
		canonicalReactComponents: true,
		screenshotPlates: false,
		components: setup.geometry,
		finalState: await page.evaluate(() => window.film.inspect()),
		reviewFrames,
		audio: sound,
		silentFile,
		score: sound
			? {
					file: scoreFile,
					source: "apps/www/scripts/agent-film/sound.mjs",
					original: false,
					soundSource,
					sampleRate: 48000,
					channels: 2,
					codec: "aac",
					bitrate: 192000,
					loudnessTargetLUFS: -20,
					truePeakTargetDBTP: -2,
					cuts: scoreCuts,
					landingCues,
				}
			: null,
		source: "apps/www/scripts/render-agents-film.mjs",
		scene: "apps/www/scripts/agent-film/film.jsx",
		interface: "apps/www/app/interfaces/agents/board.tsx",
		interfaceStyles: "apps/www/app/interfaces/agents/scene.css",
	};
	await writeFile(
		path.join(output, name + (stills ? "-stills" : "") + ".json"),
		JSON.stringify(result, null, 2) + "\n",
	);
	console.log(JSON.stringify(result, null, 2));
	await page.evaluate(() => window.film.dispose?.());
} finally {
	encoder?.stdin.destroy();
	if (encoder && encoder.exitCode === null) encoder.kill();
	await browser?.close();
	server.close();
}
