import type { IncomingMessage, ServerResponse } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "./server.js";

export type McpHttpRequest = IncomingMessage & { body?: unknown };

function setPublicHeaders(response: ServerResponse) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization, Mcp-Session-Id, Last-Event-ID");
  response.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
}

/** Handle one stateless Streamable HTTP MCP request. Safe for serverless runtimes. */
export async function handleMcpRequest(request: McpHttpRequest, response: ServerResponse): Promise<void> {
  setPublicHeaders(response);

  if (request.method === "OPTIONS") {
    response.statusCode = 204;
    response.end();
    return;
  }

  if (request.method !== "POST") {
    response.statusCode = 405;
    response.setHeader("Allow", "POST, OPTIONS");
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  const server = createServer();

  try {
    await server.connect(transport);
    await transport.handleRequest(request, response, request.body);
  } catch (error) {
    console.error("Vlak MCP request failed", error);
    if (!response.headersSent) {
      response.statusCode = 500;
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      }));
    }
  } finally {
    await server.close().catch((error) => console.error("Vlak MCP cleanup failed", error));
  }
}
