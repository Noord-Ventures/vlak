import type { VlakComponent } from "./schema";

export const aiWorkPatterns: VlakComponent[] = [
  {
    "name": "shimmer",
    "title": "Shimmer",
    "description": "A monochrome moving highlight over progress text, with reduced-motion and forced-color fallbacks.",
    "category": "ai",
    "classes": [
      "rs-shimmer",
      "rs-shimmer-active"
    ],
    "css": [
      "components/shimmer.css"
    ],
    "react": "components/shimmer.tsx",
    "registryDependencies": [],
    "snippet": "<span class=\"rs-shimmer rs-shimmer-active\">Reading the brief</span>",
    "example": "import { Shimmer } from \"@noorddev/vlak-react\";\n\nexport function ReadingStatus({ streaming }: { streaming: boolean }) {\n  return <Shimmer active={streaming}>Reading the brief</Shimmer>;\n}",
    "usage": {
      "use": [
        "Use short progress text while the application is working. Duration is in seconds; spread is a bounded percentage.",
        "Set active=false to keep the same text without animation."
      ],
      "avoid": [
        "Using animation as the only indication of progress."
      ]
    },
    "keyboard": [],
    "a11y": [
      "Reduced motion and forced colors keep the text static and readable.",
      "Text remains available to assistive technology; use an application status region for meaningful progress changes."
    ],
    "aliases": [
      "Shimmer"
    ]
  },
  {
    "name": "plan",
    "title": "Plan",
    "description": "A collapsible proposed plan with streaming title treatment, actions, and supporting context.",
    "category": "ai",
    "classes": [
      "rs-plan",
      "rs-plan-description",
      "rs-plan-actions",
      "rs-plan-footer"
    ],
    "css": [
      "components/plan.css"
    ],
    "react": "components/plan.tsx",
    "registryDependencies": [
      "reasoning",
      "shimmer"
    ],
    "snippet": "<details class=\"rs-plan\" open><summary>Review plan</summary><ol><li>Read the brief</li><li>Check owners</li></ol></details>",
    "example": "import { Plan, Button } from \"@noorddev/vlak-react\";\n\nexport function ReviewPlan({ streaming, onApprove }: { streaming: boolean; onApprove: () => void }) {\n  return <Plan title=\"Review plan\" description=\"Two steps\" streaming={streaming} actions={<Button variant=\"subtle\" disabled={streaming} onClick={onApprove}>Approve plan</Button>}>\n    <ol><li>Read the brief</li><li>Check owners</li></ol>\n  </Plan>;\n}",
    "usage": {
      "use": [
        "Supply plan content and application-owned actions. The title and description shimmer only while streaming.",
        "The native disclosure starts open; open/defaultOpen/onOpenChange preserve controlled and uncontrolled usage."
      ],
      "avoid": [
        "Treating a displayed plan as executed work."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Moves through the supplied native controls in reading order"
      },
      {
        "keys": "Enter, Space",
        "does": "Activates focused buttons and disclosure summaries"
      }
    ],
    "a11y": [
      "Native attributes, className, style, and the forwarded ref reach the outer element.",
      "Interactive content requires accessible names; progress text is not announced for every streamed token."
    ],
    "aliases": [
      "Plan"
    ]
  },
  {
    "name": "task",
    "title": "Task",
    "description": "A default-open task disclosure with supplied item states and file references.",
    "category": "ai",
    "classes": [
      "rs-task",
      "rs-task-list",
      "rs-task-item",
      "rs-task-active",
      "rs-task-file"
    ],
    "css": [
      "components/task.css"
    ],
    "react": "components/task.tsx",
    "registryDependencies": [
      "reasoning"
    ],
    "snippet": "<details class=\"rs-task\" open><summary>Read sources</summary><ul class=\"rs-task-list\"><li class=\"rs-task-item\">Read launch-brief.md</li></ul></details>",
    "example": "import { Task } from \"@noorddev/vlak-react\";\n\n<Task title=\"Read sources\" items={[{ id: \"brief\", content: \"Read the launch brief\", state: \"complete\", file: \"launch-brief.md\" }]} />",
    "usage": {
      "use": [
        "Supply pending, active, and complete items with optional file badges.",
        "Use children for additional supplied task content."
      ],
      "avoid": [
        "Expecting this display to run tasks or infer their completion."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Moves through the supplied native controls in reading order"
      },
      {
        "keys": "Enter, Space",
        "does": "Activates focused buttons and disclosure summaries"
      }
    ],
    "a11y": [
      "Native attributes, className, style, and the forwarded ref reach the outer element.",
      "Interactive content requires accessible names; progress text is not announced for every streamed token."
    ],
    "aliases": [
      "Task"
    ]
  },
  {
    "name": "thought-steps",
    "title": "Thought steps",
    "description": "A collapsible sequence of work summaries, with step states, source badges, images, and captions.",
    "category": "ai",
    "classes": [
      "rs-thought-steps",
      "rs-thought-steps-list",
      "rs-thought-steps-step",
      "rs-thought-steps-detail",
      "rs-thought-steps-title",
      "rs-thought-steps-active",
      "rs-thought-steps-sources",
      "rs-thought-steps-figure",
      "rs-thought-steps-caption"
    ],
    "css": [
      "components/thought-steps.css"
    ],
    "react": "components/thought-steps.tsx",
    "registryDependencies": [
      "reasoning"
    ],
    "snippet": "<details class=\"rs-thought-steps\"><summary>Review summary</summary><ol class=\"rs-thought-steps-list\"><li class=\"rs-thought-steps-step\">Checked the supplied source</li></ol></details>",
    "example": "import { ThoughtSteps } from \"@noorddev/vlak-react\";\n\n<ThoughtSteps title=\"Review summary\" defaultOpen steps={[{ id: \"source\", title: \"Read the brief\", state: \"complete\", description: \"Checked the supplied scope and owners.\" }, { id: \"review\", title: \"Compare responsibilities\", state: \"active\" }]} />",
    "usage": {
      "use": [
        "Present application-supplied work summaries and the evidence supporting each step.",
        "Use sources, content, image, caption, and icon slots for richer evidence; images need meaningful alt text."
      ],
      "avoid": [
        "Exposing private model reasoning or inventing an explanation of hidden model internals."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Moves through the supplied native controls in reading order"
      },
      {
        "keys": "Enter, Space",
        "does": "Activates focused buttons and disclosure summaries"
      }
    ],
    "a11y": [
      "Native attributes, className, style, and the forwarded ref reach the outer element.",
      "Interactive content requires accessible names; progress text is not announced for every streamed token."
    ],
    "aliases": [
      "Chain of thought",
      "AI Elements ChainOfThought"
    ]
  },
  {
    "name": "checkpoint",
    "title": "Checkpoint",
    "description": "A conversation marker with an async restore action, retry feedback, and stable cancellation.",
    "category": "ai",
    "classes": [
      "rs-checkpoint",
      "rs-checkpoint-line",
      "rs-checkpoint-error"
    ],
    "css": [
      "components/checkpoint.css"
    ],
    "react": "components/checkpoint.tsx",
    "registryDependencies": [
      "button"
    ],
    "snippet": "<div class=\"rs-checkpoint\"><span class=\"rs-checkpoint-line\"></span><span>Before editing</span><button class=\"rs-btn-subtle\" type=\"button\">Restore checkpoint</button><span class=\"rs-checkpoint-line\"></span></div>",
    "example": "import { Checkpoint } from \"@noorddev/vlak-react\";\n\nexport function SavedCheckpoint({ onRestore }: { onRestore: () => void | Promise<void> }) {\n  return <Checkpoint label=\"Before editing\" onRestore={onRestore} />;\n}",
    "usage": {
      "use": [
        "Mark a saved point in history and supply onRestore to restore it.",
        "A rejected promise keeps the restore action available and explains the failure."
      ],
      "avoid": [
        "Assuming the component saves model or tool state. The application owns persistence and restoration."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Moves through the supplied native controls in reading order"
      },
      {
        "keys": "Enter, Space",
        "does": "Activates focused buttons and disclosure summaries"
      }
    ],
    "a11y": [
      "Native attributes, className, style, and the forwarded ref reach the outer element.",
      "Interactive content requires accessible names; progress text is not announced for every streamed token."
    ],
    "aliases": [
      "Checkpoint"
    ]
  },
  {
    "name": "suggestions",
    "title": "Suggestions",
    "description": "A wrapping or horizontally scrollable collection of prompt buttons with subtle outlines and 4px corners.",
    "category": "ai",
    "classes": [
      "rs-suggestions",
      "rs-suggestions-wrap",
      "rs-suggestions-item"
    ],
    "css": [
      "components/suggestions.css"
    ],
    "react": "components/suggestions.tsx",
    "registryDependencies": [
      "button"
    ],
    "snippet": "<div class=\"rs-suggestions\" role=\"group\" aria-label=\"Suggested prompts\"><button class=\"rs-suggestions-item rs-btn-ghost\" type=\"button\">Review the brief</button></div>",
    "example": "\"use client\";\nimport { useState } from \"react\";\nimport { MessageComposer, Suggestions, Suggestion, type ComposedMessage } from \"@noorddev/vlak-react\";\n\nexport function SuggestedPrompts({ onSend }: { onSend: (message: ComposedMessage) => void | Promise<void> }) {\n  const [draft, setDraft] = useState(\"\");\n  return <>\n    <Suggestions wrap>\n      <Suggestion value=\"Review the launch brief\" onSelect={setDraft}>Review brief</Suggestion>\n      <Suggestion value=\"Find missing owners\" onSelect={setDraft} />\n    </Suggestions>\n    <MessageComposer compact value={draft} onValueChange={setDraft} onSend={onSend} />\n  </>;\n}",
    "usage": {
      "use": [
        "Offer short suggested prompts using value and onSelect. Display text may be shorter than the submitted value.",
        "The collection scrolls horizontally by default; wrap places buttons on multiple lines."
      ],
      "avoid": [
        "Making suggestions look like completed or submitted messages."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Moves through the supplied native controls in reading order"
      },
      {
        "keys": "Enter, Space",
        "does": "Activates focused buttons and disclosure summaries"
      }
    ],
    "a11y": [
      "Native attributes, className, style, and the forwarded ref reach the outer element.",
      "Interactive content requires accessible names; progress text is not announced for every streamed token."
    ],
    "aliases": [
      "AI Elements Suggestion",
      "Suggested prompts"
    ]
  },
  {
    "name": "work-queue",
    "title": "Work queue",
    "description": "Collapsible prompt and todo sections with completion counts, attachments, and item actions.",
    "category": "ai",
    "classes": [
      "rs-work-queue",
      "rs-work-queue-section",
      "rs-work-queue-list",
      "rs-work-queue-item",
      "rs-work-queue-row",
      "rs-work-queue-content",
      "rs-work-queue-complete",
      "rs-work-queue-actions",
      "rs-work-queue-detail"
    ],
    "css": [
      "components/work-queue.css"
    ],
    "react": "components/work-queue.tsx",
    "registryDependencies": [
      "reasoning",
      "checkbox"
    ],
    "snippet": "<section class=\"rs-work-queue\" aria-label=\"Work queue\"><details class=\"rs-work-queue-section\" open><summary>Next steps, 0 of 1 complete</summary><ul class=\"rs-work-queue-list\"><li class=\"rs-work-queue-item\">Review the brief</li></ul></details></section>",
    "example": "\"use client\";\nimport { useState } from \"react\";\nimport { WorkQueue } from \"@noorddev/vlak-react\";\n\nexport function ReviewQueue() {\n  const [completed, setCompleted] = useState(false);\n  return <WorkQueue sections={[{ id: \"todos\", title: \"Next steps\", items: [\n    { id: \"review\", content: \"Review the brief\", completed },\n  ] }]} onItemCheckedChange={(_sectionId, _itemId, checked) => setCompleted(checked)} />;\n}",
    "usage": {
      "use": [
        "Group queued prompts and todo items in sections with stable ids.",
        "Supply onItemCheckedChange to make completion interactive; the supplied items remain authoritative.",
        "Use attachments and actions slots for each item. The component displays counts from supplied completion state."
      ],
      "avoid": [
        "Using a queue display to schedule or execute work."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Moves through the supplied native controls in reading order"
      },
      {
        "keys": "Enter, Space",
        "does": "Activates focused buttons and disclosure summaries"
      }
    ],
    "a11y": [
      "Native attributes, className, style, and the forwarded ref reach the outer element.",
      "Interactive content requires accessible names; progress text is not announced for every streamed token."
    ],
    "aliases": [
      "AI Elements Queue",
      "Prompt queue"
    ]
  },
  {
    "name": "generated-image",
    "title": "Generated image",
    "description": "Displays a supplied generated-image result with alt text and responsive 4px corners.",
    "category": "ai",
    "classes": [
      "rs-generated-image"
    ],
    "css": [
      "components/generated-image.css"
    ],
    "react": "components/generated-image.tsx",
    "registryDependencies": [],
    "snippet": "<img class=\"rs-generated-image\" src=\"/example.png\" alt=\"Generated project diagram\" />",
    "example": "import { GeneratedImage, type GeneratedImageData } from \"@noorddev/vlak-react\";\n\nexport function WorkflowImage({ image }: { image: GeneratedImageData }) {\n  return <GeneratedImage image={image} alt=\"Project workflow diagram\" />;\n}",
    "usage": {
      "use": [
        "Adapt a provider result containing base64 image bytes and a supported image media type.",
        "Use native width and height to reserve space. Image generation and fetching remain application-owned."
      ],
      "avoid": [
        "Omitting meaningful alt text for informative results."
      ]
    },
    "keyboard": [],
    "a11y": [
      "Native attributes, className, style, and the forwarded ref reach the outer element.",
      "Interactive content requires accessible names; progress text is not announced for every streamed token."
    ],
    "aliases": [
      "AI Elements Image",
      "Generated image result"
    ]
  },
  {
    "name": "conversation-export",
    "title": "Conversation export",
    "description": "Downloads a Markdown snapshot from explicit message text, attachments, and structured tool results.",
    "category": "ai",
    "classes": [
      "rs-btn-subtle"
    ],
    "css": ["components/button.css"],
    "react": "components/conversation-export.tsx",
    "registryDependencies": [
      "button"
    ],
    "snippet": "<button class=\"rs-btn-subtle\" type=\"button\">Download conversation</button>",
    "example": "import { ConversationDownload } from \"@noorddev/vlak-react\";\n\n<ConversationDownload title=\"Project review\" messages={[{ role: \"user\", content: \"Review the brief\" }, { role: \"assistant\", parts: [{ type: \"text\", text: \"Two owners are missing.\" }] }]} />",
    "usage": {
      "use": [
        "Pass explicit message data to serializeConversation or ConversationDownload. No rendered DOM is scraped.",
        "Use serializePart for application-specific export formatting. The download owns and releases its object URLs."
      ],
      "avoid": [
        "Coercing arbitrary message objects into strings or claiming persistence from a local download."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Moves through the supplied native controls in reading order"
      },
      {
        "keys": "Enter, Space",
        "does": "Activates focused buttons and disclosure summaries"
      }
    ],
    "a11y": [
      "Native attributes, className, style, and the forwarded ref reach the outer element.",
      "Interactive content requires accessible names; progress text is not announced for every streamed token."
    ],
    "aliases": [
      "Conversation download",
      "Markdown export"
    ]
  },
  {
    "name": "response-editor",
    "title": "Response editor",
    "description": "A multiline message editor that preserves failed drafts and ignores cancelled saves.",
    "category": "ai",
    "classes": [
      "rs-response-editor",
      "rs-response-editor-actions",
      "rs-response-editor-error"
    ],
    "css": [
      "components/response-editor.css"
    ],
    "react": "components/response-editor.tsx",
    "registryDependencies": [
      "button",
      "textarea"
    ],
    "snippet": "<form class=\"rs-response-editor\" aria-label=\"Edit message\"><label>Message<textarea>Review the brief</textarea></label><div class=\"rs-response-editor-actions\"><button class=\"rs-btn-subtle\" type=\"submit\">Save message</button></div></form>",
    "example": "import { ResponseEditor } from \"@noorddev/vlak-react\";\n\nexport function EditMessage({ text, onSave, onCancel }: {\n  text: string;\n  onSave: (text: string) => void | Promise<void>;\n  onCancel: () => void;\n}) {\n  return <ResponseEditor text={text} onSave={onSave} onCancel={onCancel} />;\n}",
    "usage": {
      "use": [
        "Edit a supplied message with an application-owned async save. Failed saves preserve the draft.",
        "Compose this editor with ResponseBranch when editing produces another response version. The application owns regenerate requests and history.",
        "Escape or Cancel invalidates local pending feedback and calls onCancel."
      ],
      "avoid": [
        "Treating local cancellation as cancellation of a backend operation; pass and manage that signal in the application."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Moves through the supplied native controls in reading order"
      },
      {
        "keys": "Enter, Space",
        "does": "Activates focused buttons and disclosure summaries"
      },
      {
        "keys": "Escape",
        "does": "Cancels the editor and invalidates pending feedback"
      }
    ],
    "a11y": [
      "Native attributes, className, style, and the forwarded ref reach the outer element.",
      "Interactive content requires accessible names; progress text is not announced for every streamed token."
    ],
    "aliases": [
      "Response editor"
    ]
  }
];
