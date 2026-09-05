# Component expansion verification

Date: 6 September 2026

Status: implementation and local release verification complete. Forty additions bring the public catalog to 114 components. This report records local checks, not an npm publication or proof of production deployment.

## Scope

Forty additional components, in four groups of ten, plus repairs to existing components and icon construction. The source of paint remains the React StyleX leaves. Registry metadata, public exports, examples, generated CSS, props, registry items, CLI and MCP data must agree before release.

The design-system skill shaped token use, consistent states, native-first behavior, and honest API documentation. The testing-strategy skill shaped interaction and failure-path tests, independent state/focus review, and the remaining package-distribution and browser checks. Neither skill nor an automated test result constitutes accessibility or performance certification.

## Forty additions

### Input and editing

| Component | Registry name | Implemented purpose |
|---|---|---|
| NumberField | `number-field` | Numeric input with bounded native stepping, units, and inline or stacked controls |
| RangeSlider | `range-slider` | Two ordered, independently named native range endpoints |
| MultiSelect | `multi-select` | Searchable native disclosure with multiple checkbox selections |
| TagInput | `tag-input` | Validated, removable tokens with typing, paste, and explicit add |
| DateRangePicker | `date-range-picker` | Native start and end date fields with bounds and ordering |
| TimeField | `time-field` | Native, locale-presented time entry with machine-readable values |
| FileUpload | `file-upload` | Validated file queue, optional upload transport, progress, cancellation, and retry |
| TransferList | `transfer-list` | Select and move items between available and selected collections |
| InlineEdit | `inline-edit` | Read/edit flow with validation and optional asynchronous save |
| Rating | `rating` | Discrete native radio score with optional clearing |

### Data display and feedback

| Component | Registry name | Implemented purpose |
|---|---|---|
| DescriptionList | `description-list` | Semantic term/value records |
| Metric | `metric` | Aligned value, unit, label, and supporting change/context |
| ActivityTimeline | `activity-timeline` | Ordered events with time and descriptive content |
| CodeBlock | `code-block` | Code display with optional line numbers and copy feedback |
| JSONViewer | `json-viewer` | Expandable structured data with explicit rendering budgets |
| DiffViewer | `diff-viewer` | Paginated line differences with bounded comparison work |
| ErrorSummary | `error-summary` | Linked validation summary that directs focus to fields |
| NotificationCenter | `notification-center` | Read/unread notifications with confirmed clear/dismiss actions |
| TaskProgress | `task-progress` | Multi-step progress, current work, and failure/retry actions |
| ConnectionStatus | `connection-status` | Named connection state and optional reconnection action |

### Navigation and application structure

| Component | Registry name | Implemented purpose |
|---|---|---|
| TreeView | `tree-view` | Hierarchical selection and expansion with tree keyboard navigation |
| Toolbar | `toolbar` | Named toolbar actions with roving focus |
| BottomNavigation | `bottom-navigation` | Persistent compact navigation with current destination |
| OverflowList | `overflow-list` | Visible actions plus responsive overflow with focus continuity |
| FilterBar | `filter-bar` | Composed filter controls, active values, and clearing |
| QueryBuilder | `query-builder` | Nested rule groups with field-compatible operators |
| SortableList | `sortable-list` | Reordering with explicit controls, keyboard movement, and confirmed announcements |
| VirtualList | `virtual-list` | Fixed-height windowed rendering that preserves focused descendants |
| MasterDetail | `master-detail` | Collection selection with corresponding detail content |
| PropertyGrid | `property-grid` | Labeled text, numeric, select, and switch property editing |

### Media and product compositions

| Component | Registry name | Implemented purpose |
|---|---|---|
| PlaybackControls | `playback-controls` | Named play/pause and optional previous, next, and stop actions |
| MediaScrubber | `media-scrubber` | Native media seeking with elapsed/total time and chapters |
| MediaPlayer | `media-player` | Native media composed with Vlak transport, volume, captions, and error recovery |
| Waveform | `waveform` | Supplied amplitude visualization with optional seeking and region selection |
| ImageViewer | `image-viewer` | Image collection inspection with zoom and native lightbox |
| CanvasControls | `canvas-controls` | Zoom, fit, and reset controls for an application-owned canvas |
| MessageComposer | `message-composer` | Text and attachment drafting with send, stop, and error recovery |
| FileBrowser | `file-browser` | Supplied file hierarchy, breadcrumbs, search, and list/grid views |
| KanbanBoard | `kanban-board` | Cards and columns with drag, keyboard, and explicit destination movement |
| Scheduler | `scheduler` | Agenda, week, and month views with explicit event/slot callbacks |

Sources: `packages/core/src/registry-{input,data,navigation,media}-additions.ts`, corresponding leaves in `packages/react/src/components/`, and examples under `apps/www/components/examples/`.

## Repairs and review outcomes

- Existing controls: 44px target and 4px corner defaults, native state and ref handling, and consistent selected states. Selection uses full-surface fill, ink, or weight, not a leading vertical stripe.
- DataTable: controlled/default sort, filter, and selection; visible-row select-all and mixed state. Checkbox exposes `onCheckedChange` and indeterminate state.
- Tabs: first enabled default and reconciliation when the active tab disappears or becomes disabled. Calendar: 44px day targets, locale, bounds, and `isDateDisabled`; DatePicker passes bounds through.
- InputOTP: bounded length, numeric handling, controlled values, and native form, disabled, and read-only behavior. InlineForm only reports saved after a successful save callback, retains the draft on failure, and reports a missing handler instead of inventing success.
- ThemeToggle: explicit light/dark handling. Overlays: viewport clamping and native top-layer fallback. Concentric-radius math is constant-time rather than iterative.
- Charts: grouped signed values, inversion, gaps, finite domains, and named empty states. Scatterplot groups remain annotations, not visually distinct glyphs; metadata reflects that limitation.
- New input review: form resets restore uncontrolled defaults and clear transient drafts; FileUpload aborts on reset; a late InlineEdit save cannot overwrite a reset. NumberField uses native snapping for off-step values without taking over controlled state. TagInput paste preserves the current insertion context. Removed MultiSelect and TransferList options remain visible and removable.
- New data/navigation review: QueryBuilder excludes incompatible operators and clears stale values when fields change. VirtualList keeps focused children mounted and moves focus to a surviving item after removal. SortableList and NotificationCenter wait for an actual controlled-state commit before success announcements or focus transfer. OverflowList cannot steal focus from another instance. PropertyGrid serializes every supported field type and resets correctly.
- Bounded inspection: JSONViewer does not invoke property getters; array and string work is budgeted. DiffViewer pages the complete result rather than silently dropping lines.
- ImageViewer zoom changes layout dimensions so enlarged content remains reachable by scrolling.
- Mobile preview follow-up: all 40 additions render without page overflow at 390px. Rating's invisible radio now measures 44px square; TagInput's input measures 260px by 44px. Calendar days are at least 44px square, with 4px corners; narrow containers scroll internally instead of shrinking targets.
- Real-browser focus: DatePicker waits until its top-layer panel is visible before focusing the selected day. Nested menus likewise focus after placement and return to the immediate parent on Escape. Both were verified in the production export, not only in simulated tests.
- CLI installation preflights the full destination plan, deduplicates shared helpers, and rejects conflicting file contents before writing. OverflowList uses the existing React 18/19 compatibility helper for the inert attribute.
- A CSS-only consumer fixture, without the site's reset, confirmed Toggle's 44px target, 4px corners, and full-fill pressed state; a 320px border-box Textarea with 4px corners; and a dropdown with 4px corners. This is a focused distribution-style check, not a complete packaged-consumer result.

### Icon construction

- Line icons retain their 16-unit drawing module and 1 CSS px hairline across supported sizes.
- Filled silhouettes and positive strokes scale together. Detail cuts have a minimum of 1 CSS px, with dedicated 12px cuts for dense marks.
- Save details remain enclosed; archive, package, duplicate, and files use closed container silhouettes. Fine trash slots are simplified at 12px. Off-state slashes are separated from their underlying figures.
- The catalog explicitly labels line versus filled and 12, 16, and 24px specimens. Geometry and index tests guard construction. The rendered light/dark catalog was inspected at 2× pixel density, including Save, Archive, Package, ordered lists, and off-state marks. A 1× display and physical-device optical review remain outside this verification.

Sources: `packages/react/src/components/icon.tsx`, `icon-marks.ts`, and `packages/react/test/icon-fidelity.test.tsx`.

## API constraints to preserve

- Controlled callbacks are requests. A component must not claim that a save, reorder, or dismissal happened before the caller commits the corresponding state.
- NumberField's `controlsPlacement="stacked"` puts increase above decrease at the trailing edge. Both are full-size controls. The default is `inline`.
- RangeSlider intentionally uses two native ranges, not an overlapping dual-thumb track. Named form fields are `[0]` and `[1]`.
- DateRangePicker intentionally uses native date inputs, not a custom range-calendar popover. Values are ISO date strings and named fields are `[start]` and `[end]`. TimeField uses native time formatting, with `HH:mm` or `HH:mm:ss` values and seconds-based step.
- FileUpload collects files unless `onUpload` supplies a real transport. The application owns authentication, destination, and server validation. Progress is reported by that callback. Native form submission uses the browser `formdata` event and multipart encoding; unit coverage of the event handler is not a substitute for browser submission coverage.
- Rating is a discrete integer radio score from 1 to `max`, with zero meaning unset. `max` is bounded to 1–10.
- VirtualList requires fixed item height and stable unique IDs. It is not a variable-height measuring engine. List and tree IDs must stay unique and stable across updates.
- QueryBuilder produces a rule model. The application owns evaluation, persistence, and validation against its actual data source.
- JSONViewer clamps depth to 1–20, entries per branch to 1–1000, total nodes to 1–10000, and string display length to 100–10000. The default string budget is 2000. Getters are shown as getters, not executed.
- DiffViewer defaults to 200 lines per page, with a 1–1000 page-size bound. Its LCS comparison budget is 1 million cells; above that it uses a coarser replacement representation. It is not a syntax-aware or word-level diff engine.
- PlaybackControls do not play media themselves. CanvasControls do not implement a renderer or pan surface. Waveform renders supplied amplitude samples rather than decoding audio. FileBrowser operates on supplied entries, not the user's filesystem.
- Scheduler and other product compositions expose callbacks, not storage, a server, or a real-time synchronization layer. Scheduler renders a stable named shell until hydration, then uses the explicit timeZone or browser zone. Invalid spring-forward clock times are rejected; repeated fall-back times select the earlier occurrence. The application owns event storage.
- MessageComposer's generating/onStop contract is application-owned. Stopping requests cancellation; it does not claim to stop a remote transport itself.

## Focused verification recorded

These are source-level test results, not a complete release test total. Rows can overlap; do not add them together as a unique total.

| Check | Recorded result | Coverage and limitations |
|---|---|---|
| `input-additions.test.tsx` | 30 passed | Native forms, controlled/uncontrolled values, bounds, reset, paste, missing options, uploads, async save, keyboard, axe |
| `expansion-review.test.tsx` | 12 passed | Controlled commit announcements, list focus removal/scroll, nested query, property forms, overflow isolation, render budget, async resets |
| `navigation-additions.test.tsx` | 22 passed | New navigation and application compositions |
| `data-additions.test.tsx` | 24 passed | New data/feedback components |
| Four suites above together | 88 passed | Run 6 September, 01:00 local time, before the final Rating/TagInput style-only target changes |
| `audit-repairs.test.tsx` | 25 passed, latest count reported by root | Existing component regression coverage |
| `data-additions.test.tsx` + `render-budgets.test.tsx` | 29 passed, reported by repair owner | Includes getter safety, long strings, and complete paginated diffs |
| Earlier five-file existing-component suite | 123 passed, reported by repair owner | Focused pre-integration regression run, not the final complete suite |
| Core radius tests | 6 passed, reported by repair owner | Bounded radius behavior |
| React TypeScript | Passed before final target-only styles | `pnpm --filter @noorddev/vlak-react typecheck` |
| Owned source/test Biome check | 20 files passed; final 3 target-related files also passed | No errors or fixes; registry example template strings may produce existing-style warnings |
| Media and icon focused suites | 41 passed | Media products 32; icon fidelity 9; includes Scheduler zone/DST and composer stop behavior |

The new axe checks run in jsdom with color contrast disabled because that environment does not provide reliable canvas/layout contrast evaluation. They check semantics and selected rule violations, not all WCAG requirements. Native picker appearance, physical target sizes, real browser focus/scroll behavior, actual media playback, forced colors, reduced motion, and device typography need browser/device checks. No 8.3ms or 16.7ms frame-budget benchmark has been recorded.

## Release verification

| Check | Result |
|---|---|
| Full workspace tests | `pnpm test`: 572 passed (React 498, core 46, CLI 21, MCP 7) |
| Typecheck and lint | Package and site typechecks passed; Biome reports no errors |
| Scheduler SSR parity | Identical initial markup under UTC, Los Angeles, and Tokyo host zones; explicit-zone and DST tests pass |
| Public coverage | 114 public entries, 115 including the hidden compatibility entry; 198 exports; 115 isolated example files |
| Generated output | 363 files byte-stable across repeated CSS/registry builds; SHA-256 `42aa8f25125cf2512ca571297cbf9f4760a683e1bbefc48d97dbdbc7e3b5459e` |
| Consumer tarballs | `pnpm smoke` passes publint/types checks, all 40 root and leaf imports under React 18/19, props, CSS exports, and CLI install with 72 source files and complete relative-import closure |
| Package/site builds | `pnpm build` and `pnpm --filter www build` pass; 152 static routes generated, including all 114 public component pages |
| Mobile layout | All 40 new pages inspected at 390px with no page overflow. Rebuilt Rating, TagInput, Calendar, nested menu, and DatePicker fixes measured and exercised |
| Interface adoption | Drive uses shared Metric, NumberField, PlaybackControls, MediaScrubber, ConnectionStatus. Desktop readings align exactly; temperature buttons are 44px square and stacked. Journey and Energy views work. Orbit zoom changes the visual and remains contained on mobile. Render uses TreeView, PropertyGrid, DescriptionList |
| Browser scheduling | Native keyboard time edit saved 10:16–10:46 from a 30-minute event; focus returned to the reschedule action |
| Icon optical check | Light/dark, 12/16/24px specimens at 2× density. Enclosed filled silhouettes and off-state separation remain legible |
| Sizes | Core CSS 19.7KB gzip; atomic React CSS 13.8KB; all React modules bundled 125.3KB; CLI 56.9KB. All size checks pass |

The complete-catalog budgets increased to account for 40 additions: core CSS 24KB, all React modules 136KB, CLI 64KB gzip. The atomic CSS cap stays 16KB and Button stays 4KB. New leaf caps range from 2KB for PlaybackControls to 6KB for Scheduler; actual sizes are 1.0KB and 5.4KB respectively. These are distribution budgets, not frame-rate guarantees.

## Verification limits

- Browser work used the Codex Chromium browser on this Mac at 390px and desktop widths, 2× density. No separate physical iOS/Android, 1× display, forced-colors, or screen-reader session was performed. The existing CI browser/axe suite is separate from these local checks.
- Upload transport, media rejection/captions/cancellation, form serialization/reset, and reduced-motion contracts have source/unit coverage; a complete real-server upload and cross-browser media/device matrix was not performed.
- The Sketchfab vehicle loaded on desktop, but the same third-party viewer reported a device-capability failure during the mobile check. Its rendering depends on WebGL and the external service, not the component package.
- Local development CPU checks demonstrate bounded output, not universal speed: 10,000-line diff generation used the coarse fallback and a 200-row page; a 50,000-property JSON object invoked zero getters. Large caller-owned input still costs time to enumerate. No 120Hz or 60Hz performance certification is claimed.
- This change is prepared for Git main. It does not publish a new npm version. Deployment and remote CI status must be checked against the pushed commit.
