import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";

export interface AppointmentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  appointmentTitle: string;
  dateLabel: React.ReactNode;
  timeLabel: React.ReactNode;
  /** Supplied display timezone; the component performs no date conversion. */
  timeZone: React.ReactNode;
  dateTime?: string;
  clinician?: React.ReactNode;
  location?: React.ReactNode;
  status: React.ReactNode;
  /** Actual links or buttons whose actions are owned by the application. */
  children?: React.ReactNode;
}

const styles = stylex.create({
  root: { boxSizing: "border-box", width: "100%", minWidth: 0, padding: "1.25rem", color: vlak.ink, backgroundColor: vlak.paper, borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.divider, display: "flex", flexDirection: "column", gap: "1.25rem", overflowWrap: "anywhere", lineHeight: 1.45 },
  header: { display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: "0.75rem" },
  title: { margin: 0, fontSize: "1.125rem", fontWeight: 600, lineHeight: 1.3, letterSpacing: "-0.025em" },
  status: { fontSize: "0.75rem", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.divider, padding: "0.25rem 0.5rem" },
  when: { display: "flex", flexDirection: "column", gap: "0.25rem", fontVariantNumeric: "tabular-nums" },
  date: { fontSize: "1.375rem", fontWeight: 500, letterSpacing: "-0.025em" },
  time: { fontSize: "0.875rem", color: vlak.gray },
  details: { margin: 0, display: "grid", gridTemplateColumns: { default: "repeat(2, minmax(0, 1fr))", [mq.phone]: "minmax(0, 1fr)" }, gap: "1rem" },
  field: { minWidth: 0 },
  label: { margin: 0, color: vlak.gray, fontSize: "0.75rem" },
  value: { margin: 0, marginTop: "0.25rem", fontSize: "0.875rem" },
  actions: { display: "flex", flexWrap: "wrap", gap: "0.5rem", borderTopWidth: vlak.hairline, borderTopStyle: "solid", borderTopColor: vlak.divider, paddingTop: "1rem" },
});

/** Appointment details exactly as supplied, with an application-owned action slot. */
export const AppointmentCard = React.forwardRef<HTMLDivElement, AppointmentCardProps>(function AppointmentCard(
  { appointmentTitle, dateLabel, timeLabel, timeZone, dateTime, clinician, location, status, children, className, style, ...props }, ref,
) {
  const root = rs(["rs-appointment-card", className], styles.root);
  const header = rs(["rs-appointment-card-header"], styles.header);
  const title = rs(["rs-appointment-card-title"], styles.title);
  const statusStyle = rs(["rs-appointment-card-status"], styles.status);
  const when = rs(["rs-appointment-card-when"], styles.when);
  const date = rs(["rs-appointment-card-date"], styles.date);
  const time = rs(["rs-appointment-card-time"], styles.time);
  const details = rs(["rs-appointment-card-details"], styles.details);
  const field = rs(["rs-appointment-card-field"], styles.field);
  const label = rs(["rs-appointment-card-label"], styles.label);
  const value = rs(["rs-appointment-card-value"], styles.value);
  const actions = rs(["rs-appointment-card-actions"], styles.actions);
  return <div ref={ref} role="group" aria-label={appointmentTitle} {...props} className={root.className} style={{ ...root.style, ...style }}>
    <div {...header}><p {...title}>{appointmentTitle}</p><span {...statusStyle}>{status}</span></div>
    <div {...when}>
      {dateTime ? <time {...date} dateTime={dateTime}>{dateLabel}</time> : <span {...date}>{dateLabel}</span>}
      <span {...time}>{timeLabel} · {timeZone}</span>
    </div>
    <dl {...details}>
      <div {...field}><dt {...label}>Clinician</dt><dd {...value}>{clinician ?? "Clinician not supplied"}</dd></div>
      <div {...field}><dt {...label}>Location</dt><dd {...value}>{location ?? "Location not supplied"}</dd></div>
    </dl>
    {children != null && <div {...actions}>{children}</div>}
  </div>;
});
