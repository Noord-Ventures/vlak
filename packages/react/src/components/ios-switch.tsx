"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { useMergedRefs } from "../merge-refs";

export interface IOSSwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "checked" | "defaultChecked" | "children"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const styles = stylex.create({
  root: { display: "inline-flex", position: "relative", alignItems: "center", width: 64, minWidth: 64, height: 44, minHeight: 44, verticalAlign: "middle", flexShrink: 0, borderRadius: 22, outlineWidth: { default: 0, ":focus-within": 2 }, outlineStyle: "solid", outlineColor: vlak.ink, outlineOffset: 2 },
  disabled: { opacity: 0.45 },
  track: { position: "absolute", insetInline: 0, top: 8, height: 28, borderRadius: 14, boxSizing: "border-box", borderWidth: 1, borderStyle: "solid", borderColor: { default: vlak.controlBorder, [mq.forcedColors]: "ButtonText" }, backgroundColor: { default: vlak.controlFill, [mq.forcedColors]: "Canvas" }, pointerEvents: "none", transition: { default: "background-color 220ms ease", [mq.reduce]: "none" } },
  on: { backgroundColor: { default: vlak.ink, [mq.forcedColors]: "Highlight" }, borderColor: { default: vlak.ink, [mq.forcedColors]: "Highlight" }, forcedColorAdjust: "none" },
  thumb: { position: "absolute", top: 10, insetInlineStart: 2, height: 24, width: 38, borderRadius: 12, boxSizing: "border-box", borderWidth: 1, borderStyle: "solid", borderColor: { default: vlak.controlBorder, [mq.forcedColors]: "ButtonText" }, backgroundColor: { default: vlak.paper, [mq.forcedColors]: "Canvas" }, pointerEvents: "none", transition: { default: "inset-inline-start 220ms cubic-bezier(.2,.8,.2,1)", [mq.reduce]: "none" } },
  thumbOn: { insetInlineStart: 24, borderColor: "transparent", backgroundColor: { default: vlak.paper, [mq.forcedColors]: "HighlightText" }, forcedColorAdjust: "none" },
  input: { position: "absolute", inset: 0, width: "100%", height: "100%", margin: 0, opacity: 0, cursor: { default: "pointer", ":disabled": "not-allowed" } },
});

/** The native checkbox owns focus, form submission and Space activation. */
export const IOSSwitch = React.forwardRef<HTMLInputElement, IOSSwitchProps>(function IOSSwitch({ checked, defaultChecked = false, onCheckedChange, onChange, disabled, className, style, ...props }, forwardedRef) {
  const [inner, setInner] = React.useState(defaultChecked);
  const input = React.useRef<HTMLInputElement>(null);
  const ref = useMergedRefs(input, forwardedRef);
  const controlled = checked !== undefined;
  const on = controlled ? checked : inner;
  React.useEffect(() => {
    const form = props.form ? document.getElementById(props.form) : input.current?.form;
    let mounted = true;
    const reset = (event: Event) => queueMicrotask(() => { if (mounted && !controlled && !event.defaultPrevented) { if (input.current) input.current.checked = defaultChecked; setInner(defaultChecked); } });
    form?.addEventListener("reset", reset);
    return () => { mounted = false; form?.removeEventListener("reset", reset); };
  }, [controlled, defaultChecked, props.form]);
  const root = rs(["rs-ios-switch", disabled && "rs-ios-switch-disabled", className], styles.root, disabled && styles.disabled);
  const track = rs(["rs-ios-switch-track", on && "rs-ios-switch-on"], styles.track, on && styles.on);
  const thumb = rs(["rs-ios-switch-thumb", on && "rs-ios-switch-thumb-on"], styles.thumb, on && styles.thumbOn);
  const field = rs(["rs-ios-switch-input"], styles.input);
  return <span className={root.className} style={{ ...root.style, ...style }}><span {...track} aria-hidden="true" /><span {...thumb} aria-hidden="true" /><input {...props} {...field} ref={ref} type="checkbox" role="switch" aria-checked={on} checked={on} disabled={disabled} onChange={(event) => { onChange?.(event); if (event.defaultPrevented) return; if (!controlled) setInner(event.currentTarget.checked); onCheckedChange?.(event.currentTarget.checked); }} /></span>;
});
