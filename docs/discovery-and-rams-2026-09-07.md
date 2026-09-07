# Discovery, Rams and microscopy

The interface refresh shipped on 7 September 2026 in PR #40, production commit `cf3724c690722c80f62bb6ab671ab7a0694d0d19`. This follow-up adds technical discovery metadata, a Braun T3 in the 3D workspace, and a microscopy acquisition planning example. Existing page layouts and authored copy are not rewritten for search.

## Discovery

Each exported page now identifies its own production URL, title and description in canonical and sharing metadata. Previously, component and interface detail pages inherited the home page canonical and sharing data. A sitemap generated from actual page routes and the component and collection catalogues replaces the incomplete manual list. No modification dates are invented.

The root supplies a small WebSite structured-data record that describes the existing site. The hosted starter preview is marked `noindex,follow`; the starter distributed to consumers is unchanged. Ordinary crawler access remains allowed. The existing Markdown agent index now links to the design brief and a generated Markdown version of the authored interface catalogue. Production Markdown responses have explicit content types and cross-origin read access.

The export regression checks every indexable HTML page for its title, description, canonical, sharing data, main heading and site identity. It compares the exact exported page set with the sitemap and checks local sharing assets and agent-index links. The same check runs in CI after the production build. Existing privacy filtering for analytics remains in place; public collection and interface paths are included in its allowlist.

These changes improve crawlability and correct page identification. They do not promise a ranking position or inclusion in an AI answer. No training crawler policy is changed, and no undocumented Grok submission mechanism is invented.

Primary guidance:

- [Google canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [sitemap construction](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), and [AI features](https://developers.google.com/search/docs/appearance/ai-features).
- [Google structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies) and [JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).
- [Next.js metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata).
- [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots), [Anthropic crawler controls](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler), and [xAI web search](https://docs.x.ai/developers/tools/web-search).

## Coverage choice

Microscopy acquisition planning is a useful extension of Vlak's existing acquisition sequencer and stack navigator. The reviewed core catalogues of [shadcn/ui](https://ui.shadcn.com/docs/components), [Mantine](https://mantine.dev/core/package/), [Chakra UI](https://chakra-ui.com/docs/components/concepts/overview), [Radix](https://www.radix-ui.com/primitives/docs/overview/introduction) and [Base UI](https://base-ui.com/react/overview/quick-start) did not provide a dedicated microscopy acquisition planner. This is a core-catalogue comparison, not a claim that the entire ecosystem lacks scientific software or community components. shadcn also supports [third-party registries](https://ui.shadcn.com/docs/directory).

Specialist tools already exist, including [Viv](https://github.com/hms-dbmi/viv), [plate-map](https://github.com/nebiolabs/plate-map) and [JBrowse React components](https://www.jbrowse.org/jb2/docs/embedded_components/). The new example focuses on positions, an exposure sequence and a planned multidimensional stack. [Micro-Manager's HCS Site Generator](https://micro-manager.org/HCS_Site_Generator) is a primary workflow reference.

`StagePositionList` is a public component with controlled selection, explicit coordinate frames and units, nullable readings, inclusion, reordering and removal. It is distributed through the same React, CSS, registry, CLI, MCP and Markdown generation as the other leaves. The interface composes it with existing Vlak components. Mobile uses task navigation and a focused editor.

The planner is local and does not connect to an instrument. Preview frames remain “Not acquired”. Exposure totals exclude movement, readout and other overhead. JSON imports are bounded, schema-checked and staged for review before replacing the working plan. Draft export preserves unknown values.

## Braun T3

The 3D workspace uses a separate object renderer and model asset. EV controls keep their car, renderer and previews. The original radio geometry has 32,027 triangles and 28,180 stored position vertices across three meshes and one source material. The 871,796-byte delivery asset removes unused UV data and uses 16-bit indices without changing geometry. The preparation script reproduces the asset; provenance records the source and output hashes.

[MoMA credits the T3 design to Dieter Rams and Hochschule für Gestaltung, Ulm, Germany, 1958](https://www.moma.org/collection/works/4134). The 3D model is [Radio T3 by ludwigangulodi](https://sketchfab.com/3d-models/radio-t3-aad3d54384904cfc9b3df8791d254c5c), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Model and design credits appear under Components used. The two gallery previews come from the actual line renderer.

## Verification

- The final production build and package/site typechecks pass. All 531 generated files are byte-stable across regeneration.
- All 1,112 package tests pass: React 1,020, core 60, CLI 23 and MCP 9. The 22 site state, dynamics and microscopy plan tests pass.
- Biome reports no errors, with 72 existing warnings and two informational diagnostics. Aggregate size caps remain unchanged; the stage-position leaf is bounded at 4 KB gzip.
- Packed React 18 and 19 consumers render all 93 addition fixtures. Root/leaf exports, precise stage readings, native fieldset props and generated contracts pass; React 18 reports no prop warnings. Publint, type-package checks and CLI source closure pass, including 167 public catalogue entries and 127 installed source files.
- Example checks cover 168 isolated Use files and 93 separate addition previews.
- The final export passes discovery checks for 214 indexable pages, five local sharing images, the exact sitemap, site identity and agent-document links. The retired `/swag/` route is excluded.
- The complete browser suite passes across 190 pages, including axe, keyboard, phone navigation, component layouts and desktop/phone microscopy flows.
- Actual-export Rams checks pass at 320, 390, 1024 and 1440 pixels in both themes. Camera, touch, mesh display, turntable, focus pause, reduced motion, responsive fitting, failed asset recovery and lost-context recovery pass. Source lifecycle testing also verifies renderer cleanup on unmount.

- The final export passes all 182 gallery/study visits across seven width/theme combinations, plus install/brief clipboard, unavailable-clipboard fallback, navigation anchors, component links and EV reading/detail/playback checks.
- Microscopy passes all eight width/theme cases against the final export, with full position, sequence, stack, review and JSON flows. Tests cover long labels, prototype-like identifiers, zero/tiny/missing readings, unknown units, cleared selection, malformed imports and preservation of unapplied edits. Every screen retains 44px targets and passes overflow and axe checks.

An earlier delivery run exposed a missing science collection entry, which was fixed in the collection source and regenerated. The consumer fixture was extended for the new component. Browser regressions retain their original behavioral assertions while waiting for the EV Media pane to become visible and checking the actual referenced Twitter poster rather than an obsolete filename.
