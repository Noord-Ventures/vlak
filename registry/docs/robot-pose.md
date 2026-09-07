# Robot pose

Displays exact Cartesian translation and explicitly named orientation components for a selected supplied pose, with frame, time, and recorded status.

Category: robotics  
Name: `robot-pose`  
Also known as: RobotPose, Pose inspector, Cartesian pose, Robot pose record, Quaternion inspector, End effector pose  
Page: https://vlak.dev/components/robot-pose/

## When to use

- Caller-supplied pose records with a frame, time label, recorded status, translation unit, and explicit orientation representation.
- value/defaultValue/onValueChange to select a supplied record by identifier; changing records does not transform coordinates.
- orientation.components for exact named values, with optional per-component units. Include axis order and intrinsic or extrinsic conventions in the representation label when relevant.
- Missing values remain Not supplied, non-finite values remain Unavailable, and zero is never treated as missing.
- The first supplied record is selected by default; an explicit null leaves the selection empty.

## When not to

- Treating the view as a frame tree, transform calculator, quaternion normalizer, or inverse-kinematics solver.
- Omitting orientation conventions or presenting an unconfirmed pose as the robot's active target.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { RobotPose } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add robot-pose
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/robot-pose.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<fieldset class="rs-robot-pose"><legend class="rs-robot-pose-legend">Tool pose</legend><dl class="rs-robot-pose-metadata"><div class="rs-robot-pose-detail"><dt>Frame</dt><dd class="rs-robot-pose-text">base</dd></div><div class="rs-robot-pose-detail"><dt>Recorded at</dt><dd class="rs-robot-pose-text">12:00:00.125</dd></div></dl><div><p class="rs-robot-pose-heading">Translation</p><p class="rs-robot-pose-copy">Unit: m</p><dl class="rs-robot-pose-values"><div><dt>X</dt><dd class="rs-robot-pose-value">0.125</dd></div><div><dt>Y</dt><dd class="rs-robot-pose-value">0</dd></div><div><dt>Z</dt><dd class="rs-robot-pose-value">0.25</dd></div></dl></div><p class="rs-robot-pose-copy">Representation: Quaternion, x y z w</p></fieldset>
```

## Example

```tsx
import { RobotPose } from "@noorddev/vlak-react";

<RobotPose label="Tool pose" name="pose" poses={[{
  id: "tool-base", label: "Tool in base", frame: "base", timeLabel: "12:00:00.125", status: "Recorded",
  translation: { x: 0.125, y: 0, z: 0.25, unit: "m" },
  orientation: { representation: "Quaternion, x y z w", components: [
    { id: "qx", label: "qx", value: 0 }, { id: "qy", label: "qy", value: 0 },
    { id: "qz", label: "qz", value: 0 }, { id: "qw", label: "qw", value: 1 }
  ] }
}]} />
```

## Props

### RobotPose

Exact supplied Cartesian and orientation records, with no frame transform or pose computation.

Extends `Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLFieldSetElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` |  |  |
| `poses` (required) | `readonly RobotPoseRecord[]` |  |  |
| `value` | `string \| null` |  |  |
| `defaultValue` | `string \| null` |  |  |
| `onValueChange` | `(poseId: string \| null) => void` |  |  |
| `readOnly` | `boolean` | `false` |  |
| `description` | `ReactNode` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Focuses the Vlak pose-record selector. |
| Enter, Space, Arrow keys | Opens and navigates the selector; Enter confirms the highlighted record. |
| Home, End, Escape | Moves to an end of the menu or closes it without changing the record. |

## Accessibility

- A fieldset and legend name the pose view; the Vlak Select names the recorded-pose choice and its menu.
- Definition lists retain every translation and orientation component as exact text, including zero, missing values, and explicit units.
- A named selection submits its supplied pose identifier through a hidden input. Parent form reset restores uncontrolled selection.
- Read-only selection retains its submitted value; native disabled fieldsets omit it.
- The ref and native attributes reach the root fieldset. No live announcement is attached to streamed pose data.

## Classes

`rs-robot-pose`, `rs-robot-pose-legend`, `rs-robot-pose-field`, `rs-robot-pose-select`, `rs-robot-pose-metadata`, `rs-robot-pose-detail`, `rs-robot-pose-heading`, `rs-robot-pose-values`, `rs-robot-pose-value`, `rs-robot-pose-text`, `rs-robot-pose-copy`

## Dependencies

Registry dependencies: [select](select.md).  
React: `packages/react/src/components/robot-pose.tsx`  
CSS: `packages/core/css/components/robot-pose.css`
