// Offline transport for the unmodified, vendored Cuelume 0.2.2 audio engine.
// The original oscillators, envelopes, filters, shimmer and compressor execute
// in Chrome. This adapter supplies film time and repeatable white noise only.
import { createServer } from "node:http";
import { once } from "node:events";
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const vendor = new URL("./vendor/cuelume/", import.meta.url);
export const cuelumeVersion = "0.2.2";

/** Render original Cuelume graphs to a 48 kHz stereo PCM WAV, without playback. */
export async function writeCuelumeScore(file, cues, duration, { bedGain = 0.0028 } = {}) {
	if (!Number.isFinite(duration) || duration <= 0 || duration > 3600)
		throw new Error("Score duration must be between zero and one hour");
	for (const cue of cues) {
		if (!Number.isFinite(cue.time) || cue.time < 0 || !Number.isFinite(cue.volume)
			|| cue.volume < 0 || cue.volume > 1)
			throw new Error(`Invalid Cuelume cue: ${JSON.stringify(cue)}`);
	}
	const provenance = JSON.parse(await readFile(new URL("provenance.json", vendor), "utf8"));
	const sources = {};
	for (const [name, expected] of Object.entries(provenance.files)) {
		const source = await readFile(new URL(name, vendor));
		if (createHash("sha256").update(source).digest("hex") !== expected)
			throw new Error(`Vendored Cuelume file differs from the official package: ${name}`);
		sources[`/${name}`] = source.toString("utf8");
	}
	// The file on disk stays byte-identical to npm. This bridge exposes the same
	// private renderer that public play() invokes, so its graph is not rewritten.
	sources["/dist/audio/engine.js"] += "\nexport { renderRecipe };\n";
	const server = createServer((request, response) => {
		const source = sources[request.url];
		response.setHeader("Content-Type", source ? "text/javascript" : "text/html");
		response.end(source ?? "<!doctype html><title>Cuelume offline film score</title>");
	});
	server.listen(0, "127.0.0.1");
	await once(server, "listening");
	let browser;
	try {
		browser = await chromium.launch({ headless: true, channel: "chrome" });
		const page = await browser.newPage();
		await page.goto(`http://127.0.0.1:${server.address().port}/`);
		const result = await page.evaluate(async ({ cues, duration, bedGain }) => {
			const { renderRecipe } = await import("/dist/audio/engine.js");
			const { RECIPES, isSoundName } = await import("/dist/sounds/recipes.js");
			const rate = 48000;
			const length = Math.round(duration * rate);
			const context = new OfflineAudioContext(2, length, rate);
			const cleanupGroups = new Map();
			const originalRandom = Math.random;
			const originalTimeout = globalThis.setTimeout;
			let seed = 731022;
			let clock = 0;
			const scheduledContext = new Proxy(context, {
				get(target, key) {
					if (key === "currentTime") return clock;
					const value = Reflect.get(target, key, target);
					return typeof value === "function" ? value.bind(target) : value;
				},
			});
			const events = cues.filter((cue) => cue.time < duration).sort((a, b) => a.time - b.time);
			try {
				Math.random = () => {
					seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
					return seed / 4294967296;
				};
				globalThis.setTimeout = (callback, delay) => {
					// Cuelume disconnects tails with a wall-clock timer. In offline
					// rendering the callback belongs on the audio clock instead.
					const frame = Math.ceil((clock + delay / 1000) * rate / 128) * 128;
					if (frame < length) {
						if (!cleanupGroups.has(frame)) cleanupGroups.set(frame, []);
						cleanupGroups.get(frame).push(callback);
					}
					return frame;
				};
				for (const event of events) {
					if (!isSoundName(event.sound)) throw new Error(`Unknown Cuelume sound: ${event.sound}`);
					clock = event.time;
					renderRecipe(scheduledContext, RECIPES[event.sound], event.volume);
				}
			} finally {
				Math.random = originalRandom;
				globalThis.setTimeout = originalTimeout;
			}
			const cleanupPromises = [...cleanupGroups.entries()].map(([frame, callbacks]) =>
				context.suspend(frame / rate).then(async () => {
					for (const callback of callbacks) callback();
					await context.resume();
				}),
			);
			const rendered = await context.startRendering();
			await Promise.all(cleanupPromises);
			const data = [rendered.getChannelData(0), rendered.getChannelData(1)];
			const wav = new ArrayBuffer(44 + length * 4);
			const view = new DataView(wav);
			const bytes = new Uint8Array(wav);
			const text = (offset, value) => {
				for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i));
			};
			text(0, "RIFF"); view.setUint32(4, wav.byteLength - 8, true);
			text(8, "WAVEfmt "); view.setUint32(16, 16, true);
			view.setUint16(20, 1, true); view.setUint16(22, 2, true);
			view.setUint32(24, rate, true); view.setUint32(28, rate * 4, true);
			view.setUint16(32, 4, true); view.setUint16(34, 16, true);
			text(36, "data"); view.setUint32(40, length * 4, true);
			let peak = 0;
			let sum = 0;
			for (let i = 0; i < length; i++) {
				const t = i / rate;
				const envelope = Math.min(1, t / 0.6) * Math.min(1, (duration - t) / 1.6);
				// A separate original quiet bed. All transient effects above are
				// Cuelume; there are no homemade clicks, sweeps or impact layers.
				const bed = bedGain * envelope * (1 - Math.max(0, Math.min(1, (t - (duration - 5.5)) / 4)) * 0.6)
					* (Math.sin(Math.PI * 2 * 110 * t) + 0.22 * Math.sin(Math.PI * 2 * 164.8138 * t));
				for (let channel = 0; channel < 2; channel++) {
					const sample = data[channel][i] + bed;
					peak = Math.max(peak, Math.abs(sample));
					sum += sample * sample;
					view.setInt16(44 + i * 4 + channel * 2, Math.round(Math.max(-1, Math.min(1, sample)) * 32767), true);
				}
			}
			let binary = "";
			for (let offset = 0; offset < bytes.length; offset += 32768)
				binary += String.fromCharCode(...bytes.subarray(offset, offset + 32768));
			return { wav: btoa(binary), peak, rms: Math.sqrt(sum / (length * 2)), cues: events.length, rate, length };
		}, { cues, duration, bedGain });
		if (result.peak >= 1) throw new Error(`Cuelume score would clip at ${result.peak}`);
		await writeFile(file, Buffer.from(result.wav, "base64"));
		return { file, version: cuelumeVersion, peak: result.peak, rms: result.rms, cues: result.cues, rate: result.rate, length: result.length };
	} finally {
		await browser?.close();
		await new Promise((resolve) => server.close(resolve));
	}
}
