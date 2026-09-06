import type { VlakComponent } from "./schema";

export const engineeringComponents: VlakComponent[] = [
  {
    name: "alarm-panel", title: "Alarm panel", category: "engineering",
    description: "Industrial alarm records with independent condition, acknowledgement and shelving states, explicit filters and host-confirmed actions.",
    classes: ["rs-alarm-panel", "rs-alarm-panel-heading", "rs-alarm-panel-copy", "rs-alarm-panel-filters", "rs-alarm-panel-button", "rs-alarm-panel-selected", "rs-alarm-panel-list", "rs-alarm-panel-item", "rs-alarm-panel-head", "rs-alarm-panel-states", "rs-alarm-panel-term", "rs-alarm-panel-value", "rs-alarm-panel-actions"],
    css: ["components/alarm-panel.css"], react: "components/alarm-panel.tsx", registryDependencies: ["button"],
    snippet: '<div class="rs-alarm-panel"><p class="rs-alarm-panel-heading">Plant alarms</p><ul class="rs-alarm-panel-list"><li class="rs-alarm-panel-item"><div class="rs-alarm-panel-head">Cooling flow</div><dl class="rs-alarm-panel-states"><div><dt class="rs-alarm-panel-term">Condition</dt><dd class="rs-alarm-panel-value">Cleared</dd></div><div><dt class="rs-alarm-panel-term">Acknowledgement</dt><dd class="rs-alarm-panel-value">Unacknowledged</dd></div><div><dt class="rs-alarm-panel-term">Shelving</dt><dd class="rs-alarm-panel-value">Not shelved</dd></div></dl></li></ul></div>',
    example: `import { AlarmPanel } from "@noorddev/vlak-react";

<AlarmPanel label="Plant alarms" alarms={[
  { id: "flow", label: "Cooling flow", source: "Example circulation loop", priority: "Medium", condition: "cleared", acknowledgement: "unacknowledged", shelving: "unshelved", timeLabel: "14:32, supplied event time" },
  { id: "sensor", label: "Sensor connection", condition: "active", acknowledgement: "acknowledged", shelving: "shelved", shelvedUntilLabel: "15:00, local plant time" },
]} />`,
    usage: { use: ["Operator alarm lists with supplied lifecycle fields and explicit unknown values.", "Supply allowed actions and onAction to request acknowledgement, shelving or unshelving. Return pending and then confirmed records from the host.", "Use filter and onFilterChange for an application-owned filter; uncontrolled filtering starts from defaultFilter.", "Provide unique alarm ids, a bounded set of visible records, event time labels and the site's explicit time-zone context."], avoid: ["Treating acknowledgement as clearing a condition, or shelving as acknowledgement.", "Using a displayed action as proof that equipment changed state. The host owns permissions, audit records, filtering of large streams and shelving timers."] },
    keyboard: [{ keys: "Tab", does: "Moves through filter buttons and supplied enabled alarm actions." }, { keys: "Enter, Space", does: "Applies a filter or requests the focused action." }],
    a11y: ["Each alarm exposes separate condition, acknowledgement and shelving fields as visible text in a description list.", "Pressed filter buttons use a full fill; all controls have 44px targets, visible keyboard focus and forced-colour support.", "A polite record count reflects the current filter. Pending records keep their confirmed state and disable actions.", "The div ref, native attributes, className and style pass through."],
    aliases: ["Industrial alarms", "Alarm acknowledgement", "Alarm shelving", "Operator alarm list", "Process alarm panel"],
  },
  {
    name: "work-offset-panel", title: "Work offset panel", category: "engineering",
    description: "Reported machine and work coordinates alongside editable draft offsets, explicit axis units and a host-owned apply request.",
    classes: ["rs-work-offset-panel", "rs-work-offset-panel-legend", "rs-work-offset-panel-copy", "rs-work-offset-panel-field", "rs-work-offset-panel-control", "rs-work-offset-panel-viewport", "rs-work-offset-panel-table", "rs-work-offset-panel-caption", "rs-work-offset-panel-cell", "rs-work-offset-panel-axis", "rs-work-offset-panel-offset", "rs-work-offset-panel-button"],
    css: ["components/work-offset-panel.css"], react: "components/work-offset-panel.tsx", registryDependencies: ["input", "select", "button", "dropdown-menu"],
    snippet: '<fieldset class="rs-work-offset-panel"><legend class="rs-work-offset-panel-legend">Work coordinates</legend><p class="rs-work-offset-panel-copy">Active system: G54 · Offsets active</p><div class="rs-work-offset-panel-field"><span id="work-offset-system-label">Draft coordinate system</span><div class="rs-select rs-select-fluid"><button type="button" class="rs-dropdown" role="combobox" aria-labelledby="work-offset-system-label" aria-expanded="false" aria-haspopup="listbox"><span>G54</span></button></div></div><label class="rs-work-offset-panel-field">X offset (mm)<input class="rs-input rs-input-full rs-work-offset-panel-control" type="number" step="any" value="125" /></label></fieldset>',
    example: `import { WorkOffsetPanel } from "@noorddev/vlak-react";

<WorkOffsetPanel label="Work coordinates" name="fixture" activeSystemId="g54" offsetState="active" systems={[{ id: "g54", label: "G54" }, { id: "g55", label: "G55" }]} axes={[
  { id: "x", label: "X", unit: "mm", machine: 145, work: 20 },
  { id: "y", label: "Y", unit: "mm", machine: 60, work: 10 },
]} defaultValue={{ systemId: "g54", offsets: { x: 125, y: 50 } }} />`,
    usage: { use: ["Editing a supplied offset record while keeping actual machine and work readings visible.", "Supply both reported coordinate sets independently; rotations and additional offsets belong to the controller, so no machine-to-work subtraction is inferred.", "value and onValueChange let the host load offsets for a chosen draft system. Uncontrolled system changes retain the entered offsets; they do not fetch another system's record.", "onApply requests a complete finite draft containing only the listed axes and a known enabled system. activeSystemId, offsetState and actual readings change only when supplied by the host.", "name submits name.system and name.axisId values. External form association and native reset are supported."], avoid: ["Interpreting an apply request as controller acceptance, machine movement or persistence.", "Treating missing coordinates as zero, or suspended offsets as zeroed offsets. The host owns controller access, validation and interlocks."] },
    keyboard: [{ keys: "Tab", does: "Moves through the system selector, scroll region, axis offset inputs and apply action." }, { keys: "Arrow keys", does: "Opens and navigates the Vlak system selector, steps number inputs or scrolls the focused table region. Escape closes the selector." }, { keys: "Enter, Space", does: "Confirms a highlighted system or requests the focused Apply offsets action when a complete draft is available." }],
    a11y: ["A fieldset and legend name the editor. A captioned table separates actual readings from draft values, with axis units in each accessible input name.", "Unknown, unavailable and zero readings remain distinct. Invalid supplied offsets are marked and prevent apply.", "Vlak Select, Input and Button retain 44px targets; narrow layouts scroll the table inside a focusable, uniquely named region.", "Read-only values remain submittable; disabled or pending controls do not submit. Native reset restores uncontrolled defaults without overwriting controlled values.", "The fieldset ref, native attributes, className and style pass through."],
    aliases: ["Machine coordinates", "Work coordinate system", "Fixture offsets", "Machining offsets", "Coordinate readout"],
  },
];
