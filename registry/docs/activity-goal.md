# Activity goal

Shows a supplied activity amount and target with native progress, visible units, and distinct missing-data states.

Category: health  
Name: `activity-goal`  
Also known as: ActivityGoal, Activity progress, Movement goal, Hydration goal, Step goal, Wellness goal  
Page: https://vlak.dev/components/activity-goal/

## When to use

- Movement, hydration, or another activity with a caller-supplied amount, unit, and positive target.
- null for missing current data or an unset target; zero remains a valid recorded amount.
- Actual values above the target remain visible while the native bar stops at its maximum.

## When not to

- Adding default health recommendations or interpreting goal completion as a clinical outcome.
- An indeterminate loading state; missing data is explicitly labelled and has no progress bar.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { ActivityGoal } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add activity-goal
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/activity-goal.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-activity-goal"><p class="rs-activity-goal-label" id="walking-goal">Walking</p><p class="rs-activity-goal-description">Your personal goal for today</p><p class="rs-activity-goal-value">24 <span class="rs-activity-goal-target">of 30 min</span></p><progress class="rs-activity-goal-progress" value="24" max="30" aria-labelledby="walking-goal" aria-valuetext="24 of 30 min">24 of 30 min</progress></div>
```

## Example

```tsx
import { ActivityGoal } from "@noorddev/vlak-react";

<ActivityGoal label="Walking" description="Your personal goal for today" current={24} target={30} unit="min" />
<ActivityGoal label="Water recorded" current={null} target={null} unit="ml" />
```

## Props

### ActivityGoal

Progress toward a supplied activity goal, without recommended targets or scores.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `ReactNode` |  |  |
| `description` | `ReactNode` |  |  |
| `current` (required) | `number \| null` |  | A supplied amount. null means no recorded amount; zero is a valid record. |
| `target` (required) | `number \| null` |  | A positive caller-owned goal. null means no goal has been set. |
| `unit` (required) | `string` |  |  |

## Accessibility

- The native progress element is named by the visible label, aria-label, or aria-labelledby; aria-valuetext includes the actual amount, target, and unit.
- Missing, non-finite, negative amounts and non-positive targets have explicit text states and never produce a misleading bar or NaN attributes.
- Goal reached and goal exceeded remain text, with no color-only completion signal.
- The forwarded ref and native attributes reach the root div; descriptions are linked to progress.

## Classes

`rs-activity-goal`, `rs-activity-goal-label`, `rs-activity-goal-description`, `rs-activity-goal-value`, `rs-activity-goal-target`, `rs-activity-goal-progress`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/activity-goal.tsx`  
CSS: `packages/core/css/components/activity-goal.css`
