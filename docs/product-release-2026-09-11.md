# Product release evidence, 11 September 2026

This record covers the first software releases from the product and service assessment. Implementation is in `745e3ee`; `9ae8e0e` declares the workflow preview's dependencies for a clean checkout and fixes an asynchronous iOS test readiness race. It is not evidence of customer demand, a completed paid engagement, or production integration with another organization's systems.

## Delivered scope

| Track | Delivered | Boundary |
| --- | --- | --- |
| Workflow kits | Record-review UI, memory and local JSON adapters, HTTP contract, revision checks, operation lookup, history and bounded undo; approval and schedule recipes; complete source exports through CLI and registry; read-only MCP discovery | The hosted preview uses memory. The example server is a local reference with a trusted-principal boundary, not production authentication. Approval and schedule are recipes, not hosted approval services. |
| Source adoption | Ownership and baselines, status/diff, pinned update plans, reviewed application, interruption journal and guarded rollback | Available from this repository's CLI source. No npm version was published in this release. Conflicting edits require review; the CLI does not merge arbitrary source or run dependency scripts. |
| Task workspaces | CSV reconciliation, Calendar import reports and portable projects, Microscopy project restoration and printable applied-plan worksheet | Exact CSV comparison, bounded inputs, explicitly supported calendar fields, and a microscopy plan rather than acquired data. No external calendar or instrument compatibility certification. |
| Modernization service | Local brief builder, portable files, proposal/discovery/acceptance/handoff/support templates | No paid pilot, outreach, contract, customer integration or managed support has occurred. A partner and agreed acceptance remain necessary. |
| Creative tools | Wallpaper and Music project files, validated restoration, optional browser saves/history/recovery; deterministic PNG and snapshot WAV exports | Existing generators and four-track music scope remain. Project files contain editable work; exported images/audio are finished artifacts. No cloud sync or project-state sharing. |

The common document envelope is versioned separately from each app's payload. Imported data is validated before replacement. Opening another project first commits a separate copy of outgoing work to Recent projects; failed recovery storage leaves current work on screen. Optional ongoing IndexedDB saves use revision checks in the write transaction, bounded history and a recovery export; downloaded project files remain the portable ownership mechanism. These utilities do not send project contents to a service.

The final plan audit added stable Music clip IDs with deterministic migration for existing files. Wallpaper PNG filenames include a snapshot-derived content label and selected composition; that readable label is distinct from the browser database's revision ID and is not a security checksum.

## Verification

Local verification used Node 26.7.0, pnpm 11.19.0 and Chrome for Testing 151.0.7922.34 on macOS. CI uses Node 22 on Linux. Browser automation verifies Chromium behavior; it does not establish Safari, Firefox or real-device equivalence.

| Check | Evidence |
| --- | --- |
| Package and workflow tests | 1,561 passed: React 1,409; core 73; CLI 42; MCP 17; workflow examples 20 |
| Website and reference server tests | 92 website tests and 16 assistant tests passed |
| Types, lint and package builds | Package, workflow, website and assistant checks passed locally; lint has no errors, with 78 warnings and 9 informational findings |
| Consumer checks | Package tarball inspection, React 18/19 consumers, optional-engine isolation and CLI source export passed |
| Generated artifacts | Core CSS, tokens, props, registry and machine-readable documents regenerate without changes |
| Bundle limits | All configured budgets pass; CLI is 155.1 KiB gzip against an explicitly raised 160 KiB limit |
| Website build and discovery | 636 generated pages; canonical/sitemap/metadata checks cover 305 indexed pages and 191 images; agent-surface checks pass |
| General browser checks | Accessibility scans over 256 pages, phone overflow checks over 238 pages, keyboard navigation, mobile navigation/search/components and interface previews passed |
| Workflow and service UI | Desktop and mobile editing, unsaved-draft protection, commit/history/undo, validation, file export and accessibility passed |
| Project storage | File round trips, malformed/future documents, competing tabs, revision history, recovery and deletion tests passed |
| CSV | Column selection, exact comparison, ambiguity, decision invalidation, recipe/project round trips and exports passed; 5,000-row by 500-column benchmark was approximately 206 ms parse and 40 ms comparison locally |
| Calendar | CRUD at 320/390/1024/1440 px, source-level import reporting, rapid successive imports, storage failure and competing-tab deletion passed |
| Microscopy | Desktop/mobile print preparation, worksheet contents and cleanup passed; the rendered A4 PDF was inspected for all applied positions/steps/axes, status and absence of site chrome |
| Creative output | PNG dimensions for all three formats, restored-image comparison in the same browser, stable export snapshots and WAV PCM structure passed |
| Existing interfaces | Refreshed interface and specialist checks passed after focused investigation of timing-sensitive assertions; iOS audio resume was repeated five times with state-based readiness |

The first hosted build of `745e3ee` failed because the workflow example's dependencies were not declared in the root workspace. The previous production deployment remained active. The correction in `9ae8e0e` adds that workspace and its lockfile importer, and includes its typecheck in the root command. A fresh detached checkout passed frozen-lockfile installation, package/workflow/site typechecks and the production site build. Hosted CI remains a release gate; local dependency folders are not sufficient evidence.

No independent customer task-completion study has been run. The proposed four-of-five unassisted completion gate, return-use measures, adoption rates, task-time improvements, pricing and service demand remain unmeasured.

## Recovery and rollback

- Website: use the prior known-good deployment or a reviewed revert if the new deployment fails. A failed build must not be described as live. Reverting the site does not delete the user's browser database, but old code may not understand new project versions; download portable files before deliberate version changes.
- Projects: export the active project and recovery data before removing browser copies. Unknown versions and invalid imports preserve current work. On a revision conflict, preserve the draft as a new copy instead of replacing another tab's saved revision.
- Source updates: inspect the pinned plan and keep a source-control checkpoint. Use `recover` to inspect an interrupted journal. `recover --rollback` restores recognized original bytes only; unrecognized later edits stop it before replacement. Preserve the journal and edits for manual recovery if necessary.
- Calendar: retain the source ICS and import report. Export a project backup before replacing data. Unsupported calendar semantics are disclosed instead of being represented as verified interoperability.
- Microscopy: print from the applied plan. Review state and the content fingerprint describe local plan review; neither certifies acquisition, safety or scientific suitability.

## Maintenance and outcome evidence

Open-source maintenance uses the repository's issue and review process. A report should include the route or command, source revision, browser/Node version, expected result and minimal reproduction. Do not request credentials, private records or full project contents by default; use redacted fixtures. This release creates no support SLA or new telemetry.

Each service engagement must name its accepting owner, deployment operator, support scope and rollback owner in the supplied templates. Those fields cannot be completed without an actual engagement. Scientific handoff requires a domain partner and a receiving-format specification.

Before expanding the products, record observed task completion, assistance needed, whether the exported result opens in its intended destination, whether the user returns with real work and the maintenance effort incurred. Failed attempts count. These are research and continuation decisions, not claims inferred from automated test results.
