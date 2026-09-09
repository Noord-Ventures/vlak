import type { VlakComponent } from "./schema";

export const aiResponse: VlakComponent[] = [
  {
    name: "response",
    title: "Response",
    description: "Presents user messages in right-aligned soft bubbles and assistant responses on the left, with speaker identity, avatars, status, actions, and a custom layout API.",
    category: "ai",
    classes: ["rs-response", "rs-response-user", "rs-response-header", "rs-response-identity", "rs-response-avatar", "rs-response-author", "rs-response-status", "rs-response-content", "rs-response-error", "rs-response-actions", "rs-response-copy", "rs-response-copy-status"],
    css: ["components/response.css"],
    react: "components/response.tsx",
    registryDependencies: [],
    snippet: '<article class="rs-response" aria-labelledby="response-author"><div class="rs-response-header"><div class="rs-response-identity"><span class="rs-response-avatar" aria-hidden="true"><svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor"><circle cx="10" cy="10" r="7" /></svg></span><span class="rs-response-author" id="response-author">Assistant</span></div><span class="rs-response-status" role="status" aria-live="polite" aria-atomic="true">Complete</span></div><div class="rs-response-content"><p>The lease renews on 1 October.</p></div></article>',
    example: "\"use client\";\nimport { Persona, Response, ResponseActions, useResponse } from \"@noorddev/vlak-react\";\n\nfunction CompletedActions({ text }: { text: string }) {\n  const { status } = useResponse();\n  return status === \"complete\" ? <ResponseActions text={text} /> : null;\n}\n\nexport function LeaseExchange() {\n  return <>\n    <Response from=\"user\">When does the lease renew?</Response>\n    <Response from=\"assistant\" status=\"complete\"\n      avatar={<Persona variant=\"orb\" size={20} />}\n      actions={<CompletedActions text=\"The lease renews on 1 October.\" />}\n      renderLayout={({ avatar, author, status, content, error, actions }) =>\n        <div style={{ display: \"grid\", gridTemplateColumns: \"auto minmax(0, 1fr)\", gap: 12 }}>\n          {avatar}\n          <div style={{ minWidth: 0 }}>\n            <div style={{ display: \"flex\", justifyContent: \"space-between\", gap: 12 }}>{author}{status}</div>\n            {content}{error}{actions}\n          </div>\n        </div>}\n    >\n      <p>The lease renews on <strong>1 October</strong>.</p>\n    </Response>\n  </>;\n}",
    usage: {
      use: [
        "A user or assistant message whose content and response status come from the application.",
        "Pass plain text or rendered React content as children. To render markdown, supply an external markdown renderer in the children slot and configure its content and link safety in your application.",
        "Place ResponseActions in actions for icon controls that copy, narrate, rate, and share the response. Omit copyText when using that action bar.",
        "Use avatar for an application-owned visual and renderLayout to rearrange ResponseParts. Render the complete header or its avatar, author, and status parts once; retain content, errors, and actions.",
        "useResponse reads speaker, author, status, statusLabel, and errorMessage from a descendant. It requires a surrounding Response.",
        "Use actions for other application-owned controls. Provide copyText for a standalone copy button when a full action bar is not needed.",
      ],
      avoid: [
        "Assuming this component calls a model or parses markdown. It does neither.",
        "Putting changing token content in statusLabel. Reserve that label for short phase changes.",
        "Injecting untrusted markup or unsafe links through an external renderer.",
      ],
    },
    keyboard: [
      { keys: "Tab", does: "Reaches the optional copy button, supplied actions, and links in the rendered content." },
      { keys: "Enter, Space on Copy response", does: "Copies the explicit copyText value and reports success only after the clipboard write resolves." },
    ],
    a11y: [
      "A semantic article is named by its visible speaker. from identifies user or assistant without taking over the native role attribute.",
      "Custom layouts retain a fallback article name. Keep the supplied status part so phase changes remain announced, and give a non-text custom author an explicit accessible name when needed.",
      "Status is a separate polite, atomic live region. Changing response tokens are ordinary readable content and do not repeat the whole message through a live region.",
      "The streaming, complete, error, and stopped states are supplied by the application. An errorMessage is visible when status is error; the short response status announces the failure.",
      "Copy is shown only with copyText. Clipboard denial or unavailability reports a readable failure and allows retry. Pending writes prevent duplicate activation, and stale writes cannot announce success for new content.",
      "The 44px copy control has a focus outline and forced-colors styling. Native article attributes, className, style, and the article ref are forwarded.",
    ],
    aliases: ["AI response", "Chat message", "Assistant message", "AI Elements Message", "Streaming response"],
  },
  {
    name: "reasoning",
    title: "Reasoning",
    description: "A native disclosure for supplied work summaries, with a chevron and 44px control. Panels use a subtle 1px outline and 4px corners.",
    category: "ai",
    classes: ["rs-reasoning", "rs-reasoning-inline", "rs-reasoning-summary", "rs-reasoning-summary-inline", "rs-reasoning-indicator", "rs-reasoning-title", "rs-reasoning-title-inline", "rs-reasoning-status", "rs-reasoning-content"],
    css: ["components/reasoning.css"],
    react: "components/reasoning.tsx",
    registryDependencies: [],
    snippet: '<details class="rs-reasoning"><summary class="rs-reasoning-summary"><svg class="rs-reasoning-indicator" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg><span class="rs-reasoning-title">Work summary</span><span class="rs-reasoning-status" role="status" aria-live="polite" aria-atomic="true">Complete</span></summary><div class="rs-reasoning-content"><p>Compared the renewal clause with the notice period.</p></div></details>',
    example: 'import { Reasoning } from "@noorddev/vlak-react";\n\n<Reasoning variant="inline" title="Reviewed the brief" status="complete">\n  <p>Compared the supplied brief with the previous revision.</p>\n</Reasoning>',
    usage: {
      use: [
        "Optional task progress, tool activity summaries, or explanatory text supplied by your application.",
        "Use variant=inline for activity within a message. Its padded summary changes text color on hover; the default panel uses a subtle 1px outline and 4px corners.",
        "Use open and onOpenChange for controlled disclosure, or defaultOpen for an initial preference.",
        "Keep title to non-interactive content so the native summary remains one clear disclosure control.",
      ],
      avoid: [
        "Inventing private model thinking or inferring hidden chain-of-thought from a response. Supply a supported public summary or task progress instead.",
        "Treating status as a timer or automatically closing the disclosure when work completes. The reader owns their open state.",
        "Streaming long text into statusLabel. Put the evolving summary in children.",
      ],
    },
    keyboard: [
      { keys: "Tab", does: "Focuses the native summary, then any interactive content in the expanded details." },
      { keys: "Enter, Space", does: "Toggles the focused summary. In controlled mode, requests the next open value through onOpenChange." },
    ],
    a11y: [
      "Native details and summary expose disclosure state and keyboard behavior without a custom widget.",
      "The decorative chevron points right when closed and down when open; it is hidden from assistive technology.",
      "The summary target is at least 44px with a visible focus outline and system colors in forced-colors mode.",
      "Only the short status phrase is a polite, atomic live region; body updates are available in the normal reading order.",
      "Status changes never close or open the disclosure. Controlled open values remain authoritative even when a change request is not accepted.",
      "Native details attributes, onToggle, className, style, and the details ref are forwarded. The application supplies the summary and status; no model reasoning is generated or inferred.",
    ],
    aliases: ["AI Elements Reasoning", "Work summary", "AI progress disclosure", "Task summary"],
  },
];
