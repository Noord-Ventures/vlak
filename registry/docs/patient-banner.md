# Patient banner

Keeps a supplied patient identity, identifiers, and recorded context together in a responsive band.

Category: health  
Name: `patient-banner`  
Also known as: PatientBanner, Patient header, Patient summary, Clinical context, EHR header  
Page: https://vlak.dev/components/patient-banner/

## When to use

- Patient record headers and care workspaces where identity and recorded context must stay together.
- Supply explicit values such as Unknown, Not reviewed, or None recorded according to the actual source record.

## When not to

- Inferring age from a birth date or treating missing context as no allergies.
- Urgent notifications that need a live announcement; the banner is static context.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { PatientBanner } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add patient-banner
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/patient-banner.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-patient-banner" role="group" aria-label="Robin Ellis"><p class="rs-patient-banner-name">Robin Ellis</p><dl class="rs-patient-banner-identifiers"><div class="rs-patient-banner-field"><dt class="rs-patient-banner-label">Patient ID</dt><dd class="rs-patient-banner-value">Demo 042</dd></div></dl><dl class="rs-patient-banner-context"><div class="rs-patient-banner-field"><dt class="rs-patient-banner-label">Allergies</dt><dd class="rs-patient-banner-value">Not reviewed</dd></div></dl></div>
```

## Example

```tsx
import { PatientBanner } from "@noorddev/vlak-react";

<PatientBanner patientName="Robin Ellis" identifiers={[{ id: "record", label: "Patient ID", value: "Demo 042" }]} contextItems={[{ id: "allergies", label: "Allergies", value: "Not reviewed" }, { id: "language", label: "Preferred language", value: "English, as recorded" }]} />
```

## Props

### PatientBanner

A supplied patient identity and explicitly recorded context, without clinical inference.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `patientName` (required) | `string` |  | Caller-supplied identity. No age or other demographic values are inferred. |
| `identifiers` | `readonly PatientBannerIdentifier[]` | `[]` |  |
| `contextItems` | `readonly PatientBannerContextItem[]` | `[]` |  |
| `identifiersEmptyLabel` | `ReactNode` | `"Identifiers not supplied"` |  |
| `contextEmptyLabel` | `ReactNode` | `"Patient context not supplied"` | Missing context never means that no allergies or alerts exist. |

## Keyboard

| Keys | Does |
| --- | --- |
| None | Static identity and description lists add no keyboard stop. Any supplied child controls keep their native behavior. |

## Accessibility

- The patient name labels a group; identifiers and context use dl, dt, and dd in reading order.
- Unknown and none-recorded distinctions are supplied as visible text. Empty defaults describe missing data without making clinical claims.
- The root forwards its div ref, native attributes, className, and style.

## Classes

`rs-patient-banner`, `rs-patient-banner-name`, `rs-patient-banner-identifiers`, `rs-patient-banner-field`, `rs-patient-banner-label`, `rs-patient-banner-value`, `rs-patient-banner-context`, `rs-patient-banner-missing`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/patient-banner.tsx`  
CSS: `packages/core/css/components/patient-banner.css`
