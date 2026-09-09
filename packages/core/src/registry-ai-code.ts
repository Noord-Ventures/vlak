import type { VlakComponent } from "./schema";

export const aiCode: VlakComponent[] = [
  {
    "name": "agent",
    "title": "Agent",
    "description": "Inspects an agent’s model, instructions, tool definitions and output schema in a 4px surface.",
    "category": "ai",
    "classes": [
      "rs-agent",
      "rs-agent-header",
      "rs-agent-title",
      "rs-agent-content",
      "rs-agent-section",
      "rs-agent-label",
      "rs-agent-instructions",
      "rs-agent-description"
    ],
    "css": [
      "components/agent.css"
    ],
    "react": "components/agent.tsx",
    "registryDependencies": [
      "badge",
      "collapsible",
      "code-block",
      "json-viewer"
    ],
    "snippet": "<article class=\"rs-agent\" aria-label=\"Agent Code reviewer\"><header class=\"rs-agent-header\"><span class=\"rs-agent-title\">Code reviewer</span></header><div class=\"rs-agent-content\"><div class=\"rs-agent-section\"><span class=\"rs-agent-label\">Instructions</span><div class=\"rs-agent-instructions\">Review the supplied diff and cite relevant files.</div></div></div></article>",
    "example": "import { Agent } from \"@noorddev/vlak-react\";\n\n<Agent name=\"Code reviewer\" model=\"Workspace model\" instructions=\"Review the supplied diff.\" tools={[{ name: \"read_file\", inputSchema: { type: \"object\", properties: { path: { type: \"string\" } } } }]} outputSchema=\"type Review = { summary: string }\" />",
    "usage": {
      "use": [
        "Inspect supplied model configuration, instructions and named tools before starting work.",
        "Use renderSchema to supply a syntax renderer; objects use the bounded JsonViewer by default and strings use CodeBlock."
      ],
      "avoid": [
        "Executing tool definitions or treating displayed instructions as authorization.",
        "Assuming this component calls a model or highlights source without a supplied renderer."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Tab reaches tool disclosures and schema controls."
      },
      {
        "keys": "Enter, Space",
        "does": "Enter or Space on a summary expands or collapses a tool schema."
      }
    ],
    "a11y": [
      "An article has an accessible agent name; model and tool identities are visible text.",
      "Native tool disclosures provide keyboard access. The default object viewer does not invoke getters.",
      "Instructions accept React content; applications configure any Markdown renderer they supply."
    ],
    "aliases": [
      "AI Elements Agent",
      "Agent configuration",
      "Tool definitions"
    ]
  },
  {
    "name": "artifact",
    "title": "Artifact",
    "description": "Frames generated content with header actions, an optional scroll region and a close request.",
    "category": "ai",
    "classes": [
      "rs-artifact",
      "rs-artifact-header",
      "rs-artifact-heading",
      "rs-artifact-title",
      "rs-artifact-description",
      "rs-artifact-actions",
      "rs-artifact-content",
      "rs-artifact-footer"
    ],
    "css": [
      "components/artifact.css"
    ],
    "react": "components/artifact.tsx",
    "registryDependencies": [
      "button",
      "icons"
    ],
    "snippet": "<section class=\"rs-artifact\" aria-labelledby=\"artifact-title\"><header class=\"rs-artifact-header\"><div class=\"rs-artifact-heading\"><span class=\"rs-artifact-title\" id=\"artifact-title\">Review notes</span><div class=\"rs-artifact-description\">Draft 1</div></div></header><div class=\"rs-artifact-content\"><p>Retain the original draft when sending fails.</p></div><footer class=\"rs-artifact-footer\">Local draft</footer></section>",
    "example": "import { Artifact, Button } from \"@noorddev/vlak-react\";\n\nexport function ReviewArtifact({ onRevise }: { onRevise: () => void }) {\n  return <Artifact title=\"Review notes\" description=\"Draft 1\" maxHeight=\"20rem\" actions={<Button variant=\"subtle\" onClick={onRevise}>Revise draft</Button>} footer=\"Local draft\">\n    <p>Retain the original draft when sending fails.</p>\n  </Artifact>;\n}",
    "usage": {
      "use": [
        "Generated documents, code or previews with actions placed in their header.",
        "Pass onClose to request dismissal; the application controls visibility and restores focus to the opener.",
        "Set maxHeight to create a keyboard-reachable scroll region for long content."
      ],
      "avoid": [
        "Treating the container as a renderer or code execution environment.",
        "Removing the view after close without returning focus to a useful control."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Tab reaches supplied actions, the labelled close control and a height-limited content region."
      },
      {
        "keys": "Enter, Space",
        "does": "Enter or Space activates the focused button."
      }
    ],
    "a11y": [
      "A section is named by its visible title, unless a custom accessible name is supplied.",
      "The close control uses an icon, a descriptive accessible label and a 44px target.",
      "Content remains mounted until the application accepts the close request."
    ],
    "aliases": [
      "AI Elements Artifact",
      "Generated document",
      "Artifact panel"
    ]
  },
  {
    "name": "commit",
    "title": "Commit",
    "description": "Shows a commit message, full-hash copy, author and time, with expandable changed files.",
    "category": "ai",
    "classes": [
      "rs-commit",
      "rs-commit-header",
      "rs-commit-heading",
      "rs-commit-message",
      "rs-commit-metadata",
      "rs-commit-content",
      "rs-commit-list",
      "rs-commit-file",
      "rs-commit-path",
      "rs-commit-count"
    ],
    "css": [
      "components/commit.css"
    ],
    "react": "components/commit.tsx",
    "registryDependencies": [
      "badge",
      "button",
      "collapsible",
      "snippet"
    ],
    "snippet": "<article class=\"rs-commit\" aria-label=\"Commit a1b2c3d\"><header class=\"rs-commit-header\"><div class=\"rs-commit-heading\"><span class=\"rs-commit-message\">Retain failed drafts</span><div class=\"rs-commit-metadata\"><code>a1b2c3d</code><span>Mina</span></div></div></header><div class=\"rs-commit-content\"><details class=\"rs-disclosure\"><summary class=\"rs-disclosure-summary\">1 changed file</summary><ul class=\"rs-commit-list\"><li class=\"rs-commit-file\"><code class=\"rs-commit-path\">src/composer.tsx</code><span class=\"rs-commit-count\">18 additions</span></li></ul></details></div></article>",
    "example": "import { Commit } from \"@noorddev/vlak-react\";\n\n<Commit hash=\"a1b2c3d4e5f60718293a4b5c6d7e8f901234abcd\" message=\"Retain failed drafts\" author=\"Mina\" timestamp=\"2026-09-09T10:20:00Z\" defaultOpen files={[{ path: \"src/composer.tsx\", status: \"modified\", additions: 18, deletions: 4 }]} />",
    "usage": {
      "use": [
        "Inspect a supplied commit and its changed files.",
        "Use onFileSelect for navigation or an inline diff; the callback receives the full file record.",
        "Supply timeLabel for application-localized or relative time. The fallback is a stable UTC timestamp."
      ],
      "avoid": [
        "Running git commands or fetching file content from a display component.",
        "Passing a shortened hash when the copy action must return the complete revision."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Tab reaches copy, the file disclosure and optional file buttons."
      },
      {
        "keys": "Enter, Space",
        "does": "Enter or Space activates copy, disclosure or the focused file callback."
      }
    ],
    "a11y": [
      "The article includes the shortened hash in its accessible name while copy uses the complete supplied hash.",
      "Change status and additions/deletions use text, independent of color.",
      "Timestamp uses a machine-readable time element. Invalid dates are omitted."
    ],
    "aliases": [
      "AI Elements Commit",
      "Git commit",
      "Changed files"
    ]
  },
  {
    "name": "environment-variables",
    "title": "Environment variables",
    "description": "Masks environment values by default, with deliberate reveal, value copy and quoted shell exports.",
    "category": "ai",
    "classes": [
      "rs-environment-variables",
      "rs-environment-variables-header",
      "rs-environment-variables-title",
      "rs-environment-variables-list",
      "rs-environment-variables-row",
      "rs-environment-variables-name",
      "rs-environment-variables-value",
      "rs-environment-variables-controls",
      "rs-environment-variables-note",
      "rs-environment-variables-footer"
    ],
    "css": [
      "components/environment-variables.css"
    ],
    "react": "components/environment-variables.tsx",
    "registryDependencies": [
      "button",
      "snippet"
    ],
    "snippet": "<section class=\"rs-environment-variables\" aria-labelledby=\"environment-title\"><header class=\"rs-environment-variables-header\"><span class=\"rs-environment-variables-title\" id=\"environment-title\">Environment variables</span></header><dl class=\"rs-environment-variables-list\"><div class=\"rs-environment-variables-row\"><dt class=\"rs-environment-variables-name\"><code>MODEL_NAME</code></dt><dd class=\"rs-environment-variables-value\"><span role=\"img\" aria-label=\"Value hidden\">••••••••</span></dd></div></dl></section>",
    "example": "import { EnvironmentVariables } from \"@noorddev/vlak-react\";\n\n<EnvironmentVariables variables={[{ name: \"MODEL_NAME\", value: \"workspace-model\", required: true }, { name: \"EXAMPLE_TOKEN\", value: \"example-only\" }]} />",
    "usage": {
      "use": [
        "Review supplied settings with masked initial values and explicit reveal controls.",
        "Use showValues and onShowValuesChange for controlled visibility; per-row reveals reset when the value changes.",
        "Copy a value or all portable shell exports. Export generation rejects invalid assignment names and quotes shell metacharacters."
      ],
      "avoid": [
        "Treating visual masking as secret storage; values still exist in application memory.",
        "Using duplicate variable names or copying secret values without a user action."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Tab reaches show-all, per-row reveal and copy controls."
      },
      {
        "keys": "Enter, Space",
        "does": "Enter or Space activates a focused control; the show-all button exposes its pressed state."
      }
    ],
    "a11y": [
      "The section and every reveal/copy control have descriptive names.",
      "Hidden values are absent from rendered text and labelled as hidden; values are never placed in title or data attributes.",
      "Clipboard success follows the resolved write, failures remain actionable, and pending writes cannot report success for changed data."
    ],
    "aliases": [
      "AI Elements Environment Variables",
      "Environment settings",
      "Secret values"
    ]
  },
  {
    "name": "package-info",
    "title": "Package info",
    "description": "Compares current and proposed package versions with change type and expandable dependencies.",
    "category": "ai",
    "classes": [
      "rs-package-info",
      "rs-package-info-header",
      "rs-package-info-name",
      "rs-package-info-versions",
      "rs-package-info-description",
      "rs-package-info-list",
      "rs-package-info-actions"
    ],
    "css": [
      "components/package-info.css"
    ],
    "react": "components/package-info.tsx",
    "registryDependencies": [
      "badge",
      "collapsible"
    ],
    "snippet": "<article class=\"rs-package-info\" aria-label=\"Package @example/review-ui\"><header class=\"rs-package-info-header\"><code class=\"rs-package-info-name\">@example/review-ui</code></header><div class=\"rs-package-info-versions\"><span>Current 1.2.0</span><strong>Proposed 1.3.0</strong></div><p class=\"rs-package-info-description\">Adds draft recovery.</p></article>",
    "example": "import { PackageInfo } from \"@noorddev/vlak-react\";\n\n<PackageInfo name=\"@example/review-ui\" currentVersion=\"1.2.0\" newVersion=\"1.3.0\" changeType=\"minor\" description=\"Adds draft recovery.\" dependencies={[{ name: \"react\", version: \"^19.0.0\", kind: \"peer\" }]} />",
    "usage": {
      "use": [
        "Review package additions, removals or version changes before an application performs them.",
        "Supply explicit changeType and dependency kinds; the component does not infer semantic version compatibility.",
        "Use actions for application-owned install, compare or inspection controls."
      ],
      "avoid": [
        "Assuming displayed package metadata is fetched, resolved or installed automatically."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Tab reaches dependency disclosure and supplied actions."
      },
      {
        "keys": "Enter, Space",
        "does": "Enter or Space toggles the dependency summary."
      }
    ],
    "a11y": [
      "Current and proposed version labels remain explicit to screen readers.",
      "Change type uses text instead of color alone.",
      "Dependency expansion uses a native details element."
    ],
    "aliases": [
      "AI Elements Package Info",
      "Dependency change",
      "Package version"
    ]
  },
  {
    "name": "schema-display",
    "title": "Schema display",
    "description": "Displays an endpoint’s method, path, parameters and nested request and response schemas.",
    "category": "ai",
    "classes": [
      "rs-schema-display",
      "rs-schema-display-header",
      "rs-schema-display-path",
      "rs-schema-display-content",
      "rs-schema-display-description",
      "rs-schema-display-list",
      "rs-schema-display-property",
      "rs-schema-display-line",
      "rs-schema-display-note"
    ],
    "css": [
      "components/schema-display.css"
    ],
    "react": "components/schema-display.tsx",
    "registryDependencies": [
      "badge",
      "collapsible"
    ],
    "snippet": "<article class=\"rs-schema-display\" aria-label=\"POST /reviews\"><header class=\"rs-schema-display-header\"><span class=\"rs-badge-muted\">POST</span><code class=\"rs-schema-display-path\">/reviews</code></header><div class=\"rs-schema-display-content\"><details class=\"rs-disclosure\" open><summary class=\"rs-disclosure-summary\">Request body</summary><ul class=\"rs-schema-display-list\"><li class=\"rs-schema-display-property\"><div class=\"rs-schema-display-line\"><code>diff</code><span class=\"rs-badge-muted\">string</span><strong class=\"rs-schema-display-note\">Required</strong></div></li></ul></details></div></article>",
    "example": "import { SchemaDisplay } from \"@noorddev/vlak-react\";\n\n<SchemaDisplay method=\"POST\" path=\"/projects/{projectId}/reviews\" parameters={[{ name: \"projectId\", type: \"string\", required: true, location: \"path\" }]} requestBody={[{ name: \"diff\", type: \"string\", required: true }]} responseBody={[{ name: \"id\", type: \"string\", required: true }]} />",
    "usage": {
      "use": [
        "Endpoint documentation with parameter locations, required fields, nested objects and array item schemas.",
        "Use maxDepth and maxNodes to bound rendering of large schemas; defaults are 6 levels and 200 properties.",
        "Adapt an API specification to SchemaProperty records before rendering."
      ],
      "avoid": [
        "Treating this view as an OpenAPI validator or request executor.",
        "Embedding markup in endpoint paths; strings are deliberately rendered as text."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Tab reaches each native schema summary."
      },
      {
        "keys": "Enter, Space",
        "does": "Enter or Space toggles parameters, bodies and nested properties."
      }
    ],
    "a11y": [
      "Endpoint method and path name the article, while types, locations and required flags are readable text.",
      "Recursive references, depth limits and omitted properties have explicit labels.",
      "Paths and descriptions are escaped React text; no markup interpolation is used."
    ],
    "aliases": [
      "AI Elements Schema Display",
      "API endpoint",
      "Request schema"
    ]
  },
  {
    "name": "snippet",
    "title": "Snippet",
    "description": "Presents a compact selectable command with a decorative prefix and exact-value copy action.",
    "category": "ai",
    "classes": [
      "rs-snippet-copy",
      "rs-snippet-status",
      "rs-snippet",
      "rs-snippet-prefix",
      "rs-snippet-code"
    ],
    "css": [
      "components/snippet.css"
    ],
    "react": "components/snippet.tsx",
    "registryDependencies": [
      "button",
      "icons"
    ],
    "snippet": "<figure class=\"rs-snippet\" aria-label=\"Install command\"><span class=\"rs-snippet-prefix\" aria-hidden=\"true\">$</span><code class=\"rs-snippet-code\" tabindex=\"0\">pnpm add @noorddev/vlak-react</code></figure>",
    "example": "import { Snippet } from \"@noorddev/vlak-react\";\n\n<Snippet code=\"pnpm add @noorddev/vlak-react\" prefix=\"$\" label=\"Install command\" />",
    "usage": {
      "use": [
        "A short command or source reference where the copy value should preserve whitespace.",
        "Reuse SnippetCopy for named exact-value actions in developer views.",
        "Supply onCopy for a host clipboard adapter; omit it to use the browser clipboard."
      ],
      "avoid": [
        "Claiming syntax highlighting or command execution from a selectable code line.",
        "Including a shell prompt in code when it should only be a decorative prefix."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Tab reaches the scrollable code and 44px copy button."
      },
      {
        "keys": "Enter, Space",
        "does": "Enter or Space requests clipboard copy from the focused button."
      }
    ],
    "a11y": [
      "The prefix is decorative and is excluded from copied source.",
      "Copy reports success only after completion, errors remain visible, and duplicate pending requests are locked.",
      "Changing the source invalidates stale clipboard feedback. Native attributes, className, style and refs are forwarded."
    ],
    "aliases": [
      "AI Elements Snippet",
      "Command line",
      "Copy command"
    ]
  },
  {
    "name": "test-results",
    "title": "Test results",
    "description": "Displays suites, derived pass/fail/skip totals, elapsed time and failure details with optional retries.",
    "category": "ai",
    "classes": [
      "rs-test-results-test",
      "rs-test-results-line",
      "rs-test-results-name",
      "rs-test-results-note",
      "rs-test-results-error",
      "rs-test-results",
      "rs-test-results-header",
      "rs-test-results-title",
      "rs-test-results-summary",
      "rs-test-results-progress",
      "rs-test-results-content",
      "rs-test-results-list"
    ],
    "css": [
      "components/test-results.css"
    ],
    "react": "components/test-results.tsx",
    "registryDependencies": [
      "badge",
      "button",
      "collapsible",
      "code-block"
    ],
    "snippet": "<section class=\"rs-test-results\" aria-labelledby=\"tests-title\"><header class=\"rs-test-results-header\"><span class=\"rs-test-results-title\" id=\"tests-title\">Test results</span><div class=\"rs-test-results-summary\" role=\"status\"><span class=\"rs-badge-solid\">1 passed</span><span class=\"rs-badge-muted\">1 failed</span><span class=\"rs-test-results-note\">2 of 2 complete</span></div><progress class=\"rs-test-results-progress\" value=\"2\" max=\"2\" aria-label=\"Tests completed\"></progress></header><div class=\"rs-test-results-content\"><p class=\"rs-test-results-note\">Open a suite to inspect its results.</p></div></section>",
    "example": "import { TestResults } from \"@noorddev/vlak-react\";\n\n<TestResults suites={[{ id: \"composer\", name: \"Composer\", tests: [{ id: \"send\", name: \"Sends a prompt\", status: \"passed\", duration: 82 }, { id: \"retry\", name: \"Retains failed drafts\", status: \"failed\", error: \"Expected the original draft.\", stack: \"at retryTest (composer.test.tsx:38:3)\" }] }]} duration={428} />",
    "usage": {
      "use": [
        "Render supplied test suites, durations in milliseconds and per-test failures.",
        "Provide onRetry to request another run; new application data determines the resulting status.",
        "Counts and completion progress derive from the displayed tests, including skipped and running states."
      ],
      "avoid": [
        "Executing tests or marking them passed merely because a retry callback resolves.",
        "Announcing full changing logs through a live region."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Tab reaches suite/failure disclosures, retry actions and stack copy controls."
      },
      {
        "keys": "Enter, Space",
        "does": "Enter or Space toggles disclosures or requests retry for the focused failed test."
      }
    ],
    "a11y": [
      "Text labels distinguish all five states without color dependence.",
      "A concise atomic status announces totals; failure text remains ordinary readable content.",
      "The named native progress element avoids a zero maximum for empty results.",
      "Retries prevent duplicate activation, retain actionable failure feedback and ignore stale completion after data changes."
    ],
    "aliases": [
      "AI Elements Test Results",
      "Test runner output",
      "Suite results"
    ]
  }
];
