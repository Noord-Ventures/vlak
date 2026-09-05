"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { useFieldControl } from "./field";

export interface InputOTPProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  length?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (code: string) => void;
  name?: string;
  disabled?: boolean;
  readOnly?: boolean;
  /** @deprecated Use onValueChange. */
  onChange?: (code: string) => void;
  /** Called once every cell is filled. */
  onComplete?: (code: string) => void;
  "aria-label"?: string;
}

const styles = stylex.create({
  otp: {
    display: "flex",
    gap: "0.5rem",
    width: {
      default: null,
      [mq.phone]: "100%",
    },
  },
  cell: {
    boxSizing: "border-box",
    width: {
      default: vlak.hit,
      [mq.phone]: "auto",
    },
    flexGrow: {
      default: null,
      [mq.phone]: 1,
    },
    minWidth: {
      default: vlak.hit,
      [mq.phone]: vlak.hit,
    },
    height: {
      default: "3rem",
      [mq.phone]: vlak.hit,
    },
    minHeight: {
      default: null,
      [mq.phone]: vlak.hit,
    },
    textAlign: "center",
    fontSize: "1.125rem",
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums",
    appearance: "none",
    WebkitAppearance: "none",
    color: "var(--text)",
    caretColor: "var(--text)",
    backgroundColor: "var(--bg)",
    borderWidth: vlak.hairline,
    borderStyle: "solid",
    borderColor: {
      default: vlak.controlBorder,
      ":focus": vlak.accent,
    },
    borderRadius: {
      default: vlak.radiusSm,
      [mq.phone]: vlak.radiusSm,
    },
    outlineWidth: {
      default: 0,
      ":focus-visible": 2,
    },
    outlineStyle: {
      default: "none",
      ":focus-visible": "solid",
    },
    outlineColor: vlak.ink,
    outlineOffset: 2,
    fontFamily: "inherit",
    padding: 0,
    ":-webkit-autofill": {
      WebkitTextFillColor: "var(--text)",
      caretColor: "var(--text)",
      backgroundColor: "var(--bg)",
      boxShadow: "inset 0 0 0 1000px var(--bg)",
    },
  },
  invalid: {
    borderColor: vlak.ink,
  },
});

/** One cell per character. Auto-advance, backspace, paste. */
export const InputOTP = React.forwardRef<HTMLDivElement, InputOTPProps>(function InputOTP({
  length: requestedLength = 6,
  value,
  defaultValue = "",
  onValueChange,
  name,
  disabled = false,
  readOnly = false,
  onChange,
  onComplete,
  className,
  style,
  "aria-label": ariaLabel = "One-time code",
  ...props
}, ref) {
  const length = Number.isFinite(requestedLength) ? Math.max(1, Math.min(12, Math.floor(requestedLength))) : 6;
  const normalize = (code: string) => Array.from({ length }, (_, i) => code.replace(/\D/g, "")[i] ?? "");
  const [inner, setChars] = React.useState<string[]>(() => normalize(defaultValue));
  const chars = value === undefined ? Array.from({ length }, (_, i) => inner[i] ?? "") : normalize(value);
  const lastComplete = React.useRef<string | undefined>(undefined);
  const refs = React.useRef<Array<HTMLInputElement | null>>([]);
  const field = useFieldControl(props);
  const invalid = field.invalid;

  const commit = (next: string[]) => {
    if (disabled || readOnly) return;
    if (value === undefined) setChars(next);
    const code = next.join("");
    onValueChange?.(code);
    onChange?.(code);
    if (code.length === length && lastComplete.current !== code) onComplete?.(code);
    lastComplete.current = code.length === length ? code : undefined;
  };

  const setAt = (index: number, value: string) => {
    const next = [...chars];
    next[index] = value;
    commit(next);
  };

  const paste = (index: number, text: string) => {
    const clean = text.replace(/\D/g, "").slice(0, length - index);
    if (!clean) return;
    const next = [...chars];
    for (let i = 0; i < clean.length; i++) next[index + i] = clean[i]!;
    commit(next);
    refs.current[Math.min(index + clean.length, length - 1)]?.focus();
  };

  const sx = rs(["rs-otp", className], styles.otp);
  const cell = rs(["rs-otp-cell", invalid && "rs-otp-cell-invalid"], styles.cell, invalid && styles.invalid);

  return (
    <div
      ref={ref}
      className={sx.className}
      style={{ ...sx.style, ...style }}
      role="group"
      aria-label={ariaLabel}
      {...props}
      aria-describedby={field["aria-describedby"]}
    >
      {name && <input type="hidden" name={name} value={chars.join("")} disabled={disabled} />}
      {chars.map((char, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          inputMode="numeric"
          disabled={disabled}
          readOnly={readOnly}
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={char}
          aria-label={`Digit ${index + 1}`}
          aria-invalid={field["aria-invalid"]}
          className={cell.className}
          style={cell.style}
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            if (value.length > 1) {
              paste(index, value);
              return;
            }
            setAt(index, value);
            if (value) refs.current[index + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (readOnly || disabled) return;
            if (e.key === "Backspace" && !chars[index] && index > 0) {
              e.preventDefault();
              refs.current[index - 1]?.focus();
              setAt(index - 1, "");
            }
            if (e.key === "ArrowLeft") refs.current[index - 1]?.focus();
            if (e.key === "ArrowRight") refs.current[index + 1]?.focus();
          }}
          onPaste={(e) => {
            e.preventDefault();
            paste(index, e.clipboardData.getData("text"));
          }}
        />
      ))}
    </div>
  );
});
