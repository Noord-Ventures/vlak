"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { useFieldControl } from "./field";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
  feedback?: React.ReactNode;
}

const styles = stylex.create({
  field: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  label: {
    fontSize: {
      default: "0.75rem",
      [mq.phone]: vlak.controlLabel,
    },
    fontWeight: 600,
    color: vlak.gray,
    letterSpacing: "-0.01em",
    lineHeight: "16px",
  },
  area: {
    boxSizing: "border-box",
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
    appearance: "none",
    WebkitAppearance: "none",
    backgroundColor: "var(--bg)",
    color: "var(--text)",
    caretColor: "var(--text)",
    fontSize: {
      default: "0.875rem",
      [mq.phone]: "1rem",
    },
    lineHeight: 1.45,
    paddingBlock: {
      default: "0.5rem",
      [mq.phone]: "0.75rem",
    },
    paddingInline: {
      default: "0.625rem",
      [mq.phone]: "0.875rem",
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
    minHeight: {
      default: "6rem",
      [mq.phone]: "8.25rem",
    },
    resize: "vertical",
    width: "100%",
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
  feedback: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: {
      default: "0.75rem",
      [mq.phone]: "0.875rem",
    },
    fontWeight: 500,
    color: vlak.gray,
    letterSpacing: "-0.01em",
    lineHeight: "16px",
    margin: 0,
    minHeight: "1rem",
  },
});

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, feedback, className, style, id, ...props },
  ref,
) {
  const autoId = React.useId();
  const areaId = id ?? autoId;
  const field = useFieldControl(props);
  const invalid = field.invalid;
  const stack = rs(["rs-field", "rs-textarea-field"], styles.field);
  const lab = rs(["rs-field-label", "rs-textarea-label"], styles.label);
  const sx = rs(["rs-textarea", invalid && "rs-textarea-invalid", className], styles.area, invalid && styles.invalid);
  const fb = rs(["rs-feedback", "rs-textarea-feedback"], styles.feedback);
  return (
    <div className={stack.className} style={stack.style}>
      {label != null && (
        <label className={lab.className} style={lab.style} htmlFor={areaId}>
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={areaId}
        {...props}
        aria-describedby={field["aria-describedby"]}
        aria-invalid={field["aria-invalid"]}
        className={sx.className}
        style={{ ...sx.style, ...style }}
      />
      {feedback != null && (
        <span className={fb.className} style={fb.style}>
          {feedback}
        </span>
      )}
    </div>
  );
});
