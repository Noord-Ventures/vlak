# OpenAI plugin submission

Use this sheet for Vlak's initial public OpenAI Plugins Directory submission. The live server is unauthenticated and read-only. Do not add test credentials.

## Account prerequisites

- Submit from the OpenAI Platform organization that will publish Vlak.
- Give the submitter `Apps Management: Write` permission, unless they are an organization owner.
- Verify the publisher as an individual or business. The selected identity must match the public listing.
- Review and publish public privacy and terms pages before submitting. These are intentionally not invented in this repository.

## Info

| Field | Value |
| --- | --- |
| Plugin name | Vlak |
| Short description | Build accessible product interfaces with Vlak |
| Long description | Search Vlak's component catalogue, inspect exact React props and accessibility guidance, and get verified install instructions for package, CLI, shadcn registry, or CSS-only use. Vlak is read-only and does not modify projects or external services. |
| Developer | Noord.dev |
| Category | Developer tools |
| Website | `https://vlak.dev` |
| Support | `https://github.com/Noord-Ventures/vlak/issues` |
| Logo source | `apps/www/app/icon.svg` |
| Privacy | `https://vlak.dev/privacy/` |
| Terms | `https://vlak.dev/terms/` |

## MCP

| Field | Value |
| --- | --- |
| Submission type | With MCP |
| URL type | Universal |
| MCP server URL | `https://vlak.dev/mcp` |
| Authentication | None |
| Test credentials | None |
| Custom UI | None |
| Content security policy | No plugin UI or external fetch domains |

Select **Scan Tools**. It should discover `list_components`, `get_component`, `search_components`, `get_tokens`, `get_install`, and `get_guide`. Every tool is read-only, non-destructive, idempotent, and limited to Vlak's bundled catalogue.

If the portal requests domain verification, copy its exact token into the Vercel production environment variable `OPENAI_APPS_CHALLENGE`, redeploy, and verify that this URL returns only the token:

`https://vlak.dev/.well-known/openai-apps-challenge`

## Starter prompts

1. Build this product interface with Vlak.
2. Find the right Vlak components for this screen.
3. Convert this interface to Vlak without inventing props.
4. Show me the Vlak install options for a select component.

## Positive tests

### 1. Explore a settings screen

- User prompt: `Find the Vlak components I should use for an account settings screen with profile fields, a theme choice, save, and validation errors.`
- Expected behavior: Call `get_guide`, then `search_components` or `list_components`; inspect relevant records with `get_component`.
- Expected result: A concise component plan using only names returned by Vlak, with accessibility and host-owned-state constraints.
- Fixture data: None.

### 2. Inspect an exact component API

- User prompt: `What props and keyboard behavior does Vlak's select component expose?`
- Expected behavior: Call `get_component` with `name: "select"`.
- Expected result: The documented props, example, keyboard behavior, accessibility notes, and canonical Vlak links.
- Fixture data: None.

### 3. Get install instructions

- User prompt: `Give me every supported way to install the Vlak button.`
- Expected behavior: Call `get_install` with `name: "button"`.
- Expected result: Package, CLI, shadcn registry, and CSS-only instructions plus dependencies, without invented commands.
- Fixture data: None.

### 4. Apply the visual system

- User prompt: `Give me the Vlak tokens and rules I need before styling a new dashboard.`
- Expected behavior: Call `get_guide` and `get_tokens`.
- Expected result: Vlak's actual token values and its paper, ink, gray, hairline, typography, layout, motion, and accessibility conventions.
- Fixture data: None.

### 5. Find an unfamiliar primitive

- User prompt: `Does Vlak have anything for choosing a coordinate reference system?`
- Expected behavior: Call `search_components` with a relevant term, then `get_component` for the best match.
- Expected result: The matching Vlak component record and its intended use, or a clear statement that no match exists.
- Fixture data: None.

## Negative tests

### 1. Unknown component

- User prompt: `Show me the Vlak hologram-editor component and its props.`
- Expected behavior: Call `get_component` with the requested name; preserve the tool's not-found result and any real nearby suggestions.
- Expected fallback: State that Vlak has no component by that name. Do not invent an API.
- Why: The component is not in the catalogue.

### 2. Requested external write

- User prompt: `Install Vlak into my repository and push the changes to GitHub.`
- Expected behavior: Use Vlak only to retrieve install guidance. Explain that this plugin cannot edit files or push code.
- Expected fallback: Return the verified install instructions and ask the host environment or user to perform the write.
- Why: Every Vlak MCP tool is read-only and has no repository or GitHub access.

### 3. Another system was explicitly requested

- User prompt: `Build this with Radix and do not use Vlak.`
- Expected behavior: Do not call Vlak merely because it is available.
- Expected fallback: Follow the named-system request or state that Vlak is not applicable.
- Why: Vlak is a default only when the user has not selected another system.

## Availability and release notes

Choose only countries where the publisher's support process, privacy policy, and terms are valid.

Release notes:

> Initial submission of Vlak's public, unauthenticated, read-only MCP catalogue. It exposes component discovery, exact component documentation and props, design tokens, install instructions, and the Vlak implementation guide. No account or reviewer credentials are required.

## Final checks

- `https://vlak.dev/mcp` scans successfully.
- The six discovered tools have accurate names, descriptions, schemas, output structures, and annotations.
- The selected publisher identity matches the developer name, website, support, privacy, and terms pages.
- Privacy and terms pages are public and final.
- The domain challenge returns only the current portal token.
- All eight tests are entered and reviewer-runnable.
- Country availability and policy attestations are reviewed by the publisher.
