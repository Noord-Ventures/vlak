"use client";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { useInputValue } from "../use-input-value";
import { useMergedRefs } from "../merge-refs";
import { Button } from "./button";
import { Input } from "./input";
import { Select } from "./select";

export interface AcquisitionChannel { id: string; label: string; disabled?: boolean }
export interface AcquisitionStepAction { id: string; label: string; disabled?: boolean }
export interface AcquisitionStep {
  id: string;
  label: string;
  exposure: number | null;
  exposureUnit: string;
  time: number | null;
  timeUnit: string;
  depth: number | null;
  depthUnit: string;
  channel: string | null;
  /** Actual recorded state supplied by the host, never inferred from edits or requests. */
  status: string;
  confirmedLabel?: string;
  pending?: boolean;
  actions?: readonly AcquisitionStepAction[];
}
export interface AcquisitionSequencerProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  label: React.ReactNode;
  steps: readonly AcquisitionStep[];
  channels: readonly AcquisitionChannel[];
  onStepsChange?: (steps: readonly AcquisitionStep[]) => void;
  onAction?: (stepId: string, actionId: string) => void;
  description?: React.ReactNode;
  readOnly?: boolean;
}
const styles = stylex.create({
  root: { display: "grid", gap: "0.75rem", minWidth: 0, borderWidth: 0, padding: 0, margin: 0, color: vlak.ink, lineHeight: 1.45 },
  legend: { padding: 0, marginBottom: "0.75rem", fontSize: "0.875rem", fontWeight: 600 },
  list: { fontSize: "0.875rem", listStyleType: "decimal", paddingInlineStart: "1.5rem", margin: 0 },
  step: { paddingBlock: "1rem", paddingInlineStart: "0.25rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider },
  head: { display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.75rem" },
  title: { fontSize: "0.875rem", fontWeight: 500 },
  fields: { display: "grid", gridTemplateColumns: { default: "repeat(4, minmax(0, 1fr))", [mq.phone]: "repeat(2, minmax(0, 1fr))" }, gap: "0.75rem", margin: 0 },
  field: { display: "grid", gap: "0.375rem", minWidth: 0, fontSize: "0.75rem" },
  control: { minWidth: 0, minHeight: vlak.hit },
  value: { margin: 0, fontSize: "0.875rem", fontVariantNumeric: "tabular-nums", overflowWrap: "anywhere" },
  copy: { margin: 0, fontSize: "0.75rem", color: vlak.gray, maxWidth: "66ch", overflowWrap: "anywhere" },
  actions: { display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.75rem" },
  action: { minWidth: vlak.hit, minHeight: vlak.hit, width: "auto" },
});
/** A controlled capture plan editor and recorded-state display, without an acquisition engine. */
export const AcquisitionSequencer = React.forwardRef<HTMLFieldSetElement, AcquisitionSequencerProps>(function AcquisitionSequencer({ label, steps, channels, onStepsChange, onAction, description, readOnly = false, name, form, disabled, className, style, children, ...props }, ref) {
  const [, refresh] = React.useReducer((n: number) => n + 1, 0);
  const [, , fieldRef] = useInputValue<readonly AcquisitionStep[], HTMLFieldSetElement>(steps, steps, onStepsChange, refresh);
  const merged = useMergedRefs(ref, fieldRef);
  const id = React.useId();
  const valid = steps.length <= 128 && channels.length <= 128 && steps.every(step => step.id.trim()) && channels.every(channel => channel.id.trim()) && new Set(steps.map(step => step.id)).size === steps.length && new Set(channels.map(channel => channel.id)).size === channels.length;
  const update = (stepId: string, patch: Partial<AcquisitionStep>) => onStepsChange?.(steps.map(step => step.id === stepId ? { ...step, ...patch } : step));
  const move = (index: number, delta: number) => { const next = [...steps]; [next[index], next[index + delta]] = [next[index + delta]!, next[index]!]; onStepsChange?.(next); };
  const root = rs(["rs-acquisition-sequencer", className], styles.root);
  const legend = rs(["rs-acquisition-sequencer-legend"], styles.legend);
  const list = rs(["rs-acquisition-sequencer-list"], styles.list);
  const stepStyle = rs(["rs-acquisition-sequencer-step"], styles.step);
  const head = rs(["rs-acquisition-sequencer-head"], styles.head);
  const title = rs(["rs-acquisition-sequencer-title"], styles.title);
  const fields = rs(["rs-acquisition-sequencer-fields"], styles.fields);
  const field = rs(["rs-acquisition-sequencer-label"], styles.field);
  const control = rs(["rs-acquisition-sequencer-control"], styles.control);
  const valueStyle = rs(["rs-acquisition-sequencer-value"], styles.value);
  const copy = rs(["rs-acquisition-sequencer-copy"], styles.copy);
  const actions = rs(["rs-acquisition-sequencer-actions"], styles.actions);
  const action = rs(["rs-acquisition-sequencer-action"], styles.action);
  return <fieldset {...props} ref={merged} disabled={disabled} name={name} form={form} className={root.className} style={{ ...root.style, ...style }}>
    <legend {...legend}>{label}</legend>{description != null && <div {...copy}>{description}</div>}
    {!valid ? <p {...copy}>Sequence unavailable: supply unique records and at most 128 steps and channels</p> : !steps.length ? <p {...copy}>No capture steps supplied</p> : <ol {...list}>{steps.map((step, index) => {
      const editing = onStepsChange != null && !readOnly;
      const locked = disabled || step.pending;
      const statusId = `${id}-${index}-status`;
      const labels = { exposure: "Exposure", time: "Time offset", depth: "Depth" };
      return <li key={step.id} {...stepStyle}>
        <div {...head}><span {...title}>{step.label}</span><span {...copy} id={statusId}>{step.status.trim() || "Recorded state unavailable"}</span></div>
        <div {...fields}>{(["exposure", "time", "depth"] as const).map(key => {
          const unit = step[`${key}Unit`];
          const amount = step[key];
          const available = amount != null && Number.isFinite(amount);
          return editing ? <label key={key} {...field}>{labels[key]} ({unit})<Input {...control} plain type="number" step="any" min={key === "depth" ? undefined : 0} disabled={locked} name={name ? `${name}.${step.id}.${key}` : undefined} form={form} value={available ? amount : ""} aria-label={`${labels[key]} (${unit}): step ${index + 1}, ${step.label}`} aria-describedby={statusId} onChange={event => update(step.id, { [key]: Number.isFinite(event.currentTarget.valueAsNumber) ? event.currentTarget.valueAsNumber : null })} /></label> : <div key={key} {...field}><span>{labels[key]}</span><p {...valueStyle}>{available ? `${amount} ${unit}` : amount == null ? "Not supplied" : "Unavailable"}</p></div>;
        })}
          {editing ? <div {...field}><span>Channel</span><Select fullWidth disabled={locked} name={name ? `${name}.${step.id}.channel` : undefined} form={form} value={channels.some(channel => channel.id === step.channel) ? step.channel! : ""} aria-label={`Channel: step ${index + 1}, ${step.label}`} aria-describedby={statusId} options={[{ value: "", label: "Choose channel" }, ...channels.map(channel => ({ value: channel.id, label: channel.label, disabled: channel.disabled }))]} onValueChange={channel => update(step.id, { channel: channel || null })} /></div> : <div {...field}><span>Channel</span><p {...valueStyle}>{channels.find(channel => channel.id === step.channel)?.label ?? step.channel ?? "Not supplied"}</p></div>}
        </div>
        {step.confirmedLabel != null && <p {...copy}>{step.confirmedLabel}</p>}<span {...copy} role="status">{step.pending ? "Request pending; recorded state unchanged" : null}</span>
        <div {...actions}>{editing && <><Button {...action} variant="ghost" disabled={locked || index === 0 || steps[index - 1]?.pending} aria-label={`Move step ${index + 1}, ${step.label}, up`} onClick={() => move(index, -1)}>Move up</Button><Button {...action} variant="ghost" disabled={locked || index === steps.length - 1 || steps[index + 1]?.pending} aria-label={`Move step ${index + 1}, ${step.label}, down`} onClick={() => move(index, 1)}>Move down</Button></>}
          {onAction && !readOnly && step.actions?.map(choice => <Button key={choice.id} {...action} variant="ghost" disabled={locked || choice.disabled} aria-label={`${choice.label}: step ${index + 1}, ${step.label}`} aria-describedby={statusId} onClick={() => onAction(step.id, choice.id)}>{choice.label}</Button>)}
        </div>
      </li>;
    })}</ol>}{children}
  </fieldset>;
});
