# Specialised component expansion

Adds 20 components to the health expansion branch, bringing the public catalogue from 126 to 146. Together with the earlier health work, the pull request adds 32 components to the original 114-component catalogue.

| Collection | Components added in this expansion |
| --- | --- |
| Health | ActivityRings |
| Civic | IdentityDocument, TaxSummary, BenefitProgram, ApplicationStatus, EvidenceChecklist |
| Science | MeasurementValue, QuantityField, WellPlate, ExperimentRun, SpectrumPlot |
| Audio | AudioMeter, ChannelStrip, ParameterKnob |
| Video | TimecodeField, ClipTimeline, RenderQueue |
| Design | LayerStack, ColorInspector, SpacingControl |

Audio, video, and design are grouped in the Creative collection. Every addition includes a React leaf, generated CSS, public types and props, registry metadata, a raw specimen, a separate contextual example, and agent documentation. Shared Civic, Science, and Creative guides are available through the website, generated Markdown, CLI, and MCP resources.

## Health polish

ReferenceRange and LabResults now fill the available width. Readings and interval bounds share a right edge; range intervals and markers share the centre of the track. Plain lab readings use the same label/value structure as ranged readings. Logical positioning preserves right-to-left layouts.

ActivityRings renders one to six personal goals as concentric monochrome rings. Each goal retains a named native progress element and visible numeric record. Missing activity, missing targets, zero, and exceeded targets remain distinct. Above-goal amounts are preserved while the drawn arc is bounded.

## Wall comment field

The wall comment input now uses the plain Input variant in the horizontal dock. Its previous column wrapper caused flex sizing to shrink it to 22px. Scoped sizing and padding keep the input aligned with the 44px send button. Browser checks confirm height, alignment, and comment submission at 320×568, 390×844, 430×932, 1024×900, and 1440×1000.

## Interaction and data contracts

- Civic views present supplied identity, financial, eligibility, and case records. Evidence actions request changes and display supplied confirmation states.
- Science views preserve measurement units, uncertainty, provenance, and missing values. Quantity entry does not silently convert units. WellPlate supports roving keyboard focus; SpectrumPlot includes a paginated numeric table and a focusable plot viewport with readable tick labels.
- Creative controls emit application edits and actions. The host supplies audio processing, playback, render execution, persistence, and undo history. Native form values preserve exact valid channel and colour values. TimecodeField supports integer non-drop frame rates from 1 to 99.
- No runtime dependencies were added.

## Verification

- Package build and Next production export pass. The site exports 190 static routes and assets.
- All 881 unit and integrity tests pass: React 796, Core 53, CLI 23, MCP 9.
- Package and site typechecks pass. Biome reports no errors, with 82 warnings and one informational diagnostic.
- All 147 catalogue entries, including the hidden entry, have isolated Use files. The 72 addition previews have no editorial imports.
- React 18 and React 19 tarball consumers pass root and leaf imports, server rendering, props, CSS exports, and native attribute checks. Publint and type-package checks pass. CLI smoke vendors all 72 additions with complete relative import closure and lists 146 public entries.
- All 463 generated files are byte-stable across a repeated CSS/props/docs/registry build.
- Dedicated health browser checks pass in light and dark themes at phone width, with desktop and phone assertions for full-width range layouts, aligned values and bounds, and centred intervals and markers.
- The complete browser run covered 163 pages. It identified one duplicate ClipTimeline landmark, now named from its visible label, and two quantity-select test assertions affected by macOS headless key handling. The corrected clip page passes full-page desktop axe. A final complete health/domain rerun passes with zero failures, including mobile light/dark overflow, 44px targets, accessibility, and real keyboard changes. Quantity selection uses native keyboard typeahead.

## Size budgets

The twenty new leaves increase aggregate costs while preserving existing common-control and atomic CSS caps. All new leaves are capped at 3 KB gzipped except WellPlate and SpectrumPlot, capped at 4 KB. Actual sizes range from 1.2 to 3.4 KB.

| Artifact | Actual gzip | Budget |
| --- | ---: | ---: |
| Full component CSS | 25.6 KB | 27 KB |
| Atomic React CSS | 15.1 KB | 16 KB |
| Every React component bundled | 162.4 KB | 166 KB |
| CLI with the complete registry | 80.1 KB | 84 KB |

The branch remains a draft pull request and preview. No npm version is published by this change.
