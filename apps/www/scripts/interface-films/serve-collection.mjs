// Local review server with byte ranges for native HTML video playback/seeking.
import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
const root = path.resolve(
	process.env.VLAK_COLLECTION_OUTPUT ??
		path.join(homedir(), "Movies/Vlak/interface-films"),
);
const port = Number(process.env.VLAK_VIDEO_PORT ?? 3115);
const types = {
	".html": "text/html; charset=utf-8",
	".css": "text/css",
	".json": "application/json",
	".woff2": "font/woff2",
	".png": "image/png",
	".mp4": "video/mp4",
	".zip": "application/zip",
};
const server = createServer(async (request, response) => {
	try {
		if (!["GET", "HEAD"].includes(request.method)) {
			response.writeHead(405, { Allow: "GET, HEAD" });
			response.end();
			return;
		}
		const url = new URL(request.url, "http://localhost");
		if (url.pathname === "/favicon.ico") {
			response.writeHead(204);
			response.end();
			return;
		}
		const file = path.resolve(
			root,
			`.${decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname)}`,
		);
		if (!file.startsWith(root + path.sep)) throw Error("Invalid path");
		const info = await stat(file);
		if (!info.isFile()) throw Error("Not a file");
		let start = 0,
			end = info.size - 1,
			status = 200;
		const range = request.headers.range;
		if (range) {
			const match = /^bytes=(\d*)-(\d*)$/.exec(range);
			if (!match || (!match[1] && !match[2])) {
				response.writeHead(416, { "Content-Range": `bytes */${info.size}` });
				response.end();
				return;
			}
			if (match[1]) {
				start = Number(match[1]);
				if (match[2]) end = Math.min(end, Number(match[2]));
			} else start = Math.max(0, info.size - Number(match[2]));
			if (start > end || start >= info.size) {
				response.writeHead(416, { "Content-Range": `bytes */${info.size}` });
				response.end();
				return;
			}
			status = 206;
		}
		response.writeHead(status, {
			"Content-Type": types[path.extname(file)] ?? "application/octet-stream",
			"Content-Length": end - start + 1,
			"Accept-Ranges": "bytes",
			...(status === 206
				? { "Content-Range": `bytes ${start}-${end}/${info.size}` }
				: {}),
		});
		if (request.method === "HEAD") {
			response.end();
			return;
		}
		const stream = createReadStream(file, { start, end });
		stream.on("error", () => response.destroy());
		response.on("close", () => stream.destroy());
		stream.pipe(response);
	} catch {
		if (!response.headersSent) response.writeHead(404);
		response.end("Not found");
	}
});
server.listen(port, "127.0.0.1", () =>
	console.log(
		`Vlak interface films: http://127.0.0.1:${server.address().port}/`,
	),
);
