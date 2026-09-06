# Identity document

Displays a supplied credential, masked identifier, issuer, dates, and verification status without exposing a raw identifier.

Category: civic  
Name: `identity-document`  
Also known as: IdentityDocument, Credential record, Identity card, Residence permit, Identity verification, Document summary  
Page: https://vlak.dev/components/identity-document/

## When to use

- Identity documents, professional credentials, and permit records using an already-masked display identifier.
- Supply verification status and date labels from the host; add real links or actions as children.

## When not to

- Passing a full identifier and expecting this component to redact it. It renders maskedIdentifier exactly as supplied.
- Inferring validity from an expiry date, or providing a cosmetic reveal button without an authorized source.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { IdentityDocument } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add identity-document
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/identity-document.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-identity-document" role="group" aria-label="Residence document"><div class="rs-identity-document-header"><p class="rs-identity-document-title">Residence document</p><span class="rs-identity-document-status">Verification pending</span></div><p class="rs-identity-document-holder">Robin Ellis</p><dl class="rs-identity-document-fields"><div class="rs-identity-document-field"><dt class="rs-identity-document-label">Document number</dt><dd class="rs-identity-document-value">•••• 2048</dd></div></dl></div>
```

## Example

```tsx
import { IdentityDocument } from "@noorddev/vlak-react";

<IdentityDocument documentTitle="Residence document" holderName="Robin Ellis" maskedIdentifier="•••• 2048" issuer="Example civic office" issuedLabel="12 June 2025" expiresLabel="12 June 2030" status="Verification pending" statusDetail="Status supplied by the example record service" />
```

## Props

### IdentityDocument

A credential record using only the supplied, display-safe identity information.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `documentTitle` (required) | `string` |  |  |
| `holderName` (required) | `ReactNode` |  |  |
| `maskedIdentifier` | `string \| null` |  | A display-safe, already-masked identifier. This component does not mask raw data. |
| `identifierLabel` | `string` | `"Document number"` |  |
| `issuer` | `ReactNode` |  |  |
| `issuedLabel` | `ReactNode` |  |  |
| `expiresLabel` | `ReactNode` |  |  |
| `status` (required) | `ReactNode` |  | Supplied record or verification status. Expiry is never calculated. |
| `statusDetail` | `ReactNode` |  |  |
| `children` | `ReactNode` |  | Working links or application-owned actions. No reveal or copy action is generated. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Enter, Space | Supplied native links and buttons keep their keyboard behavior. The document adds no tab stop. |

## Accessibility

- A named group and description list preserve document fields in reading order.
- Missing identifier, issuer, and dates are explicitly labelled as not supplied. Status is visible text.
- Root attributes, className, style, and the div ref pass through. Supply child controls with at least 44px targets.

## Classes

`rs-identity-document`, `rs-identity-document-header`, `rs-identity-document-title`, `rs-identity-document-status`, `rs-identity-document-holder`, `rs-identity-document-fields`, `rs-identity-document-field`, `rs-identity-document-label`, `rs-identity-document-value`, `rs-identity-document-detail`, `rs-identity-document-actions`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/identity-document.tsx`  
CSS: `packages/core/css/components/identity-document.css`
