"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { Input } from "./input";

import { useInputValue } from "../use-input-value";
import { useMergedRefs } from "../merge-refs";

export interface TimecodeFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "onChange" | "pattern"> {
  label: React.ReactNode;
  /** Integer non-drop frame rate from 1 to 99. */
  frameRate: number;
  value?: string;
  defaultValue?: string;
  /** Receives editable text, including incomplete or invalid input. */
  onValueChange?: (value: string) => void;
}

const styles = stylex.create({
  root: { display: "grid", gap: "0.375rem", minWidth: 0, color: vlak.ink },
  label: { fontSize: vlak.controlFs, fontWeight: 500, lineHeight: 1.45 },
  input: { width: "100%", minWidth: 0, fontVariantNumeric: "tabular-nums" },
  hint: { margin: 0, fontSize: vlak.controlLabel, color: vlak.gray, lineHeight: 1.45 },
});

/** Editable hours, minutes, seconds and frames for integer non-drop timecode. */
export const TimecodeField = React.forwardRef<HTMLInputElement, TimecodeFieldProps>(function TimecodeField({ label, frameRate, value, defaultValue = "", onValueChange, id, className, style, "aria-describedby": ariaDescribedBy, "aria-invalid": ariaInvalid, ...props }, ref) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  const [, refresh] = React.useReducer((n: number) => n + 1, 0);
  const [current, setValue, inputRef] = useInputValue<string, HTMLInputElement>(value, defaultValue, onValueChange, refresh);
  const mergedRef = useMergedRefs(ref, inputRef);
  const validRate = Number.isInteger(frameRate) && frameRate >= 1 && frameRate <= 99;
  const validText = current === "" || (/^\d{2}:[0-5]\d:[0-5]\d:\d{2}$/.test(current) && Number(current.slice(-2)) < frameRate);
  const error = !validRate ? "Use an integer non-drop frame rate from 1 to 99." : !validText ? `Use hours:minutes:seconds:frames, with frames from 00 to ${String(frameRate - 1).padStart(2, "0")}.` : "";
  React.useEffect(() => { inputRef.current?.setCustomValidity(error); }, [error, inputRef]);
  const root = rs(["rs-timecode-field"], styles.root);
  const caption = rs(["rs-timecode-field-label"], styles.label);
  const input = rs(["rs-timecode-field-input", className], styles.input);
  const hint = rs(["rs-timecode-field-hint"], styles.hint);
  return <div className={root.className} style={root.style}>
    <label htmlFor={inputId} className={caption.className} style={caption.style}>{label}</label>
    <Input plain {...props} ref={mergedRef} id={inputId} type="text" value={current} pattern="[0-9]{2}:[0-5][0-9]:[0-5][0-9]:[0-9]{2}" placeholder={props.placeholder ?? "00:00:00:00"} spellCheck={false} aria-invalid={error ? true : ariaInvalid} aria-describedby={[ariaDescribedBy, `${inputId}-hint`].filter(Boolean).join(" ")} className={input.className} style={{ ...input.style, ...style }} onChange={(event) => setValue(event.currentTarget.value)} />
    <p id={`${inputId}-hint`} className={hint.className} style={hint.style}>{error || `${frameRate} fps, non-drop. Hours:minutes:seconds:frames.`}</p>
  </div>;
});
