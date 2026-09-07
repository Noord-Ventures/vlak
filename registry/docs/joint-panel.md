# Joint panel

Pairs host-reported joint positions with independent draft targets, supplied units and limits, and an explicit request action.

Category: robotics  
Name: `joint-panel`  
Also known as: JointPanel, Robot joint targets, Joint monitor, Joint position editor, Robot axis targets  
Page: https://vlak.dev/components/joint-panel/

## When to use

- Reported joint positions and a separate draft target map keyed by joint identifier.
- value/defaultValue/onValueChange for controlled editing or an isolated prototype; drafts never inherit missing values from reported positions.
- Finite minimum and maximum values in each joint's supplied unit. A complete valid draft is required before requesting targets.
- onRequestTargets to ask the host to apply a draft; pending and confirmedLabel describe independently supplied request state.
- Missing, non-finite, duplicate, and unlisted records receive explicit feedback. No motion or limit policy is inferred.

## When not to

- Treating a successful click as confirmed robot movement.
- Using the component as a motion planner, interlock, unit converter, or source of joint limits.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { JointPanel } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add joint-panel
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/joint-panel.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<fieldset class="rs-joint-panel"><legend class="rs-joint-panel-legend">Arm joints</legend><p class="rs-joint-panel-copy">Reported at: 12:00:00.125</p><ul class="rs-joint-panel-list"><li class="rs-joint-panel-joint"><div><p class="rs-joint-panel-title">Shoulder</p><p class="rs-joint-panel-reading">Reported: 12.5 deg</p><p class="rs-joint-panel-copy">Limits: -90 to 90 deg</p></div><label class="rs-joint-panel-field">Draft target (deg)<input class="rs-input rs-input-full rs-joint-panel-input" type="number" step="any" min="-90" max="90" value="0" aria-label="Shoulder draft target (deg)" /></label></li></ul><button class="rs-btn-primary rs-joint-panel-button" type="button">Request targets</button></fieldset>
```

## Example

```tsx
import { JointPanel } from "@noorddev/vlak-react";

<JointPanel label="Arm joints" name="targets" timeLabel="12:00:00.125"
  joints={[{ id: "shoulder", label: "Shoulder", unit: "deg", reported: 12.5, minimum: -90, maximum: 90 }, { id: "slide", label: "Slide", unit: "m", reported: 0, minimum: 0, maximum: 0.5 }]}
  defaultValue={{ shoulder: 0, slide: 0 }}
  onRequestTargets={targets => console.log("Requested targets", targets)} />
```

## Props

### JointPanel

Draft joint targets remain separate from host-reported positions and request confirmation.

Extends `Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLFieldSetElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` |  |  |
| `joints` (required) | `readonly JointRecord[]` |  |  |
| `value` | `JointTargets` |  |  |
| `defaultValue` | `JointTargets` | `{}` |  |
| `onValueChange` | `(targets: JointTargets) => void` |  |  |
| `onRequestTargets` | `(targets: JointTargets) => void` |  | Requests the complete draft. Motion and confirmation belong to the host. |
| `pending` | `boolean` | `false` |  |
| `confirmedLabel` | `ReactNode` |  |  |
| `timeLabel` | `ReactNode` |  |  |
| `description` | `ReactNode` |  |  |
| `readOnly` | `boolean` | `false` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves through target inputs and the request button. |
| Arrow up, Arrow down | Uses native number-input stepping within the supplied limits. |
| Enter, Space | Activates the focused request button when the complete draft is valid. |

## Accessibility

- The fieldset and legend name the joint group; each target names its joint and unit.
- Vlak Input and Button provide consistent control sizing, focus treatment, and native keyboard behavior.
- Native validity and visible messages identify missing or out-of-bounds targets; reported zero remains distinct from missing data.
- Named inputs submit per-joint drafts. Form reset restores uncontrolled defaults, read-only drafts still submit, and pending controls are disabled.
- The ref, native fieldset attributes, className, and style reach the root fieldset.

## Classes

`rs-joint-panel`, `rs-joint-panel-legend`, `rs-joint-panel-copy`, `rs-joint-panel-list`, `rs-joint-panel-joint`, `rs-joint-panel-title`, `rs-joint-panel-reading`, `rs-joint-panel-field`, `rs-joint-panel-input`, `rs-joint-panel-button`

## Dependencies

Registry dependencies: [input](input.md), [button](button.md).  
React: `packages/react/src/components/joint-panel.tsx`  
CSS: `packages/core/css/components/joint-panel.css`
