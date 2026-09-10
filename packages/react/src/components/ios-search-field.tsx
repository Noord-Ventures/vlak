"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { useMergedRefs } from "../merge-refs";
import { Icon } from "./icon";

export interface IOSSearchFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "children"> {
  value?: string;
  defaultValue?: string;
  /** Fires when typing or using the clear action. */
  onValueChange?: (value: string) => void;
  clearLabel?: string;
}
const styles = stylex.create({
  root: { display: "flex", alignItems: "center", gap: 8, boxSizing: "border-box", minWidth: 0, minHeight: 48, width: "100%", paddingInlineStart: 16, paddingInlineEnd: 2, borderRadius: 24, borderWidth: 1, borderStyle: "solid", borderColor: { default: vlak.controlBorder, [mq.forcedColors]: "ButtonText" }, backgroundColor: vlak.controlFill, color: vlak.gray, outlineWidth: { default: 0, ":focus-within": 2 }, outlineStyle: "solid", outlineColor: vlak.ink, outlineOffset: 2 },
  disabled: { opacity: 0.45 },
  symbol: { display: "inline-flex", flexShrink: 0, pointerEvents: "none" },
  input: { appearance: "none", fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif", fontSize: 17, lineHeight: "22px", color: vlak.ink, width: "100%", minWidth: 0, minHeight: 44, flexGrow: 1, borderWidth: 0, backgroundColor: "transparent", paddingBlock: 10, paddingInline: 0, margin: 0, outlineWidth: 0, "::placeholder": { color: vlak.ink, opacity: 1 }, "::-webkit-search-cancel-button": { appearance: "none" } },
  clear: { appearance: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, minWidth: 44, minHeight: 44, borderRadius: 22, borderWidth: 0, padding: 0, backgroundColor: { default: "transparent", ":hover": { default: null, [mq.hover]: vlak.paper } }, color: vlak.gray, cursor: "pointer", outlineWidth: { default: 0, ":focus-visible": 2 }, outlineStyle: "solid", outlineColor: vlak.ink, outlineOffset: -3, transition: { default: "background-color 200ms ease", [mq.reduce]: "none" } },
});

/** A 48px search capsule with a native input and an explicit clear target. */
export const IOSSearchField = React.forwardRef<HTMLInputElement, IOSSearchFieldProps>(function IOSSearchField({ value, defaultValue = "", onValueChange, onChange, clearLabel = "Clear search", disabled, readOnly, className, style, ...props }, forwardedRef) {
  const [inner, setInner] = React.useState(defaultValue);
  const input = React.useRef<HTMLInputElement>(null);
  const ref = useMergedRefs(input, forwardedRef);
  const controlled = value !== undefined;
  const current = controlled ? value : inner;
  const clearValue = () => {
    const node = input.current;
    if (!node) return;
    // Keep native onChange handlers and form libraries on the same path as typing.
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(node, "");
    node.dispatchEvent(new Event("input", { bubbles: true }));
    node.focus();
  };
  React.useEffect(() => {
    const form = props.form ? document.getElementById(props.form) : input.current?.form;
    let mounted = true;
    const reset = (event: Event) => queueMicrotask(() => { if (mounted && !controlled && !event.defaultPrevented) { if (input.current) input.current.value = defaultValue; setInner(defaultValue); } });
    form?.addEventListener("reset", reset);
    return () => { mounted = false; form?.removeEventListener("reset", reset); };
  }, [controlled, defaultValue, props.form]);
  const root = rs(["rs-ios-search-field", disabled && "rs-ios-search-field-disabled", className], styles.root, disabled && styles.disabled);
  const symbol = rs(["rs-ios-search-field-symbol"], styles.symbol);
  const field = rs(["rs-ios-search-field-input"], styles.input);
  const clear = rs(["rs-ios-search-field-clear"], styles.clear);
  return <div className={root.className} style={{ ...root.style, ...style }}><span {...symbol} aria-hidden="true"><Icon name="search" size={24} /></span><input {...props} {...field} ref={ref} type="search" value={current} disabled={disabled} readOnly={readOnly} onChange={(event) => { onChange?.(event); if (event.defaultPrevented) return; if (!controlled) setInner(event.currentTarget.value); onValueChange?.(event.currentTarget.value); }} />{current && !disabled && !readOnly && <button {...clear} type="button" aria-label={clearLabel} onClick={clearValue}><Icon name="close" size={16} /></button>}</div>;
});
