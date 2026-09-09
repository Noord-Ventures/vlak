import type { VlakComponent } from "./schema";

export const aiCodeTools: VlakComponent[] = [
  {
    "name": "terminal",
    "title": "Terminal",
    "description": "Renders streamed console output with incremental ANSI attributes and optional original colors.",
    "category": "ai",
    "classes": [
      "rs-terminal",
      "rs-terminal-header",
      "rs-terminal-title",
      "rs-terminal-status",
      "rs-terminal-content",
      "rs-terminal-pre",
      "rs-terminal-cursor",
      "rs-terminal-footer",
      "rs-terminal-run",
      "rs-terminal-bold",
      "rs-terminal-dim",
      "rs-terminal-italic",
      "rs-terminal-underline",
      "rs-terminal-strike",
      "rs-terminal-underline-strike",
      "rs-terminal-inverse",
      "rs-terminal-colors"
    ],
    "css": [
      "components/terminal.css"
    ],
    "react": "components/terminal.tsx",
    "registryDependencies": [
      "button",
      "snippet"
    ],
    "snippet": "<section class=\"rs-terminal\" aria-label=\"Terminal\"><header class=\"rs-terminal-header\"><span class=\"rs-terminal-title\">Terminal</span><span class=\"rs-terminal-status\" role=\"status\">Output complete</span></header><div class=\"rs-terminal-content\" tabindex=\"0\" role=\"group\" aria-label=\"Terminal output\"><pre class=\"rs-terminal-pre\"><span class=\"rs-terminal-run rs-terminal-bold\">2 tests passed</span></pre></div></section>",
    "example": "import { Terminal } from \"@noorddev/vlak-react\";\n\n<Terminal output={\"\\u001b[1m2 tests passed\\u001b[0m\\n\"} streaming={false} />",
    "usage": {
      "use": [
        "Pass the growing output string to retain partial terminal escape sequences across updates.",
        "The monochrome default preserves bold, italic, underline, strike and inverse states. Set ansiColors to display supplied 16-color, 256-color and truecolor values.",
        "Provide onClear to request clearing application state. Copy preserves the complete original output, including escape sequences.",
        "maxCharacters bounds visible source; maxHeight creates a named keyboard-scrollable region."
      ],
      "avoid": [
        "Treating this output viewer as a shell, process runner or cursor-addressable terminal emulator.",
        "Assuming output text can execute OSC clipboard commands or turn itself into active links. Such sequences are discarded.",
        "Forcing follow-scroll while a reader is inspecting earlier output."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Tab reaches copy, optional clear, jump-to-latest and the output region."
      },
      {
        "keys": "Enter, Space",
        "does": "Enter or Space activates the focused button. Scroll keys move the focused output region."
      }
    ],
    "a11y": [
      "Only the short streaming status is live; token output remains ordinary readable text.",
      "Reader scroll position is preserved until they return to the end or activate Latest output.",
      "The cursor is decorative and stops animating with reduced motion.",
      "Original terminal colors are explicit opt-in and revert to system colors in forced-colors mode. Text remains escaped React content."
    ],
    "aliases": [
      "AI Elements Terminal",
      "ANSI output",
      "Console output"
    ]
  },
  {
    "name": "stack-trace",
    "title": "Stack trace",
    "description": "Parses JavaScript error frames into function names, file locations and internal-frame labels.",
    "category": "ai",
    "classes": [
      "rs-stack-trace",
      "rs-stack-trace-header",
      "rs-stack-trace-heading",
      "rs-stack-trace-title",
      "rs-stack-trace-message",
      "rs-stack-trace-content",
      "rs-stack-trace-list",
      "rs-stack-trace-location",
      "rs-stack-trace-note",
      "rs-stack-trace-frame",
      "rs-stack-trace-internal"
    ],
    "css": [
      "components/stack-trace.css"
    ],
    "react": "components/stack-trace.tsx",
    "registryDependencies": [
      "button",
      "collapsible",
      "snippet"
    ],
    "snippet": "<article class=\"rs-stack-trace\" aria-label=\"TypeError\"><header class=\"rs-stack-trace-header\"><div class=\"rs-stack-trace-heading\"><span class=\"rs-stack-trace-title\">TypeError</span><p class=\"rs-stack-trace-message\">Draft must contain text</p></div></header><div class=\"rs-stack-trace-content\"><details class=\"rs-disclosure\" open><summary class=\"rs-disclosure-summary\">1 stack frame</summary><ol class=\"rs-stack-trace-list\"><li class=\"rs-stack-trace-frame\"><span>sendPrompt</span><span>src/composer.tsx:42:5</span></li></ol></details></div></article>",
    "example": "import { StackTrace } from \"@noorddev/vlak-react\";\n\n<StackTrace trace={\"TypeError: Draft must contain text\\n  at sendPrompt (src/composer.tsx:42:5)\\n  at node:internal/process/task_queues:95:5\"} defaultOpen />",
    "usage": {
      "use": [
        "Inspect supplied V8, Node, Firefox or Safari stack frames, preserving Windows drive names and URL paths.",
        "Use onFilePathClick to navigate to a file, line and column; unknown frame text remains readable.",
        "Use open/onOpenChange for controlled disclosure and maxFrames to bound displayed frames. Copy retains the full raw trace."
      ],
      "avoid": [
        "Executing a file path or inferring its contents from an error frame.",
        "Assuming every runtime stack syntax can be parsed; unsupported frame text is retained."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Tab reaches raw-trace copy, the frame disclosure and optional location buttons."
      },
      {
        "keys": "Enter, Space",
        "does": "Enter or Space activates copy, toggles the frame summary or requests navigation to a location."
      }
    ],
    "a11y": [
      "Error type and message are visible text; internal frames have a readable label rather than opacity alone.",
      "Native disclosure semantics expose expanded state.",
      "All file callbacks are explicit user actions; parsing never opens files."
    ],
    "aliases": [
      "AI Elements Stack Trace",
      "JavaScript error",
      "Error frames"
    ]
  },
  {
    "name": "sandbox",
    "title": "Sandbox",
    "description": "Combines a tool-status disclosure with keyboard-accessible code and output tabs.",
    "category": "ai",
    "classes": [
      "rs-sandbox",
      "rs-sandbox-content",
      "rs-sandbox-output"
    ],
    "css": [
      "components/sandbox.css"
    ],
    "react": "components/sandbox.tsx",
    "registryDependencies": [
      "tool-call",
      "code-block",
      "tabs"
    ],
    "snippet": "<details class=\"rs-tool-call rs-sandbox\" open><summary class=\"rs-tool-call-summary\"><span class=\"rs-tool-call-title\">Check generated module</span><span class=\"rs-tool-call-state\">Complete</span></summary><div class=\"rs-tool-call-body\"><div class=\"rs-sandbox-content\"><pre class=\"rs-sandbox-output\">2 checks passed</pre></div></div></details>",
    "example": "import { Sandbox } from \"@noorddev/vlak-react\";\n\n<Sandbox title=\"Check generated module\" state=\"complete\" code=\"export const ready = true;\" language=\"TypeScript\" output=\"2 checks passed\" />",
    "usage": {
      "use": [
        "Display supplied generated code and the result of an application-owned run.",
        "Use tab/onTabChange or defaultTab to select code or output.",
        "Supply codeContent to compose an optional syntax renderer, and output for text or structured React results."
      ],
      "avoid": [
        "Treating this display surface as a code executor or isolation boundary.",
        "Reporting a successful run before the application supplies that state."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Tab reaches the native disclosure, active tab and controls inside the selected panel."
      },
      {
        "keys": "Arrow keys, Home, End, Enter, Space",
        "does": "Arrow keys, Home and End move between code/output tabs; Enter or Space activates the focused control."
      }
    ],
    "a11y": [
      "ToolCall supplies a named 44px summary, status text and subtle 4px surface.",
      "Tabs provide a named tablist and labelled panels; hidden panels do not stay in the tab order.",
      "Output strings are escaped preformatted text and can be read without repeated live announcements."
    ],
    "aliases": [
      "AI Elements Sandbox",
      "Code execution result",
      "Code and output"
    ]
  },
  {
    "name": "web-preview",
    "title": "Web preview",
    "description": "Provides URL navigation, a sandboxed iframe and a collapsible console of supplied log messages.",
    "category": "ai",
    "classes": [
      "rs-web-preview",
      "rs-web-preview-navigation",
      "rs-web-preview-address",
      "rs-web-preview-body",
      "rs-web-preview-status",
      "rs-web-preview-console",
      "rs-web-preview-logs",
      "rs-web-preview-log",
      "rs-web-preview-level",
      "rs-web-preview-message"
    ],
    "css": [
      "components/web-preview.css"
    ],
    "react": "components/web-preview.tsx",
    "registryDependencies": [
      "button",
      "icons",
      "input",
      "collapsible",
      "widget"
    ],
    "snippet": "<section class=\"rs-web-preview\" aria-label=\"Calendar preview\"><div class=\"rs-web-preview-body\"><iframe class=\"rs-widget-embed\" title=\"Calendar preview\" src=\"about:blank\" sandbox=\"allow-scripts allow-forms\" loading=\"lazy\" referrerpolicy=\"no-referrer\"></iframe></div><p class=\"rs-web-preview-status\" role=\"status\">Preview loaded.</p></section>",
    "example": "import { WebPreview } from \"@noorddev/vlak-react\";\n\n<WebPreview title=\"Generated page\" defaultUrl=\"about:blank\" frameProps={{ height: 320 }} logs={[{ level: \"info\", message: \"Preview ready\" }]} />",
    "usage": {
      "use": [
        "Preview a supplied http/https URL, local path or about:blank.",
        "Use url/onUrlChange for controlled navigation. Optional onBack/onForward callbacks and canGoBack/canGoForward flags let the host own history.",
        "Pass frameProps for explicit iframe permissions and native load/error events; the default does not grant same-origin access.",
        "Supply logs from a trusted application channel. maxLogEntries bounds the visible console tail."
      ],
      "avoid": [
        "Evaluating JavaScript URLs or embedding executable data URLs in the address field.",
        "Claiming automatic console capture from a cross-origin iframe.",
        "Treating iframe load as proof that a provider page accepted framing or successfully ran its application."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Tab reaches enabled navigation controls, the address, iframe and console disclosure."
      },
      {
        "keys": "Enter, Space",
        "does": "Enter in the address field requests navigation; Enter or Space activates the focused button."
      }
    ],
    "a11y": [
      "The iframe, address, navigation form and console list have accessible names.",
      "URL validation is visible and invalid protocols never reach iframe src.",
      "Controlled navigation leaves the previous source in place until the host supplies a new url.",
      "Log levels use text and messages are escaped; history and external application behavior remain host-owned."
    ],
    "aliases": [
      "AI Elements Web Preview",
      "Generated page preview",
      "Iframe console"
    ]
  },
  {
    "name": "jsx-preview",
    "title": "Jsx preview",
    "description": "Renders registered components and plain data expressions from streamed JSX through an optional parser.",
    "category": "ai",
    "classes": [
      "rs-jsx-preview",
      "rs-jsx-preview-content",
      "rs-jsx-preview-status",
      "rs-jsx-preview-error"
    ],
    "css": [
      "components/jsx-preview.css"
    ],
    "react": "components/jsx-preview.tsx",
    "registryDependencies": [],
    "snippet": "<div class=\"rs-jsx-preview\"><div class=\"rs-jsx-preview-content\"><section aria-label=\"Review summary\"><p>3 findings are ready for review.</p></section></div></div>",
    "example": "import { JSXPreview } from \"@noorddev/vlak-react/components/jsx-preview\";\n\n<JSXPreview jsx={'<section aria-label=\"Review summary\"><p>{count} findings are ready.</p></section>'} bindings={{ count: 3 }} />",
    "usage": {
      "use": [
        "Install the optional react-jsx-parser, acorn and acorn-jsx dependencies and import the component subpath.",
        "Register trusted display components and pass plain data bindings. Application components own their internal interactive controls.",
        "Set streaming for simple tag completion and last-valid-content fallback while an expression is incomplete.",
        "Use fallback/onError for invalid completed source or a registered component that throws."
      ],
      "avoid": [
        "Treating this component as an arbitrary JavaScript sandbox or exposing side-effectful components that execute operations during render.",
        "Passing functions, getters, prototype objects or secrets through bindings.",
        "Expecting function calls, arrow functions, spreads, event attributes, active markup or dynamic link targets to be interpreted. Use application components or an isolated external preview for those cases."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Tab follows the normal order of controls and safe links produced by registered components."
      },
      {
        "keys": "Enter, Space",
        "does": "Keyboard behavior inside a registered component belongs to that component."
      }
    ],
    "a11y": [
      "Acorn validates the data-expression subset before react-jsx-parser interprets it; no host eval is used.",
      "Function calls, prototype access, active tags and unsafe attributes are rejected rather than executed.",
      "Bindings have bounded depth and size and are copied without invoking accessors.",
      "Invalid completed previews show an alert; streaming updates retain the last valid preview and use a short status message.",
      "The parser mounts after hydration; styling remains inside a contained 4px surface."
    ],
    "aliases": [
      "AI Elements JSX Preview",
      "Generated React preview",
      "JSX widgets"
    ],
    "reactImport": "@noorddev/vlak-react/components/jsx-preview",
    "dependencies": [
      "react-jsx-parser@^2.4.1",
      "acorn@^8.15.0",
      "acorn-jsx@^5.3.2"
    ]
  }
];
