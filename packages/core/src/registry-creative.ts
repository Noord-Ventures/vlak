import type { VlakComponent } from "./schema";

/** Controls and records for application-owned creative workflows. */
export const creativeComponents: VlakComponent[] = [
  {
    name: "audio-meter", title: "Audio meter", category: "creative",
    description: "Shows supplied channel levels and peaks in decibels, with bounded native meters and explicit missing readings.",
    classes: ["rs-audio-meter", "rs-audio-meter-label", "rs-audio-meter-channel", "rs-audio-meter-text", "rs-audio-meter-bar", "rs-audio-meter-note"],
    css: ["components/audio-meter.css"], react: "components/audio-meter.tsx", registryDependencies: [],
    snippet: `<div class="rs-audio-meter"><p class="rs-audio-meter-label">Output</p><div class="rs-audio-meter-channel"><div class="rs-audio-meter-text"><span id="left-channel">Left</span><span>-12 dB</span></div><meter class="rs-audio-meter-bar" min="-60" max="0" value="-12" aria-labelledby="left-channel">-12 dB</meter><p class="rs-audio-meter-note">Peak: -3 dB</p></div></div>`,
    example: `import { AudioMeter } from "@noorddev/vlak-react";

<AudioMeter label="Output" channels={[{ id: "left", label: "Left", level: -12, peak: -3 }, { id: "right", label: "Right", level: -15, peak: -4 }]} />`,
    usage: { use: ["Live or recorded decibel readings supplied by an audio host.", "min and max to set the visible scale; supplied readings remain visible as text.", "Negative infinity for digital silence, and null for an unavailable level."], avoid: ["Expecting microphone access, audio analysis, or automatic peak holding.", "Treating a missing reading as silence or zero decibels."] },
    keyboard: [],
    a11y: ["Each native meter has a channel name, minimum, maximum, and decibel value text.", "Supplied peaks are visible text; absent and invalid readings suppress the meter.", "Monochrome native meter styles retain boundaries in forced colors.", "The ref and native attributes reach the root div."],
    aliases: ["AudioMeter", "Level meter", "Peak meter", "Decibel meter", "Channel meter"],
  },
  {
    name: "channel-strip", title: "Channel strip", category: "creative",
    description: "Edits channel gain, pan, mute, and solo with native sliders and 44px toggle actions wired to caller-owned state.",
    classes: ["rs-channel-strip", "rs-channel-strip-label", "rs-channel-strip-field", "rs-channel-strip-text", "rs-channel-strip-range", "rs-channel-strip-actions", "rs-channel-strip-button", "rs-channel-strip-pressed"],
    css: ["components/channel-strip.css"], react: "components/channel-strip.tsx", registryDependencies: [],
    snippet: `<fieldset class="rs-channel-strip"><legend class="rs-channel-strip-label">Dialogue</legend><label class="rs-channel-strip-field">Gain<input class="rs-channel-strip-range" type="range" min="-60" max="12" step="any" value="0" /></label><label class="rs-channel-strip-field">Pan<input class="rs-channel-strip-range" type="range" min="-100" max="100" step="any" value="0" /></label><div class="rs-channel-strip-actions"><button class="rs-channel-strip-button" type="button" aria-pressed="false">Mute</button><button class="rs-channel-strip-button" type="button" aria-pressed="false">Solo</button></div></fieldset>`,
    example: `import { ChannelStrip } from "@noorddev/vlak-react";

<ChannelStrip label="Dialogue" name="dialogue" defaultValue={{ gain: -3, pan: 0, muted: false, solo: false }} />`,
    usage: { use: ["A host channel whose gain, pan, mute, and solo states belong together.", "value/defaultValue/onValueChange for controlled or local editing; connect changes to your audio host.", "Pan from -100 percent left through zero center to 100 percent right; gain uses decibels."], avoid: ["Assuming UI changes process audio without a connected host.", "Using solo as a global mixing policy; the application coordinates other channels."] },
    keyboard: [{ keys: "Tab", does: "Moves through enabled gain, pan, mute, and solo controls." }, { keys: "Arrow keys, Home, End", does: "Uses native slider stepping and bounds." }, { keys: "Enter, Space", does: "Toggles the focused mute or solo action." }],
    a11y: ["A fieldset and legend name the channel; native sliders expose gain and pan bounds and descriptive value text. In-range values retain their supplied precision.", "Mute and solo have stable names and aria-pressed; their entire surface changes on selection.", "All controls meet the 44px target size. Disabled or read-only controls cannot edit the channel.", "Uncontrolled form reset restores the supplied default; named read-only channels retain all valid values in form submissions. Disabled channels and out-of-range sliders are omitted. The ref reaches the fieldset."],
    aliases: ["ChannelStrip", "Mixer channel", "Audio mixer", "Gain control", "Pan control", "Mute solo"],
  },
  {
    name: "parameter-knob", title: "Parameter knob", category: "creative",
    description: "Displays a rotary parameter over a native horizontal range input, with named values, units, and a 64px control.",
    classes: ["rs-parameter-knob", "rs-parameter-knob-label", "rs-parameter-knob-control", "rs-parameter-knob-pointer", "rs-parameter-knob-input", "rs-parameter-knob-value"],
    css: ["components/parameter-knob.css"], react: "components/parameter-knob.tsx", registryDependencies: [],
    snippet: `<div class="rs-parameter-knob"><label class="rs-parameter-knob-label" for="mix-knob">Mix</label><div class="rs-parameter-knob-control"><span class="rs-parameter-knob-pointer" aria-hidden="true" style="transform:rotate(0deg)"></span><input class="rs-parameter-knob-input" id="mix-knob" type="range" min="0" max="100" step="1" value="50" aria-valuetext="50%" /></div><span class="rs-parameter-knob-value">50%</span></div>`,
    example: `import { ParameterKnob } from "@noorddev/vlak-react";

<ParameterKnob label="Mix" name="mix" min={0} max={100} step={1} defaultValue={35} unit="%" />`,
    usage: { use: ["A compact bounded parameter with an explicit label, step, and unit.", "value/defaultValue/onValueChange and native form attributes; the ref reaches the range input.", "Horizontal pointer movement and the browser's native range keyboard behavior."], avoid: ["Implying circular pointer dragging; the dial is a visual representation of a horizontal range.", "Non-finite values or invalid bounds; they render an unavailable disabled control."] },
    keyboard: [{ keys: "Tab", does: "Focuses the native range input and its visible dial ring." }, { keys: "Arrow keys, Home, End", does: "Uses native range stepping and bounds unless read-only." }],
    a11y: ["The native range uses the visible label and exposes min, max, step, and value text including the unit.", "The full 64px dial is the input target; the pointer graphic is decorative.", "Form reset restores uncontrolled defaults and preserves controlled values.", "The ref, native input attributes, className, and style reach the range input."],
    aliases: ["ParameterKnob", "Rotary control", "Dial", "Audio knob", "Parameter dial"],
  },
  {
    name: "timecode-field", title: "Timecode field", category: "creative",
    description: "Edits hours, minutes, seconds, and frames with native form validation for a supplied integer non-drop frame rate.",
    classes: ["rs-timecode-field", "rs-timecode-field-label", "rs-timecode-field-input", "rs-timecode-field-hint"],
    css: ["components/timecode-field.css"], react: "components/timecode-field.tsx", registryDependencies: [],
    snippet: `<div class="rs-timecode-field"><label class="rs-timecode-field-label" for="in-point">In point</label><input class="rs-timecode-field-input" id="in-point" type="text" value="00:01:24:12" pattern="[0-9]{2}:[0-5][0-9]:[0-5][0-9]:[0-9]{2}" aria-describedby="in-point-hint" /><p class="rs-timecode-field-hint" id="in-point-hint">24 fps, non-drop. Hours:minutes:seconds:frames.</p></div>`,
    example: `import { TimecodeField } from "@noorddev/vlak-react";

<TimecodeField label="In point" name="inPoint" frameRate={24} defaultValue="00:01:24:12" required />`,
    usage: { use: ["Integer non-drop rates from 1 through 99, supplied explicitly by the application.", "Two-digit hours, minutes, seconds, and frames separated by colons.", "onValueChange receives editable text, including incomplete input; check native validity before committing."], avoid: ["Drop-frame, fractional frame rates, or automatic conversion between timecode standards.", "Coercing invalid frame numbers into a different timestamp without user intent."] },
    keyboard: [{ keys: "Tab", does: "Focuses the native text input." }, { keys: "Text editing keys", does: "Edits and selects timecode text using native input behavior." }],
    a11y: ["A visible label names the input, and the frame-rate hint or validation error is linked as its description.", "The format pattern and custom validity reject out-of-range frames and unsupported rates; required uses native form validation.", "A 44px input target and focus ring accompany aria-invalid on invalid timecode.", "The ref and native input attributes reach the input; uncontrolled form reset restores the default text."],
    aliases: ["TimecodeField", "Timecode input", "Frame address", "In point", "Out point", "Non-drop timecode"],
  },
  {
    name: "clip-timeline", title: "Clip timeline", category: "creative",
    description: "Positions supplied clips within a declared duration, with contained horizontal scrolling, accessible selection, and optional seeking.",
    classes: ["rs-clip-timeline", "rs-clip-timeline-label", "rs-clip-timeline-note", "rs-clip-timeline-seek", "rs-clip-timeline-range", "rs-clip-timeline-viewport", "rs-clip-timeline-track", "rs-clip-timeline-clips", "rs-clip-timeline-lane", "rs-clip-timeline-clip", "rs-clip-timeline-selected", "rs-clip-timeline-rows", "rs-clip-timeline-button"],
    css: ["components/clip-timeline.css"], react: "components/clip-timeline.tsx", registryDependencies: [],
    snippet: `<div class="rs-clip-timeline"><p class="rs-clip-timeline-label" id="assembly-label">Assembly</p><p class="rs-clip-timeline-note">0 to 60 seconds</p><div class="rs-clip-timeline-viewport" role="region" aria-labelledby="assembly-label" tabindex="0"><div class="rs-clip-timeline-track"><span>Video</span><div class="rs-clip-timeline-lane" aria-hidden="true"><span class="rs-clip-timeline-clip" style="inset-inline-start:10%;width:30%">Opening</span></div></div></div><ul class="rs-clip-timeline-rows"><li><span>Opening · Video · 6–24 seconds</span></li></ul></div>`,
    example: `import { ClipTimeline } from "@noorddev/vlak-react";

<ClipTimeline label="Assembly" duration={60} unit="seconds" tracks={[{ id: "video", label: "Video" }]} clips={[{ id: "opening", trackId: "video", label: "Opening", start: 6, duration: 18 }]} />`,
    usage: { use: ["Caller-owned tracks and clips measured explicitly in seconds or whole frames.", "onSelectClip for selection requests and onSeek for a native position control; update the supplied selectedClipId and position.", "Separate rows within each track keep overlapping clips visible without implying an edit."], avoid: ["Expecting drag editing, playback, trimming, or a media backend.", "Hiding invalid or unassigned clips; their text records remain visible."] },
    keyboard: [{ keys: "Tab", does: "Moves through the optional seek control, scrollable track region, and selection buttons." }, { keys: "Arrow keys, Home, End", does: "Uses native seeking on the range input; arrow keys scroll the focused track region." }, { keys: "Enter, Space", does: "Requests selection from a focused clip button." }],
    a11y: ["Clip graphics are decorative and accompanied by complete text records with track, start, end, and unit.", "Every selectable clip has a separate 44px button, including clips whose plotted duration is less than one pixel.", "The horizontal viewport remains inside the component and can receive keyboard focus.", "Invalid duration or clip intervals do not produce misleading geometry; the ref and native attributes reach the root div."],
    aliases: ["ClipTimeline", "Video timeline", "Audio timeline", "Track timeline", "Clip selection", "Edit timeline"],
  },
  {
    name: "render-queue", title: "Render queue", category: "creative",
    description: "Displays supplied export jobs, progress, and status with explicit cancel and retry callbacks for a connected renderer.",
    classes: ["rs-render-queue", "rs-render-queue-label", "rs-render-queue-list", "rs-render-queue-job", "rs-render-queue-header", "rs-render-queue-note", "rs-render-queue-progress", "rs-render-queue-action"],
    css: ["components/render-queue.css"], react: "components/render-queue.tsx", registryDependencies: [],
    snippet: `<div class="rs-render-queue"><p class="rs-render-queue-label">Exports</p><ul class="rs-render-queue-list"><li class="rs-render-queue-job"><div class="rs-render-queue-header"><span>Film master</span><span>Rendering</span></div><progress class="rs-render-queue-progress" value="42" max="100" aria-label="Film master progress">42%</progress><p class="rs-render-queue-note">42%</p></li></ul></div>`,
    example: `import { RenderQueue } from "@noorddev/vlak-react";

<RenderQueue label="Exports" jobs={[{ id: "master", label: "Film master", status: "rendering", progress: 42, detail: "ProRes master" }, { id: "preview", label: "Review copy", status: "queued" }]} />`,
    usage: { use: ["Renderer-owned jobs with queued, rendering, complete, failed, or canceled status.", "onCancel for active jobs and onRetry for failed or canceled jobs; the host owns the resulting status.", "Known percentages from zero through 100; missing progress remains explicitly unreported."], avoid: ["Simulating render progress or success without a backend result.", "Displaying cancel or retry controls when there is no callback to handle them."] },
    keyboard: [{ keys: "Tab", does: "Moves through available cancel and retry buttons." }, { keys: "Enter, Space", does: "Requests the focused job action without changing the supplied job state." }],
    a11y: ["Job labels and statuses remain text; determinate native progress is named per job.", "Missing or invalid progress has an explicit text state and never emits NaN or an invented percentage.", "Actions have job-specific names, 44px targets, and disabled support.", "The ref and native attributes reach the root div."],
    aliases: ["RenderQueue", "Export queue", "Encoding queue", "Render jobs", "Export progress"],
  },
  {
    name: "layer-stack", title: "Layer stack", category: "creative",
    description: "Manages supplied layer selection, visibility, locking, and order through named 44px controls and caller-owned changes.",
    classes: ["rs-layer-stack", "rs-layer-stack-label", "rs-layer-stack-list", "rs-layer-stack-row", "rs-layer-stack-actions", "rs-layer-stack-button", "rs-layer-stack-selected", "rs-layer-stack-note"],
    css: ["components/layer-stack.css"], react: "components/layer-stack.tsx", registryDependencies: [],
    snippet: `<div class="rs-layer-stack"><p class="rs-layer-stack-label">Layers</p><ol class="rs-layer-stack-list"><li class="rs-layer-stack-row"><span>Title</span><span class="rs-layer-stack-note">Visible · Unlocked</span></li><li class="rs-layer-stack-row"><span>Background</span><span class="rs-layer-stack-note">Visible · Locked</span></li></ol></div>`,
    example: `import { useState } from "react";
import { LayerStack } from "@noorddev/vlak-react";
import type { CreativeLayer } from "@noorddev/vlak-react";

function Layers() {
  const [layers, setLayers] = useState<CreativeLayer[]>([{ id: "title", label: "Title", visible: true, locked: false }, { id: "background", label: "Background", visible: true, locked: true }]);
  const [selected, setSelected] = useState<string | null>(null);
  return <LayerStack label="Layers" layers={layers} selectedId={selected} onSelect={setSelected} onLayersChange={setLayers} />;
}`,
    usage: { use: ["Top-to-bottom layer order for a graphics, audio, or video editor.", "onLayersChange receives the proposed array; the application applies it and owns persistence.", "onSelect independently controls selection; locked layers cannot use their move actions."], avoid: ["Implying drag-and-drop support or modifying document content behind the host's back.", "Rendering state-changing controls without onLayersChange."] },
    keyboard: [{ keys: "Tab", does: "Moves through available selection, visibility, lock, and move actions." }, { keys: "Enter, Space", does: "Requests the focused action; move buttons reorder one position when allowed." }],
    a11y: ["An ordered list preserves the supplied layer order, with visible status text for visibility and locking.", "Selection, visibility, and lock controls have stable names and pressed states.", "Move actions name their layer, disable at boundaries or when locked, and avoid a drag-only workflow.", "All actions have 44px targets; the ref and native attributes reach the root div."],
    aliases: ["LayerStack", "Layers panel", "Layer list", "Layer inspector", "Object stack"],
  },
  {
    name: "color-inspector", title: "Color inspector", category: "creative",
    description: "Edits a six-digit hex color and alpha with a data-driven preview, a transparency ground, and native form validation.",
    classes: ["rs-color-inspector", "rs-color-inspector-label", "rs-color-inspector-preview", "rs-color-inspector-swatch", "rs-color-inspector-fields", "rs-color-inspector-field", "rs-color-inspector-input", "rs-color-inspector-note"],
    css: ["components/color-inspector.css"], react: "components/color-inspector.tsx", registryDependencies: [],
    snippet: `<fieldset class="rs-color-inspector"><legend class="rs-color-inspector-label">Fill</legend><div class="rs-color-inspector-preview" aria-hidden="true"><span class="rs-color-inspector-swatch" style="background-color:#808080;opacity:0.5"></span></div><div class="rs-color-inspector-fields"><label class="rs-color-inspector-field">Hex<input class="rs-color-inspector-input" type="text" value="#808080" pattern="#[0-9a-fA-F]{6}" required /></label><label class="rs-color-inspector-field">Alpha<input class="rs-color-inspector-input" type="number" value="0.5" min="0" max="1" step="any" required /></label></div></fieldset>`,
    example: `import { ColorInspector } from "@noorddev/vlak-react";

<ColorInspector label="Fill" name="fill" defaultValue={{ hex: "#808080", alpha: 0.5 }} />`,
    usage: { use: ["Application-owned color data; only the swatch uses the supplied hue, while the inspector shell stays monochrome.", "Six-digit hex including #, with alpha from zero transparent to one opaque.", "onValueChange receives editable input; incomplete alpha is null and invalid hex remains available for correction."], avoid: ["Assuming color-space conversion, gamut checking, contrast certification, or color-profile management.", "Presenting a valid preview when the supplied color or alpha is invalid."] },
    keyboard: [{ keys: "Tab", does: "Moves between the native hex and alpha inputs." }, { keys: "Text editing keys", does: "Edits or selects hex and alpha values; any alpha precision from 0 to 1 is accepted." }],
    a11y: ["A fieldset and legend name the color; hex and alpha are labelled native controls with 44px targets.", "The decorative swatch has an explicit text equivalent and preserves caller-owned color in forced colors.", "Pattern, required, and numeric bounds supply native form validation; invalid data suppresses the swatch.", "Controlled and uncontrolled values support form reset; the ref and native attributes reach the fieldset."],
    aliases: ["ColorInspector", "Color input", "Hex editor", "Alpha control", "Fill inspector", "Color swatch"],
  },
  {
    name: "spacing-control", title: "Spacing control", category: "creative",
    description: "Edits top, right, bottom, and left spacing with linked or independent native number fields and explicit units.",
    classes: ["rs-spacing-control", "rs-spacing-control-label", "rs-spacing-control-fields", "rs-spacing-control-field", "rs-spacing-control-input", "rs-spacing-control-link", "rs-spacing-control-linked", "rs-spacing-control-note"],
    css: ["components/spacing-control.css"], react: "components/spacing-control.tsx", registryDependencies: [],
    snippet: `<fieldset class="rs-spacing-control"><legend class="rs-spacing-control-label">Padding</legend><div class="rs-spacing-control-fields"><label class="rs-spacing-control-field">Top (px)<input class="rs-spacing-control-input" type="number" value="16" /></label><label class="rs-spacing-control-field">Right (px)<input class="rs-spacing-control-input" type="number" value="24" /></label><label class="rs-spacing-control-field">Bottom (px)<input class="rs-spacing-control-input" type="number" value="16" /></label><label class="rs-spacing-control-field">Left (px)<input class="rs-spacing-control-input" type="number" value="24" /></label></div></fieldset>`,
    example: `import { SpacingControl } from "@noorddev/vlak-react";

<SpacingControl label="Padding" name="padding" unit="px" min={0} defaultValue={{ top: 16, right: 24, bottom: 16, left: 24 }} />`,
    usage: { use: ["Padding, margin, inset, or other four-sided numeric values in a caller-specified unit.", "Link sides to apply the next edit to every side; linking alone preserves existing values.", "value/defaultValue/onValueChange and linked/defaultLinked/onLinkedChange control the values and link state independently."], avoid: ["Converting between units or assuming CSS semantics beyond the supplied numeric fields.", "Treating cleared values as zero; a cleared side is null."] },
    keyboard: [{ keys: "Tab", does: "Moves through four number inputs and the link action." }, { keys: "Arrow up, Arrow down", does: "Uses native number stepping with supplied min, max, and step." }, { keys: "Enter, Space", does: "Toggles Link sides on the focused action." }],
    a11y: ["A fieldset and legend name the spacing group; each native number field includes its side and unit.", "Link sides has a stable name and aria-pressed, plus text explaining the next-edit behavior.", "Inputs and the link action have 44px targets; native bounds and step support form validation.", "Named fields submit separately; reset restores uncontrolled values and link state. The ref reaches the fieldset."],
    aliases: ["SpacingControl", "Spacing inspector", "Padding editor", "Margin editor", "Inset controls", "Box model"],
  },
];
