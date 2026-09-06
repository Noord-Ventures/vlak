# Benefit program

Keeps programme availability, supplied eligibility, award terms, and criterion assessments separate.

Category: civic  
Name: `benefit-program`  
Also known as: BenefitProgram, Grant programme, Subsidy card, Public benefit, Funding opportunity, Eligibility summary  
Page: https://vlak.dev/components/benefit-program/

## When to use

- Public benefits, grants, subsidies, and funding opportunities with source-owned eligibility assessments.
- Display programme availability separately from an applicant’s eligibility and the programme’s award terms.

## When not to

- Deciding eligibility from criteria, personal data, income, or a model-generated recommendation.
- Implying an award is approved because applications are open or some criteria are satisfied.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { BenefitProgram } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add benefit-program
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/benefit-program.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-benefit-program" role="group" aria-label="Community project grant"><div class="rs-benefit-program-header"><p class="rs-benefit-program-name">Community project grant</p><span class="rs-benefit-program-status">Applications open</span></div><dl class="rs-benefit-program-facts"><div class="rs-benefit-program-field"><dt class="rs-benefit-program-label">Your eligibility</dt><dd class="rs-benefit-program-value">Not assessed</dd></div><div class="rs-benefit-program-field"><dt class="rs-benefit-program-label">Award</dt><dd class="rs-benefit-program-value">Award amount not supplied</dd></div></dl><ul class="rs-benefit-program-criteria" aria-label="Eligibility criteria"><li class="rs-benefit-program-criterion"><div class="rs-benefit-program-criterion-head"><strong>Project location</strong><span>Not reviewed</span></div></li></ul></div>
```

## Example

```tsx
import { BenefitProgram } from "@noorddev/vlak-react";

<BenefitProgram programName="Community project grant" provider="Example council" status="Applications open" eligibility="Not assessed" awardLabel="Award amount not supplied" deadlineLabel="30 September 2026, as supplied" criteria={[{ id: "location", label: "Project location", status: "Not reviewed", description: "Location evidence is reviewed by the provider" }]} />
```

## Props

### BenefitProgram

Programme availability, supplied eligibility, and award terms kept as distinct facts.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `programName` (required) | `string` |  |  |
| `provider` | `ReactNode` |  |  |
| `status` (required) | `ReactNode` |  | Supplied programme availability, separate from a person's eligibility. |
| `eligibility` (required) | `ReactNode` |  |  |
| `awardLabel` | `ReactNode` |  |  |
| `awardDetails` | `ReactNode` |  |  |
| `deadlineLabel` | `ReactNode` |  |  |
| `criteria` (required) | `readonly BenefitProgramCriterion[]` |  |  |
| `description` | `ReactNode` |  |  |
| `criteriaEmptyLabel` | `ReactNode` | `"Eligibility criteria not supplied"` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Enter, Space | Supplied action links and buttons use native keyboard behavior. Criteria are static readable items. |

## Accessibility

- Programme name labels a group; programme facts use a description list and criteria use a named list.
- Eligibility, criterion status, and programme availability are visible text rather than color-only indicators.
- Missing provider, award, deadline, or criteria are explicitly described. Native root attributes and div refs pass through.
- Provide working child controls with at least 44px targets when an application or information action is available.

## Classes

`rs-benefit-program`, `rs-benefit-program-header`, `rs-benefit-program-name`, `rs-benefit-program-status`, `rs-benefit-program-detail`, `rs-benefit-program-facts`, `rs-benefit-program-field`, `rs-benefit-program-label`, `rs-benefit-program-value`, `rs-benefit-program-criteria`, `rs-benefit-program-criterion`, `rs-benefit-program-criterion-head`, `rs-benefit-program-actions`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/benefit-program.tsx`  
CSS: `packages/core/css/components/benefit-program.css`
