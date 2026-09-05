import type { VlakComponent } from "./schema";

/** Data inspection and durable feedback patterns. */
export const dataAdditions: VlakComponent[] = [
  {
    "name": "description-list",
    "title": "Description list",
    "description": "Aligns semantic labels and values in a responsive description list.",
    "category": "content",
    "classes": [
      "rs-description-list",
      "rs-description-list-row",
      "rs-description-list-label",
      "rs-description-list-value"
    ],
    "css": [
      "components/description-list.css"
    ],
    "react": "components/description-list.tsx",
    "registryDependencies": [],
    "snippet": "<dl class=\"rs-description-list\"><div class=\"rs-description-list-row\"><dt class=\"rs-description-list-label\">Estimated range</dt><dd class=\"rs-description-list-value\">386 km</dd></div></dl>",
    "example": "import { DescriptionList } from \"@noorddev/vlak-react\";\n\n<DescriptionList items={[{ id: \"range\", label: \"Estimated range\", value: \"386 km\" }, { id: \"battery\", label: \"Battery\", value: \"84%\" }]} />",
    "usage": {
      "use": [
        "Read-only properties, specifications, and account details."
      ],
      "avoid": [
        "Editable properties; use PropertyGrid."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, Enter, Space",
        "does": "Links or controls supplied as values keep their native keyboard behavior."
      }
    ],
    "a11y": [
      "Uses dl, dt, and dd; labels and values remain in reading order on small screens."
    ],
    "aliases": [
      "DescriptionList"
    ]
  },
  {
    "name": "metric",
    "title": "Metric",
    "description": "Displays a numeric reading with tabular figures and aligned units.",
    "category": "content",
    "classes": [
      "rs-metric",
      "rs-metric-label",
      "rs-metric-reading",
      "rs-metric-value",
      "rs-metric-unit",
      "rs-metric-detail"
    ],
    "css": [
      "components/metric.css"
    ],
    "react": "components/metric.tsx",
    "registryDependencies": [],
    "snippet": "<div class=\"rs-metric\"><p class=\"rs-metric-label\">Estimated range</p><div class=\"rs-metric-reading\"><span class=\"rs-metric-value\">386</span><span class=\"rs-metric-unit\">km</span></div></div>",
    "example": "import { Metric } from \"@noorddev/vlak-react\";\n\n<Metric label=\"Estimated range\" value={386} unit=\"km\" description=\"Ready for your next journey\" comparison=\"18 km more than yesterday\" />",
    "usage": {
      "use": [
        "Dashboard readings, vehicle status, and concise numeric comparisons."
      ],
      "avoid": [
        "Full data series; use Charts."
      ]
    },
    "keyboard": [
      {
        "keys": "None",
        "does": "Static reading; no additional keyboard stop."
      }
    ],
    "a11y": [
      "The label, formatted value, and unit are readable text. Provide a text equivalent for an optional trend graphic."
    ],
    "aliases": [
      "Metric"
    ]
  },
  {
    "name": "activity-timeline",
    "title": "Activity timeline",
    "description": "Lists timestamped events with actors and optional expandable details.",
    "category": "content",
    "classes": [
      "rs-activity-timeline",
      "rs-activity-timeline-event",
      "rs-activity-timeline-time",
      "rs-activity-timeline-title",
      "rs-activity-timeline-body",
      "rs-activity-timeline-summary"
    ],
    "css": [
      "components/activity-timeline.css"
    ],
    "react": "components/activity-timeline.tsx",
    "registryDependencies": [],
    "snippet": "<ol class=\"rs-activity-timeline\"><li class=\"rs-activity-timeline-event\"><time class=\"rs-activity-timeline-time\" datetime=\"2026-09-05T10:00:00Z\">5 September, 10:00</time><div><p class=\"rs-activity-timeline-title\">Revision published</p></div></li></ol>",
    "example": "import { ActivityTimeline } from \"@noorddev/vlak-react\";\n\n<ActivityTimeline events={[{ id: \"release\", title: \"Revision published\", dateTime: \"2026-09-05T10:00:00Z\", actor: \"Studio\", description: \"Updated the vehicle controls\", details: \"Numeric baselines and playback spacing are now shared.\" }]} />",
    "usage": {
      "use": [
        "Audit history, project activity, and chronological event records."
      ],
      "avoid": [
        "Steps toward a goal; use Stepper or TaskProgress."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, Enter, Space",
        "does": "Tab reaches each summary; Enter or Space expands the native disclosure."
      }
    ],
    "a11y": [
      "An ordered list with machine-readable time elements. Optional details use native disclosure semantics."
    ],
    "aliases": [
      "ActivityTimeline"
    ]
  },
  {
    "name": "code-block",
    "title": "Code block",
    "description": "Shows source text with optional line numbers, wrapping, and copy feedback.",
    "category": "content",
    "classes": [
      "rs-code-block",
      "rs-code-block-header",
      "rs-code-block-pre",
      "rs-code-block-wrap",
      "rs-code-block-line",
      "rs-code-block-number",
      "rs-code-block-status"
    ],
    "css": [
      "components/code-block.css"
    ],
    "react": "components/code-block.tsx",
    "registryDependencies": [
      "button"
    ],
    "snippet": "<figure class=\"rs-code-block\"><figcaption class=\"rs-code-block-header\">TypeScript</figcaption><pre class=\"rs-code-block-pre\" tabindex=\"0\" aria-label=\"TypeScript source\"><code>const range = 386;</code></pre></figure>",
    "example": "import { CodeBlock } from \"@noorddev/vlak-react\";\n\n<CodeBlock language=\"TypeScript\" code={\"const range = 386;\\nconst unit = \\\"km\\\";\"} lineNumbers />",
    "usage": {
      "use": [
        "Installation commands, code samples, and technical documents."
      ],
      "avoid": [
        "Comparing revisions; use DiffViewer."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, Enter, Space",
        "does": "Tab reaches the copy action and scrollable source; Enter or Space copies."
      }
    ],
    "a11y": [
      "Line numbers are decorative. Copy completion and failure are announced only after the operation resolves."
    ],
    "aliases": [
      "CodeBlock"
    ]
  },
  {
    "name": "json-viewer",
    "title": "Json viewer",
    "description": "Inspects structured data with bounded nested disclosures and path search.",
    "category": "content",
    "classes": [
      "rs-json-viewer",
      "rs-json-viewer-tools",
      "rs-json-viewer-body",
      "rs-json-viewer-summary",
      "rs-json-viewer-children",
      "rs-json-viewer-value",
      "rs-json-viewer-note"
    ],
    "css": [
      "components/json-viewer.css"
    ],
    "react": "components/json-viewer.tsx",
    "registryDependencies": [
      "button",
      "input"
    ],
    "snippet": "<div class=\"rs-json-viewer\" role=\"region\" aria-label=\"Vehicle data\"><div class=\"rs-json-viewer-body\"><details open><summary class=\"rs-json-viewer-summary\">vehicle: Object</summary><div class=\"rs-json-viewer-children\"><p class=\"rs-json-viewer-value\">range: 386</p></div></details></div></div>",
    "example": "import { JSONViewer } from \"@noorddev/vlak-react\";\n\n<JSONViewer label=\"Vehicle data\" data={{ vehicle: { range: 386, battery: 84 }, connected: true }} />",
    "usage": {
      "use": [
        "Inspecting API responses, configuration, and nested records."
      ],
      "avoid": [
        "Editing structured data; use a form or editor."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, Enter, Space",
        "does": "Tab reaches search, expand/collapse controls, and summaries; Enter or Space toggles a disclosure."
      }
    ],
    "a11y": [
      "Uses native details rather than a partial tree role. Depth, entry, total node, and string length limits disclose truncation; circular references are labeled. Inspection does not invoke getters. Search covers the displayed, bounded data."
    ],
    "aliases": [
      "JSONViewer"
    ]
  },
  {
    "name": "diff-viewer",
    "title": "Diff viewer",
    "description": "Compares text revisions in unified or split rows with explicit change labels.",
    "category": "content",
    "classes": [
      "rs-diff-viewer",
      "rs-diff-viewer-header",
      "rs-diff-viewer-tools",
      "rs-diff-viewer-scroll",
      "rs-diff-viewer-table",
      "rs-diff-viewer-cell",
      "rs-diff-viewer-change",
      "rs-diff-viewer-number"
    ],
    "css": [
      "components/diff-viewer.css"
    ],
    "react": "components/diff-viewer.tsx",
    "registryDependencies": [
      "button"
    ],
    "snippet": "<div class=\"rs-diff-viewer\"><div class=\"rs-diff-viewer-scroll\" tabindex=\"0\" role=\"region\" aria-label=\"Changes\"><table class=\"rs-diff-viewer-table\"><caption>Changes</caption><thead><tr><th scope=\"col\">Change</th><th scope=\"col\">Content</th></tr></thead><tbody><tr class=\"rs-diff-viewer-change\"><th scope=\"row\">Added</th><td class=\"rs-diff-viewer-cell\">range: 386</td></tr></tbody></table></div></div>",
    "example": "import { DiffViewer } from \"@noorddev/vlak-react\";\n\n<DiffViewer label=\"Configuration changes\" before={\"range: 368\\nbattery: 84\"} after={\"range: 386\\nbattery: 84\"} />",
    "usage": {
      "use": [
        "Reviewing configuration, document, or code changes."
      ],
      "avoid": [
        "Rich document editing or merging conflicts."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, Enter, Space",
        "does": "Tab reaches layout buttons, the scrollable comparison, and page controls; Enter or Space switches layout or moves between line pages."
      }
    ],
    "a11y": [
      "Table headers and explicit Added/Removed labels communicate changes without color. Large replacements use a bounded coarse diff. At most 200 rows render per page by default; pageSize is capped at 1000, with page ranges announced and all lines reachable through navigation."
    ],
    "aliases": [
      "DiffViewer"
    ]
  },
  {
    "name": "error-summary",
    "title": "Error summary",
    "description": "Summarizes invalid fields and moves focus to their inputs.",
    "category": "feedback",
    "classes": [
      "rs-error-summary",
      "rs-error-summary-title",
      "rs-error-summary-list",
      "rs-error-summary-link"
    ],
    "css": [
      "components/error-summary.css"
    ],
    "react": "components/error-summary.tsx",
    "registryDependencies": [],
    "snippet": "<div class=\"rs-error-summary\" role=\"alert\" aria-labelledby=\"error-title\" tabindex=\"-1\"><h2 id=\"error-title\" class=\"rs-error-summary-title\">Check the following fields</h2><ul class=\"rs-error-summary-list\"><li><a class=\"rs-error-summary-link\" href=\"#email\">Enter an email address</a></li></ul></div>",
    "example": "import { ErrorSummary } from \"@noorddev/vlak-react\";\n\n<ErrorSummary errors={[{ id: \"email\", message: \"Enter an email address\" }]} />",
    "usage": {
      "use": [
        "Failed form submissions with errors across several fields."
      ],
      "avoid": [
        "Validation on every keystroke; keep inline field feedback nearby."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, Enter, Space",
        "does": "Tab reaches each field link; Enter focuses the corresponding input."
      }
    ],
    "a11y": [
      "Uses role alert with a heading. autoFocus is opt-in for failed submission, not continuous validation."
    ],
    "aliases": [
      "ErrorSummary"
    ]
  },
  {
    "name": "notification-center",
    "title": "Notification center",
    "description": "Keeps persistent notifications with read, unread, action, and dismissal state.",
    "category": "feedback",
    "classes": [
      "rs-notification-center",
      "rs-notification-center-header",
      "rs-notification-center-title",
      "rs-notification-center-list",
      "rs-notification-center-item",
      "rs-notification-center-unread",
      "rs-notification-center-detail",
      "rs-notification-center-actions"
    ],
    "css": [
      "components/notification-center.css"
    ],
    "react": "components/notification-center.tsx",
    "registryDependencies": [
      "button"
    ],
    "snippet": "<section class=\"rs-notification-center\" aria-label=\"Notifications\"><ul class=\"rs-notification-center-list\"><li class=\"rs-notification-center-item rs-notification-center-unread\"><h3 class=\"rs-notification-center-title\">Export ready</h3><p class=\"rs-notification-center-detail\">Unread</p></li></ul></section>",
    "example": "import { NotificationCenter } from \"@noorddev/vlak-react\";\n\n<NotificationCenter defaultValue={[{ id: \"export\", title: \"Export ready\", description: \"Your study is ready to download\" }, { id: \"invite\", title: \"Studio invitation\", read: true }]} />",
    "usage": {
      "use": [
        "An inbox of persistent application notifications."
      ],
      "avoid": [
        "Ephemeral confirmation; use Toast."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, Enter, Space",
        "does": "Tab reaches read, action, and dismiss buttons; Enter or Space activates."
      }
    ],
    "a11y": [
      "Unread state is also exposed in text and control names. User changes are announced through a polite status."
    ],
    "aliases": [
      "NotificationCenter"
    ]
  },
  {
    "name": "task-progress",
    "title": "Task progress",
    "description": "Tracks long-running work with phases, honest progress, cancellation, and retry.",
    "category": "feedback",
    "classes": [
      "rs-task-progress",
      "rs-task-progress-title",
      "rs-task-progress-bar",
      "rs-task-progress-detail",
      "rs-task-progress-phases",
      "rs-task-progress-phase",
      "rs-task-progress-actions"
    ],
    "css": [
      "components/task-progress.css"
    ],
    "react": "components/task-progress.tsx",
    "registryDependencies": [
      "button"
    ],
    "snippet": "<section class=\"rs-task-progress\" aria-label=\"Exporting study\"><h2 class=\"rs-task-progress-title\">Exporting study</h2><p role=\"status\">In progress</p><progress class=\"rs-task-progress-bar\" aria-label=\"Export progress\" max=\"100\" value=\"42\"></progress></section>",
    "example": "import { TaskProgress } from \"@noorddev/vlak-react\";\n\n<TaskProgress label=\"Exporting study\" state=\"running\" value={42} elapsedSeconds={12} phases={[{ id: \"prepare\", label: \"Prepare\", state: \"complete\" }, { id: \"render\", label: \"Render\", state: \"active\" }, { id: \"package\", label: \"Package\", state: \"pending\" }]} />",
    "usage": {
      "use": [
        "Exports, uploads, background processing, and recoverable operations."
      ],
      "avoid": [
        "A brief loading indicator; use Spinner."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, Enter, Space",
        "does": "Tab reaches cancel or retry when supplied; Enter or Space invokes the callback."
      }
    ],
    "a11y": [
      "Native progress supports unknown completion when value is omitted. State changes are announced, elapsed seconds are not repeatedly announced."
    ],
    "aliases": [
      "TaskProgress"
    ]
  },
  {
    "name": "connection-status",
    "title": "Connection status",
    "description": "Communicates connecting, connected, offline, and reconnecting states.",
    "category": "feedback",
    "classes": [
      "rs-connection-status",
      "rs-connection-status-label",
      "rs-connection-status-detail"
    ],
    "css": [
      "components/connection-status.css"
    ],
    "react": "components/connection-status.tsx",
    "registryDependencies": [
      "button",
      "icons"
    ],
    "snippet": "<div class=\"rs-connection-status\"><span class=\"rs-connection-status-label\" role=\"status\">Connected</span><span class=\"rs-connection-status-detail\">Changes are synchronized</span></div>",
    "example": "import { ConnectionStatus } from \"@noorddev/vlak-react\";\n\n<ConnectionStatus state=\"connected\" description=\"Changes are synchronized\" />",
    "usage": {
      "use": [
        "Network-dependent controls and synchronization status."
      ],
      "avoid": [
        "Inferring server connectivity from browser online status alone."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, Enter, Space",
        "does": "Tab reaches retry when offline and a callback is supplied; Enter or Space retries."
      }
    ],
    "a11y": [
      "State is visible text announced politely. Retry completion does not assume the connection recovered."
    ],
    "aliases": [
      "ConnectionStatus"
    ]
  }
];
