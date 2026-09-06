import type { VlakComponent } from "./schema";

/** Recorded robot state and explicit host requests, without a motion backend. */
export const roboticsComponents: VlakComponent[] = [
  {
    name: "joint-panel", title: "Joint panel", category: "robotics",
    description: "Pairs host-reported joint positions with independent draft targets, supplied units and limits, and an explicit request action.",
    classes: ["rs-joint-panel", "rs-joint-panel-legend", "rs-joint-panel-copy", "rs-joint-panel-list", "rs-joint-panel-joint", "rs-joint-panel-title", "rs-joint-panel-reading", "rs-joint-panel-field", "rs-joint-panel-input", "rs-joint-panel-button"],
    css: ["components/joint-panel.css"], react: "components/joint-panel.tsx", registryDependencies: ["input", "button"],
    snippet: `<fieldset class="rs-joint-panel"><legend class="rs-joint-panel-legend">Arm joints</legend><p class="rs-joint-panel-copy">Reported at: 12:00:00.125</p><ul class="rs-joint-panel-list"><li class="rs-joint-panel-joint"><div><p class="rs-joint-panel-title">Shoulder</p><p class="rs-joint-panel-reading">Reported: 12.5 deg</p><p class="rs-joint-panel-copy">Limits: -90 to 90 deg</p></div><label class="rs-joint-panel-field">Draft target (deg)<input class="rs-input rs-input-full rs-joint-panel-input" type="number" step="any" min="-90" max="90" value="0" aria-label="Shoulder draft target (deg)" /></label></li></ul><button class="rs-btn-primary rs-joint-panel-button" type="button">Request targets</button></fieldset>`,
    example: `import { JointPanel } from "@noorddev/vlak-react";

<JointPanel label="Arm joints" name="targets" timeLabel="12:00:00.125"
  joints={[{ id: "shoulder", label: "Shoulder", unit: "deg", reported: 12.5, minimum: -90, maximum: 90 }, { id: "slide", label: "Slide", unit: "m", reported: 0, minimum: 0, maximum: 0.5 }]}
  defaultValue={{ shoulder: 0, slide: 0 }}
  onRequestTargets={targets => console.log("Requested targets", targets)} />`,
    usage: { use: ["Reported joint positions and a separate draft target map keyed by joint identifier.", "value/defaultValue/onValueChange for controlled editing or an isolated prototype; drafts never inherit missing values from reported positions.", "Finite minimum and maximum values in each joint's supplied unit. A complete valid draft is required before requesting targets.", "onRequestTargets to ask the host to apply a draft; pending and confirmedLabel describe independently supplied request state.", "Missing, non-finite, duplicate, and unlisted records receive explicit feedback. No motion or limit policy is inferred."], avoid: ["Treating a successful click as confirmed robot movement.", "Using the component as a motion planner, interlock, unit converter, or source of joint limits."] },
    keyboard: [{ keys: "Tab", does: "Moves through target inputs and the request button." }, { keys: "Arrow up, Arrow down", does: "Uses native number-input stepping within the supplied limits." }, { keys: "Enter, Space", does: "Activates the focused request button when the complete draft is valid." }],
    a11y: ["The fieldset and legend name the joint group; each target names its joint and unit.", "Vlak Input and Button provide consistent control sizing, focus treatment, and native keyboard behavior.", "Native validity and visible messages identify missing or out-of-bounds targets; reported zero remains distinct from missing data.", "Named inputs submit per-joint drafts. Form reset restores uncontrolled defaults, read-only drafts still submit, and pending controls are disabled.", "The ref, native fieldset attributes, className, and style reach the root fieldset."],
    aliases: ["JointPanel", "Robot joint targets", "Joint monitor", "Joint position editor", "Robot axis targets"],
  },
  {
    name: "robot-pose", title: "Robot pose", category: "robotics",
    description: "Displays exact Cartesian translation and explicitly named orientation components for a selected supplied pose, with frame, time, and recorded status.",
    classes: ["rs-robot-pose", "rs-robot-pose-legend", "rs-robot-pose-field", "rs-robot-pose-select", "rs-robot-pose-metadata", "rs-robot-pose-detail", "rs-robot-pose-heading", "rs-robot-pose-values", "rs-robot-pose-value", "rs-robot-pose-text", "rs-robot-pose-copy"],
    css: ["components/robot-pose.css"], react: "components/robot-pose.tsx", registryDependencies: ["select"],
    snippet: `<fieldset class="rs-robot-pose"><legend class="rs-robot-pose-legend">Tool pose</legend><dl class="rs-robot-pose-metadata"><div class="rs-robot-pose-detail"><dt>Frame</dt><dd class="rs-robot-pose-text">base</dd></div><div class="rs-robot-pose-detail"><dt>Recorded at</dt><dd class="rs-robot-pose-text">12:00:00.125</dd></div></dl><div><p class="rs-robot-pose-heading">Translation</p><p class="rs-robot-pose-copy">Unit: m</p><dl class="rs-robot-pose-values"><div><dt>X</dt><dd class="rs-robot-pose-value">0.125</dd></div><div><dt>Y</dt><dd class="rs-robot-pose-value">0</dd></div><div><dt>Z</dt><dd class="rs-robot-pose-value">0.25</dd></div></dl></div><p class="rs-robot-pose-copy">Representation: Quaternion, x y z w</p></fieldset>`,
    example: `import { RobotPose } from "@noorddev/vlak-react";

<RobotPose label="Tool pose" name="pose" poses={[{
  id: "tool-base", label: "Tool in base", frame: "base", timeLabel: "12:00:00.125", status: "Recorded",
  translation: { x: 0.125, y: 0, z: 0.25, unit: "m" },
  orientation: { representation: "Quaternion, x y z w", components: [
    { id: "qx", label: "qx", value: 0 }, { id: "qy", label: "qy", value: 0 },
    { id: "qz", label: "qz", value: 0 }, { id: "qw", label: "qw", value: 1 }
  ] }
}]} />`,
    usage: { use: ["Caller-supplied pose records with a frame, time label, recorded status, translation unit, and explicit orientation representation.", "value/defaultValue/onValueChange to select a supplied record by identifier; changing records does not transform coordinates.", "orientation.components for exact named values, with optional per-component units. Include axis order and intrinsic or extrinsic conventions in the representation label when relevant.", "Missing values remain Not supplied, non-finite values remain Unavailable, and zero is never treated as missing.", "The first supplied record is selected by default; an explicit null leaves the selection empty."], avoid: ["Treating the view as a frame tree, transform calculator, quaternion normalizer, or inverse-kinematics solver.", "Omitting orientation conventions or presenting an unconfirmed pose as the robot's active target."] },
    keyboard: [{ keys: "Tab", does: "Focuses the Vlak pose-record selector." }, { keys: "Enter, Space, Arrow keys", does: "Opens and navigates the selector; Enter confirms the highlighted record." }, { keys: "Home, End, Escape", does: "Moves to an end of the menu or closes it without changing the record." }],
    a11y: ["A fieldset and legend name the pose view; the Vlak Select names the recorded-pose choice and its menu.", "Definition lists retain every translation and orientation component as exact text, including zero, missing values, and explicit units.", "A named selection submits its supplied pose identifier through a hidden input. Parent form reset restores uncontrolled selection.", "Read-only selection retains its submitted value; native disabled fieldsets omit it.", "The ref and native attributes reach the root fieldset. No live announcement is attached to streamed pose data."],
    aliases: ["RobotPose", "Pose inspector", "Cartesian pose", "Robot pose record", "Quaternion inspector", "End effector pose"],
  },
  {
    name: "robot-mission-queue", title: "Robot mission queue", category: "robotics",
    description: "Shows supplied mission order and recorded step states, with keyboard reorder requests and explicit host actions separate from pending and confirmed records.",
    classes: ["rs-robot-mission-queue", "rs-robot-mission-queue-legend", "rs-robot-mission-queue-list", "rs-robot-mission-queue-step", "rs-robot-mission-queue-head", "rs-robot-mission-queue-title", "rs-robot-mission-queue-copy", "rs-robot-mission-queue-status", "rs-robot-mission-queue-actions", "rs-robot-mission-queue-button"],
    css: ["components/robot-mission-queue.css"], react: "components/robot-mission-queue.tsx", registryDependencies: ["button"],
    snippet: `<fieldset class="rs-robot-mission-queue"><legend class="rs-robot-mission-queue-legend">Inspection mission</legend><ol class="rs-robot-mission-queue-list"><li class="rs-robot-mission-queue-step"><div class="rs-robot-mission-queue-head"><p class="rs-robot-mission-queue-title">Inspect station</p><p class="rs-robot-mission-queue-status">Recorded: Not started</p></div><div class="rs-robot-mission-queue-actions"><button class="rs-btn-ghost rs-robot-mission-queue-button" type="button" aria-label="Review plan: step 1, Inspect station">Review plan</button></div></li></ol><p class="rs-robot-mission-queue-copy">Reordering and actions request host changes. Reported mission state remains supplied by the host.</p></fieldset>`,
    example: `import { RobotMissionQueue } from "@noorddev/vlak-react";

<RobotMissionQueue label="Inspection mission" name="mission"
  steps={[{ id: "inspect", label: "Inspect station", status: "Not started", actions: [{ id: "review", label: "Review plan" }] }, { id: "return", label: "Return to dock", status: "Not started" }]}
  onOrderChange={ids => console.log("Requested order", ids)}
  onAction={(stepId, actionId) => console.log("Requested action", stepId, actionId)} />`,
    usage: { use: ["A caller-owned ordered step list, explicit recorded statuses, and only those actions the host makes available.", "onOrderChange receives step identifiers in the proposed order. The host supplies the resulting records; the queue never rewrites status on a reorder request.", "onAction receives a step identifier and supplied action identifier. pending and confirmedLabel remain separate host records.", "Pending steps lock their own actions and adjacent reorder controls. readOnly keeps all request controls disabled.", "Named hidden inputs submit the supplied step identifiers in order; invalid duplicate step or action identifiers suppress ambiguous controls."], avoid: ["Assuming a request starts, cancels, schedules, or confirms physical execution.", "Using display order as an execution dependency graph or deriving allowed actions from a status string."] },
    keyboard: [{ keys: "Tab", does: "Moves through enabled reorder and host-action buttons." }, { keys: "Enter, Space", does: "Requests the focused reorder or supplied host action." }],
    a11y: ["The fieldset and legend name the mission, and a native ordered list conveys its supplied order.", "Vlak Button actions name both the step number and label. Reorder buttons state their direction and disable at list boundaries.", "Recorded status, host confirmation, and request-pending text remain distinct; pending feedback uses a status role.", "Action descriptions are connected to the corresponding button, including its recorded status.", "The ref and native fieldset attributes reach the root, and read-only ordered records remain available to forms."],
    aliases: ["RobotMissionQueue", "Robot task queue", "Mission plan", "Robot job sequence", "Mission steps"],
  },
];
