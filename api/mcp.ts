import type { ServerResponse } from "node:http";
import props from "../packages/core/props/props.json" with { type: "json" };
import { primeData, type Bundle, type PropsJson } from "../packages/mcp/src/data.js";
import { handleMcpRequest, type McpHttpRequest } from "../packages/mcp/src/http.js";
import bundle from "../registry/bundle.json" with { type: "json" };

primeData(bundle as Bundle, props as PropsJson);

export default async function handler(request: McpHttpRequest, response: ServerResponse) {
  await handleMcpRequest(request, response);
}

export const config = {
  api: {
    bodyParser: true,
  },
};
