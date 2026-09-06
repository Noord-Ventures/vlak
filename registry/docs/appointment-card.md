# Appointment card

Groups supplied appointment time, timezone, clinician, location, and status with an optional action slot.

Category: health  
Name: `appointment-card`  
Also known as: AppointmentCard, Visit card, Booking card, Care appointment, Consultation details  
Page: https://vlak.dev/components/appointment-card/

## When to use

- Confirmed, proposed, cancelled, or otherwise explicitly supplied appointments.
- Add real links or buttons as children when navigation or an action is available.

## When not to

- Inferring confirmation, converting timezones, or deriving a relative date from the system clock.
- Rendering placeholder Join, Cancel, or Reschedule buttons without working actions.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { AppointmentCard } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add appointment-card
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/appointment-card.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-appointment-card" role="group" aria-label="Care team check-in"><div class="rs-appointment-card-header"><p class="rs-appointment-card-title">Care team check-in</p><span class="rs-appointment-card-status">Confirmed</span></div><div class="rs-appointment-card-when"><span class="rs-appointment-card-date">18 September 2026</span><span class="rs-appointment-card-time">10:30–11:00 · Europe/Amsterdam, UTC+02:00</span></div><dl class="rs-appointment-card-details"><div class="rs-appointment-card-field"><dt class="rs-appointment-card-label">Clinician</dt><dd class="rs-appointment-card-value">Alex Morgan</dd></div><div class="rs-appointment-card-field"><dt class="rs-appointment-card-label">Location</dt><dd class="rs-appointment-card-value">Room 04, demo clinic</dd></div></dl></div>
```

## Example

```tsx
import { AppointmentCard } from "@noorddev/vlak-react";

<AppointmentCard appointmentTitle="Care team check-in" dateLabel="18 September 2026" timeLabel="10:30–11:00" timeZone="Europe/Amsterdam, UTC+02:00" dateTime="2026-09-18T10:30:00+02:00" clinician="Alex Morgan" location="Room 04, demo clinic" status="Confirmed" />

// Supply children for real navigation links or application-owned actions.
```

## Props

### AppointmentCard

Appointment details exactly as supplied, with an application-owned action slot.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `appointmentTitle` (required) | `string` |  |  |
| `dateLabel` (required) | `ReactNode` |  |  |
| `timeLabel` (required) | `ReactNode` |  |  |
| `timeZone` (required) | `ReactNode` |  | Supplied display timezone; the component performs no date conversion. |
| `dateTime` | `string` |  |  |
| `clinician` | `ReactNode` |  |  |
| `location` | `ReactNode` |  |  |
| `status` (required) | `ReactNode` |  |  |
| `children` | `ReactNode` |  | Actual links or buttons whose actions are owned by the application. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Enter, Space | Supplied links and buttons retain their native keyboard interactions. The card adds no tab stop. |

## Accessibility

- Appointment title names a group. Date, time, timezone, and status are text; clinician and location use a description list.
- Missing clinician and location are explicitly labelled as not supplied.
- Use native action controls with accessible names and at least 44px targets in the children slot.
- Native root attributes and the div ref pass through. The caller owns status updates and announcements.

## Classes

`rs-appointment-card`, `rs-appointment-card-header`, `rs-appointment-card-title`, `rs-appointment-card-status`, `rs-appointment-card-when`, `rs-appointment-card-date`, `rs-appointment-card-time`, `rs-appointment-card-details`, `rs-appointment-card-field`, `rs-appointment-card-label`, `rs-appointment-card-value`, `rs-appointment-card-actions`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/appointment-card.tsx`  
CSS: `packages/core/css/components/appointment-card.css`
