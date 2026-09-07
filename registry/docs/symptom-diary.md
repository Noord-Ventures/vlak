# Symptom diary

A chronological record of supplied symptoms and intensity descriptions, with notes and 44px native detail disclosures.

Category: health  
Name: `symptom-diary`  
Also known as: Symptom journal, Patient diary, Symptom history, Pain diary, Health journal, Patient-reported outcomes  
Page: https://vlak.dev/components/symptom-diary/

## When to use

- Read patient-entered symptom history without converting their descriptions into a diagnosis.
- Supply intensity in words or with a named scale; the component does not create severity categories.
- Use actions for application-owned edit or review controls with accessible names and 44px targets.

## When not to

- Triage, diagnosis or urgency inferred from diary text.
- Assuming a missing diary entry means that no symptom occurred.
- Passing ambiguous timestamps; use ISO timestamps with an explicit offset and timeLabel for display.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { SymptomDiary } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add symptom-diary
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/symptom-diary.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<ol class="rs-symptom-diary" aria-label="Recent symptom entries"><li class="rs-symptom-diary-item">
  <time class="rs-symptom-diary-time" datetime="2026-09-06T09:00:00+02:00">6 Sep, 09:00 CEST</time>
  <div class="rs-symptom-diary-content"><div class="rs-symptom-diary-head"><p class="rs-symptom-diary-symptom">Headache</p><p class="rs-symptom-diary-intensity">Mild, self-reported</p></div><p class="rs-symptom-diary-body">Recorded after breakfast</p><details><summary class="rs-symptom-diary-summary" aria-label="Details for Headache, 6 Sep at 09:00 CEST">Details</summary><p class="rs-symptom-diary-body">No additional context recorded</p></details></div>
</li></ol>
```

## Example

```tsx
import { SymptomDiary } from "@noorddev/vlak-react";

<SymptomDiary aria-label="Recent symptom entries" order="newest" entries={[
  { id: "morning", symptom: "Headache", dateTime: "2026-09-06T09:00:00+02:00", timeLabel: "6 Sep, 09:00 CEST", intensity: "Mild, self-reported", notes: "Recorded after breakfast", details: "No additional context recorded" },
  { id: "evening", symptom: "Fatigue", dateTime: "2026-09-05T18:30:00+02:00", timeLabel: "5 Sep, 18:30 CEST", intensity: "Noticeable, self-reported", notes: "Recorded at the end of the workday" },
]} />
```

## Props

### SymptomDiary

A time-ordered record of supplied symptoms, descriptions and native detail disclosures.

Extends `HTMLAttributes<HTMLOListElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLOListElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `entries` (required) | `readonly SymptomEntry[]` |  |  |
| `emptyLabel` | `string` | `"No symptoms recorded"` |  |
| `order` | `"newest" \| "oldest"` | `"newest"` | Sorts a copy of entries. Equal timestamps retain their supplied order. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Focuses each detail summary and any supplied actions |
| Enter, Space | Opens or closes a focused native detail disclosure |

## Accessibility

- A native ordered list preserves chronological structure. Order defaults to newest first and never mutates the supplied entries.
- Equal timestamps retain input order; invalid timestamps sort last and have no invalid datetime attribute.
- Each disclosure has a unique default name combining symptom and display time; detailsLabel can supply a more precise name.
- Native details and summary provide keyboard toggling. Summaries have 44px targets and a 2px focus ring.
- Intensity and context remain readable text. There are no inferred clinical flags or automatic announcements.

## Classes

`rs-symptom-diary`, `rs-symptom-diary-item`, `rs-symptom-diary-time`, `rs-symptom-diary-content`, `rs-symptom-diary-head`, `rs-symptom-diary-symptom`, `rs-symptom-diary-intensity`, `rs-symptom-diary-body`, `rs-symptom-diary-summary`, `rs-symptom-diary-actions`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/symptom-diary.tsx`  
CSS: `packages/core/css/components/symptom-diary.css`
