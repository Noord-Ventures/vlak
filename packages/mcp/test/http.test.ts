import { createServer as createHttpServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { handleMcpRequest } from "../src/http.js";

let httpServer: Server;
let client: Client;

beforeAll(async () => {
  httpServer = createHttpServer((request, response) => {
    void handleMcpRequest(request, response);
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
  it("initializes, advertises read-only tools, and handles a call", async () => {
    const { tools } = await client.listTools();
    expect(tools.map((tool) => tool.name)).toContain("get_component");
    expect(tools.every((tool) => tool.annotations?.readOnlyHint)).toBe(true);

    const result = await client.callTool({ name: "search_components", arguments: { term: "button" } });
    expect(result.structuredContent).toMatchObject({ term: "button" });
  });
});
