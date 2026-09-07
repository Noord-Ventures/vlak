# Design rule results

Supplied board-check violations with severity and status filters, object and location details, and host-confirmed selection and resolution actions.

Category: electronics  
Name: `design-rule-results`  
Also known as: Board rule check, Circuit board violations, Clearance results, Design-rule review, Board verification results  
Page: https://vlak.dev/components/design-rule-results/

## When to use

- Reviewing a bounded set of results supplied by a board design-rule checker.
- Supply unique result ids, the confirmed severity and status, and any available layer, net, object and location records. Null severity or status means unknown.
- onSelect requests host selection; selectedId confirms it. onResolve requests resolution of an open result unless canResolve is false. Pending and disabled records cannot invoke actions.
- Use filter and onFilterChange for host-owned filters; uncontrolled filters start from defaultFilter. Named filters submit as name.severity and name.status.

## When not to

- Treating an action click as a resolved board defect or treating an excluded result as resolved.
- Inferring that an empty result array means a check ran or passed. The component does not run rules, edit the board or invent clearance limits.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { DesignRuleResults } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add design-rule-results
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/design-rule-results.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<fieldset class="rs-design-rule-results"><legend class="rs-design-rule-results-legend">Reported design rules</legend><p class="rs-design-rule-results-note">Synthetic check run 042</p><ul class="rs-design-rule-results-list"><li class="rs-design-rule-results-item"><p class="rs-design-rule-results-title">Copper clearance</p><dl class="rs-design-rule-results-properties"><div><dt class="rs-design-rule-results-term">Severity</dt><dd class="rs-design-rule-results-detail">Error</dd></div><div><dt class="rs-design-rule-results-term">Confirmed status</dt><dd class="rs-design-rule-results-detail">Open</dd></div><div><dt class="rs-design-rule-results-term">Layer</dt><dd class="rs-design-rule-results-detail">Front copper</dd></div><div><dt class="rs-design-rule-results-term">Location</dt><dd class="rs-design-rule-results-detail">X: 24.5, Y: 18; unit: mm</dd></div></dl></li></ul></fieldset>
```

## Example

```tsx
import { DesignRuleResults } from "@noorddev/vlak-react";

<DesignRuleResults label="Reported design rules" runLabel="Synthetic check run 042" violations={[
  { id: "clearance-1", title: "Copper clearance", severity: "error", status: "open", rule: "Supplied clearance rule", layer: "Front copper", net: "Supply", location: { x: 24.5, y: 18, unit: "mm" }, objects: ["J1 pad 1", "Track 17"] },
  { id: "label-2", title: "Silkscreen overlap", severity: "warning", status: "excluded", layer: "Front silkscreen", objects: ["J1 reference", "J1 outline"] },
]} />
```

## Props

### DesignRuleResults

Supplied rule-check outcomes with local or controlled filters and host-confirmed actions.

Extends `Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "onSelect">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLFieldSetElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `ReactNode` |  |  |
| `violations` (required) | `readonly DesignRuleViolation[]` |  |  |
| `filter` | `DesignRuleFilter` |  |  |
| `defaultFilter` | `DesignRuleFilter` | `initial` |  |
| `onFilterChange` | `(filter: DesignRuleFilter) => void` |  |  |
| `selectedId` | `string \| null` |  |  |
| `onSelect` | `(id: string) => void` |  | Requests selection in the host board viewer; selectedId remains host-owned. |
| `onResolve` | `(id: string) => void` |  | Requests resolution of an open result. Confirmed status never changes locally. |
| `runLabel` | `ReactNode` |  |  |
| `description` | `ReactNode` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves through the Vlak filter selectors and available action buttons. |
| Arrow keys, Home, End | Navigates a focused filter's choices. |
| Enter, Space | Chooses a filter or requests the focused selection or resolution action. |
| Escape | Closes an open filter selector. |

## Accessibility

- A fieldset legend names the results. Vlak Select and Button provide shared control paint, focus states and 44px targets.
- Visible description lists distinguish reported severity, confirmed status, layer, net and coordinate units. Action names include the unique result id and title.
- The polite count distinguishes filtered results from the complete supplied set. Empty results and unmatched filters use different messages.
- Selected records use a full-surface fill and Selected text. Pending actions keep confirmed data readable and disable the action controls.
- Native form reset restores uncontrolled filters; controlled filters remain with the application. Disabled fieldsets omit filter values and block actions.
- The fieldset ref, native attributes, className and style pass through.

## Classes

`rs-design-rule-results`, `rs-design-rule-results-legend`, `rs-design-rule-results-filters`, `rs-design-rule-results-label`, `rs-design-rule-results-control`, `rs-design-rule-results-list`, `rs-design-rule-results-item`, `rs-design-rule-results-selected`, `rs-design-rule-results-title`, `rs-design-rule-results-properties`, `rs-design-rule-results-term`, `rs-design-rule-results-detail`, `rs-design-rule-results-actions`, `rs-design-rule-results-action`, `rs-design-rule-results-note`

## Dependencies

Registry dependencies: [select](select.md), [button](button.md).  
React: `packages/react/src/components/design-rule-results.tsx`  
CSS: `packages/core/css/components/design-rule-results.css`
