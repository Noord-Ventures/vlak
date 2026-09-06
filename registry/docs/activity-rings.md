# Activity rings

Shows one to six personal goals as concentric rings with a staggered entrance, gentle rotating encouragement, named progress and explicit missing-data states.

Category: health  
Name: `activity-rings`  
Also known as: Activity ring, Fitness rings, Goal rings, Move rings, Wellness progress, Concentric progress  
Page: https://vlak.dev/components/activity-rings/

## When to use

- One activity ring or a compact set of personal movement, routine, or wellness goals.
- Supply goals in outer-to-inner order, with unique ids, labels, amounts, targets, and units.
- Pair with ActivityGoal for a linear progress view of the same data.
- Rings sweep into their supplied values on first view and ease into later updates. Set animate to false for an instant graphic.
- Encouragement picks a different line every ten seconds while visible. Supply your own encouragement strings, one string for a static line, or false to hide it. The first line stays deterministic during server rendering.

## When not to

- Deriving a readiness score, calorie prescription, or recommended target.
- Treating an unrecorded amount as zero. More than six goals retain their text records without a ring graphic.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { ActivityRings } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add activity-rings
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/activity-rings.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<figure class="rs-activity-rings"><figcaption class="rs-activity-rings-caption">Daily activity</figcaption><div class="rs-activity-rings-body"><svg class="rs-activity-rings-graphic" viewBox="0 0 200 200" aria-hidden="true"><g transform="rotate(-90 100 100)"><circle class="rs-activity-rings-track" cx="100" cy="100" r="88" stroke-width="14"/><circle class="rs-activity-rings-arc" cx="100" cy="100" r="88" stroke-width="14" pathLength="100" stroke-dasharray="60 100"/></g></svg><ol class="rs-activity-rings-list" aria-label="Daily activity, outer ring first"><li class="rs-activity-rings-item"><span class="rs-activity-rings-index" aria-hidden="true">01</span><div><p class="rs-activity-rings-label">Walking</p><p class="rs-activity-rings-value">18 <span class="rs-activity-rings-target">of 30 minutes</span></p><progress class="rs-activity-rings-progress" value="18" max="30" aria-label="Walking, ring 1" aria-valuetext="18 of 30 minutes">18 of 30 minutes</progress></div></li></ol></div></figure>
```

## Example

```tsx
import { ActivityRings } from "@noorddev/vlak-react";

<ActivityRings label="Daily activity" goals={[
  { id: "walk", label: "Walking", current: 18, target: 30, unit: "minutes" },
  { id: "move", label: "Movement breaks", current: 5, target: 8, unit: "breaks" },
  { id: "stand", label: "Standing", current: 7, target: 10, unit: "hours" },
]} description="Personal targets, supplied by your application" />
```

## Props

### ActivityRings

Concentric personal-goal progress, with a complete named record for each ring.

Extends `HTMLAttributes<HTMLElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` |  |  |
| `goals` (required) | `readonly ActivityRingGoal[]` |  | One to six goals are drawn from the outside inward. Every goal retains a text record. |
| `description` | `ReactNode` |  |  |
| `animate` | `boolean` | `true` | Sweep each ring into its supplied value on first view. Reduced motion stays instant. |
| `encouragement` | `false \| readonly string[]` | `defaultEncouragement` | Gentle lines rotate every ten seconds without immediate repetition. false hides the line. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves to the encouragement pause control when rotation is available. |
| Enter, Space | Pauses or resumes encouraging text rotation. |

## Accessibility

- Every valid goal has a named native progress element and an explicit amount, target, and unit.
- Concentric geometry is decorative. Visible numbering and outer-to-inner order connect the rings with their text records without relying on hue.
- Zero stays empty, amounts above target retain their actual value, and missing or invalid data has no progress arc.
- The figure forwards its native attributes and ref, and rings remain visible in forced colors. Actual readings and native progress values update immediately throughout the decorative entrance.
- Reduced motion makes ring fills instant and keeps encouragement static. Rotation also pauses while the figure is offscreen or the document is hidden.
- A 44px keyboard-accessible control pauses or resumes rotation. Encouragement has no automatic live announcement; text remains available in the reading order.

## Classes

`rs-activity-rings`, `rs-activity-rings-caption`, `rs-activity-rings-body`, `rs-activity-rings-graphic`, `rs-activity-rings-track`, `rs-activity-rings-arc`, `rs-activity-rings-list`, `rs-activity-rings-item`, `rs-activity-rings-index`, `rs-activity-rings-label`, `rs-activity-rings-value`, `rs-activity-rings-target`, `rs-activity-rings-note`, `rs-activity-rings-description`, `rs-activity-rings-progress`, `rs-activity-rings-motion`, `rs-activity-rings-waiting`, `rs-activity-rings-encouragement`, `rs-activity-rings-encouragement-text`, `rs-activity-rings-pause`, `rs-activity-rings-pause-icon`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/activity-rings.tsx`  
CSS: `packages/core/css/components/activity-rings.css`
