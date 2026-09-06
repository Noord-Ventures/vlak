import type { VlakComponent } from "./schema";

/** Media and product patterns, composed from the core controls. */
export const mediaAdditions: VlakComponent[] = [
  {
    "name": "playback-controls",
    "title": "Playback controls",
    "description": "Groups named play, pause, previous, next, and stop controls with 44px targets.",
    "category": "actions",
    "registryDependencies": [
      "button",
      "icons"
    ],
    "snippet": "<div class=\"rs-playback-controls\" role=\"group\" aria-label=\"Playback controls\"><button class=\"rs-btn-primary rs-playback-action\" type=\"button\" aria-label=\"Play\">Play</button></div>",
    "example": "import { PlaybackControls } from \"@noorddev/vlak-react\";\n\n<PlaybackControls playing={playing} onPlayingChange={setPlaying} onPrevious={restartTrack} previousLabel=\"Restart track\" onNext={skipAhead} nextLabel=\"Skip ahead\" />",
    "usage": {
      "use": [
        "Transport controls beside media metadata or inside a player.",
        "Custom previous and next labels when actions restart or seek."
      ],
      "avoid": [
        "A media source by itself; use MediaPlayer to bind to audio or video."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, Shift+Tab",
        "does": "Moves between enabled transport buttons."
      },
      {
        "keys": "Enter, Space",
        "does": "Activates the focused transport action."
      }
    ],
    "a11y": [
      "Every icon button has a state-aware accessible name.",
      "Optional previous, next, and stop actions render only when supplied.",
      "The containing group has a customisable label; disabled actions use native disabled buttons."
    ],
    "aliases": [
      "PlaybackControls",
      "Transport controls",
      "Media controls"
    ],
    "classes": [
      "rs-playback-controls",
      "rs-playback-action"
    ],
    "css": [
      "components/playback-controls.css"
    ],
    "react": "components/playback-controls.tsx"
  },
  {
    "name": "media-scrubber",
    "title": "Media scrubber",
    "description": "Seeks through media in seconds with elapsed time, buffering, chapters, and optional previews.",
    "category": "forms",
    "registryDependencies": [
      "slider",
      "native-select"
    ],
    "snippet": "<div class=\"rs-media-scrubber\"><input type=\"range\" min=\"0\" max=\"240\" value=\"42\" aria-label=\"Playback position\" aria-valuetext=\"0:42 of 4:00\" /><div class=\"rs-media-scrubber-times\"><span>0:42</span><span>4:00</span></div></div>",
    "example": "import { MediaScrubber } from \"@noorddev/vlak-react\";\n\n<MediaScrubber value={position} duration={240} buffered={180} onValueChange={setPosition} chapters={[{ time: 0, label: \"Opening\" }, { time: 90, label: \"The detail\" }]} />",
    "usage": {
      "use": [
        "A media timeline where values are seconds.",
        "Chapter navigation or supplied thumbnail previews."
      ],
      "avoid": [
        "An arbitrary numeric setting; use Slider."
      ]
    },
    "keyboard": [
      {
        "keys": "Arrow keys, Home, End",
        "does": "Uses the native range input to seek within the duration."
      },
      {
        "keys": "Tab",
        "does": "Moves to the optional native chapter selector; selecting a chapter seeks to its start."
      }
    ],
    "a11y": [
      "The range announces elapsed and total time with aria-valuetext.",
      "Unknown or invalid duration disables seeking.",
      "Previews are visual supplements; the native range supplies the equivalent position text."
    ],
    "aliases": [
      "MediaScrubber",
      "Seek bar",
      "Media timeline"
    ],
    "classes": [
      "rs-media-scrubber",
      "rs-media-scrubber-times",
      "rs-media-scrubber-track",
      "rs-media-scrubber-rail",
      "rs-media-scrubber-buffered",
      "rs-media-scrubber-slider",
      "rs-media-scrubber-preview",
      "rs-media-scrubber-chapters"
    ],
    "css": [
      "components/media-scrubber.css"
    ],
    "react": "components/media-scrubber.tsx"
  },
  {
    "name": "media-player",
    "title": "Media player",
    "description": "Connects native audio or video to playback, seeking, captions, speed, volume, and full screen.",
    "category": "patterns",
    "registryDependencies": [
      "button",
      "icons",
      "slider",
      "native-select",
      "playback-controls",
      "media-scrubber"
    ],
    "snippet": "<div class=\"rs-media-player\" role=\"region\" aria-label=\"Film\"><h3 class=\"rs-media-player-title\">Film</h3><video class=\"rs-media-player-media\" controls aria-label=\"Film\"><track kind=\"captions\" src=\"captions.vtt\" srclang=\"en\" label=\"English\" /></video></div>",
    "example": "import { MediaPlayer } from \"@noorddev/vlak-react\";\n\n<MediaPlayer src=\"/film.mp4\" title=\"A closer look\" tracks={[{ src: \"/film-en.vtt\", srcLang: \"en\", label: \"English\", default: true }]} transcript={<p>A text transcript of the film.</p>} />",
    "usage": {
      "use": [
        "Playing an actual audio or video source with consistent controls.",
        "Media with captions and a supplied text transcript."
      ],
      "avoid": [
        "DRM, adaptive streaming protocols, or a video editing timeline."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, Shift+Tab",
        "does": "Moves through transport, seeking, volume, speed, captions, and available full-screen actions."
      },
      {
        "keys": "Enter, Space",
        "does": "Activates buttons; range and select controls retain native keyboard behavior."
      },
      {
        "keys": "Escape",
        "does": "Exits browser full screen."
      }
    ],
    "a11y": [
      "Native controls remain available before hydration.",
      "Supply caption tracks for spoken video and a transcript where appropriate.",
      "Load and play failures are announced; retry preserves access to the player.",
      "Full screen is shown only when the browser supplies the API."
    ],
    "aliases": [
      "MediaPlayer",
      "Audio player",
      "Video player"
    ],
    "classes": [
      "rs-media-player",
      "rs-media-player-media",
      "rs-media-player-title",
      "rs-media-player-controls",
      "rs-media-player-action",
      "rs-media-player-volume",
      "rs-media-player-status",
      "rs-media-player-transcript",
      "rs-media-player-summary"
    ],
    "css": [
      "components/media-player.css"
    ],
    "react": "components/media-player.tsx"
  },
  {
    "name": "waveform",
    "title": "Waveform",
    "description": "Displays supplied audio amplitudes with optional seeking and editable selection bounds.",
    "category": "content",
    "registryDependencies": [
      "slider"
    ],
    "snippet": "<div class=\"rs-waveform\"><svg class=\"rs-waveform-plot\" viewBox=\"0 0 80 48\" role=\"img\" aria-label=\"Audio waveform\"><path d=\"M0 24 H10 V10 H12 V38 H14 V24 H30 V4 H32 V44 H34 V24 H80\" fill=\"none\" stroke=\"currentColor\" /></svg></div>",
    "example": "import { Waveform } from \"@noorddev/vlak-react\";\n\n<Waveform samples={[0.2, 0.5, 0.8, 0.3, 0.7, 0.4]} label=\"Interview waveform\" value={position} onValueChange={setPosition} region={region} onRegionChange={setRegion} />",
    "usage": {
      "use": [
        "A supplied waveform for an audio recording.",
        "Seeking or selecting an interval in normalised zero-to-one coordinates."
      ],
      "avoid": [
        "Generating or decoding audio data; provide amplitude samples."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, Arrow keys, Home, End",
        "does": "Operates the native seek range and optional selection start and end ranges."
      }
    ],
    "a11y": [
      "Static waveforms have a labelled image role.",
      "Interactive waveforms announce percentage and selection endpoints.",
      "Long inputs are reduced to no more than 240 peak bars to bound SVG rendering cost."
    ],
    "aliases": [
      "Waveform",
      "Audio waveform",
      "Audio region"
    ],
    "classes": [
      "rs-waveform",
      "rs-waveform-stage",
      "rs-waveform-plot",
      "rs-waveform-input",
      "rs-waveform-region",
      "rs-waveform-region-controls",
      "rs-waveform-label",
      "rs-waveform-bar",
      "rs-waveform-played"
    ],
    "css": [
      "components/waveform.css"
    ],
    "react": "components/waveform.tsx"
  },
  {
    "name": "image-viewer",
    "title": "Image viewer",
    "description": "Inspects an image collection with zoom, navigation, and a native dialog lightbox.",
    "category": "patterns",
    "registryDependencies": [
      "button",
      "icons",
      "canvas-controls",
      "dialog"
    ],
    "snippet": "<div class=\"rs-image-viewer\" role=\"region\" aria-label=\"Image viewer\"><div class=\"rs-image-viewer-canvas\"><img class=\"rs-image-viewer-image\" src=\"image.jpg\" alt=\"Describe the image\" /></div><p class=\"rs-image-viewer-caption\">Image caption</p></div>",
    "example": "import { ImageViewer } from \"@noorddev/vlak-react\";\n\n<ImageViewer images={[{ src: \"/front.jpg\", alt: \"Front cover\", caption: \"Front cover\" }, { src: \"/back.jpg\", alt: \"Back cover\", caption: \"Back cover\" }]} />",
    "usage": {
      "use": [
        "Examining a finite collection of labelled images.",
        "Inline preview with an optional focused lightbox."
      ],
      "avoid": [
        "Editing pixels or drawing annotations; use an image editor."
      ]
    },
    "keyboard": [
      {
        "keys": "Arrow left, Arrow right",
        "does": "Changes images when the image canvas is focused."
      },
      {
        "keys": "Tab, Enter, Space",
        "does": "Operates image navigation and zoom controls."
      },
      {
        "keys": "Escape",
        "does": "Closes the native lightbox and returns focus to its opener."
      }
    ],
    "a11y": [
      "Each image requires alt text.",
      "Native dialog supplies modal focus behavior; visible errors replace broken image output.",
      "Navigation buttons disable at collection boundaries."
    ],
    "aliases": [
      "ImageViewer",
      "Lightbox",
      "Image gallery"
    ],
    "classes": [
      "rs-image-viewer",
      "rs-image-viewer-canvas",
      "rs-image-viewer-plane",
      "rs-image-viewer-image",
      "rs-image-viewer-controls",
      "rs-image-viewer-navigation",
      "rs-image-viewer-action",
      "rs-image-viewer-caption",
      "rs-image-viewer-modal"
    ],
    "css": [
      "components/image-viewer.css"
    ],
    "react": "components/image-viewer.tsx"
  },
  {
    "name": "canvas-controls",
    "title": "Canvas controls",
    "description": "Adjusts bounded zoom and exposes fit and reset actions for a canvas.",
    "category": "actions",
    "registryDependencies": [
      "button",
      "icons"
    ],
    "snippet": "<div class=\"rs-canvas-controls\" role=\"group\" aria-label=\"Canvas controls\"><button class=\"rs-btn-ghost rs-canvas-action\" type=\"button\" aria-label=\"Zoom out\">−</button><output class=\"rs-canvas-zoom\" aria-label=\"Zoom level\">100%</output><button class=\"rs-btn-ghost rs-canvas-action\" type=\"button\" aria-label=\"Zoom in\">+</button></div>",
    "example": "import { CanvasControls } from \"@noorddev/vlak-react\";\n\n<CanvasControls zoom={zoom} onZoomChange={setZoom} minZoom={0.25} maxZoom={4} onFit={fitCanvas} onReset={resetPan} />",
    "usage": {
      "use": [
        "A canvas, diagram, map, or image with application-owned transforms."
      ],
      "avoid": [
        "Rendering or panning the canvas; these controls emit zoom and action callbacks."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, Enter, Space",
        "does": "Operates zoom, optional fit, and reset buttons."
      }
    ],
    "a11y": [
      "Zoom has a visible numeric reading.",
      "Limits disable the corresponding zoom action.",
      "All actions keep at least a 44px target."
    ],
    "aliases": [
      "CanvasControls",
      "Zoom controls",
      "Viewport controls"
    ],
    "classes": [
      "rs-canvas-controls",
      "rs-canvas-action",
      "rs-canvas-zoom"
    ],
    "css": [
      "components/canvas-controls.css"
    ],
    "react": "components/canvas-controls.tsx"
  },
  {
    "name": "message-composer",
    "title": "Message composer",
    "description": "Composes text and optional attachments with submission shortcuts and retained drafts on failure.",
    "category": "patterns",
    "registryDependencies": [
      "textarea",
      "button",
      "icons"
    ],
    "snippet": "<form class=\"rs-message-composer\" aria-label=\"Message\"><label>Message<textarea class=\"rs-textarea\" placeholder=\"Write a message…\"></textarea></label><div class=\"rs-message-composer-actions\"><button class=\"rs-btn-primary\" type=\"submit\">Send</button></div></form>",
    "example": "import { MessageComposer } from \"@noorddev/vlak-react\";\n\n<MessageComposer onSend={async ({ text, files }) => sendMessage(text, files)} generating={generating} onStop={stopResponse} allowAttachments accept=\"image/*,.pdf\" />",
    "usage": {
      "use": [
        "Chat, comments, or a support reply.",
        "Async submission that must preserve a draft when it fails.",
        "Application-owned response generation with a Stop response action."
      ],
      "avoid": [
        "An arbitrary multi-field form or uploading files without a message."
      ]
    },
    "keyboard": [
      {
        "keys": "Cmd+Enter, Ctrl+Enter",
        "does": "Submits the draft when no send or response generation is in progress."
      },
      {
        "keys": "Enter, Shift+Enter",
        "does": "With sendOnEnter enabled, Enter submits and Shift+Enter inserts a line; IME composition never submits."
      },
      {
        "keys": "Tab, Enter, Space",
        "does": "Operates attachment, send, and stop actions."
      }
    ],
    "a11y": [
      "The textarea has a visible label and shortcut description.",
      "Sending prevents duplicate submission; results are announced.",
      "Only a successful send clears the draft and attachments; failures retain both.",
      "generating replaces Send with Stop response but keeps the next draft editable. onStop requests application cancellation; it does not cancel network activity itself."
    ],
    "aliases": [
      "MessageComposer",
      "Chat input",
      "Comment composer"
    ],
    "classes": [
      "rs-message-composer",
      "rs-message-composer-actions",
      "rs-message-composer-action",
      "rs-message-composer-files",
      "rs-message-composer-file",
      "rs-message-composer-hint",
      "rs-message-composer-input"
    ],
    "css": [
      "components/message-composer.css"
    ],
    "react": "components/message-composer.tsx"
  },
  {
    "name": "file-browser",
    "title": "File browser",
    "description": "Explores a supplied file hierarchy through folders, breadcrumbs, search, and list or grid views.",
    "category": "patterns",
    "registryDependencies": [
      "button",
      "icons",
      "input",
      "tree-view"
    ],
    "snippet": "<div class=\"rs-file-browser\" role=\"region\" aria-label=\"Files\"><nav aria-label=\"Folder breadcrumbs\">Files</nav><ul class=\"rs-file-browser-list\"><li><button class=\"rs-file-browser-item\" type=\"button\" aria-pressed=\"false\">Cover.pdf</button></li></ul></div>",
    "example": "import { FileBrowser } from \"@noorddev/vlak-react\";\n\n<FileBrowser entries={[{ id: \"design\", name: \"Design\", kind: \"folder\", children: [{ id: \"cover\", name: \"Cover.pdf\", kind: \"file\", size: \"1.2 MB\" }] }]} onOpen={openFile} />",
    "usage": {
      "use": [
        "Browsing a supplied file tree and choosing a file.",
        "Folder-local search with consistent selection in list and grid views."
      ],
      "avoid": [
        "Direct filesystem access or cloud storage sync; the application supplies data and actions."
      ]
    },
    "keyboard": [
      {
        "keys": "Arrow keys, Home, End, type-ahead",
        "does": "Navigates the folder tree using its roving focus behavior."
      },
      {
        "keys": "Tab, Enter, Space",
        "does": "Uses breadcrumbs, selects files, switches view, and activates Open selected."
      }
    ],
    "a11y": [
      "Folder tree, breadcrumbs, search, and file collection each have names.",
      "label names the region and its landmarks; rootLabel supplies the visible root folder name.",
      "Selected files use aria-pressed and a full surface change.",
      "Files can be opened by an explicit keyboard-operable action as well as double click."
    ],
    "aliases": [
      "FileBrowser",
      "File explorer",
      "Asset browser"
    ],
    "classes": [
      "rs-file-browser",
      "rs-file-browser-toolbar",
      "rs-file-browser-breadcrumbs",
      "rs-file-browser-path",
      "rs-file-browser-crumb-item",
      "rs-file-browser-crumb",
      "rs-file-browser-crumb-current",
      "rs-file-browser-action",
      "rs-file-browser-body",
      "rs-file-browser-tree",
      "rs-file-browser-content",
      "rs-file-browser-list",
      "rs-file-browser-grid",
      "rs-file-browser-name",
      "rs-file-browser-meta",
      "rs-file-browser-empty",
      "rs-file-browser-view-active",
      "rs-file-browser-item",
      "rs-file-browser-tile",
      "rs-file-browser-selected"
    ],
    "css": [
      "components/file-browser.css"
    ],
    "react": "components/file-browser.tsx"
  },
  {
    "name": "kanban-board",
    "title": "Kanban board",
    "description": "Moves and reorders cards across named columns with drag and keyboard alternatives.",
    "category": "patterns",
    "registryDependencies": [
      "native-select",
      "button",
      "icons"
    ],
    "snippet": "<div class=\"rs-kanban-board\" role=\"region\" aria-label=\"Board\"><div class=\"rs-kanban-columns\"><section class=\"rs-kanban-column\"><h3 class=\"rs-kanban-heading\">In progress</h3><p class=\"rs-kanban-card\">Review the proof</p></section></div></div>",
    "example": "import { KanbanBoard } from \"@noorddev/vlak-react\";\n\n<KanbanBoard columns={[{ id: \"todo\", label: \"To do\" }, { id: \"doing\", label: \"In progress\" }, { id: \"done\", label: \"Done\" }]} value={cards} onValueChange={setCards} />",
    "usage": {
      "use": [
        "Finite work items moving through named states.",
        "Column changes and ordering that should remain keyboard accessible."
      ],
      "avoid": [
        "A large virtualised issue tracker or automatic workflow rules."
      ]
    },
    "keyboard": [
      {
        "keys": "Alt+Arrow up, Alt+Arrow down",
        "does": "Reorders the focused card handle within its column."
      },
      {
        "keys": "Tab, Enter, Space",
        "does": "Operates move up and down buttons and each card's native destination selector."
      }
    ],
    "a11y": [
      "Every column is a named section; card counts are visible.",
      "A native destination selector is the keyboard alternative to dragging across columns.",
      "Moves are announced and disabled cards remain immovable."
    ],
    "aliases": [
      "KanbanBoard",
      "Task board",
      "Workflow board"
    ],
    "classes": [
      "rs-kanban-board",
      "rs-kanban-columns",
      "rs-kanban-column",
      "rs-kanban-heading",
      "rs-kanban-list",
      "rs-kanban-card",
      "rs-kanban-card-header",
      "rs-kanban-title",
      "rs-kanban-detail",
      "rs-kanban-controls",
      "rs-kanban-destination",
      "rs-kanban-reorder",
      "rs-kanban-action",
      "rs-kanban-status",
      "rs-kanban-help"
    ],
    "css": [
      "components/kanban-board.css"
    ],
    "react": "components/kanban-board.tsx"
  },
  {
    "name": "scheduler",
    "title": "Scheduler",
    "description": "Plans events in agenda, week, or month views with date navigation and accessible rescheduling.",
    "category": "patterns",
    "registryDependencies": [
      "button",
      "icons",
      "input",
      "native-select",
      "dialog"
    ],
    "snippet": "<div class=\"rs-scheduler\" role=\"region\" aria-label=\"Schedule\"><h3 class=\"rs-scheduler-title\">Monday, 7 September</h3><ol class=\"rs-scheduler-list\"><li class=\"rs-scheduler-event\"><span>Review</span><span class=\"rs-scheduler-time\">09:00–09:30</span></li></ol></div>",
    "example": "import { Scheduler } from \"@noorddev/vlak-react\";\n\n<Scheduler events={events} defaultValue={new Date(\"2026-09-07T12:00:00Z\")} timeZone=\"Europe/Amsterdam\" defaultView=\"week\" onSlotSelect={createEvent} onEventSelect={openEvent} onEventMove={rescheduleEvent} />",
    "usage": {
      "use": [
        "An event collection in agenda, week, or month views, using a named timeZone or the browser zone.",
        "Selecting a new event time or rescheduling while preserving duration."
      ],
      "avoid": [
        "Recurrence expansion or conflict enforcement; prepare those in the application."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, Enter, Space",
        "does": "Operates date navigation, event buttons, scheduling actions, and view selection."
      },
      {
        "keys": "Escape",
        "does": "Closes the rescheduling dialog and returns focus to the triggering action."
      }
    ],
    "a11y": [
      "Month view is a native table with weekday headers.",
      "Week columns and navigation are named; native date and time inputs retain platform behavior.",
      "Rescheduling uses a named native dialog and announces the new time.",
      "Event Date values and callbacks are instants; date and time inputs use the displayed zone. Invalid intervals and nonexistent daylight-saving times are rejected. Repeated times choose the earlier occurrence.",
      "Server rendering uses a stable loading shell until hydration so browser time zones and the current date cannot cause a hydration mismatch."
    ],
    "aliases": [
      "Scheduler",
      "Event calendar",
      "Agenda"
    ],
    "classes": [
      "rs-scheduler",
      "rs-scheduler-toolbar",
      "rs-scheduler-action",
      "rs-scheduler-title",
      "rs-scheduler-scroll",
      "rs-scheduler-week",
      "rs-scheduler-date",
      "rs-scheduler-month",
      "rs-scheduler-weekday",
      "rs-scheduler-list",
      "rs-scheduler-event",
      "rs-scheduler-event-button",
      "rs-scheduler-time",
      "rs-scheduler-empty",
      "rs-scheduler-form",
      "rs-scheduler-day",
      "rs-scheduler-selected",
      "rs-scheduler-cell",
      "rs-scheduler-outside"
    ],
    "css": [
      "components/scheduler.css"
    ],
    "react": "components/scheduler.tsx"
  }
];
