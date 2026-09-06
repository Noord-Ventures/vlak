# Creative tools

Controls for professional audio, video, and design workspaces.

## Audio

Read channel levels, adjust gain and pan, and control a named parameter with native keyboard input.

- [Audio meter](https://vlak.dev/docs/audio-meter.md): Shows supplied channel levels and peaks in decibels, with bounded native meters and explicit missing readings.
- [Channel strip](https://vlak.dev/docs/channel-strip.md): Edits channel gain, pan, mute, and solo with native sliders and 44px toggle actions wired to caller-owned state.
- [Parameter knob](https://vlak.dev/docs/parameter-knob.md): Displays a rotary parameter over a native horizontal range input, with named values, units, and a 64px control.

## Video

Enter a timecode, select a clip, seek through a sequence, and manage render jobs.

- [Timecode field](https://vlak.dev/docs/timecode-field.md): Edits hours, minutes, seconds, and frames with native form validation for a supplied integer non-drop frame rate.
- [Clip timeline](https://vlak.dev/docs/clip-timeline.md): Positions supplied clips within a declared duration, with contained horizontal scrolling, accessible selection, and optional seeking.
- [Render queue](https://vlak.dev/docs/render-queue.md): Displays supplied export jobs, progress, and status with explicit cancel and retry callbacks for a connected renderer.

## Design

Select, hide, and lock layers; inspect a colour; and edit independent or linked spacing values.

- [Layer stack](https://vlak.dev/docs/layer-stack.md): Manages supplied layer selection, visibility, locking, and order through named 44px controls and caller-owned changes.
- [Color inspector](https://vlak.dev/docs/color-inspector.md): Edits a six-digit hex color and alpha with a data-driven preview, a transparency ground, and native form validation.
- [Spacing control](https://vlak.dev/docs/spacing-control.md): Edits top, right, bottom, and left spacing with linked or independent native number fields and explicit units.

## Data and action contracts

### Connect controls to an engine

Callbacks express edits and requested actions. The host application owns audio processing, playback, timeline editing, undo history, and render execution. Demo controls update local state.

### Declare units and time bases

Audio meter levels use the supplied decibel scale. ClipTimeline uses an explicit seconds or frames unit. TimecodeField supports integer non-drop frame rates from 1 to 99; fractional and drop-frame workflows require a different timecode implementation.

### Keep missing data visible

Missing meter levels, unknown job progress, unset colours, and empty spacing values remain distinct from zero. Pass confirmed render status back after cancel or retry actions complete.

### Support precise keyboard edits

Parameter controls retain native input semantics. Timeline clips have separate accessible selection controls, and layer visibility and locking use named buttons. Geometry and swatches accompany readable values.

## Install

```sh
npm install @noorddev/vlak-react
# Or vendor an individual component
npx @noorddev/vlak-cli add audio-meter
```
