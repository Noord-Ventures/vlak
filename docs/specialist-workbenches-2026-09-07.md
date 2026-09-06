# Specialist workbenches and shared controls

Adds 20 components to the preceding health, civic, science and creative expansion. The public catalogue now contains 166 components, with 52 additions relative to the original 114-component catalogue.

| Collection | Additions in this change |
| --- | --- |
| Industrial | AlarmPanel, WorkOffsetPanel |
| Geospatial | CoordinateReferenceField, DatumTransformPicker, RasterBandMixer |
| Creative | Patchbay, KerningPairEditor |
| Science | StackNavigator, AcquisitionSequencer, SequenceAlignment, CoverageInspector, GenomicRegionField |
| Robotics | JointPanel, RobotPose, RobotMissionQueue |
| Circuitry | AssemblyVariantMatrix, PadInspector, DesignRuleResults |
| Microbiology | ColonyPlate, CultureLog |

WellPlate moves into Microbiology. Genomics remains part of Science. The existing `engineering` and new `electronics` identifiers display as Industrial and Circuitry. Collection guides, sidebar labels, registry search and MCP resources use the same grouping.

Every new component includes a React leaf, public types and props, generated semantic CSS, registry metadata and source closure, a raw preview, a separate contextual example, and keyboard and accessibility documentation. The application supplies scientific interpretation, measurement units, controller readings, permissions, execution and confirmed action states.

## Design and interaction

Conventional selectors, inputs and action buttons compose Vlak Select, Input and Button. Rings, routing matrices, sequence bases, plate annotations, meters and plots retain specialized visual treatments in Vlak's monochrome StyleX leaves. Generated CSS remains derived from those leaves.

Select now supports full-width compound fields, disabled options, named and externally associated forms, native submission, controlled and uncontrolled reset, required feedback, and read-only values. Its keyboard navigation skips disabled options. Disabling an ancestor fieldset closes an open menu and prevents a pending choice; the native first-legend exception remains intact. The full-width minimum uses a shared CSS custom property so semantic base rules cannot restore a wider minimum after the modifier.

ActivityRings builds on first view with a one-second sweep and 100ms stagger. Numeric progress is available immediately, and subsequent updates do not replay the entrance. Encouragement changes every ten seconds without immediate repetition. Rotation pauses offscreen, when the document is hidden, and through the visible pause control. Reduced motion renders the supplied rings immediately and keeps the line static.

Every page level now uses the same sidebar origin: compact desktop begins at the first grid line, and viewports from 1440px reserve one 204px module. Catalogue, component, guide and interface navigation preserve that origin during client navigation. Acquisition step numbers use the surrounding control scale; genomic and coverage selectors use Vlak's padded menu and chevron treatment.

## Verification

- Package build and Next production export pass. Package and site typechecks pass.
- All 1,091 unit and integrity tests pass: React 1,001, Core 58, CLI 23 and MCP 9.
- Biome reports no errors, with the existing 82 warnings and one informational diagnostic.
- All 167 registry entries have isolated Use files; 92 addition previews remain separate from contextual examples.
- React 18 and React 19 tarball consumers pass root and leaf imports, server rendering, native attributes, props and CSS exports. Publint and type-package checks pass. CLI smoke includes all 92 addition fixtures with 125 files of complete relative import closure and 166 public entries.
- The 528 generated CSS, token, props, registry and documentation files are byte-stable across repeated core builds.
- The complete browser suite passes all 188 pages, including accessibility, keyboard behavior, 390px page overflow, collection flows and sidebar navigation. Specialist checks cover all 20 additions, compound field boundaries, dark mode, 44px targets and independent application data states.
- Activity ring browser checks confirm the first-view sweep, stagger, final offsets, immediate progress values, no entrance replay, ten-second nonrepeating encouragement, pause/resume and reduced-motion behavior.
- AudioMeter retains its native meter. Browser-specific background images are cleared on the track and fill, preserving a flat monochrome treatment. Chromium shadow-element checks verify the actual meter paint at desktop and phone widths in both themes.
- Wall comment sizing and submission pass at 320, 390, 430, 1024 and 1440px.

## Size budgets

The larger catalogue accounts for the aggregate increases. Existing common-control and atomic CSS caps remain unchanged. Six of the seven latest leaves stay below 3 KB gzip; DesignRuleResults has a 4 KB cap. ActivityRings has a 5 KB cap for first-view animation, visibility-aware rotation and pause controls.

| Artifact | Actual gzip | Budget |
| --- | ---: | ---: |
| Full component CSS | 28.6 KB | 29 KB |
| Atomic React CSS | 15.7 KB | 16 KB |
| Every React component bundled | 199.5 KB | 205 KB |
| CLI with the complete registry | 100.7 KB | 104 KB |

This component checkpoint remains a draft pull request. No npm version is published.
