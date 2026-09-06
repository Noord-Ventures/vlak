// Render one original Vlak interface with component assembly and native actions.
// node apps/www/scripts/render-interface-film.mjs press --proof --stills
// node apps/www/scripts/render-interface-film.mjs press --sound
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
	writeCuelumeScore,
	cuelumeVersion,
} from "./agent-film/cuelume-offline.mjs";
const filmDuration = 40;
const slug = process.argv[2];
const slugs = [
	"line",
	"press",
	"wall",
	"night",
	"evening",
	"room",
	"graphics",
	"render",
	"drive",
	"orbit",
	"frontier",
	"platforms",
];
if (!slugs.includes(slug))
	throw new Error(`Choose an interface: ${slugs.join(", ")}`);
const concept = [
	"graphics",
	"render",
	"drive",
	"orbit",
	"frontier",
	"platforms",
].includes(slug);
const directory = path.dirname(fileURLToPath(import.meta.url));
const filmRoot = path.join(directory, "interface-films");
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
	entryPoints: [path.join(filmRoot, "runtime.jsx")],
	plugins: [
		{
			name: "original-interface",
			setup(plugin) {
				plugin.onResolve({ filter: /^film:config$/ }, () => ({
					path: path.join(filmRoot, "films", `${slug}.jsx`),
				}));
				plugin.onResolve({ filter: /^next\/dynamic$/ }, () => ({
					path: path.join(filmRoot, "dynamic.jsx"),
				}));
			},
		},
	],
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
		path.join(homedir(), `Movies/Vlak/interface-films/${slug}`),
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
	`vlak-${slug}-interface` +
	(proof ? "-proof" : "") +
	(partial ? "-partial" : "");
const file = path.join(output, name + ".mp4");
const silentFile = sound ? path.join(output, name + "-silent.mp4") : null;
const scoreFile = sound ? path.join(output, name + "-score.wav") : null;
const ffmpeg = process.env.VLAK_FFMPEG ?? "ffmpeg";
const checkpointTimes = [
	0.5, 1.25, 2, 2.8, 3.5, 4.5, 5.5, 6.8, 8.2, 9.9, 12.5, 15.3, 17.5, 20.5, 23.5,
	25.5, 27.7, 30.8, 34.5, 36.5, 39.7,
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
await stat(path.join(filmRoot, "runtime.jsx"));

const html = `<!doctype html><html lang="en" data-theme="light"><head><meta charset="utf-8"><title>Vlak · ${slug}</title>
<link rel="stylesheet" href="/css/vlak-react.css"><link rel="stylesheet" href="/core-components.css"><link rel="stylesheet" href="/site.css"><link rel="stylesheet" href="/interfaces.css"><link rel="stylesheet" href="/scene.css"><style>
html::before{display:none}html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:var(--bg)}
#world{position:absolute;left:0;top:0;width:1920px;height:1080px;transform-origin:0 0}
#film-camera{position:absolute;left:0;top:0;transform-origin:0 0}
#film-interface{width:1180px;height:772px;zoom:3;container-type:inline-size;transform-origin:0 0}
#film-type{position:absolute;left:0;top:0;width:1920px;height:1080px;pointer-events:none;color:var(--text)}
#film-name{position:absolute;left:72px;top:64px;font-size:22px;letter-spacing:-.025em;line-height:1.2}
#film-wordmark{position:absolute;left:72px;top:55px;font-size:116px;line-height:1;letter-spacing:-.055em}
#film-path{position:absolute;right:72px;top:145px;font-size:20px;line-height:1.2;color:var(--text-secondary)}
</style></head><body><div id="world"><div id="film-camera"><div class="if-board" id="film-interface"></div></div><div id="film-type"><div id="film-name">${slug}</div><div id="film-wordmark">Vlak.dev</div><div id="film-path">/interfaces/${slug}</div></div></div><script src="/bundle.js"></script></body></html>`;

const types = {
	".css": "text/css",
	".mjs": "text/javascript",
	".js": "text/javascript",
	".json": "application/json",
	".ttf": "font/ttf",
	".woff2": "font/woff2",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".webp": "image/webp",
	".svg": "image/svg+xml",
	".mp4": "video/mp4",
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
		if (pathname === "/site.css") asset = path.join(site, "app/site.css");
		if (pathname === "/scene.css")
			asset = path.join(
				site,
				`app/interfaces/${concept ? "concepts" : slug}/scene.css`,
			);
		if (pathname === "/interfaces.css" || pathname === "/scene-motion.css")
			asset = path.join(site, "app/interfaces", pathname.slice(1));
		if (pathname.startsWith("/interfaces/"))
			asset = within(
				path.join(site, "public"),
				decodeURIComponent(pathname.slice(1)),
			);
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
const errors = [],
	thirdPartyDiagnostics = [];
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
		colorScheme: slug === "night" ? "dark" : "light",
		reducedMotion: slug === "render" ? "no-preference" : "reduce",
		locale: "en-GB",
		timezoneId: "UTC",
	});
	page.on("pageerror", (error) => errors.push(error.message));
	page.on("console", (message) => {
		if (message.type() === "error") {
			const text = message.text();
			if (
				slug === "render" &&
				text ===
					"Permissions policy violation: accelerometer is not allowed in this document."
			)
				thirdPartyDiagnostics.push(text);
			else errors.push(text);
		}
	});
	await page.goto("http://127.0.0.1:" + server.address().port + "/", {
		waitUntil: "domcontentloaded",
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
		geometry: window.film.config,
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
			await Promise.race([
				once(encoder.stdin, "drain"),
				encoded.then(() => {
					throw new Error("Encoder closed before all film frames were written");
				}),
			]);
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
			const inspection = await page.evaluate(() => window.film.inspect());
			await writeCuelumeScore(scoreFile, inspection.sounds, duration);
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
		thirdPartyDiagnostics,
		reviewFrames,
		audio: sound,
		silentFile,
		score: sound
			? {
					file: scoreFile,
					source: "apps/www/scripts/agent-film/cuelume-offline.mjs",
					original: false,
					soundSource: {
						url: "https://cuelume.dev/",
						version: cuelumeVersion,
						license: "MIT",
					},
					sampleRate: 48000,
					channels: 2,
					codec: "aac",
					bitrate: 192000,
					loudnessTargetLUFS: -20,
					truePeakTargetDBTP: -2,
					cues: (await page.evaluate(() => window.film.inspect())).sounds,
				}
			: null,
		source: "apps/www/scripts/render-interface-film.mjs",
		scene: "apps/www/scripts/interface-films/runtime.jsx",
		interface: `apps/www/app/interfaces/${concept ? "concepts" : slug}/board.tsx`,
		interfaceStyles: `apps/www/app/interfaces/${concept ? "concepts" : slug}/scene.css`,
	};
	await writeFile(
		path.join(output, name + (stills ? "-stills" : "") + ".json"),
		JSON.stringify(result, null, 2) + "\n",
	);
	console.log(
		JSON.stringify(
			{
				file: result.file,
				mode: result.mode,
				frames: result.frames,
				state: result.finalState.state,
				warnings: result.finalState.warnings,
				audio: result.audio,
			},
			null,
			2,
		),
	);
	await page.evaluate(() => window.film.dispose?.());
} finally {
	encoder?.stdin.destroy();
	if (encoder && encoder.exitCode === null) encoder.kill();
	await browser?.close();
	server.closeAllConnections();
	server.close();
}
