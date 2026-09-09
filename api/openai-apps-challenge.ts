import type { IncomingMessage, ServerResponse } from "node:http";

/** Serve the exact domain-verification token issued by OpenAI's plugin portal. */
export default function handler(request: IncomingMessage, response: ServerResponse) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Type", "text/plain; charset=utf-8");
  response.setHeader("X-Content-Type-Options", "nosniff");

  if (request.method !== "GET" && request.method !== "HEAD") {
    response.statusCode = 405;
    response.setHeader("Allow", "GET, HEAD");
    response.end();
    return;
  }

  const token = process.env.OPENAI_APPS_CHALLENGE?.trim();
  if (!token) {
    response.statusCode = 404;
    response.end();
    return;
  }

  response.statusCode = 200;
  response.end(request.method === "HEAD" ? undefined : token);
}
