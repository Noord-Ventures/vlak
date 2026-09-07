# Functional micro apps for Vlak

Research date: 7 September 2026. This is a proposed backlog, not an implementation commitment. No additional micro apps are included in the current work beyond Video player.

## Recommendation

Build **CSV cleanup first, then SQLite inspection**. Both can do useful work on real local files, produce downloadable results, and demonstrate reusable Vlak tables, filters, selection, inspectors, and history. The current interface catalogue has neither. The other proposals below also avoid the existing media players, transit, fleet, scientific, and engineering studies.

The opportunity is a focused task with fewer steps and a complete result. It does not depend on an incumbent being abandoned. OpenRefine released 3.10.0 in February 2026, and WinMerge released 2.16.58.2 in August 2026. Both remain maintained. [OpenRefine releases](https://openrefine.org/download.html), [WinMerge releases](https://winmerge.org/downloads/?lang=en).

## Ranked shortlist

Ranking reflects inferred fit, feasibility, and differentiation for Vlak. The demand figures are snapshots from primary sources, not keyword volumes, unique-user counts, or forecasts.

| Priority | Utility and demand proxy | Functional scope and discovery intent |
| --- | --- | --- |
| 1 | **CSV cleanup.** OpenRefine reports approximately 20,000 downloads per month and 1,200 academic citations per year; its usage page includes data through July 2026. [Source](https://openrefine.org/usage) | Import CSV, inspect column values, trim whitespace, normalize selected values, remove duplicates, preview changes, undo, and export CSV plus a transformation recipe. Target specific jobs such as “remove duplicate CSV rows” and “clean CSV without Excel.” |
| 2 | **SQLite file explorer.** Homebrew reports 53,609 DB Browser for SQLite installs over 365 days, covering only one distribution channel. [Source](https://formulae.brew.sh/cask/db-browser-for-sqlite) | Open a real database, inspect its schema, browse and filter tables, run queries, and export results. Start with inspection; database editing needs explicit save-as. Intents: “open SQLite file online” and “export SQLite to CSV.” |
| 3 | **Photo metadata inspector.** ExifTool's official download hosting showed 56,748 downloads for the displayed week. This measures downloads, not distinct photographers. [Source](https://sourceforge.net/projects/exiftool/) | Inspect a batch of photos, compare exposure, camera, lens, timestamps and GPS fields, filter, and export a CSV or JSON manifest. Intents: “batch EXIF viewer” and “compare photo metadata.” Selective metadata removal is a later, separately tested feature. |
| 4 | **Text and file comparison.** WinMerge's official download hosting showed 38,605 downloads for the displayed week. [Source](https://sourceforge.net/projects/winmerge/) | Open two text files or paste content, compare lines and words, configure whitespace handling, navigate differences, accept individual changes, and export merged text or a patch. Intents: “compare files locally” and “create patch from two files.” |
| 5 | **PDF page workbench.** Smallpdf claims over one billion lifetime customers. Its pages disagree on monthly figures, so no monthly estimate is used here. [Source](https://smallpdf.com/about) | Merge, reorder, rotate, delete and extract pages with previews, undo and real PDF export. Intents: “reorder PDF pages without uploading” and “extract PDF pages locally.” This is a crowded category with polished competitors; PDFsam already offers offline processing and visual tools. [PDFsam](https://pdfsam.org/) |
| 6 | **Time zone meeting planner.** timeanddate says its services reach millions worldwide; that is a broad audience claim, not planner-specific traffic. [Source](https://www.timeanddate.com/information/advertising.html) | Compare zones and working hours, move a shared timeline, expose daylight-saving changes, save the configuration in a link, and export an ICS event. Intents: “find overlapping working hours” and “DST meeting time calculator.” Differentiation is thinner here. |

## Feasibility and boundaries

Each first version can use supplied local files or browser calculations. No paid data API, account system, or per-operation server processing is necessary. Hosting and maintenance still have costs. Use original Vlak interfaces over suitable libraries rather than copying incumbent application code.

| Utility | Implementation basis | Initial boundary |
| --- | --- | --- |
| CSV | [Papa Parse](https://github.com/mholt/PapaParse), MIT; local parsing, workers, streaming and export | Preserve source values unless the user applies a previewed transformation. Do not execute spreadsheet formulas. |
| SQLite | [Official SQLite WASM APIs](https://www.sqlite.org/wasm/doc/trunk/api-index.md); SQLite deliverables are [public domain](https://www.sqlite.org/copyright.html) | Worker execution, cancellation and explicit file-size limits. Encrypted databases and large-file editing require separate work. |
| Metadata | [exifr](https://github.com/mikekovarik/exifr), MIT; reads common image metadata in the browser | Reading support does not imply writing support. Do not promise complete anonymization from a metadata preview. |
| Comparison | [jsdiff](https://github.com/kpdecker/jsdiff), BSD-3-Clause; browser diffs and patches | Text files first. Binary, folder, and three-way merging are separate features. |
| PDF | [pdf-lib](https://github.com/Hopding/pdf-lib), MIT, for modification; [PDF.js](https://mozilla.github.io/pdf.js/getting_started/), Apache-2.0, for previews | Exclude OCR, arbitrary text editing, signatures and encryption from the initial promise. Test preservation of document features. |
| Time zones | Browser internationalization and a compatible [Temporal polyfill](https://github.com/js-temporal/temporal-polyfill), ISC | Test ambiguous and missing local times at DST boundaries. Rules change, as the [IANA timezone database](https://www.iana.org/time-zones) documents. |

## Discovery and validation

Pair each working utility with an indexable explanation of the task, representative input and output, format limitations, keyboard behavior, and source examples. Link its reusable components to Vlak's registry and existing developer documentation. This adds a working domain workflow alongside the generic dashboards, sidebars and authentication layouts featured in [shadcn's blocks](https://ui.shadcn.com/blocks).

Validate completion and repeat use before expanding the suite. Track successful imports and exports without collecting file contents, then examine actual search queries and referral traffic. Downloads of other tools only establish that the underlying job exists; they do not establish that Vlak can acquire those users.

Do not promise rankings or LLM citations. Google says foundational SEO practices apply to AI features and gives no guarantee of crawling, indexing or appearance. [Google Search guidance](https://developers.google.com/search/docs/appearance/ai-features). Bing's AI Performance report can measure citations on its supported AI surfaces, but its counts do not establish authority or causation. [Bing documentation](https://www.bing.com/webmasters/help/ai-performance-9f8e7d6c).
