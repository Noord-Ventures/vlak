# Vlak components

114 components in 9 categories. Each page lists install paths, a React example, props, keyboard, and accessibility notes. Version 0.4.0.

## Actions

- [Toolbar](toolbar.md): Groups actions behind one Tab stop with arrow-key navigation.
- [Overflow list](overflow-list.md): Keeps priority actions visible and moves excess actions into a menu.
- [Playback controls](playback-controls.md): Groups named play, pause, previous, next, and stop controls with 44px targets.
- [Canvas controls](canvas-controls.md): Adjusts bounded zoom and exposes fit and reset actions for a canvas.
- [Button](button.md): Triggers an action. Solid primary or 1px ghost, with a minimum 44px target at every size.
- [Button group](button-group.md): Keeps related actions together as joined ghost buttons with 1px dividers.
- [Text link](link.md): Navigates to a page or resource. Hairline underline; in-copy variant is inset 1px.
- [Dropdown menu](dropdown-menu.md): Presents a compact list of actions. Menu roles and arrow-key navigation are built in.
- [Toggle](toggle.md): Turns one persistent option on or off. Pressed fills with ink and exposes aria-pressed.
- [Toggle group](toggle-group.md): Selects one option from joined toggles. The active option fills with ink.
- [Context menu](context-menu.md): Opens actions at the pointer or with Shift+F10. Escape and outside click close the menu.
- [Menubar](menubar.md): Groups application menus in one row of dropdowns with a 1px frame.
- [Command](command.md): Finds and runs commands in a native dialog. Filter by typing; navigate with arrows and Enter.
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
- [Switch](switch.md): Turns one setting on or off. A 64×44px target contains the moving thumb and ink-filled track.
- [Slider](slider.md): Selects one value from a range. A fine track sits inside a 44px hit area.
- [Select](select.md): Selects one option from an overlay. The closed trigger carries a chevron.
- [Textarea](textarea.md): Collects multiple lines of text. Resizes vertically only.
- [One-time code](input-otp.md): Collects a one-time code in one cell per character. Supports auto-advance, backspace, and paste.
- [Combobox](combobox.md): Filters and selects an option from a listbox through one text field.
- [Calendar](calendar.md): Selects a date from a month grid. Selected day fills with ink; today has a 1px outline.
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

- [Icons](icons.md): Provides interface marks on a 16px viewBox. 1px currentColor strokes with butt caps and miter joins.

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
- [Message composer](message-composer.md): Composes text and optional attachments with submission shortcuts and retained drafts on failure.
- [File browser](file-browser.md): Explores a supplied file hierarchy through folders, breadcrumbs, search, and list or grid views.
- [Kanban board](kanban-board.md): Moves and reorders cards across named columns with drag and keyboard alternatives.
- [Scheduler](scheduler.md): Plans events in agenda, week, or month views with date navigation and accessible rescheduling.
- [Inline form](inline-form.md): Pairs one field with an embedded submit action. The button appears after validation.
- [Workflow card](workflow.md): Frames an ordered pipeline. 1px dashed frame, chips, and a ghost add action. Reordering is supplied by SortableList.
- [Assistant panel](assistant.md): Frames an assistant exchange with a user message, reply, suggestion, and input row.

## Also

- [Guide](guide.md): install, theming, layers, StyleX, CSS, CLI, registry, conventions
- [Tokens](tokens.md): every custom property, light and dark
- [Registry index](https://vlak.dev/r/index.json): the shadcn-compatible registry
- [Props JSON](https://vlak.dev/docs/props.json): every export and its props as data
