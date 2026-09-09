import type { VlakComponent } from "./schema";

export const aiAttachments: VlakComponent[] = [
  {
    "name": "attachments",
    "title": "Attachments",
    "description": "A responsive file list with image, audio, and video previews, file metadata, removal, and application-owned upload states.",
    "category": "ai",
    "classes": [
      "rs-attachments",
      "rs-attachments-grid",
      "rs-attachments-inline",
      "rs-attachments-list",
      "rs-attachment-inline",
      "rs-attachment-list",
      "rs-attachment-thumbnail-inline",
      "rs-attachment-detail-inline",
      "rs-attachment-media-inline",
      "rs-attachment",
      "rs-attachment-row",
      "rs-attachment-thumbnail",
      "rs-attachment-file-icon",
      "rs-attachment-info",
      "rs-attachment-name",
      "rs-attachment-detail",
      "rs-attachment-action",
      "rs-attachment-media",
      "rs-attachment-link",
      "rs-attachment-status",
      "rs-attachment-progress"
    ],
    "css": [
      "components/attachments.css"
    ],
    "react": "components/attachments.tsx",
    "registryDependencies": [
      "button",
      "icons"
    ],
    "snippet": "<ul class=\"rs-attachments\" aria-label=\"Attachments\"><li class=\"rs-attachment\"><div class=\"rs-attachment-row\"><div class=\"rs-attachment-info\"><p class=\"rs-attachment-name\">Project brief.txt</p><p class=\"rs-attachment-detail\">text/plain · 342 bytes</p></div></div></li></ul>",
    "example": "\"use client\";\nimport { useState } from \"react\";\nimport { Attachment, Attachments, Button } from \"@noorddev/vlak-react\";\n\nexport function DraftFiles() {\n  const [visible, setVisible] = useState(true);\n  return visible ? <Attachments>\n    <Attachment data={{ id: \"brief\", name: \"Project brief.txt\", mediaType: \"text/plain\", size: 342 }} onRemove={() => setVisible(false)} />\n  </Attachments> : <Button variant=\"subtle\" onClick={() => setVisible(true)}>Reset file</Button>;\n}",
    "usage": {
      "use": [
        "Compose Attachment items inside Attachments for files in a message, a draft, or a tool result.",
        "Choose grid, inline, or list layout through variant. Items inherit that layout and can override it individually.",
        "Supply stable data IDs, readable filenames, media types, and optional web or local preview addresses.",
        "Use useFileAttachments with a browser File array to create local previews with automatic cleanup.",
        "Set status, progress, error, and onRetry from an application upload process. Native audio and video controls let the reader start playback.",
        "Use preview for application-specific media content, including captions and transcripts where available."
      ],
      "avoid": [
        "Treating removal or retry controls as an upload service. The application owns those operations.",
        "Passing untrusted script addresses, or revoking preview addresses created by a different owner."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Reaches file links, native media controls, retry, and remove actions."
      },
      {
        "keys": "Enter, Space",
        "does": "Activates the focused file action or native media control."
      }
    ],
    "a11y": [
      "The named list preserves file grouping. Filenames identify file links and action buttons.",
      "Images use decorative thumbnails beside their readable filenames. Audio and video use named native controls without autoplay.",
      "Upload status and errors are announced separately from file content. Determinate progress has a file-specific accessible name.",
      "Removal and retry have 44px targets and visible focus inherited from Button. Native list and item attributes, className, style, and refs pass through.",
      "useFileAttachments preserves file identity and revokes owned preview addresses when files are removed or the owner unmounts."
    ],
    "aliases": [
      "AI Elements Attachments",
      "File attachments",
      "Attachment preview",
      "Message files"
    ]
  }
];
