export const engineeringStudies = [
  {
    slug: "robotics", title: "Robotics workspace", voice: "See what the robot reports before changing what it should do.",
    law: "A robot debugging workspace with deterministic telemetry, joint drafts, mission records and an event log.",
    story: "A commissioning desk for an illustrative inspection arm. The live viewport and joint readings share a deterministic local clock. Selecting a joint opens its draft target; a separate confirmation applies that target to the simulation. Mission review and diagnostic events remain close to the machine view.",
    what: "Robotics workspace", type: "Telemetry viewport, joint inspector, mission review", module: "Grid system",
    ink: "A monochrome machine drawing, instrument grid and full-surface joint selection.",
    use: "Pause telemetry → select a joint → edit and confirm a simulated target → inspect the event",
    field: "An instrument viewport beside a focused inspector and a persistent simulation transport.",
    note: "Telemetry and motion are deterministic local examples. No robot, controller or remote service is connected. Targets change the illustration only after explicit simulation confirmation; mission review does not execute a mission. Changes reset on reload.",
    components: ["Button", "Card", "Icon", "Toggle group", "Joint panel", "Robot pose", "Robot mission queue", "Alarm panel"],
    modifications: [
      "Joint panel edits one selected joint while the separate viewport keeps reported readings visible. A second Vlak Button confirms the request in the local simulator.",
      "Robot pose, Robot mission queue and Alarm panel occupy focused inspector views. Mission review and alarm acknowledgement update local records and append diagnostic events.",
      "A custom vector arm and timeline visualize the sample clock. The drawing is illustrative, not a kinematic solver. Reduced motion pauses the automatic sample stream; manual stepping remains available.",
    ],
  },
  {
    slug: "circuitry", title: "Circuit board workspace", voice: "Keep proposed changes beside the board they affect.",
    law: "A prompt-aided circuit-board study with pad inspection, editable proposals, assembly variants and imported check records.",
    story: "A board editor with an assistant-shaped review workflow. Select a pad to follow its supplied net, then use a local prompt template to propose a net rename or assembly population change. Every proposal exposes the before and after values, an editable result and a note before it changes the local board record.",
    what: "Circuit board workspace", type: "Board viewport, prompt composer, proposal review", module: "Grid system",
    ink: "Quiet green copper artwork surrounded by monochrome controls and flush working panels.",
    use: "Select a pad → write a supported prompt → edit the proposal → apply and inspect its history",
    field: "A circuit-board canvas beside pad, assistant, assembly and check inspectors.",
    note: "Prompts use two local rule-based templates, not a remote model. The board illustration and check records are synthetic. Edits update labels and assembly records; they do not route traces, calculate electrical behavior or rerun design rules. Changes reset on reload.",
    components: ["Button", "Card", "Icon", "Input", "Textarea", "Select", "Toggle group", "Pad inspector", "Design rule results", "Assembly variant matrix"],
    modifications: [
      "Pad inspector drives selected pads and highlights their supplied net in a custom vector board. The physical board artwork has its own restrained copper color.",
      "Textarea and Button form a local prompt composer. Input and Select edit a structured proposal; applying checks the original value before updating the board and adding a history record.",
      "Assembly variant matrix edits independent population and export flags. Design rule results keeps imported sample findings visible after edits, with an explicit stale-results notice.",
    ],
  },
] as const;

export const engineeringMobilePatterns = {
  robotics: "At specimen widths of 640px and below, Monitor, Joints, Mission and Debug become focused screens with persistent bottom navigation. Joint, pose and event details scroll independently; Back restores focus to the originating joint or event. Telemetry controls remain separate from scrolling content.",
  circuitry: "At specimen widths of 640px and below, Board, Inspect, Assistant and Checks become focused screens. Pad selection opens inspection, assembly uses a separate full-width screen, and proposal review keeps its apply action in view. Back preserves the selected pad and restores focus to the originating control.",
};
