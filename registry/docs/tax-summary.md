# Tax summary

Separates supplied assessment line items from authoritative totals in a semantic two-column table.

Category: civic  
Name: `tax-summary`  
Also known as: TaxSummary, Tax assessment, Assessment statement, Municipal charges, Tax bill, Refund statement  
Page: https://vlak.dev/components/tax-summary/

## When to use

- Tax assessments, municipal charges, and other supplied statements with separate line items and totals.
- Pass fully formatted amounts, signs, currencies, period, payment timing, and status from the authoritative source.

## When not to

- Computing taxes, estimating refunds, summing amounts, or assuming a missing total is zero.
- Generating a payment action or deadline without an application-owned destination or supplied terms.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { TaxSummary } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add tax-summary
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/tax-summary.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-tax-summary" role="group" aria-label="Annual assessment"><div class="rs-tax-summary-header"><span class="rs-tax-summary-status">Provisional</span><span class="rs-tax-summary-reference">Example 204</span></div><table class="rs-tax-summary-table"><caption class="rs-tax-summary-caption">Annual assessment<span class="rs-tax-summary-period">2025</span></caption><thead><tr><th scope="col" class="rs-tax-summary-column">Item</th><th scope="col" class="rs-tax-summary-amount">Amount</th></tr></thead><tbody><tr><th scope="row" class="rs-tax-summary-row-label">Assessed amount</th><td class="rs-tax-summary-amount">€ 240.00</td></tr></tbody><tfoot><tr class="rs-tax-summary-total"><th scope="row" class="rs-tax-summary-row-label">Amount payable</th><td class="rs-tax-summary-amount">€ 240.00</td></tr></tfoot></table></div>
```

## Example

```tsx
import { TaxSummary } from "@noorddev/vlak-react";

<TaxSummary label="Annual assessment" periodLabel="2025" reference="Example 204" status="Provisional" items={[{ id: "assessment", label: "Assessed amount", amount: "€ 240.00", detail: "Supplied by the example authority" }]} totals={[{ id: "payable", label: "Amount payable", amount: "€ 240.00" }]} dueLabel="Payment date not supplied" note="Fictional amounts; no tax calculation is performed" />
```

## Props

### TaxSummary

A supplied assessment with distinct line items and authoritative totals.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` |  |  |
| `periodLabel` (required) | `ReactNode` |  |  |
| `reference` | `ReactNode` |  |  |
| `status` (required) | `ReactNode` |  |  |
| `items` (required) | `readonly TaxSummaryItem[]` |  |  |
| `totals` (required) | `readonly TaxSummaryTotal[]` |  |  |
| `dueLabel` | `ReactNode` |  |  |
| `note` | `ReactNode` |  |  |
| `itemsEmptyLabel` | `ReactNode` | `"Assessment lines not supplied"` |  |
| `totalsEmptyLabel` | `ReactNode` | `"Totals not supplied"` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Enter, Space | Only supplied child controls enter the tab order and retain native keyboard behavior. |

## Accessibility

- A caption names the table; scope attributes associate row and column headers with amount cells.
- Line items use tbody and supplied totals use tfoot. Amounts remain literal readable text.
- Missing line items, totals, reference, and timing have explicit text. No numeric or financial status is inferred.
- Native div attributes and refs pass through; child action targets should be at least 44px.

## Classes

`rs-tax-summary`, `rs-tax-summary-header`, `rs-tax-summary-status`, `rs-tax-summary-reference`, `rs-tax-summary-table`, `rs-tax-summary-caption`, `rs-tax-summary-period`, `rs-tax-summary-column`, `rs-tax-summary-row-label`, `rs-tax-summary-amount`, `rs-tax-summary-detail`, `rs-tax-summary-total`, `rs-tax-summary-footer`, `rs-tax-summary-note`, `rs-tax-summary-actions`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/tax-summary.tsx`  
CSS: `packages/core/css/components/tax-summary.css`
