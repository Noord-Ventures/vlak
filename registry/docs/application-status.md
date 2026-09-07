# Application status

Shows a supplied case reference, status, update time, milestones, and next step without estimating progress.

Category: civic  
Name: `application-status`  
Also known as: ApplicationStatus, Case status, Application tracker, Permit status, Claim progress, Case timeline  
Page: https://vlak.dev/components/application-status/

## When to use

- Permit, benefits, tax, and grant cases with supplied status and milestones.
- Supply the current milestone explicitly, preserve source milestone order, and use nextStep for the authority’s actual instruction.

## When not to

- Predicting approval, calculating completion percentages, or choosing the current step from dates.
- Presenting estimated service times as confirmed decision dates.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { ApplicationStatus } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add application-status
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/application-status.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-application-status" role="group" aria-label="Community grant application"><div class="rs-application-status-header"><p class="rs-application-status-title">Community grant application</p><span class="rs-application-status-reference">Example 204</span></div><div class="rs-application-status-overview"><p class="rs-application-status-status">Under review</p><p class="rs-application-status-detail">Updated 14 September, as supplied</p></div><ol class="rs-application-status-milestones" aria-label="Application milestones"><li class="rs-application-status-milestone rs-application-status-current" aria-current="step"><span class="rs-application-status-milestone-label">Evidence review</span><span class="rs-application-status-milestone-meta">In progress</span></li></ol><div class="rs-application-status-next"><p class="rs-application-status-next-label">Next step</p><div>Wait for the review update</div></div></div>
```

## Example

```tsx
import { ApplicationStatus } from "@noorddev/vlak-react";

<ApplicationStatus applicationTitle="Community grant application" reference="Example 204" status="Under review" updatedLabel="Updated 14 September, as supplied" milestones={[{ id: "received", label: "Application received", status: "Recorded", dateLabel: "12 September" }, { id: "review", label: "Evidence review", status: "In progress", current: true }]} nextStep="Wait for the review update" />
```

## Props

### ApplicationStatus

A case reference, explicit decision status, and supplied milestones with no inferred progress.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `applicationTitle` (required) | `string` |  |  |
| `reference` | `ReactNode` |  |  |
| `status` (required) | `ReactNode` |  |  |
| `statusDetail` | `ReactNode` |  |  |
| `updatedLabel` | `ReactNode` |  |  |
| `milestones` (required) | `readonly ApplicationMilestone[]` |  |  |
| `nextStep` | `ReactNode` |  |  |
| `milestonesEmptyLabel` | `ReactNode` | `"Application milestones not supplied"` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Enter, Space | Any supplied child links or buttons keep their native keyboard behavior. Milestones are not interactive. |

## Accessibility

- An ordered, named list preserves milestone order. Explicit current milestones use aria-current=step and a full-surface fill.
- Status and dates are readable text. Optional machine-readable milestone dates are passed through without conversion.
- Missing reference, update time, milestone dates, milestones, and next step have explicit descriptions.
- The root forwards native div attributes and its ref. Use at least 44px targets for supplied actions.

## Classes

`rs-application-status`, `rs-application-status-header`, `rs-application-status-title`, `rs-application-status-reference`, `rs-application-status-overview`, `rs-application-status-status`, `rs-application-status-detail`, `rs-application-status-milestones`, `rs-application-status-milestone`, `rs-application-status-current`, `rs-application-status-milestone-label`, `rs-application-status-milestone-meta`, `rs-application-status-next`, `rs-application-status-next-label`, `rs-application-status-actions`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/application-status.tsx`  
CSS: `packages/core/css/components/application-status.css`
