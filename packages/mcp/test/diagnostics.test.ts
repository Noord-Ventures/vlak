import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { describe, expect, it } from "vitest";
import { observeToolCalls, type McpErrorCategory, type McpToolMetric } from "../src/telemetry.js";

describe("Observed SDK diagnostics", () => {
  it.each([
    ["missing-output", "output_validation"],
    ["invalid-output", "output_validation"],
    ["internal", "internal"],
    ["unexpected", "unknown"],
  ] as const)("classifies %s without copying response text", async (mode, category: McpErrorCategory) => {
    const server = new McpServer({ name: "diagnostics-test", version: "0.6.0" });
    server.registerTool("get_component", {
      inputSchema: { name: z.string() },
      outputSchema: { name: z.string() },
    }, () => {
      if (mode === "internal") throw new McpError(ErrorCode.InternalError, "private exception details");
      if (mode === "unexpected") throw new Error("private unknown exception details");
      return {
        content: [{ type: "text" as const, text: "private result" }],
        ...(mode === "invalid-output" ? { structuredContent: { name: 12 } } : {}),
      };
    });
    const events: McpToolMetric[] = [];
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const client = new Client({ name: "diagnostics-test", version: "0.0.0" });
    try {
      await server.connect(serverTransport);
      observeToolCalls(serverTransport, event => { events.push(event); }, "0.6.0");
      await client.connect(clientTransport);
      const result = await client.callTool({ name: "get_component", arguments: { name: "private-input" } });
      expect(result.isError).toBe(true);
      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({ outcome: "error", errorCategory: category, serverVersion: "0.6.0" });
      expect(JSON.stringify(events)).not.toContain("private");
    } finally {
      await client.close();
      await server.close();
    }
  });
});
