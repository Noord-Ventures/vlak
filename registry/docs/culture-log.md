# Culture log

A culture and sample record with supplied medium, conditions, chronological observations and host-owned recording actions.

Category: microbiology  
Name: `culture-log`  
Also known as: Culture notebook, Culture observations, Microbiology log, Culture record, Sample culture history  
Page: https://vlak.dev/components/culture-log/

## When to use

- Review culture identity, sample identity, medium and conditions as supplied by the host.
- Provide offset-bearing timestamps for chronological ordering. Equal timestamps retain their supplied order; missing and invalid timestamps sort after dated observations.
- Supply actions and onAction to request recording changes. Update status or observations only when the host has accepted the change; pending disables actions without changing recorded state.
- Use oldest or newest ordering for at most 256 observations, 32 conditions and 16 actions with unique non-empty identifiers.

## When not to

- Inferring organism identity, contamination, growth interpretation or culture success from a status or observation.
- Generating a culture recipe, an incubation recommendation or a procedure from the displayed conditions.
- Treating a requested recording action as confirmation that a laboratory procedure occurred.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { CultureLog } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add culture-log
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/culture-log.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-culture-log" role="group" aria-label="Culture observations"><div class="rs-culture-log-head"><p class="rs-culture-log-title">Culture observations</p><span class="rs-culture-log-copy">Awaiting record review</span></div><dl class="rs-culture-log-metadata"><div><dt class="rs-culture-log-copy">Culture</dt><dd class="rs-culture-log-value">C-042</dd></div><div><dt class="rs-culture-log-copy">Sample</dt><dd class="rs-culture-log-value">S-042</dd></div><div><dt class="rs-culture-log-copy">Medium</dt><dd class="rs-culture-log-value">Agar medium A</dd></div></dl><ol class="rs-culture-log-list"><li class="rs-culture-log-observation"><time class="rs-culture-log-time" datetime="2026-09-07T09:00:00+02:00">7 September, 09:00</time><div class="rs-culture-log-content"><p class="rs-culture-log-observation-label">Sample record received</p></div></li></ol></div>
```

## Example

```tsx
import { useState } from "react";
import { CultureLog } from "@noorddev/vlak-react";

function CultureRecord() {
  const [reviewed, setReviewed] = useState(false);
  return <CultureLog label="Culture observations" cultureId="C-042" sampleId="S-042" medium="Agar medium A" status={reviewed ? "Record review noted" : "Awaiting record review"} conditions={[{ id: "batch", label: "Medium batch", value: "M-17" }]} observations={[
    { id: "received", label: "Sample record received", dateTime: "2026-09-07T09:00:00+02:00", timeLabel: "7 September, 09:00", status: "Recorded" },
    { id: "image", label: "Plate image attached", dateTime: "2026-09-07T10:30:00+02:00", timeLabel: "7 September, 10:30", status: "Recorded", notes: "Image and source annotations attached" },
  ]} actions={reviewed ? [] : [{ id: "review", label: "Record review" }]} onAction={() => setReviewed(true)} />;
}
```

## Props

### CultureLog

A chronological notebook of supplied culture observations, without protocol recommendations.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` |  |  |
| `cultureId` (required) | `string` |  |  |
| `sampleId` (required) | `string` |  |  |
| `observations` (required) | `readonly CultureObservation[]` |  |  |
| `medium` | `ReactNode` |  |  |
| `status` | `string \| null` |  |  |
| `conditions` | `readonly CultureCondition[]` | `[]` |  |
| `actions` | `readonly CultureAction[]` | `[]` |  |
| `onAction` | `(actionId: string) => void` |  | Requests a host recording action without changing any supplied observation or status. |
| `pending` | `boolean` | `false` |  |
| `order` | `"newest" \| "oldest"` | `"oldest"` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves between supplied links and enabled recording actions. |
| Enter, Space | Requests the focused action through onAction without submitting a surrounding form. |

## Accessibility

- A named group contains a description list for metadata and an ordered list of observations. Every valid dated observation has a native time element.
- Missing times and malformed dates remain explicitly undated. Dates without an offset and impossible calendar dates are not silently reinterpreted.
- Zero-valued conditions remain visible; empty values and non-finite numeric conditions have explicit availability labels. Supplied statuses remain unchanged during pending requests.
- Recording actions have 44px targets and visible focus rings. Their names include the culture identity and their descriptions reference the supplied status.
- Oversized or ambiguous record collections have a visible explanation instead of a partial timeline. The div ref, native attributes, className and style pass through.

## Classes

`rs-culture-log`, `rs-culture-log-head`, `rs-culture-log-title`, `rs-culture-log-copy`, `rs-culture-log-metadata`, `rs-culture-log-value`, `rs-culture-log-list`, `rs-culture-log-observation`, `rs-culture-log-time`, `rs-culture-log-content`, `rs-culture-log-observation-label`, `rs-culture-log-notes`, `rs-culture-log-actions`, `rs-culture-log-action`

## Dependencies

Registry dependencies: [button](button.md).  
React: `packages/react/src/components/culture-log.tsx`  
CSS: `packages/core/css/components/culture-log.css`
