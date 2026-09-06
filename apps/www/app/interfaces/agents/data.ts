export type AgentStatus = "running" | "review" | "queued" | "paused" | "complete";

export type AgentTask = {
  id: string;
  title: string;
  agent: string;
  status: AgentStatus;
  progress: number;
  brief: string;
  scope: string;
  activity: { time: string; text: string }[];
  output: { file: string; description: string }[];
};

export const agentStatusLabels: Record<AgentStatus, string> = {
  running: "Working",
  review: "Needs review",
  queued: "Queued",
  paused: "Paused",
  complete: "Complete",
};

export const initialAgentTasks: AgentTask[] = [
  {
    id: "014",
    title: "Refine account settings",
    agent: "Frontend agent",
    status: "running",
    progress: 64,
    brief: "Rebuild the account form with shared components. Keep the current settings intact and make every field usable by keyboard.",
    scope: "Account settings",
    activity: [
      { time: "09:41", text: "Checking the form at mobile and desktop widths." },
      { time: "09:39", text: "Replaced custom fields with shared inputs." },
      { time: "09:37", text: "Read the task brief and existing settings." },
    ],
    output: [
      { file: "account/settings.tsx", description: "Shared form fields, clear labels, and inline validation." },
      { file: "account/settings.test.tsx", description: "Keyboard coverage for save, cancel, and validation." },
    ],
  },
  {
    id: "013",
    title: "Audit keyboard navigation",
    agent: "Accessibility agent",
    status: "review",
    progress: 100,
    brief: "Check the primary navigation, dialogs, and account flow. Propose focused fixes without changing the visual layout.",
    scope: "Navigation and dialogs",
    activity: [
      { time: "09:40", text: "Ready for review. All 18 keyboard checks pass." },
      { time: "09:38", text: "Restored focus to the trigger when a dialog closes." },
      { time: "09:35", text: "Added a visible focus state to navigation links." },
    ],
    output: [
      { file: "navigation/menu.tsx", description: "Focus returns to the menu trigger after closing." },
      { file: "dialog/dialog.test.tsx", description: "18 keyboard checks pass across the revised flows." },
    ],
  },
  {
    id: "012",
    title: "Check mobile layouts",
    agent: "Responsive agent",
    status: "running",
    progress: 38,
    brief: "Check the release pages at narrow widths. Fix overflowing copy and make compact actions comfortable to tap.",
    scope: "Responsive layouts",
    activity: [
      { time: "09:40", text: "Inspecting navigation and forms at 390 pixels." },
      { time: "09:38", text: "Verified that page content fits at 320 pixels." },
      { time: "09:36", text: "Collected the release pages for review." },
    ],
    output: [
      { file: "layout/mobile.css", description: "Bounded fields and consistent 44-pixel touch targets." },
      { file: "checks/responsive.md", description: "Viewport notes for 320, 390, 768, and 1440 pixels." },
    ],
  },
  {
    id: "011",
    title: "Build the onboarding flow",
    agent: "Product agent",
    status: "queued",
    progress: 0,
    brief: "Turn the approved onboarding brief into three short steps. Let people save their progress and return later.",
    scope: "Onboarding",
    activity: [{ time: "09:34", text: "Task queued. The brief is ready for the product agent." }],
    output: [],
  },
  {
    id: "010",
    title: "Document the component API",
    agent: "Documentation agent",
    status: "complete",
    progress: 100,
    brief: "Document the inputs, buttons, and dialogs used in this release. Include one practical example for each component.",
    scope: "Component documentation",
    activity: [
      { time: "09:32", text: "Documentation reviewed and accepted." },
      { time: "09:29", text: "Verified all three examples against the component APIs." },
      { time: "09:25", text: "Added input, button, and dialog examples." },
    ],
    output: [{ file: "docs/components.md", description: "Usage, keyboard behavior, and three working examples." }],
  },
];
