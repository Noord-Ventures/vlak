# Website analytics

The documentation website loads Vercel Web Analytics from the same-origin
`/_vercel/insights/script.js` route. Enable Web Analytics on the existing Vercel
project before deploying; no paid add-on is required for this integration.
This code is confined to `apps/www` and adds no dependency to the Vlak packages.

Collection is gated to HTTPS `vlak.dev` and `www.vlak.dev`. Local development,
Vercel preview hosts and other domains do not load the collector. The former
`getraster.com` and `raster.noord.dev` hosts redirect to `vlak.dev` before serving
content, so they are not separately enabled.

The native collector records initial page views and history navigation. Its
`beforeSend` callback removes query strings and fragments. Page views and custom
events on paths outside the published site routes and component catalogue are
dropped entirely.
No form values, search text, copied code, clipboard contents or arbitrary link
URLs are passed as custom-event properties. Existing browser preferences are
unrelated to analytics; the integration creates no cookies or storage keys.

All custom events carry `source: "vlak"`:

| Event | Trigger | Additional properties |
| --- | --- | --- |
| `get_started_click` | Link to the getting-started page | `path: "/docs"` |
| `docs_click` | Link to a published documentation topic | Allowlisted `path` |
| `github_click` | Link to the Vlak GitHub repository | None |
| `install_copy` | Successful copy of a published installation command | `method: "npm"`, `"cli"` or `"shadcn"` |
| `network_click` | Link to another Noord network website | `destination: "noord"` or `"renatovaldes"` |

Run `node --experimental-strip-types --test apps/www/scripts/analytics.test.mjs`
for host-gating and payload-redaction checks, then `pnpm --filter www build`.
Run `node apps/www/scripts/analytics.browser.mjs` against that export to test the
actual native collector. It intercepts every ingestion request locally so test
visits do not inflate production metrics.

Vercel's v2 SDK can use build-time `VERCEL_OBSERVABILITY_CLIENT_CONFIG` values
for project-specific resilient intake paths. The native same-origin route above
is the supported fallback. No project-specific path is invented or hardcoded.
See [Vercel's setup guide](https://vercel.com/docs/analytics/quickstart),
[package configuration](https://vercel.com/docs/analytics/package) and
[redaction guide](https://vercel.com/docs/analytics/redacting-sensitive-data).
