# Hosted MCP usage in Godmode

The hosted, tool-only MCP server can send operational measurements to Noord's
authenticated Godmode dashboard at `/godmode/analytics/vlak`. No OpenAI API key
is needed. This does not query an OpenAI install-count API.

## Meaning of the metrics

- A tool call is one observed response to a known `tools/call` request, including
  validation and application errors, or a known request whose transport closes
  without a response. Discovery, initialization, resources,
  unsupported tool names and notifications are not counted.
- `get_install` counts requests for instructions, not executed package installs.
- `openai_hint` means nonempty `openai/userAgent`, `openai/session` or
  `openai/subject` metadata was present. The value is discarded. This can be
  spoofed, absent, or shared across host surfaces. It is not verified ChatGPT traffic.
- Durations measure handling until the JSON response is handed to the transport,
  not network delivery or end-to-end model latency. They are rounded to
  milliseconds and capped at the 30-second route limit.
- Requests retried by the client are separate calls. Delivery retries of the
  same metric can be deduplicated by its random event ID at the collector.
- No user/session IDs, arguments, prompts, search terms, outputs, IPs, raw headers,
  or error messages are included. No unique-user or retention metric is inferred.
- With diagnostics enabled, records also contain the deployed registry package
  version and a fixed error category. These describe observed failures, not user
  intent or proof of a client bug. Existing records are not reclassified.
- Counts begin after activation. Missing historical data is not backfilled.
  Delivery is best-effort; a collector timeout can undercount activity.

The hosted API owns the reporter. Local stdio and unconfigured or preview
deployments emit nothing. The published tool names, schemas, results and
annotations are unchanged. Runtime error logs omit error objects that could
contain request content.

## Enable after deployment

1. Deploy Noord's collector and dashboard, and apply its dedicated MCP metrics
   migration using the instructions in Noord's `docs/vlak-mcp-metrics.md`.
2. Configure the same random, at least 32-character `VLAK_MCP_METRICS_TOKEN` in
   the server-side environment of both projects. Never use a `NEXT_PUBLIC_` name.
3. Deploy Vlak with the updated `/privacy/` page and reporter. Collection stays
   off unless `VLAK_MCP_METRICS_ENABLED=true` and `VERCEL_ENV=production`.
4. Verify both deployments before turning that production flag on. The fixed
   destination is `https://noord.dev/api/analytics/vlak-mcp`. Redirects are rejected
   so a bearer credential cannot be forwarded to another origin.
5. Make one intentional, labelled operational smoke check and confirm it reaches
   Godmode. It is a test call, not a real user or install. Do not backfill fixtures.

Delivery has a one-second timeout. The complete request-and-delivery promise is
registered with Vercel's `waitUntil` before processing the request, so analytics
can finish after the HTTP response ends. Delivery cannot change the tool result.
DNT: 1 and Sec-GPC: 1 opt out when the client
sends them. Reports use a rolling 30-day window; expired events are purged on the
next collector write or report read. No cleanup job is provisioned automatically.

## Diagnostic rollout

The default payload remains schema version 1, with exactly its original seven
fields. Deploy Noord's additive diagnostics migration and compatible collector
first. Only then set `VLAK_MCP_DIAGNOSTICS_ENABLED=true` on the Vlak production
deployment. The existing metrics enable flag, credential, production check and
privacy opt-outs still apply. Remove the diagnostics flag to return to the old
payload without stopping basic usage reporting.

Schema version 2 adds two fields:

- `serverVersion`: the bundled registry version used by the deployed MCP server,
  such as `0.6.0`. It is not the client version or a user-provided value. The
  collector accepts numeric release versions; prerelease deployments must keep
  diagnostics disabled until the collector explicitly supports their versions.
- `errorCategory`: `null` for success; otherwise one of `invalid_arguments`,
  `not_found`, `output_validation`, `internal`, `transport`, or `unknown`.

The SDK currently turns input validation, output validation and handler failures
into text-only `isError` results. The hosted observer reads only fixed,
tool-specific SDK validation prefixes and Vlak lookup prefixes in memory; it
does not copy them into the event or log them. Protocol invalid-parameter and
internal-error codes are also recognized. Unrecognized errors are `unknown`,
not guessed. A rejected send or a connection closed before a known call responds
is `transport`. Error categories do not establish whether a caller was a real
user, an automated probe, or which application supplied the arguments.

Local tests exercise actual SDK input/output validation, missing records,
successful empty searches, unknown errors and transport failures. SDK upgrades
must preserve these tests or explicitly update the classifier. Historical
schema-v1 errors remain “not recorded”; they are different from a new error
classified as `unknown`.

The diagnostics observer and HTTP entry are not part of the published stdio
bundle. This change does not alter tool schemas, descriptions, results, or the
npm package. Verify the published payload check when deploying; do not edit
`server.ts` under an already-published version to improve tool metadata.

## Verify locally

`pnpm --filter @noorddev/vlak-mcp typecheck`

`pnpm --filter @noorddev/vlak-mcp test`

Tests use an actual local Streamable HTTP MCP client and mocked outbound
delivery. They do not call the production collector or affect production counts.

## Sources

- [OpenAI client metadata reference](https://developers.openai.com/plugins/reference#_meta-fields-the-client-provides)
- [OpenAI plugin privacy requirements](https://developers.openai.com/plugins/app-guidelines#privacy)

On 27 September 2026, the signed-in Vlak published-plugin portal did not expose
an analytics view or install totals. No official plugin installation-count API
was identified in the documentation checked. Godmode must show this as
unavailable, not zero. Revisit if OpenAI exposes an official reporting source.
