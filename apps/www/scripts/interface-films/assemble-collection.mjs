// Assemble the complete, portable review gallery only after every master passes.
import {
	copyFile,
	cp,
	mkdir,
	readFile,
	readdir,
	rename,
	stat,
	writeFile,
} from "node:fs/promises";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { interfaces } from "../../app/interfaces/catalog.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.resolve(here, "../../package.json"));
const packageRoot = path.dirname(require.resolve("@noorddev/vlak-react"));
const output = path.resolve(
	process.env.VLAK_COLLECTION_OUTPUT ??
		path.join(homedir(), "Movies/Vlak/interface-films"),
);
const source = path.resolve(process.env.VLAK_COLLECTION_STAGING ?? output);
const featureSource = path.resolve(
	process.env.VLAK_FEATURE_OUTPUT ??
		path.join(homedir(), "Movies/Vlak/prompt-to-interface"),
);
async function atomicWrite(file, contents) {
	const temporary = `${file}.incoming-${process.pid}`;
	await writeFile(temporary, contents);
	await rename(temporary, file);
}
function relocateReport(value) {
	if (typeof value === "string")
		return value.startsWith(source + path.sep)
			? output + value.slice(source.length)
			: value;
	if (Array.isArray(value)) return value.map(relocateReport);
	if (value && typeof value === "object")
		return Object.fromEntries(
			Object.entries(value).map(([key, item]) => [key, relocateReport(item)]),
		);
	return value;
}
const escapeHtml = (s) =>
	String(s).replace(
		/[&<>"']/g,
		(c) =>
			({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
				c
			],
	);
async function verifyMaster(file) {
	const ffmpeg = process.env.VLAK_FFMPEG ?? "ffmpeg";
	const decoded = await new Promise((resolve, reject) => {
		const process = spawn(
			ffmpeg,
			[
				"-hide_banner",
				"-v",
				"info",
				"-xerror",
				"-i",
				file,
				"-map",
				"0:v:0",
				"-map",
				"0:a:0",
				"-progress",
				"pipe:1",
				"-nostats",
				"-f",
				"null",
				"-",
			],
			{ stdio: ["ignore", "pipe", "pipe"] },
		);
		let progress = "",
			diagnostic = "";
		process.stdout.on("data", (chunk) => {
			progress += chunk;
		});
		process.stderr.on("data", (chunk) => {
			diagnostic += chunk;
		});
		process.on("error", reject);
		process.on("close", (code) => {
			const frames = Number(
				[...progress.matchAll(/^frame=(\d+)$/gm)].at(-1)?.[1],
			);
			if (
				code !== 0 ||
				frames !== 1200 ||
				!diagnostic.match(/Video: h264[^\n]*1920x1080[^\n]*30 fps/) ||
				!diagnostic.match(/Audio: aac[^\n]*48000 Hz, stereo/)
			)
				return reject(
					new Error(
						`Invalid current master ${file}: decoded ${frames} frames. ${diagnostic.slice(-1200)}`,
					),
				);
			resolve(frames);
		});
	});
	return {
		decodedFrames: decoded,
		sha256: createHash("sha256")
			.update(await readFile(file))
			.digest("hex"),
	};
}
const entries = [];
for (const item of interfaces) {
	const name = `${item.slug}/vlak-${item.slug}-interface`,
		file = `${name}.mp4`,
		cover = `${name}-cover.png`;
	const report = JSON.parse(
		await readFile(path.join(source, `${name}.json`), "utf8"),
	);
	if (
		report.width !== 1920 ||
		report.height !== 1080 ||
		report.fps !== 30 ||
		report.duration !== 40 ||
		report.frames !== 1200 ||
		!report.audio ||
		report.partial
	)
		throw new Error(`Incomplete master: ${item.slug}`);
	if (report.finalState?.warnings?.length)
		throw new Error(`Unresolved film warnings: ${item.slug}`);
	const browserFrame = report.finalState?.browserFrame;
	if (
		browserFrame?.address !== `vlak.dev/interfaces/${item.slug}` ||
		browserFrame.board?.width !== 1180 ||
		browserFrame.board?.height !== 772 ||
		!browserFrame.bounds
	)
		throw new Error(`Missing current browser frame: ${item.slug}`);
	const info = await stat(path.join(source, file));
	const verified = await verifyMaster(path.join(source, file));
	await stat(path.join(source, cover));
	entries.push({
		slug: item.slug,
		title: item.title,
		workflow: item.use,
		file,
		cover,
		bytes: info.size,
		...verified,
		duration: 40,
		width: 1920,
		height: 1080,
		fps: 30,
		audio: "AAC stereo, 48 kHz",
		sound: "Cuelume 0.2.2",
		report: `${name}.json`,
		browserFrame,
	});
}
let feature = null;
const featureName = "vlak-prompt-to-interface";
try {
	await Promise.all(
		[".mp4", "-cover.png", ".json"].map((suffix) =>
			stat(path.join(featureSource, featureName + suffix)),
		),
	);
	const report = JSON.parse(
		await readFile(path.join(featureSource, featureName + ".json"), "utf8"),
	);
	if (
		report.width !== 1920 ||
		report.height !== 1080 ||
		report.fps !== 30 ||
		report.duration !== 40 ||
		report.frames !== 1200 ||
		!report.audio ||
		report.partial ||
		report.finalState?.warnings?.length
	)
		throw new Error("Incomplete featured master: prompt-to-interface");
	const original = path.join(featureSource, featureName + ".mp4");
	feature = {
		slug: "prompt-to-interface",
		title: "Prompt to interface",
		description:
			"A prompt becomes an agent workspace, with an original electronic crescendo.",
		file: `prompt-to-interface/${featureName}.mp4`,
		cover: `prompt-to-interface/${featureName}-cover.png`,
		report: `prompt-to-interface/${featureName}.json`,
		bytes: (await stat(original)).size,
		...(await verifyMaster(original)),
		duration: 40,
		width: 1920,
		height: 1080,
		fps: 30,
		audio: "AAC stereo, 48 kHz",
		sound: "Original electronic score and Cuelume 0.2.2",
	};
} catch (error) {
	if (error.code !== "ENOENT") throw error;
}
// Validate every source before replacing any served file. Never fall back to
// the old, unframed agent export or discard other review-gallery artifacts.
await mkdir(output, { recursive: true });
const archive = path.join(output, "Vlak-interface-films.zip");
try {
	const previous = JSON.parse(
		await readFile(path.join(output, "manifest.json"), "utf8"),
	);
	if (!previous.interfaces?.every((item) => item.browserFrame))
		await copyFile(
			archive,
			path.join(output, "Vlak-interface-films-unframed.zip"),
			constants.COPYFILE_EXCL,
		);
} catch (error) {
	if (!["ENOENT", "EEXIST"].includes(error.code)) throw error;
}
if (source !== output) {
	for (const item of entries) {
		const target = path.join(output, item.slug);
		await mkdir(target, { recursive: true });
		for (const filename of await readdir(path.join(source, item.slug))) {
			if (!filename.startsWith(`vlak-${item.slug}-interface`)) continue;
			const origin = path.join(source, item.slug, filename);
			if (!(await stat(origin)).isFile()) continue;
			const destination = path.join(target, filename);
			if (filename.endsWith(".json")) {
				const report = JSON.parse(await readFile(origin, "utf8"));
				await atomicWrite(
					destination,
					JSON.stringify(relocateReport(report), null, 2) + "\n",
				);
			} else {
				const temporary = `${destination}.incoming-${process.pid}`;
				await copyFile(origin, temporary);
				await rename(temporary, destination);
			}
		}
	}
}
if (feature) {
	await mkdir(path.join(output, "prompt-to-interface"), { recursive: true });
	for (const suffix of [".mp4", "-cover.png", ".json"]) {
		const filename = featureName + suffix,
			origin = path.join(featureSource, filename),
			destination = path.join(output, "prompt-to-interface", filename);
		if (origin === destination) continue;
		if (suffix === ".json") {
			const report = JSON.parse(await readFile(origin, "utf8"));
			report.file = path.join(output, feature.file);
			await atomicWrite(destination, JSON.stringify(report, null, 2) + "\n");
		} else {
			const temporary = `${destination}.incoming-${process.pid}`;
			await copyFile(origin, temporary);
			await rename(temporary, destination);
		}
	}
}
await mkdir(path.join(output, "assets"), { recursive: true });
await copyFile(
	path.join(packageRoot, "vlak-react.css"),
	path.join(output, "assets/vlak-react.css"),
);
await copyFile(
	require.resolve("@noorddev/vlak/css/components.css"),
	path.join(output, "assets/components.css"),
);
await cp(path.join(packageRoot, "fonts"), path.join(output, "assets/fonts"), {
	recursive: true,
});
const manifest = {
	title: "Vlak interface films",
	count: entries.length,
	created: new Date().toISOString(),
	interfaces: entries,
	...(feature ? { feature } : {}),
	soundSource: {
		url: "https://cuelume.dev/",
		version: "0.2.2",
		license: "MIT",
	},
};
await atomicWrite(
	path.join(output, "manifest.json"),
	JSON.stringify(manifest, null, 2) + "\n",
);
const featuredHtml = feature
	? `<section class="featured" id="prompt-to-interface" aria-labelledby="featured-title"><div class="caption"><h2 id="featured-title">${escapeHtml(feature.title)}</h2><span class="number">Featured film</span></div><p class="workflow">${escapeHtml(feature.description)}</p><video controls playsinline preload="none" poster="${feature.cover}?v=${feature.sha256.slice(0, 12)}" aria-label="Prompt to interface film"><source src="${feature.file}?v=${feature.sha256.slice(0, 12)}" type="video/mp4"></video><div class="file"><span>40 seconds · 1080p · Sound on</span><a href="${feature.file}" download>Download MP4 ↗</a></div></section>`
	: "";
const html = `<!doctype html><html lang="en" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vlak · Interface films</title><link rel="stylesheet" href="assets/vlak-react.css"><link rel="stylesheet" href="assets/components.css"><style>
*{box-sizing:border-box}html,body{margin:0;background:var(--bg);color:var(--text)}html::before{display:none}body{padding:48px clamp(20px,4vw,80px) 64px}header{display:flex;align-items:end;justify-content:space-between;gap:32px;padding-bottom:40px}h1{font-size:clamp(64px,9vw,144px);font-weight:500;line-height:.9;letter-spacing:-.065em;margin:0}header p{margin:20px 0 0;color:var(--text-secondary);font-size:18px}a{color:inherit;text-decoration-thickness:1px;text-underline-offset:5px}header>a{font-size:16px;white-space:nowrap}nav{display:flex;flex-wrap:wrap;gap:12px 24px;border-top:1px solid var(--divider);padding:20px 0 28px}nav a{font-size:14px}.featured{border:1px solid var(--divider);padding:24px;margin-bottom:40px;scroll-margin-top:24px}.featured video{max-width:1120px;margin-inline:auto}.films{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));border-top:1px solid var(--divider);border-left:1px solid var(--divider)}article{min-width:0;border-right:1px solid var(--divider);border-bottom:1px solid var(--divider);padding:24px;scroll-margin-top:24px}.caption{display:flex;justify-content:space-between;gap:20px;align-items:baseline}h2{margin:0;font-size:22px;font-weight:500;letter-spacing:-.025em}.number{color:var(--text-secondary);font-size:14px;font-variant-numeric:tabular-nums}.workflow{min-height:36px;margin:12px 0 18px;color:var(--text-secondary);font-size:14px;line-height:1.5}video{display:block;width:100%;aspect-ratio:16/9;background:var(--bg)}.file{display:flex;justify-content:space-between;gap:12px;align-items:baseline;margin-top:16px;font-size:13px}.file span{color:var(--text-secondary)}footer{display:flex;gap:20px;justify-content:space-between;padding-top:28px;color:var(--text-secondary);font-size:13px}@media(max-width:760px){body{padding-top:28px}header{align-items:start;flex-direction:column;gap:24px}.films{grid-template-columns:1fr}article{padding:20px}.workflow{min-height:0}footer{flex-direction:column}}
</style></head><body><header><div><h1>Vlak.dev</h1><p>${entries.length} interfaces. Built in motion.</p></div><a id="download-all" href="Vlak-interface-films.zip" download>Download all ${entries.length + (feature ? 1 : 0)} films ↗</a></header>${featuredHtml}<nav aria-label="Choose an interface">${entries.map((item) => `<a href="#${item.slug}">${escapeHtml(item.title)}</a>`).join("")}</nav><main class="films">${entries.map((item, index) => `<article id="${item.slug}"><div class="caption"><h2>${escapeHtml(item.title)}</h2><span class="number">${String(index + 1).padStart(2, "0")}</span></div><p class="workflow">${escapeHtml(item.workflow)}</p><video controls playsinline preload="none" poster="${item.cover}?v=${item.sha256.slice(0, 12)}" aria-label="${escapeHtml(item.title)} film"><source src="${item.file}?v=${item.sha256.slice(0, 12)}" type="video/mp4"></video><div class="file"><span>40 seconds · 1080p · Sound on</span><a href="${item.file}" download>Download MP4 ↗</a></div></article>`).join("")}</main><footer><span>Original Vlak components and native interface interactions.</span><span>Sound effects by <a href="https://cuelume.dev/">Cuelume</a></span></footer><script>const archive=document.getElementById('download-all');if(location.protocol==='file:')archive.hidden=true;else fetch(archive.href,{method:'HEAD'}).then(response=>{if(!response.ok)archive.hidden=true;}).catch(()=>{archive.hidden=true;});document.addEventListener('play',event=>{if(event.target.tagName==='VIDEO')for(const video of document.querySelectorAll('video'))if(video!==event.target)video.pause();},true);</script></body></html>`;
await atomicWrite(path.join(output, "index.html"), html);
const temporaryArchive = path.join(
	output,
	`.Vlak-interface-films-${process.pid}.zip`,
);
await new Promise((resolve, reject) => {
	const process = spawn(
		"zip",
		[
			"-q",
			"-r",
			temporaryArchive,
			"index.html",
			"manifest.json",
			"assets",
			...entries.flatMap((item) => [item.file, item.cover, item.report]),
			...(feature ? [feature.file, feature.cover, feature.report] : []),
		],
		{ cwd: output, stdio: ["ignore", "ignore", "pipe"] },
	);
	let error = "";
	process.stderr.on("data", (chunk) => {
		error += chunk;
	});
	process.on("error", reject);
	process.on("close", (code) =>
		code === 0 ? resolve() : reject(new Error(error || `zip exited ${code}`)),
	);
});
await rename(temporaryArchive, archive);
console.log(
	JSON.stringify(
		{
			gallery: path.join(output, "index.html"),
			archive,
			count: entries.length,
			feature: feature?.file ?? null,
			bytes: (await stat(archive)).size,
		},
		null,
		2,
	),
);
