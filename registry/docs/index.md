# Vlak components

231 components in 21 categories. Each page lists install paths, a React example, props, keyboard, and accessibility notes. Version 0.5.0.

## Actions

- [Toolbar](toolbar.md): Groups actions behind one Tab stop with arrow-key navigation.
- [Overflow list](overflow-list.md): Keeps priority actions visible and moves excess actions into a menu.
- [Playback controls](playback-controls.md): Groups named play, pause, previous, next, and stop controls with 44px targets.
- [Canvas controls](canvas-controls.md): Adjusts bounded zoom and exposes fit and reset actions for a canvas.
- [Button](button.md): Triggers an action with solid primary, 1px ghost, or borderless subtle styling. Every target is at least 44px; icon size is a 44px square.
- [Button group](button-group.md): Keeps related actions together as joined buttons with 1px dividers and one outer frame.
- [Text link](link.md): Navigates to a page or resource. Hairline underline; in-copy variant is inset 1px.
- [Dropdown menu](dropdown-menu.md): Presents a compact list of actions. Menu roles and arrow-key navigation are built in.
- [Toggle](toggle.md): Turns one persistent option on or off with aria-pressed. Default uses an ink fill when pressed; subtle uses a soft fill and stronger text.
- [Toggle group](toggle-group.md): Selects one visible option. Default joins toggles with an ink active state; subtle uses a gray rail, 3px gaps, and a soft active fill.
- [Context menu](context-menu.md): Opens actions at the pointer or with Shift+F10. Escape and outside click close the menu.
- [Menubar](menubar.md): Groups application menus in a compact 1px frame. Text-only triggers keep 44px targets and wrap to fit.
- [Command](command.md): Finds and runs commands inline or in a native dialog. Filter by typing or supply ranked results; navigate with arrows and Enter.
- [Theme toggle](theme-toggle.md): Switches between light and dark schemes. The icon changes and the choice persists locally.

## Forms

- [Number field](number-field.md): Edits a numeric value with native validation, units, and bounded 44px increase and decrease actions.
- [Range slider](range-slider.md): Sets an ordered numeric interval with two named native range controls and visible endpoint values.
- [Multi-select](multi-select.md): Selects multiple predefined options from a searchable native disclosure with named checkboxes.
- [Tag input](tag-input.md): Creates and removes freeform text tokens with paste splitting, duplicate prevention, and validation.
- [Date range picker](date-range-picker.md): Collects start and end dates with two native date editors, shared constraints, and 44px controls.
- [Time field](time-field.md): Edits a time using the platform's localized time control with native bounds and second-based steps.
- [File upload](file-upload.md): Collects validated files through browse or drop, with optional upload progress, cancellation, and retry.
- [Transfer list](transfer-list.md): Assigns options between available and selected lists using native checkboxes and explicit move actions.
- [Inline edit](inline-edit.md): Switches a text value into an editor with explicit save and cancel, validation, and optional async persistence.
- [Rating](rating.md): Collects a discrete numeric score with 44px native radio choices and an optional clear action.
- [Media scrubber](media-scrubber.md): Seeks through media in seconds with elapsed time, buffering, chapters, and optional previews.
- [Input](input.md): Collects one line of text. 1px border, 2px focus ring, 12px label above.
- [Label](label.md): Names a form control. 12px secondary text, set above the control.
- [Field](field.md): Groups a label, control, and hint or error in one vertical field.
- [Input group](input-group.md): Joins a text field with a prefix or suffix inside one 1px border.
- [Native select](native-select.md): Presents browser-native options inside a 1px control border.
- [Radio](radio.md): Selects one option from a group. The selected dot fills with ink.
- [Checkbox](checkbox.md): Selects any number of options. A 44px target surrounds the check mark; indeterminate uses a minus.
- [Switch](switch.md): Turns one setting on or off. A slim 44×24px track sits inside a 44px touch target.
- [Slider](slider.md): Selects one value from a range. A fine track sits inside a 44px hit area.
- [Select](select.md): Selects one option from an overlay. The closed trigger carries a chevron.
- [Textarea](textarea.md): Collects multiple lines of text. Resizes vertically only.
- [One-time code](input-otp.md): Collects a one-time code in one cell per character. Supports auto-advance, backspace, and paste.
- [Combobox](combobox.md): Filters and selects an option from a listbox through one text field.
- [Calendar](calendar.md): Selects a date from a month grid. Selected day fills with ink; today has a 1px outline.
- [Calendar popover](calendar-popover.md): Types or picks a date and optional local time. A 1px field opens a calendar in the native top layer.
- [Date picker](date-picker.md): Selects a date from a calendar overlay opened by a 1px trigger.
- [Form](form.md): Collects related inputs as stacked fields with one primary action at the end.

## Navigation

- [Tree view](tree-view.md): Navigates a hierarchy with expansion, single selection, and roving focus.
- [Bottom navigation](bottom-navigation.md): Presents mobile destinations with current state and safe-area spacing.
- [Tabs](tabs.md): Switches between related panels. Text labels in one row; active tab has a 1px underline.
- [Breadcrumbs](breadcrumbs.md): Shows a page's place in a hierarchy. Ancestors are links; the current page is full ink.
- [Crumb bar](crumb-bar.md): Keeps the current path visible while scrolling. Fixed at 72px with a 1px bottom rule when active.
- [Pagination](pagination.md): Moves through paginated content. Square controls; the current page fills with ink.
- [Stepper](stepper.md): Shows progress through ordered steps. 1px connectors; done fills with ink, active is outlined.
- [Navigation menu](navigation-menu.md): Moves between primary destinations. Horizontal links; the current page is full ink.
- [Sidebar](sidebar.md): Holds persistent navigation in a 204px rail with a head, body, and foot.

## Feedback

- [Error summary](error-summary.md): Summarizes invalid fields and moves focus to their inputs.
- [Notification center](notification-center.md): Keeps persistent notifications with read, unread, action, and dismissal state.
- [Task progress](task-progress.md): Tracks long-running work with phases, honest progress, cancellation, and retry.
- [Connection status](connection-status.md): Communicates connecting, connected, offline, and reconnecting states.
- [Progress](progress.md): Shows completion for a known process. 4px bar; the label carries the percentage.
- [Badge](badge.md): Labels status or category. 11px text with outline, solid, and muted variants.
- [Alert](alert.md): Calls attention to contextual information. 1px frame and icon; critical variant fills with ink.
- [Skeleton](skeleton.md): Reserves space while content loads. Divider-tone pulse that respects reduced motion.
- [Empty](empty.md): Explains an empty state with a title, one sentence, and an optional action.
- [Spinner](spinner.md): Signals indeterminate progress. 16px ring with a 1px stroke; respects reduced motion.
- [Tooltip](tooltip.md): Explains a control on hover or keyboard focus. A real element describes its trigger.
- [Toast](toast.md): Reports a brief status in the bottom-right corner. Polite live region; pauses on hover and closes on demand.
- [Callout](callout.md): Adds a contextual note to running copy. 1px frame, square corners, no accent bar.

## Surfaces

- [Dialog](dialog.md): Focuses attention on a modal task. Title, body, and two equal actions.
- [Card](card.md): Groups related content as a label, title, and body. No outline.
- [Alert dialog](alert-dialog.md): Requires a decision before work continues. Native dialog with Escape and light dismiss disabled.
- [Popover](popover.md): Places non-modal content above the page with the native Popover API and light dismiss.
- [Sheet](sheet.md): Opens a focused task from a screen edge. Native dialog with platform focus handling and backdrop.
- [Drawer](drawer.md): Opens a focused task from the bottom edge. Native dialog with platform focus handling and backdrop.
- [Hover card](hover-card.md): Previews linked context on hover or keyboard focus.
- [Resizable](resizable.md): Resizes two adjacent panes with a draggable 1px handle. Arrow keys adjust the split.

## Content

- [Description list](description-list.md): Aligns semantic labels and values in a responsive description list.
- [Metric](metric.md): Displays a numeric reading with tabular figures and aligned units.
- [Activity timeline](activity-timeline.md): Lists timestamped events with actors and optional expandable details.
- [Code block](code-block.md): Shows source text with optional line numbers, wrapping, and copy feedback.
- [Json viewer](json-viewer.md): Inspects structured data with bounded nested disclosures and path search.
- [Diff viewer](diff-viewer.md): Compares text revisions in unified or split rows with explicit change labels.
- [Sortable list](sortable-list.md): Reorders items with drag handles, move buttons, and keyboard shortcuts.
- [Virtual list](virtual-list.md): Windows large fixed-height collections while preserving focused rows.
- [Waveform](waveform.md): Displays supplied audio amplitudes with optional seeking and editable selection bounds.
- [Mono chip](chip.md): Marks a short technical identifier. Monospace text with a 1px mixed border.
- [Table](table.md): Presents structured values in rows and columns. 1px row rules; total rows use 2px rules.
- [Accordion](accordion.md): Reveals related sections on demand. Native details rows with 1px rules.
- [Avatar](avatar.md): Identifies a person or group. 32px image or initials; broken images fall back automatically.
- [Item](item.md): Presents one list entry. Title and description sit left; metadata sits right.
- [Separator](separator.md): Separates related regions with a 1px horizontal or vertical rule.
- [Scroll area](scroll-area.md): Contains overflow without visible scrollbars. 20px edge feathers signal more content.
- [Collapsible](collapsible.md): Shows or hides one section with a native details disclosure.
- [Kbd](kbd.md): Labels a keyboard key. Monospace cap with a 1px frame and heavier bottom edge.
- [Carousel](carousel.md): Browses a sequence on a scroll-snap track. Buttons move one slide; the ends feather.
- [Data table](data-table.md): Sorts, filters and selects structured records. Native controls expose sort and selection state.
- [Aspect ratio](aspect-ratio.md): Keeps media at a defined aspect ratio while it fills the available box.
- [References](references.md): Connects inline citations to a numbered source list and cite box. Numerals hang in the gutter.

## Icons

- [Icons](icons.md): Provides interface marks on a 16px viewBox. Round currentColor strokes are 1px at 12, 1.25px at 16, and 1.5px at 24.

## Charts

- [Charts](chart.md): Plots one or more lines on a 204px field. 1px grid, textured series, and one optional spot color.
- [Bar chart](bar-chart.md): Compares values with vertical or horizontal bars. Thin ink marks, square ends, optional stacks.
- [Area chart](area-chart.md): Shows change and magnitude with a filled first series. 1px grid and one optional spot color.
- [Scatter chart](scatter-chart.md): Shows the relationship between two measures. Marks sit on a 1px grid in ink or one spot color.
- [Donut or share](donut.md): Shows one part of a whole as a ring or flush share strip. 1px stroke.
- [Histogram](histogram.md): Shows a distribution in adjacent bins with 1px gaps.
- [Small multiples](small-multiples.md): Compares repeated charts on shared axes. Each panel occupies one 184px column.

## Patterns

- [Filter bar](filter-bar.md): Shows active filters with individual removal, reset, and a result count.
- [Query builder](query-builder.md): Builds nested filter conditions from fields, operators, and values.
- [Master detail](master-detail.md): Links selection to a detail panel with a mobile back path.
- [Property grid](property-grid.md): Aligns editable labels, values, units, and hints in an inspector.
- [Media player](media-player.md): Connects native audio or video to playback, seeking, captions, speed, volume, and full screen.
- [Image viewer](image-viewer.md): Inspects an image collection with zoom, navigation, and a native dialog lightbox.
- [Message composer](message-composer.md): Composes a compact growing draft with validated file previews, paste and drop, screenshot capture, and retained drafts on failure.
- [File browser](file-browser.md): Explores a supplied file hierarchy through folders, breadcrumbs, search, and list or grid views.
- [Kanban board](kanban-board.md): Moves and reorders cards across named columns with drag and keyboard alternatives.
- [Scheduler](scheduler.md): Plans events in agenda, week, or month views with date navigation and accessible rescheduling.
- [Inline form](inline-form.md): Pairs one field with an embedded submit action. The button appears after validation.
- [Workflow card](workflow.md): Frames an ordered pipeline. 1px dashed frame, chips, and a ghost add action. Reordering is supplied by SortableList.
- [Assistant panel](assistant.md): Frames an assistant exchange with a user message, reply, suggestion, and input row.

## iOS

[iOS component index](ios.md): exports, integration boundaries, and related interface study.

- [iOS navigation bar](ios-navigation-bar.md): Compact or large-title navigation with circular actions and an optional vertical rail.
- [iOS tab bar](ios-tab-bar.md): Floating peer tabs with icon labels, roving focus and horizontal or vertical placement.
- [iOS search field](ios-search-field.md): A 48px search capsule with a native input and a separate clear action.
- [iOS switch](ios-switch.md): A native checkbox with a 64px pill track, translating thumb and a 44px hit height.
- [iOS list](ios-list.md): Inset list groups with labels, descriptions, leading symbols and independent trailing controls.
- [iOS segmented control](ios-segmented-control.md): A pill-shaped single choice with a full selected fill, radio semantics and arrow-key selection.
- [iOS slider](ios-slider.md): A native range input with a quiet track, pill thumb and synchronized stepped values.
- [iOS sheet](ios-sheet.md): A native modal bottom sheet with a centered title, grabber and deliberate entrance.

## Android

[Android component index](android.md): exports, integration boundaries, and related interface study.

- [Android app bar](android-app-bar.md): A Material app bar with a title, navigation action and trailing actions in Vlak tones.
- [Android navigation](android-navigation.md): Material destination indicators for a bottom navigation bar or vertical rail.
- [Android search bar](android-search-bar.md): A rounded Material search field with a leading icon and a clear action.
- [Android switch](android-switch.md): A Material switch with a 52-by-32 track and an expanding thumb, built on a native checkbox.
- [Android list](android-list.md): Segmented Material list rows with leading content, supporting text and independent trailing controls.
- [Android chip](android-chip.md): A Material filter chip with a filled selection state and a checkmark.
- [Android floating action button](android-fab.md): A Material floating action button with an optional extended text label.
- [Android bottom sheet](android-sheet.md): A native modal bottom sheet with Material geometry, accessible naming and focus restoration.

## AI

- [Context usage](context-usage.md): A native disclosure of context occupancy, token categories and estimated costs from application-supplied rates or model catalogs.
- [Model selector](model-selector.md): Searches a supplied model catalog by name, provider and capabilities, with metadata and controlled selection.
- [Sources](sources.md): A counted native disclosure of application-supplied references, descriptions and supporting quotes.
- [Inline citation](inline-citation.md): A quiet inline source trigger opening a counted, keyboard-navigable preview with links, descriptions and quotes.
- [Open in chat](open-in-chat.md): Explicit provider links that encode a supplied prompt for ChatGPT, Claude, Cursor, Scira, T3 Chat and v0.
- [Terminal](terminal.md): Renders streamed console output with incremental ANSI attributes and optional original colors.
- [Stack trace](stack-trace.md): Parses JavaScript error frames into function names, file locations and internal-frame labels.
- [Sandbox](sandbox.md): Combines a tool-status disclosure with keyboard-accessible code and output tabs.
- [Web preview](web-preview.md): Provides URL navigation, a sandboxed iframe and a collapsible console of supplied log messages.
- [Jsx preview](jsx-preview.md): Renders registered components and plain data expressions from streamed JSX through an optional parser.
- [Attachments](attachments.md): A responsive file list with image, audio, and video previews, file metadata, removal, and application-owned upload states.
- [Shimmer](shimmer.md): A monochrome moving highlight over progress text, with reduced-motion and forced-color fallbacks.
- [Plan](plan.md): A collapsible proposed plan with streaming title treatment, actions, and supporting context.
- [Task](task.md): A default-open task disclosure with supplied item states and file references.
- [Thought steps](thought-steps.md): A collapsible sequence of work summaries, with step states, source badges, images, and captions.
- [Checkpoint](checkpoint.md): A conversation marker with an async restore action, retry feedback, and stable cancellation.
- [Suggestions](suggestions.md): A wrapping or horizontally scrollable collection of prompt buttons with subtle outlines and 4px corners.
- [Work queue](work-queue.md): Collapsible prompt and todo sections with completion counts, attachments, and item actions.
- [Generated image](generated-image.md): Displays a supplied generated-image result with alt text and responsive 4px corners.
- [Conversation export](conversation-export.md): Downloads a Markdown snapshot from explicit message text, attachments, and structured tool results.
- [Response editor](response-editor.md): A multiline message editor that preserves failed drafts and ignores cancelled saves.
- [Workflow canvas](workflow-canvas.md): An interactive graph with draggable nodes, connections, viewport controls, anchored panels, and node actions.
- [Response markdown](response-markdown.md): Renders streaming markdown, tables, code, math, and diagrams with Vlak typography and safe default links.
- [Highlighted code](highlighted-code.md): Monochrome syntax highlighting with lazy grammars, exact-source copy and download, and a scrollable code region.
- [Response branch](response-branch.md): Navigates saved response alternatives with stable identity, previous and next controls, and a readable position.
- [Audio player](audio-player.md): Native audio playback for remote files and generated speech, with composable controls, bounded skip seeking, volume, and recoverable errors.
- [Mic selector](mic-selector.md): Searches available microphone inputs with explicit permission activation, device-change updates, and recoverable selection states.
- [Speech input](speech-input.md): Starts and stops native speech capture, with final text, optional interim results, and application transcription of recorded audio.
- [Voice selector](voice-selector.md): Searches application-supplied voice names and metadata, with controlled selection and optional audio preview playback.
- [Transcription](transcription.md): Displays timestamped speech segments, highlights playback time, and optionally seeks a player through accessible phrase controls.
- [Persona](persona.md): Native monochrome waveform, fluid orb, and ring visuals with five conversational states, live intensity, and a custom renderer.
- [Agent](agent.md): Inspects an agent’s model, instructions, tool definitions and output schema in a 4px surface.
- [Artifact](artifact.md): Frames generated content with header actions, an optional scroll region and a close request.
- [Commit](commit.md): Shows a commit message, full-hash copy, author and time, with expandable changed files.
- [Environment variables](environment-variables.md): Masks environment values by default, with deliberate reveal, value copy and quoted shell exports.
- [Package info](package-info.md): Compares current and proposed package versions with change type and expandable dependencies.
- [Schema display](schema-display.md): Displays an endpoint’s method, path, parameters and nested request and response schemas.
- [Snippet](snippet.md): Presents a compact selectable command with a decorative prefix and exact-value copy action.
- [Test results](test-results.md): Displays suites, derived pass/fail/skip totals, elapsed time and failure details with optional retries.
- [Chat](chat.md): A subtle 1px outline with 4px corners, a named header, scrollable conversation, and a composer anchored below the history.
- [Conversation](conversation.md): Keeps a scrollable message history at the latest response until the reader scrolls back.
- [Widget](widget.md): A surface with a subtle 1px outline and 4px corners for React content and provider iframes, with attribution, data states, actions, and supporting context.
- [Response actions](response-actions.md): Selectable subtle 44px icon controls for copying, reading aloud, rating through a combined feedback menu, and sharing an assistant response.
- [Tool call](tool-call.md): Shows tool input, output, and execution state in a native disclosure with a subtle 1px outline, 4px corners, and a 44px summary.
- [Confirmation](confirmation.md): Collects approval or rejection in a surface with a subtle 1px outline and 4px corners, with async recording, error recovery, and 44px actions.
- [Response](response.md): Presents user messages in right-aligned soft bubbles and assistant responses on the left, with speaker identity, avatars, status, actions, and a custom layout API.
- [Reasoning](reasoning.md): A native disclosure for supplied work summaries, with a chevron and 44px control. Panels use a subtle 1px outline and 4px corners.

## Health

- [Health metric](health-metric.md): A supplied health reading, unit, time and source with explicit pending, unavailable and stale states.
- [Reference range](reference-range.md): Positions a supplied numeric reading against caller-supplied reference bounds, with a complete text equivalent.
- [Lab results](lab-results.md): A named collection of supplied laboratory results with units, reference intervals, report times and amendment notes.
- [Symptom diary](symptom-diary.md): A chronological record of supplied symptoms and intensity descriptions, with notes and 44px native detail disclosures.
- [Check-in](check-in.md): Collects one supplied text answer with native radio controls, 44px targets, and an explicit unanswered state.
- [Habit tracker](habit-tracker.md): Shows dated complete, missed, skipped, and unrecorded states, with controlled completion actions and a responsive week view.
- [Sleep timeline](sleep-timeline.md): Displays supplied sleep, wake, and unknown intervals with explicit time labels, monochrome segments, and a complete text record.
- [Activity goal](activity-goal.md): Shows a supplied activity amount and target with native progress, visible units, and distinct missing-data states.
- [Activity rings](activity-rings.md): Shows one to six personal goals as concentric rings with a staggered entrance, gentle rotating encouragement, named progress and explicit missing-data states.
- [Patient banner](patient-banner.md): Keeps a supplied patient identity, identifiers, and recorded context together in a responsive band.
- [Medication schedule](medication-schedule.md): Lists supplied medication, dose, time, and recorded status with controlled 44px recording actions.
- [Appointment card](appointment-card.md): Groups supplied appointment time, timezone, clinician, location, and status with an optional action slot.
- [Care plan](care-plan.md): Lists supplied care tasks, owners, due labels, and statuses with controlled completion requests.

## Civic

- [Identity document](identity-document.md): Displays a supplied credential, masked identifier, issuer, dates, and verification status without exposing a raw identifier.
- [Tax summary](tax-summary.md): Separates supplied assessment line items from authoritative totals in a semantic two-column table.
- [Benefit program](benefit-program.md): Keeps programme availability, supplied eligibility, award terms, and criterion assessments separate.
- [Application status](application-status.md): Shows a supplied case reference, status, update time, milestones, and next step without estimating progress.
- [Evidence checklist](evidence-checklist.md): Lists evidence requirements, file records, and supplied verification status with controlled 44px action buttons.

## Science

- [Measurement value](measurement-value.md): A supplied scientific reading with units, symmetric uncertainty, optional scientific notation and explicit availability.
- [Quantity field](quantity-field.md): A 44px Vlak numeric input and styled unit selector with controlled quantity values, form submission and reset support.
- [Experiment run](experiment-run.md): Supplied experiment metadata, conditions and ordered protocol steps with explicit statuses and controlled recording actions.
- [Spectrum plot](spectrum-plot.md): A supplied numeric spectrum with labelled axes, caller-provided peak annotations and a complete paginated data table.
- [Stage position list](stage-position-list.md): Reviews supplied named stage positions with an explicit coordinate frame, per-axis units, inclusion state and controlled selection, reorder and removal requests.
- [Stack navigator](stack-navigator.md): Navigates supplied depth, time, channel and stage-position axes while preserving exact physical readings and indexed positions.
- [Acquisition sequencer](acquisition-sequencer.md): Edits supplied capture steps, exact exposure, time, depth and channel values, and distinguishes requested actions from recorded run state.
- [Sequence alignment](sequence-alignment.md): Displays a bounded window of already aligned reference and read strings, with supplied genomic positions, gaps and keyboard region selection.
- [Coverage inspector](coverage-inspector.md): Shows supplied per-locus depth, base and strand counts with an exact position selector, bounded plot and complete depth table.
- [Genomic region field](genomic-region-field.md): Collects a reference, contig and validated integer interval with an explicit one-based inclusive coordinate convention and native form submission.

## Creative tools

- [Audio meter](audio-meter.md): Shows supplied channel levels and peaks in decibels, with bounded native meters and explicit missing readings.
- [Channel strip](channel-strip.md): Edits channel gain, pan, mute, and solo with native sliders and 44px toggle actions wired to caller-owned state.
- [Parameter knob](parameter-knob.md): Displays a rotary parameter over a native horizontal range input, with named values, units, and a 64px control.
- [Timecode field](timecode-field.md): Edits hours, minutes, seconds, and frames with native form validation for a supplied integer non-drop frame rate.
- [Clip timeline](clip-timeline.md): Positions supplied clips within a declared duration, with contained horizontal scrolling, accessible selection, and optional seeking.
- [Render queue](render-queue.md): Displays supplied export jobs, progress, and status with explicit cancel and retry callbacks for a connected renderer.
- [Layer stack](layer-stack.md): Manages supplied layer selection, visibility, locking, and order through named 44px controls and caller-owned changes.
- [Color inspector](color-inspector.md): Edits a six-digit hex color and alpha with a data-driven preview, a transparency ground, and native form validation.
- [Spacing control](spacing-control.md): Edits top, right, bottom, and left spacing with linked or independent native number fields and explicit units.
- [Patchbay](patchbay.md): Connects supplied source and destination ports through a keyboard-navigable matrix, with signal types, channel groups, and blocked-route reasons.
- [Kerning pair editor](kerning-pair-editor.md): Edits supplied glyph-pair offsets in font units, with baseline and edited previews, bounded keyboard nudging, and one-step undo.

## Industrial

- [Alarm panel](alarm-panel.md): Industrial alarm records with independent condition, acknowledgement and shelving states, explicit filters and host-confirmed actions.
- [Work offset panel](work-offset-panel.md): Reported machine and work coordinates alongside editable draft offsets, explicit axis units and a host-owned apply request.

## Geospatial

- [Coordinate reference field](coordinate-reference-field.md): Two or three numeric coordinate axes with supplied units and a reference selector that preserves entered values when assigning a reference.
- [Datum transform picker](datum-transform-picker.md): A Vlak transformation selector with source and destination references, supplied accuracy and area, and visible support-grid availability.
- [Raster band mixer](raster-band-mixer.md): A raster configuration editor with source-band mapping, single or three-channel modes, supplied stretch bounds and explicit missing-data metadata.

## Robotics

- [Joint panel](joint-panel.md): Pairs host-reported joint positions with independent draft targets, supplied units and limits, and an explicit request action.
- [Robot pose](robot-pose.md): Displays exact Cartesian translation and explicitly named orientation components for a selected supplied pose, with frame, time, and recorded status.
- [Robot mission queue](robot-mission-queue.md): Shows supplied mission order and recorded step states, with keyboard reorder requests and explicit host actions separate from pending and confirmed records.

## Circuitry

- [Assembly variant matrix](assembly-variant-matrix.md): Edits independent population, bill-of-materials, and placement flags per reference and assembly variant, preserving unspecified choices.
- [Pad inspector](pad-inspector.md): Circuit-board pad selection with supplied footprint references, net and layer records, pad types and a dimension table with explicit units.
- [Design rule results](design-rule-results.md): Supplied board-check violations with severity and status filters, object and location details, and host-confirmed selection and resolution actions.

## Microbiology

- [Well plate](well-plate.md): A labelled laboratory plate with supplied well states, 44px selection controls and keyboard navigation across up to 1536 wells.
- [Colony plate](colony-plate.md): A bounded plate diagram and keyboard-selectable list of supplied colony markers, with the source count kept separate from annotation totals.
- [Culture log](culture-log.md): A culture and sample record with supplied medium, conditions, chronological observations and host-owned recording actions.

## Also

- [Guide](guide.md): install, theming, layers, StyleX, CSS, CLI, registry, conventions
- [AI component index](ai-index.md): AI surfaces, companion primitives, and optional renderer imports
- [AI integration](ai.md): application contracts and the runnable assistant
- [AI Elements coverage](ai-parity.md): functional mappings and deliberate differences
- [Tokens](tokens.md): every custom property, light and dark
- [Registry index](https://vlak.dev/r/index.json): the shadcn-compatible registry
- [Props JSON](https://vlak.dev/docs/props.json): every export and its props as data
