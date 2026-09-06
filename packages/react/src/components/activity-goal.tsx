import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";

export interface ActivityGoalProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  description?: React.ReactNode;
  /** A supplied amount. null means no recorded amount; zero is a valid record. */
  current: number | null;
  /** A positive caller-owned goal. null means no goal has been set. */
  target: number | null;
  unit: string;
}

const styles = stylex.create({
  root: { display: "grid", gap: "0.75rem", minWidth: 0, color: vlak.ink },
  label: { margin: 0, fontSize: vlak.controlFs, fontWeight: 600, lineHeight: 1.45 },
  description: { margin: 0, color: vlak.gray, fontSize: vlak.controlFs, lineHeight: 1.45, maxWidth: "66ch" },
  value: { margin: 0, fontSize: "1.75rem", fontWeight: 500, lineHeight: 1.2, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.025em" },
  target: { fontSize: vlak.controlFs, fontWeight: 400, color: vlak.gray, letterSpacing: "normal" },
  progress: { display: "block", width: "100%", height: "0.75rem", accentColor: { default: vlak.ink, [mq.forcedColors]: "Highlight" }, borderRadius: 0 },
});

/** Progress toward a supplied activity goal, without recommended targets or scores. */
export const ActivityGoal = React.forwardRef<HTMLDivElement, ActivityGoalProps>(function ActivityGoal({
  label, description, current, target, unit, className, style, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, "aria-describedby": ariaDescribedBy, ...props
}, ref) {
  const id = React.useId();
  const validCurrent = current != null && Number.isFinite(current) && current >= 0;
  const validTarget = target != null && Number.isFinite(target) && target > 0;
  const valueText = validCurrent && validTarget ? `${current} of ${target} ${unit}` : undefined;
  const root = rs(["rs-activity-goal", className], styles.root);
  const heading = rs(["rs-activity-goal-label"], styles.label);
  const copy = rs(["rs-activity-goal-description"], styles.description);
  const amount = rs(["rs-activity-goal-value"], styles.value);
  const goal = rs(["rs-activity-goal-target"], styles.target);
  const progress = rs(["rs-activity-goal-progress"], styles.progress);
  return <div {...props} ref={ref} className={root.className} style={{ ...root.style, ...style }}>
    <p id={`${id}-label`} className={heading.className} style={heading.style}>{label}</p>
    {description != null && <p id={`${id}-description`} className={copy.className} style={copy.style}>{description}</p>}
    {validCurrent ? <p className={amount.className} style={amount.style}>{current} <span className={goal.className} style={goal.style}>{validTarget ? `of ${target} ${unit}` : unit}</span></p> : <p className={copy.className} style={copy.style}>{current == null ? "No activity recorded" : "Activity unavailable"}</p>}
    {!validTarget && <p className={copy.className} style={copy.style}>{target == null ? "No goal set" : "Goal unavailable"}</p>}
    {validCurrent && validTarget && <>
      <progress value={Math.min(current, target)} max={target} aria-label={ariaLabel} aria-labelledby={ariaLabelledBy ?? (ariaLabel == null ? `${id}-label` : undefined)} aria-describedby={[ariaDescribedBy, description != null && `${id}-description`].filter(Boolean).join(" ") || undefined} aria-valuetext={valueText} className={progress.className} style={progress.style}>{valueText}</progress>
      {current >= target && <p className={copy.className} style={copy.style}>{current > target ? "Goal exceeded" : "Goal reached"}</p>}
    </>}
  </div>;
});
