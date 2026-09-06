import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";

export interface ActivityRingGoal {
  id: string;
  label: string;
  /** A recorded amount; null is unrecorded and zero is valid. */
  current: number | null;
  /** A positive personal target supplied by the application. */
  target: number | null;
  unit: string;
}

export interface ActivityRingsProps extends React.HTMLAttributes<HTMLElement> {
  label: string;
  /** One to six goals are drawn from the outside inward. Every goal retains a text record. */
  goals: readonly ActivityRingGoal[];
  description?: React.ReactNode;
}

const styles = stylex.create({
  root: { margin: 0, width: "100%", minWidth: 0, color: vlak.ink, lineHeight: 1.45 },
  caption: { display: "flex", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", gap: "0.25rem 1rem", marginBottom: "1rem", fontSize: vlak.controlFs, fontWeight: 600 },
  body: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1.5rem 2rem" },
  graphic: { display: "block", flexShrink: 0, width: "10.5rem", height: "10.5rem", maxWidth: "100%", overflow: "visible" },
  track: { fill: "none", stroke: { default: vlak.divider, [mq.forcedColors]: "CanvasText" } },
  arc: { fill: "none", stroke: { default: vlak.ink, [mq.forcedColors]: "Highlight" }, strokeLinecap: "round", forcedColorAdjust: "none" },
  list: { listStyleType: "none", margin: 0, padding: 0, display: "grid", gap: "1rem", flex: "1 1 10rem", minWidth: 0 },
  item: { display: "grid", gridTemplateColumns: "1.25rem minmax(0, 1fr)", alignItems: "baseline", columnGap: "0.625rem", overflowWrap: "anywhere" },
  index: { fontSize: "0.75rem", color: vlak.gray, fontVariantNumeric: "tabular-nums" },
  label: { margin: 0, fontSize: vlak.controlFs, fontWeight: 500 },
  value: { margin: "0.125rem 0 0", fontSize: "1.25rem", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" },
  target: { fontSize: "0.875rem", color: vlak.gray, letterSpacing: "normal" },
  note: { margin: "0.25rem 0 0", fontSize: "0.75rem", fontWeight: 400, color: vlak.gray },
  description: { margin: "1rem 0 0", fontSize: "0.875rem", color: vlak.gray, maxWidth: "66ch" },
  progress: { position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clipPath: "inset(50%)", whiteSpace: "nowrap", borderWidth: 0 },
});

/** Concentric personal-goal progress, with a complete named record for each ring. */
export const ActivityRings = React.forwardRef<HTMLElement, ActivityRingsProps>(function ActivityRings({ label, goals, description, className, style, ...props }, ref) {
  const id = React.useId();
  const root = rs(["rs-activity-rings", className], styles.root);
  const caption = rs(["rs-activity-rings-caption"], styles.caption);
  const body = rs(["rs-activity-rings-body"], styles.body);
  const graphic = rs(["rs-activity-rings-graphic"], styles.graphic);
  const track = rs(["rs-activity-rings-track"], styles.track);
  const arc = rs(["rs-activity-rings-arc"], styles.arc);
  const list = rs(["rs-activity-rings-list"], styles.list);
  const item = rs(["rs-activity-rings-item"], styles.item);
  const indexStyle = rs(["rs-activity-rings-index"], styles.index);
  const labelStyle = rs(["rs-activity-rings-label"], styles.label);
  const valueStyle = rs(["rs-activity-rings-value"], styles.value);
  const targetStyle = rs(["rs-activity-rings-target"], styles.target);
  const note = rs(["rs-activity-rings-note"], styles.note);
  const descriptionStyle = rs(["rs-activity-rings-description"], styles.description);
  const progress = rs(["rs-activity-rings-progress"], styles.progress);
  const readings = goals.map(goal => {
    const recorded = goal.current != null && Number.isFinite(goal.current) && goal.current >= 0;
    const targeted = goal.target != null && Number.isFinite(goal.target) && goal.target > 0;
    return { ...goal, recorded, targeted, fraction: recorded && targeted ? Math.min(1, goal.current! / goal.target!) : null };
  });
  const drawable = readings.length > 0 && readings.length <= 6;
  const step = readings.length <= 3 ? 22 : 13;
  const strokeWidth = readings.length <= 3 ? 14 : 8;
  return <figure {...props} ref={ref} className={root.className} style={{ ...root.style, ...style }}>
    <figcaption {...caption}>{label}{drawable && readings.length > 1 && <span {...note}>Outer to inner</span>}</figcaption>
    <div {...body}>
      {drawable && <svg {...graphic} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
        {readings.map((goal, index) => <g key={goal.id} transform="rotate(-90 100 100)">
          <circle {...track} cx="100" cy="100" r={88 - index * step} strokeWidth={strokeWidth} strokeDasharray={goal.fraction == null ? "2 4" : undefined} />
          {goal.fraction != null && goal.fraction > 0 && <circle {...arc} cx="100" cy="100" r={88 - index * step} strokeWidth={strokeWidth} pathLength="100" strokeDasharray={`${goal.fraction * 100} 100`} />}
        </g>)}
      </svg>}
      {readings.length > 0 ? <ol {...list} aria-label={drawable ? `${label}, outer ring first` : `${label} goals`}>{readings.map((goal, index) => <li key={goal.id} {...item}>
        <span {...indexStyle} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
        <div>
          <p {...labelStyle}>{goal.label}</p>
          {goal.recorded ? <p {...valueStyle}>{goal.current} <span {...targetStyle}>{goal.targeted ? `of ${goal.target} ${goal.unit}` : goal.unit}</span></p> : <p {...note}>{goal.current == null ? "No activity recorded" : "Activity unavailable"}</p>}
          {!goal.targeted && <p {...note}>{goal.target == null ? "No goal set" : "Goal unavailable"}</p>}
          {goal.recorded && goal.targeted && <>
            <progress {...progress} max={goal.target!} value={Math.min(goal.current!, goal.target!)} aria-label={drawable ? `${goal.label}, ring ${index + 1}` : goal.label} aria-valuetext={`${goal.current} of ${goal.target} ${goal.unit}`} aria-describedby={description != null ? `${id}-description` : undefined}>{goal.current} of {goal.target} {goal.unit}</progress>
            {goal.current! >= goal.target! && <p {...note}>{goal.current! > goal.target! ? "Goal exceeded" : "Goal reached"}</p>}
          </>}
        </div>
      </li>)}</ol> : <p {...note}>No activity goals supplied</p>}
    </div>
    {readings.length > 6 && <p {...descriptionStyle}>The ring view supports up to six goals. All supplied goals are listed.</p>}
    {description != null && <p {...descriptionStyle} id={`${id}-description`}>{description}</p>}
  </figure>;
});
