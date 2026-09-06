# Civic

Components for public services, identity records, tax summaries, benefits, and applications.

## Identity and obligations

Keep the record holder, issuer, reporting period, and supplied status together.

- [Identity document](https://vlak.dev/docs/identity-document.md): Displays a supplied credential, masked identifier, issuer, dates, and verification status without exposing a raw identifier.
- [Tax summary](https://vlak.dev/docs/tax-summary.md): Separates supplied assessment line items from authoritative totals in a semantic two-column table.

## Access to services

Explain a programme, follow an application, and collect the required evidence with explicit submission states.

- [Benefit program](https://vlak.dev/docs/benefit-program.md): Keeps programme availability, supplied eligibility, award terms, and criterion assessments separate.
- [Application status](https://vlak.dev/docs/application-status.md): Shows a supplied case reference, status, update time, milestones, and next step without estimating progress.
- [Evidence checklist](https://vlak.dev/docs/evidence-checklist.md): Lists evidence requirements, file records, and supplied verification status with controlled 44px action buttons.

## Data and action contracts

### Supply policy decisions

The service supplies eligibility assessments, amounts, deadlines, and decisions. Components do not calculate tax or determine entitlement to a subsidy.

### Display only the identity detail needed

Pass a display-safe masked identifier. Keep full identity records, document verification, and access rules in the host application.

### Separate a request from its result

Evidence actions request work from the application. Show pending while saving, confirmed receipt after success, and an actionable error when it fails.

### Preserve the public record

Supply the authority, reference, period, dates, and reasons that belong to the record. Missing, unavailable, and zero amounts retain distinct meanings. Examples use fictional services and records.

## Install

```sh
npm install @noorddev/vlak-react
# Or vendor an individual component
npx @noorddev/vlak-cli add identity-document
```
