# Vlak assistant reference app

A working Next.js application that connects Vlak components to the AI SDK, a server-side OpenAI model, saved conversations, owned uploads, and tools that request approval before writing a task. Try the [live assistant](https://assistant.vlak.dev), explore the [AI component catalog](https://vlak.dev/ai/), or run it locally at [localhost:3211](http://localhost:3211).

## Run locally

From the repository root, use the workspace's Node.js and pnpm versions and build the library packages before starting the app:

```sh
pnpm install
pnpm build
cp -n apps/assistant/.env.example apps/assistant/.env.local
chmod 600 apps/assistant/.env.local
```

Set `OPENAI_API_KEY` in `apps/assistant/.env.local`, then run:

```sh
pnpm --filter @noorddev/vlak-assistant-reference dev
```

The key stays on the server. `.env.local` is ignored by Git; never put the key in a `NEXT_PUBLIC_` variable. `AI_REFERENCE_MODEL` defaults to `gpt-6-astra`; change it to an OpenAI Responses model available to your project. The earlier `AI_MODEL` variable remains a fallback. Live mode uses `@ai-sdk/openai` directly. No gateway account is required.

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Server credential for live OpenAI requests. |
| `AI_REFERENCE_MODEL` | Model identifier; defaults to `gpt-6-astra`. |
| `AI_REFERENCE_DATA_DIR` | Local persistence directory; defaults to `.data` relative to the app process. |
| `AI_REFERENCE_MODE` | Set to `fixture` only for deterministic protocol tests. Leaving it unset selects live mode. |

For a local production build, run these after building the workspace packages:

```sh
pnpm --filter @noorddev/vlak-assistant-reference build
pnpm --filter @noorddev/vlak-assistant-reference start
```

The application needs a Node.js server and persistent storage. It is not a static export. Local runs use a writable directory; the hosted deployment uses private Vercel Blob storage.

## Request flow

`app/assistant-app.tsx` composes `Chat`, `Response`, `ResponseMarkdown`, `MessageComposer`, `Persona`, `ToolCall`, `Confirmation`, and `Widget`. The AI SDK's `useChat` and `DefaultChatTransport` consume the server's message stream. Submission sends an explicit intent; the server loads the authoritative conversation instead of accepting a client-supplied message history or tool result.

`lib/server.ts` validates requests, resolves the browser session, scopes storage access, and streams the result of `lib/agent.ts`. `lib/store.ts` selects the local `file-store.ts` or hosted `blob-store.ts` backend for canonical history, conversation locks, snapshots, and idempotent task creation. The route files keep those operations in the Node.js runtime.

| Route | Behavior |
| --- | --- |
| `GET /api/conversations` | Starts or reads a private session, lists its conversations, and reports model configuration, storage mode, and upload limits. |
| `POST /api/conversations` | Creates a conversation for that session. |
| `GET /api/conversations/:id` | Loads owned messages, versions, and saved tasks. |
| `POST /api/chat` | Applies a `submit`, `approve`, `edit`, or `regenerate` intent and returns an AI SDK message stream. |
| `POST /api/chat/stop` | Cancels an owned running response and waits briefly for saved partial history. |
| `POST /api/uploads` | Stores validated files for the current session. |
| `GET /api/uploads/:id` | Returns an owned file with download, no-cache, and content-isolation headers. |
| `POST /api/conversations/:id/restore` | Restores a retained message-history version. |

The stream records live model usage when provided. Stop requests cancel the current request; errors remain visible and the UI can reload saved history and retry. This reference does not implement reconnectable stream replay. The model is instructed to treat uploaded material as source text, and private model reasoning is not sent to the client.

## Tools and approval

- `readBrief` reads the bundled launch brief or a text file already attached to the current conversation. Uploaded text is limited to its first 40,000 characters. The tool does not parse images or PDFs.
- `projectWidget` returns a typed project summary and the conversation's saved tasks. The client renders that data with a Vlak `Widget`.
- `createTask` saves a task only after approval. The SDK signs approvals using a persisted secret scoped to the session owner and conversation. The server accepts a decision only for a saved, pending task approval; prompt text cannot grant it.

Task creation uses the tool-call identifier as its idempotency key. Replaying the same tool call returns the existing task instead of writing another one. A new tool call can create a separate task. Conversation locks reject overlapping turns. Saved task writes survive later message-history updates and restores in both storage backends.

The optional embedded provider view is a local sandboxed HTML example. It receives no conversation, session, or model credentials; connecting a real third-party provider remains application work.

## Files, edits, and persistence

The server accepts text, Markdown, CSV, JSON, PDF, PNG, JPEG, WebP, and GIF media types. Local limits are 5 MiB per file and 12 MiB per upload request. The hosted demo uses 3 MiB per file and 4 MiB total to fit Vercel function payload limits. Both permit four files per request and 100 files or 50 MiB per session. The composer reads the active limits from the server. These are media-type and size checks, not file scanning.

Model requests resolve only stored files owned by the current session. Text attachments become delimited source text; image and PDF attachments become stored binary payloads for the selected model. Arbitrary attachment URLs never enter the SDK download path. Actual image and PDF support depends on the chosen model.

Editing a user request preserves its attachments and replaces the later message history. Regenerating removes the selected assistant response and later turns before requesting a new response. Both operations save a snapshot first, and the latest 20 versions can be restored. Restoring a version first snapshots the current history. **Restoring or regenerating messages does not undo tasks that already ran.** The saved-task list remains authoritative.

The default `.data/` directory is ignored by Git. It contains conversations, upload bytes and metadata, history snapshots, tasks, and the approval-signing secret. Preserve the whole directory together if retaining local history. A custom data directory should also stay outside version control.

A random 256-bit cookie identifies each browser session. It is `HttpOnly`, `SameSite=Lax`, expires after 30 days, and is `Secure` over HTTPS. Its hash selects the owner's storage directory. Mutation routes require the application's exact origin. Clearing the cookie loses access to that browser's stored conversations; there is no account recovery flow.

Browser-session ownership is suitable for this bounded public reference, but has no accounts, recovery, or organization access control. A product that needs those features should provide authenticated ownership and its own retention policy. Expired or cleared cookies do not automatically delete stored data. Local filesystem locks and atomic writes assume a shared writable filesystem; the hosted backend uses shared storage instead.

## Hosted storage

Set these server-only variables on a Vercel project rooted at `apps/assistant` and connect a dedicated **private** Blob store:

| Variable | Purpose |
| --- | --- |
| `AI_REFERENCE_STORAGE=blob` | Selects durable private Blob storage. Vercel requests refuse the local filesystem backend. |
| `BLOB_READ_WRITE_TOKEN` | Credential supplied by the private store connection. |
| `AI_REFERENCE_APPROVAL_SECRET` | Stable random secret of at least 32 characters. Generate 32 random bytes and encode them as hex. Keep it across deployments. |
| `AI_REFERENCE_DAILY_REQUESTS` | Shared daily model-run cap; defaults to 200, maximum 1,000. |
| `AI_REFERENCE_SESSION_DAILY_REQUESTS` | Daily model-run cap per browser session; defaults to 20, maximum 100. |
| `AI_REFERENCE_BLOB_PREFIX` | Optional isolated storage namespace for verification or separate environments. |

Private reads bypass the Blob cache. ETag conditional writes serialize canonical history, task idempotency, capacity reservations, and five-minute conversation leases across workers. An explicit Stop writes to the shared lease; the streaming worker polls it every 1.5 seconds and saves the partial response before releasing the lease. Model generation times out at 120 seconds; the chat route allows 180 seconds so final persistence has time to complete. A worker terminated by the platform may leave a lease until its five-minute expiry, and its unfinished output cannot be recovered.

The shared demo allows 500 new conversations per UTC day and reserves at most 256 MiB of uploaded bytes across all owners. Each owner can keep 100 conversations, and each conversation keeps 20 history versions. Model-run caps reset at midnight UTC and count attempted runs, including failures and retries; they limit requests, not an exact currency amount. Operator deletion is required to reclaim retained uploads or remove expired sessions. The adapter compensates failed upload reservations and keeps task writes durable when message history changes.

Build the workspace packages and then this app. A suitable Vercel build command from the app root is `cd ../.. && pnpm build && pnpm --filter @noorddev/vlak-assistant-reference build`. Keep model and storage credentials out of public environment variables.

## Avatar

The chat uses Vlak's original monochrome SVG dot orb from `apps/www/components/ai-avatar`. Only the latest assistant message animates; older messages use its static image. It needs no WebGL or external avatar runtime. Vlak's official Persona component also offers three native visual variants and a custom-renderer API.

## Deterministic verification

Fixture mode requires explicit opt-in and needs no OpenAI key:

```sh
AI_REFERENCE_MODE=fixture AI_REFERENCE_DATA_DIR=.data/fixture pnpm --filter @noorddev/vlak-assistant-reference dev
```

The page labels this mode. It uses a deterministic SDK model through the same agent, streaming protocol, approval validation, tool execution, and persistence path. Fixtures can therefore create real local test tasks after approval; use a separate data directory when keeping live conversation history.

```sh
pnpm --filter @noorddev/vlak-assistant-reference typecheck
pnpm --filter @noorddev/vlak-assistant-reference test
AI_REFERENCE_BASE=http://localhost:3211 pnpm --filter @noorddev/vlak-assistant-reference e2e
AI_REFERENCE_BASE=http://localhost:3211 pnpm --filter @noorddev/vlak-assistant-reference test:recovery
```

The browser tests require Playwright Chromium (`pnpm --filter @noorddev/vlak-assistant-reference exec playwright install chromium`). The main flow refuses to send prompts to a server that is not in fixture mode. Recovery checks intercept the API to exercise failed requests, draft retention and clearing, uploads, and cancellation races without a model call.

Fixture tests verify application behavior, not live provider quality or model availability. With the server running in live mode, this separate opt-in command creates an isolated verification conversation, makes bounded model requests, approves one local test task, and checks Stop:

```sh
AI_REFERENCE_LIVE_TEST=1 AI_REFERENCE_URL=http://localhost:3211 pnpm --filter @noorddev/vlak-assistant-reference test:live
```

To verify a hosted server you own, also set `AI_REFERENCE_LIVE_ORIGIN` to its exact HTTPS origin and use that URL in `AI_REFERENCE_URL`. Set `AI_REFERENCE_LIVE_STOP=1` to check cancellation after streaming starts. These checks use the configured live model.

For simultaneous live and fixture servers, give them distinct ports, storage namespaces or data directories, and `AI_REFERENCE_BUILD_DIR` paths. The default Next.js build directory is `.next`.

The private-store smoke uses deterministic model responses, an isolated random Blob prefix, and deletes its test objects. Supply `BLOB_READ_WRITE_TOKEN` in the environment, or in the ignored `.env.blob-test.local` file, then run:

```sh
AI_REFERENCE_BLOB_TEST=1 node --experimental-strip-types apps/assistant/scripts/blob-smoke.mjs
```

It verifies the hosted API, saved approval, owned uploads, and cancellation with the in-process run map removed to simulate a separate worker. It makes no OpenAI request.
