import { createServer as createHttpServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { handleMcpRequest } from "../src/http.js";
import type { McpToolMetric } from "../src/telemetry.js";
import { loadBundle, workflows } from "../src/data.js";

let httpServer: Server;
let client: Client;
const events: McpToolMetric[] = [];

beforeAll(async () => {
  httpServer = createHttpServer((request, response) => {
    void handleMcpRequest(request, response, event => { events.push(event); });
  });
  await new Promise<void>((resolve) => httpServer.listen(0, "127.0.0.1", resolve));
  const { port } = httpServer.address() as AddressInfo;
  client = new Client({ name: "http-test", version: "0.0.0" });
  await client.connect(new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${port}/mcp`)));
});

afterAll(async () => {
  await client?.close();
  await new Promise<void>((resolve, reject) => httpServer?.close((error) => error ? reject(error) : resolve()));
});

describe("Vlak Streamable HTTP transport", () => {
  it("allows clients to send privacy preference headers", async () => {
    const { port } = httpServer.address() as AddressInfo;
    const response = await fetch(`http://127.0.0.1:${port}/mcp`, { method: "OPTIONS" });
    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-headers")).toContain("DNT");
    expect(response.headers.get("access-control-allow-headers")).toContain("Sec-GPC");
    expect(events).toHaveLength(0);
  });

  it("initializes, advertises read-only tools, and handles a call", async () => {
    const { tools } = await client.listTools();
    expect(tools.map((tool) => tool.name)).toContain("get_component");
    expect(tools.every((tool) => tool.annotations?.readOnlyHint)).toBe(true);

    const result = await client.callTool({ name: "search_components", arguments: { term: "button" } });
    expect(result.structuredContent).toMatchObject({ term: "button" });
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ tool: "search_components", outcome: "success", source: "unknown", serverVersion: loadBundle().version, errorCategory: null });
  });

  it("measures optional OpenAI hints and tool errors through the actual HTTP transport", async () => {
    const result = await client.callTool({ name: "get_install", arguments: { name: "does-not-exist" }, _meta: { "openai/session": "not-retained" } });
    expect(result.isError).toBe(true);
    expect(events.at(-1)).toMatchObject({ tool: "get_install", outcome: "error", source: "openai_hint", errorCategory: "not_found" });
    expect(JSON.stringify(events)).not.toContain("not-retained");
  });

  it("distinguishes real SDK input failures from missing records and successful empty searches", async () => {
    const requests = [
      { name: "get_workflow", arguments: { name: "private-id" }, category: "invalid_arguments" },
      { name: "get_install", arguments: { framework: "private-framework" }, category: "invalid_arguments" },
      { name: "search_components", arguments: { query: "private-query" }, category: "invalid_arguments" },
      { name: "get_guide", arguments: { page: "private-guide" }, category: "invalid_arguments" },
      { name: "list_workflows", arguments: { query: 12 }, category: "invalid_arguments" },
      { name: "get_workflow", arguments: { id: "private-missing-workflow" }, category: "not_found" },
      { name: "get_component", arguments: { name: "private-missing-component" }, category: "not_found" },
      { name: "get_workflow", arguments: { id: workflows()[0]!.id }, category: null },
      { name: "get_install", arguments: { name: "button" }, category: null },
      { name: "search_components", arguments: { term: "private-no-matching-component-987654" }, category: null },
    ];
    for (const request of requests) {
      const before = events.length;
      const result = await client.callTool({ name: request.name, arguments: request.arguments });
      expect(events).toHaveLength(before + 1);
      expect(result.isError === true).toBe(request.category !== null);
      expect(events.at(-1)).toMatchObject({ tool: request.name, errorCategory: request.category, serverVersion: loadBundle().version });
    }
    expect(JSON.stringify(events)).not.toContain("private");
  });
});
