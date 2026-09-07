"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { useInputValue } from "../use-input-value";
import { useMergedRefs } from "../merge-refs";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { Radio, RadioGroup } from "./radio";

export interface StagePosition {
  readonly id: string;
  name: string;
  x: number | null;
  y: number | null;
  z: number | null;
  enabled: boolean;
  /** A supplied pending edit locks this record and adjacent reorder requests. */
  pending?: boolean;
}
export interface StageCoordinateFrame { id: string; label: string }
export interface StagePositionUnits { x: string | null; y: string | null; z: string | null }
export interface StagePositionListProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue"> {
  label: React.ReactNode;
  coordinateFrame: StageCoordinateFrame | null;
  units: StagePositionUnits;
  positions: readonly StagePosition[];
  /** Controlled selected record identifier; pair with onValueChange for inspection. Missing or unknown identifiers never select a fallback. */
  value?: string | null;
  onValueChange?: (id: string) => void;
  onEnabledChange?: (id: string, enabled: boolean) => void;
  /** Requests an order of existing identifiers without changing records. */
  onOrderChange?: (ids: readonly string[]) => void;
  onRemove?: (id: string) => void;
  description?: React.ReactNode;
  /** Prevents record edits; inspection selection remains available. */
  readOnly?: boolean;
}

const styles = stylex.create({
  root: { display: "grid", gap: "0.75rem", minWidth: 0, margin: 0, padding: 0, borderWidth: 0, color: vlak.ink, lineHeight: 1.45 },
  legend: { padding: 0, marginBottom: "0.75rem", fontWeight: 600, fontSize: "0.875rem" },
  copy: { margin: 0, fontSize: "0.75rem", color: vlak.gray, overflowWrap: "anywhere", maxWidth: "66ch" },
  list: { listStyleType: "none", margin: 0, padding: 0, minWidth: 0 },
  row: { paddingBlock: "1rem", paddingInline: "0.75rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider, minWidth: 0, ":focus-visible": { outlineWidth: 2, outlineStyle: "solid", outlineColor: vlak.ink, outlineOffset: -2 } },
  selected: { backgroundColor: { default: vlak.tableAlt, [mq.forcedColors]: "Canvas" } },
  head: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem 1rem", minWidth: 0 },
  identity: { display: "grid", minWidth: 0, overflowWrap: "anywhere", fontSize: "0.875rem" },
  coordinateList: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.5rem 1rem", marginBlock: "0.75rem", marginInline: 0 },
  coordinate: { minWidth: 0, overflowWrap: "anywhere" },
  axis: { margin: 0, color: vlak.gray, fontSize: "0.75rem" },
  number: { margin: 0, fontSize: "0.875rem", fontVariantNumeric: "tabular-nums" },
  actions: { display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.75rem" },
  action: { minWidth: vlak.hit, minHeight: vlak.hit, width: "auto" },
  status: { position: "absolute", width: 1, height: 1, overflow: "hidden", clipPath: "inset(50%)", whiteSpace: "nowrap" },
});

const axes = ["x", "y", "z"] as const;
const hasUnit = (unit: string | null) => typeof unit === "string" && unit.trim().length > 0;
function coordinate(value: number | null) {
  if (value == null) return "Not supplied";
  if (!Number.isFinite(value)) return "Unavailable";
  return Object.is(value, -0) ? "-0" : String(value);
}
interface FocusRequest { kind: "order" | "remove"; id: string; name: string; order: readonly string[]; control: HTMLButtonElement; ownedFocus: boolean; next?: string; previous?: string }

/** Supplied stage coordinates and controlled plan edits. No stage motion or coordinate conversion occurs. */
export const StagePositionList = React.forwardRef<HTMLFieldSetElement, StagePositionListProps>(function StagePositionList({ label, coordinateFrame, units, positions, value = null, onValueChange, onEnabledChange, onOrderChange, onRemove, description, readOnly = false, disabled, name, form, className, style, children, "aria-describedby": ariaDescribedBy, ...props }, ref) {
  const [, refresh] = React.useReducer((revision: number) => revision + 1, 0);
  const [, , fieldRef] = useInputValue<readonly StagePosition[], HTMLFieldSetElement>(positions, positions, undefined, refresh);
  const mergedRef = useMergedRefs(ref, fieldRef);
  const pendingFocus = React.useRef<FocusRequest | null>(null);
  const rows = React.useRef(new Map<string, HTMLLIElement>());
  const radios = React.useRef(new Map<string, HTMLInputElement>());
  const [announcement, setAnnouncement] = React.useState("");
  const id = React.useId();
  const valid = positions.length <= 128 && positions.every(position => typeof position.id === "string" && position.id.trim()) && new Set(positions.map(position => position.id)).size === positions.length;
  const selected = valid && value != null && positions.some(position => position.id === value);
  const frameLabel = coordinateFrame?.id.trim() && coordinateFrame.label.trim() ? `${coordinateFrame.label} (${coordinateFrame.id})` : "Not supplied";
  const describedBy = [ariaDescribedBy, `${id}-frame`, `${id}-selection`, description != null && `${id}-description`].filter(Boolean).join(" ");
  React.useLayoutEffect(() => {
    const request = pendingFocus.current;
    if (!request || !valid) return;
    const index = positions.findIndex(position => position.id === request.id);
    const accepted = request.kind === "remove" ? index < 0 : request.order.length === positions.length && request.order.every((key, i) => positions[i]?.id === key);
    if (!accepted) return;
    pendingFocus.current = null;
    setAnnouncement(request.kind === "remove" ? `${request.name} (${request.id}) removed; ${positions.length} positions remain` : `${request.name} (${request.id}), position ${index + 1} of ${positions.length}`);
    const active = request.control.ownerDocument.activeElement;
    if (!request.ownedFocus || active !== request.control && active !== request.control.ownerDocument.body) return;
    if (request.kind === "order" && request.control.isConnected && !request.control.disabled) return;
    const targetId = request.kind === "order" ? request.id : [request.next, request.previous, positions[0]?.id].find(key => key != null && rows.current.has(key));
    const radio = targetId == null ? undefined : radios.current.get(targetId);
    const target = radio && !radio.disabled ? radio : targetId == null ? fieldRef.current : rows.current.get(targetId);
    target?.focus({ preventScroll: true });
  }, [positions, valid, fieldRef]);
  function requestOrder(index: number, delta: number, control: HTMLButtonElement) {
    const position = positions[index];
    if (!position || disabled || readOnly || position.pending || positions[index + delta]?.pending || !positions[index + delta]) return;
    const order = positions.map(entry => entry.id);
    [order[index], order[index + delta]] = [order[index + delta]!, order[index]!];
    pendingFocus.current = { kind: "order", id: position.id, name: position.name || "Unnamed position", order, control, ownedFocus: control.ownerDocument.activeElement === control };
    onOrderChange?.(order);
  }
  function requestRemoval(index: number, control: HTMLButtonElement) {
    const position = positions[index];
    if (!position || disabled || readOnly || position.pending) return;
    pendingFocus.current = { kind: "remove", id: position.id, name: position.name || "Unnamed position", order: [], control, ownedFocus: control.ownerDocument.activeElement === control, next: positions[index + 1]?.id, previous: positions[index - 1]?.id };
    onRemove?.(position.id);
  }
  const root = rs(["rs-stage-position-list", className], styles.root);
  const legend = rs(["rs-stage-position-list-legend"], styles.legend);
  const copy = rs(["rs-stage-position-list-copy"], styles.copy);
  const list = rs(["rs-stage-position-list-items"], styles.list);
  const head = rs(["rs-stage-position-list-head"], styles.head);
  const identity = rs(["rs-stage-position-list-identity"], styles.identity);
  const coordinateList = rs(["rs-stage-position-list-coordinates"], styles.coordinateList);
  const coordinateStyle = rs(["rs-stage-position-list-coordinate"], styles.coordinate);
  const axisStyle = rs(["rs-stage-position-list-axis"], styles.axis);
  const number = rs(["rs-stage-position-list-number"], styles.number);
  const actions = rs(["rs-stage-position-list-actions"], styles.actions);
  const action = rs(["rs-stage-position-list-action"], styles.action);
  const status = rs(["rs-stage-position-list-status"], styles.status);
  return <fieldset {...props} ref={mergedRef} tabIndex={props.tabIndex ?? -1} disabled={disabled} name={name} form={form} aria-describedby={describedBy} className={root.className} style={{ ...root.style, ...style }}>
    <legend {...legend} id={`${id}-label`}>{label}</legend>
    {description != null && <div {...copy} id={`${id}-description`}>{description}</div>}
    <p {...copy} id={`${id}-frame`}>Coordinate frame: {frameLabel}</p>
    <p {...copy} id={`${id}-selection`}>{selected ? `Selected: ${positions.find(position => position.id === value)?.name || "Unnamed position"} (${value})` : value == null ? "No position selected" : "Selected position unavailable"}</p>
    {!valid ? <p {...copy}>Positions unavailable: supply unique nonempty identifiers and at most 128 positions</p> : positions.length === 0 ? <p {...copy}>No stage positions supplied</p> : <RadioGroup aria-labelledby={`${id}-label`} name={name} value={selected ? value! : ""} onValueChange={onValueChange}>
      <ol {...list}>{positions.map((position, index) => {
        const isSelected = selected && position.id === value;
        const row = rs(["rs-stage-position-list-row", isSelected && "rs-stage-position-list-selected"], styles.row, isSelected && styles.selected);
        const context = `${position.name || "Unnamed position"} (${position.id})`;
        const locked = disabled || readOnly || position.pending;
        return <li key={position.id} {...row} ref={element => { if (element) rows.current.set(position.id, element); else rows.current.delete(position.id); }} tabIndex={-1} aria-label={context}>
          <div {...head}><Radio ref={element => { if (element) radios.current.set(position.id, element); else radios.current.delete(position.id); }} value={position.id} form={form} disabled={disabled || !onValueChange} aria-describedby={`${id}-${index}-coordinates`} label={<span {...identity}><span>{position.name || "Unnamed position"}</span><span {...copy}>({position.id})</span></span>} />
            <Checkbox checked={position.enabled === true} indeterminate={typeof position.enabled !== "boolean"} disabled={locked || !onEnabledChange} form={form} label="Include" aria-label={`${context}: Include`} onCheckedChange={enabled => onEnabledChange?.(position.id, enabled)} /></div>
          <dl {...coordinateList} id={`${id}-${index}-coordinates`}>{axes.map(axis => <div key={axis} {...coordinateStyle}><dt {...axisStyle}>{axis.toUpperCase()} ({hasUnit(units[axis]) ? units[axis] : "Unit not supplied"})</dt><dd {...number}>{coordinate(position[axis])}</dd></div>)}</dl>
          <p {...copy}>{typeof position.enabled !== "boolean" ? "Inclusion unavailable" : position.enabled ? "Included in plan" : "Excluded from plan"}</p>
          {position.pending && <p {...copy}>Edit pending; supplied record remains unchanged</p>}
          {(onOrderChange || onRemove) && <div {...actions}>
            {onOrderChange && <><Button {...action} type="button" variant="ghost" aria-label={`${context}: Move up`} disabled={locked || index === 0 || positions[index - 1]?.pending} onClick={event => requestOrder(index, -1, event.currentTarget)}>Move up</Button><Button {...action} type="button" variant="ghost" aria-label={`${context}: Move down`} disabled={locked || index === positions.length - 1 || positions[index + 1]?.pending} onClick={event => requestOrder(index, 1, event.currentTarget)}>Move down</Button></>}
            {onRemove && <Button {...action} type="button" variant="ghost" aria-label={`${context}: Remove`} disabled={locked} onClick={event => requestRemoval(index, event.currentTarget)}>Remove</Button>}
          </div>}
        </li>;
      })}</ol>
    </RadioGroup>}
    {name && selected && !onValueChange && <input type="hidden" name={name} form={form} value={value!} />}
    <span {...status} role="status">{announcement}</span>{children}
  </fieldset>;
});
