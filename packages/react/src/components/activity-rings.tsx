"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { useMergedRefs } from "../merge-refs";

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
  /** Sweep each ring into its supplied value on first view. Reduced motion stays instant. */
  animate?: boolean;
  /** Gentle lines rotate every ten seconds without immediate repetition. false hides the line. */
  encouragement?: readonly string[] | false;
}

const defaultEncouragement = [
  "Small steps still count.",
  "Find a rhythm that feels like you.",
  "A little care goes a long way.",
  "There is room to move at your own pace.",
  "Every day can look a little different.",
];
const ringBuild = stylex.keyframes({ from: { strokeDashoffset: 100, opacity: 0 }, to: { opacity: 1 } });
const encouragementIn = stylex.keyframes({ from: { opacity: 0, transform: "translateY(3px)" }, to: { opacity: 1, transform: "translateY(0)" } });

const styles = stylex.create({
  root: { margin: 0, width: "100%", minWidth: 0, color: vlak.ink, lineHeight: 1.45 },
  caption: { display: "flex", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", gap: "0.25rem 1rem", marginBottom: "1rem", fontSize: vlak.controlFs, fontWeight: 600 },
  body: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1.5rem 2rem" },
  graphic: { display: "block", flexShrink: 0, width: "10.5rem", height: "10.5rem", maxWidth: "100%", overflow: "visible" },
  track: { fill: "none", stroke: { default: vlak.divider, [mq.forcedColors]: "CanvasText" } },
  arc: { fill: "none", stroke: { default: vlak.ink, [mq.forcedColors]: "Highlight" }, strokeLinecap: "round", forcedColorAdjust: "none" },
  motion: { animationName: { default: ringBuild, [mq.reduce]: "none" }, animationDuration: "1s", animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)", animationFillMode: "backwards", transitionProperty: "stroke-dashoffset", transitionDuration: { default: "0.6s", [mq.reduce]: "0s" }, transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" },
  waiting: { animationPlayState: "paused" },
  encouragement: { display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1.25rem", minHeight: vlak.hit, maxWidth: "66ch" },
  encouragementText: { margin: 0, flex: "1 1 auto", minWidth: 0, fontSize: "0.875rem", lineHeight: 1.45, color: vlak.gray, overflowWrap: "anywhere", animationName: { default: encouragementIn, [mq.reduce]: "none" }, animationDuration: "0.3s", animationTimingFunction: "ease-out" },
  pause: { display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, minWidth: vlak.hit, minHeight: vlak.hit, padding: 0, backgroundColor: "transparent", color: vlak.gray, borderWidth: 0, borderRadius: vlak.radiusSm, cursor: "pointer", outlineWidth: { default: null, ":focus-visible": 2 }, outlineStyle: { default: null, ":focus-visible": "solid" }, outlineColor: vlak.ink, outlineOffset: 2 },
  pauseIcon: { width: "0.875rem", height: "0.875rem", fill: "currentColor" },
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
export const ActivityRings = React.forwardRef<HTMLElement, ActivityRingsProps>(function ActivityRings({ label, goals, description, animate = true, encouragement = defaultEncouragement, className, style, ...props }, ref) {
  const figureRef = React.useRef<HTMLElement>(null);
  const mergedRef = useMergedRefs(ref, figureRef);
  const [entered, setEntered] = React.useState(false);
  const [inView, setInView] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [visible, setVisible] = React.useState(true);
  const [paused, setPaused] = React.useState(false);
  // A stable content key keeps frequent goal updates from resetting the timer.
  const messageKey = JSON.stringify(encouragement === false ? [] : [...new Set(encouragement.map(line => line.trim()).filter(Boolean))]);
  const messages = React.useMemo<string[]>(() => JSON.parse(messageKey), [messageKey]);
  const [message, setMessage] = React.useState(messages[0] ?? "");
  const line = messages.includes(message) ? message : messages[0];
  const hasGoals = goals.length > 0;
  React.useEffect(() => {
    const element = figureRef.current;
    if (!element) return;
    if (typeof IntersectionObserver === "undefined") { setEntered(true); setInView(true); return; }
    const observer = new IntersectionObserver(entries => {
      const shown = entries.some(entry => entry.isIntersecting);
      setInView(shown);
      if (shown) setEntered(true);
    }, { threshold: 0.15 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  React.useEffect(() => {
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media?.matches ?? false);
    const updateVisibility = () => setVisible(document.visibilityState !== "hidden");
    updateMotion(); updateVisibility();
    media?.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => { media?.removeEventListener("change", updateMotion); document.removeEventListener("visibilitychange", updateVisibility); };
  }, []);
  React.useEffect(() => {
    if (!hasGoals || messages.length < 2 || paused || reducedMotion || !visible || !inView) return;
    const timer = window.setInterval(() => {
      const random = Math.random();
      setMessage(previous => {
        const choices = messages.filter(candidate => candidate !== (messages.includes(previous) ? previous : messages[0]));
        return choices[Math.floor(random * choices.length)]!;
      });
    }, 10000);
    return () => window.clearInterval(timer);
  }, [hasGoals, messages, paused, reducedMotion, visible, inView]);
  const id = React.useId();
  const root = rs(["rs-activity-rings", className], styles.root);
  const caption = rs(["rs-activity-rings-caption"], styles.caption);
  const body = rs(["rs-activity-rings-body"], styles.body);
  const graphic = rs(["rs-activity-rings-graphic"], styles.graphic);
  const track = rs(["rs-activity-rings-track"], styles.track);
  const arc = rs(["rs-activity-rings-arc", animate && "rs-activity-rings-motion", animate && !entered && "rs-activity-rings-waiting"], styles.arc, animate && styles.motion, animate && !entered && styles.waiting);
  const encouragementStyle = rs(["rs-activity-rings-encouragement"], styles.encouragement);
  const encouragementText = rs(["rs-activity-rings-encouragement-text"], styles.encouragementText);
  const pause = rs(["rs-activity-rings-pause"], styles.pause);
  const pauseIcon = rs(["rs-activity-rings-pause-icon"], styles.pauseIcon);
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
  return <figure {...props} ref={mergedRef} className={root.className} style={{ ...root.style, ...style }}>
    <figcaption {...caption}>{label}{drawable && readings.length > 1 && <span {...note}>Outer to inner</span>}</figcaption>
    <div {...body}>
      {drawable && <svg {...graphic} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
        {readings.map((goal, index) => <g key={goal.id} transform="rotate(-90 100 100)">
          <circle {...track} cx="100" cy="100" r={88 - index * step} strokeWidth={strokeWidth} strokeDasharray={goal.fraction == null ? "2 4" : undefined} />
          {goal.fraction != null && goal.fraction > 0 && <circle {...arc} cx="100" cy="100" r={88 - index * step} strokeWidth={strokeWidth} pathLength="100" strokeDasharray="100 100" strokeDashoffset={100 - goal.fraction * 100} style={{ ...arc.style, ...(animate ? { animationDelay: `${index * 100}ms` } : {}) }} />}
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
    {hasGoals && line && <div {...encouragementStyle}>
      <p key={line} {...encouragementText} aria-live="off">{line}</p>
      {messages.length > 1 && !reducedMotion && <button {...pause} type="button" aria-label={paused ? "Resume encouragement" : "Pause encouragement"} title={paused ? "Resume encouragement" : "Pause encouragement"} onClick={() => setPaused(current => !current)}>
        <svg {...pauseIcon} viewBox="0 0 16 16" aria-hidden="true" focusable="false">{paused ? <path d="M4 2L13 8L4 14Z" /> : <path d="M4 3H6V13H4ZM10 3H12V13H10Z" />}</svg>
      </button>}
    </div>}
  </figure>;
});
