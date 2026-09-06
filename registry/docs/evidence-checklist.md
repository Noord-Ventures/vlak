# Evidence checklist

Lists evidence requirements, file records, and supplied verification status with controlled 44px action buttons.

Category: civic  
Name: `evidence-checklist`  
Also known as: EvidenceChecklist, Document checklist, Supporting documents, Evidence requirements, Application documents, Verification checklist  
Page: https://vlak.dev/components/evidence-checklist/

## When to use

- Evidence requirements for permits, grants, benefits, and identity checks.
- Provide explicit actions for working uploads, downloads, replacements, or record changes through the host callback.

## When not to

- Marking evidence accepted from a filename or a button click, or inferring requirements from missing values.
- Treating uploads as submitted before the host confirms them, or rendering dead action buttons without a callback.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { EvidenceChecklist } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add evidence-checklist
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/evidence-checklist.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-evidence-checklist" role="group" aria-label="Application evidence"><p class="rs-evidence-checklist-heading">Application evidence</p><ul class="rs-evidence-checklist-list"><li class="rs-evidence-checklist-item"><div class="rs-evidence-checklist-head"><p class="rs-evidence-checklist-label">Proof of address</p><span class="rs-evidence-checklist-requirement">Required by the provider</span></div><div class="rs-evidence-checklist-record">Example-address.pdf</div><div class="rs-evidence-checklist-status" role="status">Awaiting review</div></li></ul></div>
```

## Example

```tsx
import { EvidenceChecklist } from "@noorddev/vlak-react";

<EvidenceChecklist label="Application evidence" items={[{ id: "address", label: "Proof of address", requirement: "Required by the provider", fileName: "Example-address.pdf", status: "Awaiting review" }]} />

// To enable actions, supply item.actions and onAction(itemId, actionId).
// The host performs uploads or changes and supplies pending and updated status.
```

## Props

### EvidenceChecklist

Evidence requirements, file records, and verification status with controlled action requests.

Extends `Omit<HTMLAttributes<HTMLDivElement>, "onAction">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` |  |  |
| `items` (required) | `readonly EvidenceChecklistItem[]` |  |  |
| `summary` | `ReactNode` |  | Application-supplied coverage summary; the component does not count approvals. |
| `emptyLabel` | `ReactNode` | `"Evidence requirements not supplied"` |  |
| `onAction` | `(itemId: string, actionId: string) => void` |  | Requests an action only; uploads, removals, and resulting statuses belong to the caller. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves between enabled evidence action buttons when onAction and item actions are supplied. |
| Enter, Space | Requests the focused item action without mutating the displayed record. Pending or disabled actions cannot be activated. |

## Accessibility

- Action names contain the visible label and evidence name; descriptions include requirement, file record, and supplied status.
- Record status uses a polite atomic status region. Pending text remains visible and actionable controls are disabled without hiding the existing status.
- No checkboxes or completion percentage are invented from verification status. Missing requirements or file details are explicitly labelled.
- Buttons have at least 44px targets. Native root attributes, className, style, and div refs pass through.

## Classes

`rs-evidence-checklist`, `rs-evidence-checklist-heading`, `rs-evidence-checklist-summary`, `rs-evidence-checklist-list`, `rs-evidence-checklist-item`, `rs-evidence-checklist-head`, `rs-evidence-checklist-label`, `rs-evidence-checklist-requirement`, `rs-evidence-checklist-detail`, `rs-evidence-checklist-record`, `rs-evidence-checklist-status`, `rs-evidence-checklist-actions`, `rs-evidence-checklist-action`, `rs-evidence-checklist-empty`

## Dependencies

Registry dependencies: [button](button.md).  
React: `packages/react/src/components/evidence-checklist.tsx`  
CSS: `packages/core/css/components/evidence-checklist.css`
