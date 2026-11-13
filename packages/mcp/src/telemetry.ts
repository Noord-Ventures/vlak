import { randomUUID } from "node:crypto";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import type { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";

const TOOLS = new Set([
  "list_workflows", "get_workflow", "list_components", "get_component",
  "search_components", "get_tokens", "get_install", "get_guide",
]);

export type McpErrorCategory = "invalid_arguments" | "not_found" | "output_validation" | "internal" | "transport" | "unknown";

export type McpToolMetric = {
  schemaVersion: 2;
  eventId: string;
  occurredAt: string;
  tool: string;
  source: "openai_hint" | "unknown";
  outcome: "success" | "error";
  durationMs: number;
  serverVersion: string;
  errorCategory: McpErrorCategory | null;
};

export type McpMetricObserver = (event: McpToolMetric) => void;

function object(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : undefined;
}

/** Client metadata is an unverified hint, never an identity or proof of installation. */
export function metricSource(meta: unknown): McpToolMetric["source"] {
  const fields = object(meta);
  return ["openai/userAgent", "openai/session", "openai/subject"].some(key =>
    typeof fields?.[key] === "string" && (fields[key] as string).length > 0,
  ) ? "openai_hint" : "unknown";
}

/**
 * Observed response reasons, not a diagnosis of user intent or client fault.
 * The SDK wraps validation exceptions in text-only tool results. Match only its
 * fixed prefixes and Vlak's fixed lookup prefixes; discard all text immediately.
 * Unrecognized responses stay unknown. Local HTTP tests guard SDK compatibility.
 */
function errorCategory(message: JSONRPCMessage, tool: string): McpErrorCategory | null {
  if ("error" in message) {
    if (message.error.code === -32602) return "invalid_arguments";
    if (message.error.code === -32603) return "internal";
    return "unknown";
  }
  if (!("result" in message) || message.result.isError !== true) return null;
  const content = message.result.content;
  const first = Array.isArray(content) ? object(content[0]) : undefined;
  if (first?.type !== "text" || typeof first.text !== "string") return "unknown";
  const text = first.text;
  if (text.startsWith(`MCP error -32602: Input validation error: Invalid arguments for tool ${tool}:`)) return "invalid_arguments";
  if (text.startsWith(`MCP error -32602: Output validation error: Invalid structured content for tool ${tool}:`) ||
    text === `MCP error -32602: Output validation error: Tool ${tool} has an output schema but no structured content was provided`) return "output_validation";
  if (text.startsWith("MCP error -32603:")) return "internal";
  if ((tool === "get_component" || tool === "get_install") && text.startsWith('No component named "')) return "not_found";
  if (tool === "get_workflow" && text.startsWith('No workflow named "')) return "not_found";
  if (tool === "get_guide" && text.startsWith('Guide "') &&
    text.endsWith('" is not bundled. Rebuild Vlak to refresh its documentation.')) return "not_found";
  return "unknown";
}

/** Attach after server.connect(), before accepting requests. Never retain arguments or client identifiers. */
export function observeToolCalls(transport: Transport, observe: McpMetricObserver, serverVersion: string): void {
  const pending = new Map<string | number, { started: number; tool: string; source: McpToolMetric["source"] }>();
  const onmessage = transport.onmessage;
  const send = transport.send.bind(transport);
  const onclose = transport.onclose;

  const record = (metric: { started: number; tool: string; source: McpToolMetric["source"] }, category: McpErrorCategory | null) => {
    try {
      observe({
        schemaVersion: 2, eventId: randomUUID(), occurredAt: new Date().toISOString(),
        tool: metric.tool, source: metric.source, outcome: category === null ? "success" : "error",
        durationMs: Math.min(30_000, Math.max(0, Math.round(performance.now() - metric.started))),
        serverVersion, errorCategory: category,
      });
    } catch {
      // Analytics must never change a tool response or leak its contents.
    }
  };

  transport.onmessage = (message, extra) => {
    if ("method" in message && message.method === "tools/call" && "id" in message) {
      const params = object(message.params);
      if (typeof params?.name === "string" && TOOLS.has(params.name)) {
        pending.set(message.id, {
          started: performance.now(), tool: params.name, source: metricSource(params._meta),
        });
      }
    }
    onmessage?.(message, extra);
  };

  transport.send = async (message, options) => {
    const id = "id" in message ? message.id : undefined;
    const metric = id !== undefined && !("method" in message) ? pending.get(id) : undefined;
    if (!metric) return send(message, options);
    // Remove before yielding so a duplicate response cannot count twice.
    if (id !== undefined) pending.delete(id);
    let category = errorCategory(message, metric.tool);
    try {
      await send(message, options);
    } catch (error) {
      category = "transport";
      throw error;
    } finally {
      record(metric, category);
    }
  };

  transport.onclose = () => {
    // A known request whose transport closes before a response is an observed
    // transport failure. No request or response content is kept in this map.
    for (const metric of pending.values()) record(metric, "transport");
    pending.clear();
    onclose?.();
  };
}
