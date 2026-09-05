"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { rs } from "../rs";
import { useMergedRefs } from "../merge-refs";
import { useInputValue } from "../use-input-value";
import { Input } from "./input";

export interface TimeFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "onChange"> {
  /** A 24-hour HTML time value, HH:mm or HH:mm:ss. The browser localizes editing. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
}

const styles = stylex.create({ input: { minWidth: 0, fontVariantNumeric: "tabular-nums", colorScheme: "inherit" } });

/** The platform time editor, including its locale, keyboard and step validation. */
export const TimeField = React.forwardRef<HTMLInputElement, TimeFieldProps>(function TimeField({
  value, defaultValue = "", onValueChange, className, style, ...props
}, ref) {
  const [current, setValue, inputRef] = useInputValue<string, HTMLInputElement>(value, defaultValue, onValueChange);
  const mergedRef = useMergedRefs(ref, inputRef);
  const sx = rs(["rs-time-field", className], styles.input);
  return <Input {...props} ref={mergedRef} type="time" value={current} className={sx.className} style={{ ...sx.style, ...style }} onChange={(event) => setValue(event.currentTarget.value)} />;
});
