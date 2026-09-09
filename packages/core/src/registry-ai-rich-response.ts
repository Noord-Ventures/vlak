import type { VlakComponent } from "./schema";

export const aiRichResponse: VlakComponent[] = [
  {
    "name": "response-markdown",
    "title": "Response markdown",
    "description": "Renders streaming markdown, tables, code, math, and diagrams with Vlak typography and safe default links.",
    "category": "ai",
    "classes": [
      "rs-response-markdown-paragraph",
      "rs-response-markdown-strong",
      "rs-response-markdown-list",
      "rs-response-markdown-item",
      "rs-response-markdown-quote",
      "rs-response-markdown-inline",
      "rs-response-markdown-link",
      "rs-response-markdown-image",
      "rs-response-markdown-image-description",
      "rs-response-markdown-table-region",
      "rs-response-markdown-table",
      "rs-response-markdown-th",
      "rs-response-markdown-td",
      "rs-response-markdown-rule",
      "rs-response-markdown-diagram",
      "rs-response-markdown-diagram-viewport",
      "rs-response-markdown-diagram-art",
      "rs-response-markdown-diagram-header",
      "rs-response-markdown-diagram-title",
      "rs-response-markdown-diagram-action",
      "rs-response-markdown-diagram-icon",
      "rs-response-markdown-summary",
      "rs-response-markdown-feedback",
      "rs-response-markdown",
      "rs-response-markdown-h1",
      "rs-response-markdown-h2",
      "rs-response-markdown-h3",
      "rs-response-markdown-h4",
      "rs-response-markdown-h5",
      "rs-response-markdown-h6"
    ],
    "css": [
      "components/response-markdown.css"
    ],
    "react": "components/response-markdown.tsx",
    "reactImport": "@noorddev/vlak-react/components/response-markdown",
    "dependencies": [
      "streamdown@^2.6.0",
      "shiki@^3.19.0",
      "@streamdown/math@^1.0.2",
      "@streamdown/cjk@^1.0.3",
      "mermaid@^11.12.2",
      "katex@^0.16.27"
    ],
    "styles": [
      "katex/dist/katex.min.css"
    ],
    "registryDependencies": [
      "highlighted-code",
      "button"
    ],
    "snippet": "<div class=\"rs-response-markdown\"><p class=\"rs-response-markdown-paragraph\">Give each decision a <strong class=\"rs-response-markdown-strong\">clear owner</strong> and a next step.</p></div>",
    "example": "import { Response } from \"@noorddev/vlak-react\";\nimport { ResponseMarkdown } from \"@noorddev/vlak-react/components/response-markdown\";\nimport \"katex/dist/katex.min.css\";\n\n<Response status=\"streaming\">\n  <ResponseMarkdown streaming>{\"Give each decision a **clear owner**.\"}</ResponseMarkdown>\n</Response>",
    "usage": {
      "use": [
        "Pass the current response text and streaming=true while receiving it. Completed content uses static parsing.",
        "Use the optional renderer subpath and install its documented dependencies. It needs no model vendor or Tailwind runtime.",
        "Import the documented KaTeX stylesheet to render equations and local math fonts correctly.",
        "Set imageOrigins to exact permitted origins when response images should load. Otherwise image descriptions remain readable.",
        "Use trusted components overrides for application-specific rendering. Native root attributes, styles, and refs are preserved."
      ],
      "avoid": [
        "Passing model-authored markup through a custom component that injects it as trusted content.",
        "Assuming the renderer starts a model request, persists a message, or executes displayed code.",
        "Importing renderer code into the root component package when a lightweight application does not use it."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Reaches links, scrollable tables and code, diagram controls, and the native source disclosure."
      },
      {
        "keys": "Enter, Space",
        "does": "Activates the focused code or diagram button; the native source summary expands or collapses."
      }
    ],
    "a11y": [
      "Changing response text stays outside a live region. Compose with Response for short response status announcements.",
      "Headings, lists, tables, readable code, and math retain semantic markup. Tables and code are keyboard-scrollable.",
      "Raw markup is disabled and sanitized. Links allow web and mail protocols; other protocols and incomplete links remain inert text.",
      "Math uses KaTeX with its default trust restrictions. Diagrams load only after a complete fence and use strict rendering with source fallback.",
      "Diagram zoom controls have descriptive names, 44px targets, and visible focus. Invalid or oversized diagrams preserve their source."
    ],
    "aliases": [
      "AI Elements MessageResponse",
      "Streamdown",
      "Markdown response",
      "Streaming markdown",
      "Math response",
      "Mermaid response"
    ]
  },
  {
    "name": "highlighted-code",
    "title": "Highlighted code",
    "description": "Monochrome syntax highlighting with lazy grammars, exact-source copy and download, and a scrollable code region.",
    "category": "ai",
    "classes": [
      "rs-highlighted-code",
      "rs-highlighted-code-header",
      "rs-highlighted-code-language",
      "rs-highlighted-code-actions",
      "rs-highlighted-code-action",
      "rs-highlighted-code-icon",
      "rs-highlighted-code-pre",
      "rs-highlighted-code-line",
      "rs-highlighted-code-number",
      "rs-highlighted-code-status",
      "rs-highlighted-code-token",
      "rs-highlighted-code-muted",
      "rs-highlighted-code-bold",
      "rs-highlighted-code-italic"
    ],
    "css": [
      "components/highlighted-code.css"
    ],
    "react": "components/highlighted-code.tsx",
    "reactImport": "@noorddev/vlak-react/components/highlighted-code",
    "dependencies": [
      "shiki@^3.19.0"
    ],
    "registryDependencies": [
      "button"
    ],
    "snippet": "<figure class=\"rs-highlighted-code\"><figcaption class=\"rs-highlighted-code-header\"><span class=\"rs-highlighted-code-language\">typescript</span></figcaption><pre class=\"rs-highlighted-code-pre\" tabindex=\"0\" role=\"group\" aria-label=\"typescript source\"><code>const ready = true;</code></pre></figure>",
    "example": "import { HighlightedCode } from \"@noorddev/vlak-react/components/highlighted-code\";\n\n<HighlightedCode code={\"const ready = true;\"} language=\"typescript\" filename=\"review.ts\" lineNumbers />",
    "usage": {
      "use": [
        "Source returned by an assistant or supplied by an application that benefits from syntax structure.",
        "Pass streaming=true for unfinished blocks. Highlighting begins when the block settles.",
        "Set filename for code downloads. Copy and download always use the original supplied code.",
        "Unknown languages, large source, and unavailable grammars remain readable plain text."
      ],
      "avoid": [
        "Expecting this component to execute code or to fetch a source file.",
        "Applying colored syntax themes outside the monochrome design system."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Reaches copy, download, and the scrollable source region."
      },
      {
        "keys": "Enter, Space",
        "does": "Copies or downloads the source through the focused button."
      }
    ],
    "a11y": [
      "Source is rendered as escaped React text, including highlighted tokens. Decorative line numbers do not enter the accessible text.",
      "Copy feedback appears only after the clipboard request resolves. Failure remains visible and can be retried.",
      "A 44px target and visible focus outline support keyboard use. The source region is named and scrollable.",
      "Highlighting is lazy, has bounded full-source caching, and ignores stale results after content changes. Native figure attributes and its ref pass through."
    ],
    "aliases": [
      "AI Elements CodeBlock",
      "Shiki code block",
      "Syntax highlighting"
    ]
  },
  {
    "name": "response-branch",
    "title": "Response branch",
    "description": "Navigates saved response alternatives with stable identity, previous and next controls, and a readable position.",
    "category": "ai",
    "classes": [
      "rs-response-branch",
      "rs-response-branch-content",
      "rs-response-branch-controls",
      "rs-response-branch-action",
      "rs-response-branch-icon",
      "rs-response-branch-position",
      "rs-response-branch-empty"
    ],
    "css": [
      "components/response-branch.css"
    ],
    "react": "components/response-branch.tsx",
    "registryDependencies": [
      "button"
    ],
    "snippet": "<div class=\"rs-response-branch\"><div class=\"rs-response-branch-content\" id=\"branch-content\"><p>Give each decision an owner and a next step.</p></div><div class=\"rs-response-branch-controls\" role=\"group\" aria-label=\"Response alternatives\"><button class=\"rs-btn-subtle rs-response-branch-action\" type=\"button\" disabled aria-label=\"Previous response\" aria-controls=\"branch-content\">‹</button><span class=\"rs-response-branch-position\" role=\"status\" aria-live=\"polite\">1 / 2</span><button class=\"rs-btn-subtle rs-response-branch-action\" type=\"button\" aria-label=\"Next response\" aria-controls=\"branch-content\">›</button></div></div>",
    "example": "import { Response, ResponseBranch } from \"@noorddev/vlak-react\";\n\n<ResponseBranch branches={[\n  { id: \"first\", content: <Response>Give each decision an owner.</Response> },\n  { id: \"second\", content: <Response>Start with a clear review flow.</Response> },\n]} />",
    "usage": {
      "use": [
        "Compare existing assistant responses or application-supplied alternatives without losing their identity.",
        "Use value and onValueChange for application-owned selection, or defaultValue for an initial preference.",
        "Keep branch IDs stable when responses are reordered or new alternatives arrive.",
        "Compose retry and editing actions in branch content. The application owns generation, persistence, and conversation history."
      ],
      "avoid": [
        "Assuming changing a branch calls a model, deletes a response, or rewrites subsequent messages.",
        "Using array position as a persistent branch identity."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Reaches available previous and next buttons and interactive content in the selected response."
      },
      {
        "keys": "Enter, Space",
        "does": "Requests the adjacent response through the focused native button."
      }
    ],
    "a11y": [
      "The named control group exposes descriptive 44px buttons. Boundary controls are disabled.",
      "A short polite status announces the selected position, while message content stays outside the live region.",
      "Only the selected response is rendered. Controlled values stay authoritative until the application accepts a request.",
      "Empty and single-branch states omit navigation. Native root attributes, className, style, and the div ref pass through."
    ],
    "aliases": [
      "AI Elements MessageBranch",
      "Response alternatives",
      "Message versions",
      "Response pagination"
    ]
  }
];
