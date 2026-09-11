import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { resolve } from "node:path";
import { LocalFileReviewAdapter } from "../adapters/local-file.ts";
import { localFixtureRecords, localReferencePrincipal } from "../fixtures.ts";
import { createRecordReviewHandler, fixedLocalOwnership } from "../handlers/reference/handler.ts";
import { RECORD_REVIEW_MAX_BODY_BYTES } from "../transports/http/contract.ts";

const host = process.env.VLAK_WORKFLOW_HOST ?? "127.0.0.1";
const port = Number(process.env.VLAK_WORKFLOW_PORT ?? "3212");
const dataFile = resolve(process.env.VLAK_WORKFLOW_DATA_FILE ?? ".data/record-review.json");
const adapter = new LocalFileReviewAdapter(dataFile, { fixtures: { [localReferencePrincipal.scopeId]: localFixtureRecords }, historyLimit: 20 });
const handler = createRecordReviewHandler({ adapter, ownership: fixedLocalOwnership(localReferencePrincipal) });

const server = createServer(async (request, response) => {
  try {
    const body = request.method === "POST" ? await readJson(request) : undefined;
    const result = await handler({
      method: request.method ?? "GET",
      url: request.url ?? "/",
      headers: Object.fromEntries(Object.entries(request.headers).map(([key, value]) => [key, Array.isArray(value) ? value.join(", ") : value])),
      body,
    });
    sendJson(response, result.status, result.body, result.headers);
  } catch (error) {
    const status = error instanceof RequestBodyError ? error.status : 500;
    sendJson(response, status, { error: status === 500 ? "internal-error" : error instanceof Error ? error.message : "invalid-request" });
  }
});

server.listen(port, host, () => {
  process.stdout.write(`Record review reference server: http://${host}:${port}\nData: ${dataFile}\n`);
});

class RequestBodyError extends Error {
  readonly status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  const contentType = request.headers["content-type"]?.split(";", 1)[0]?.trim();
  if (contentType !== "application/json") throw new RequestBodyError(415, "content-type-must-be-application-json");
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > RECORD_REVIEW_MAX_BODY_BYTES) throw new RequestBodyError(413, "request-body-too-large");
    chunks.push(buffer);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw new RequestBodyError(400, "invalid-json"); }
}

function sendJson(response: ServerResponse, status: number, body: unknown, headers: Record<string, string> = {}): void {
  response.writeHead(status, { ...headers, "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  response.end(`${JSON.stringify(body)}\n`);
}
