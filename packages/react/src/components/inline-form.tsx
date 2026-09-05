"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Icon } from "./icon";

export interface InlineFormProps
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
  placeholder?: string;
  buttonLabel?: React.ReactNode;
  successLabel?: React.ReactNode;
  pendingLabel?: React.ReactNode;
  errorLabel?: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** The action only appears once this returns true. Defaults to a loose e-mail check. */
  validate?: (value: string) => boolean;
  onSubmit?: (value: string) => void | Promise<void>;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

const fadeIn = stylex.keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const styles = stylex.create({
  field: {
    boxSizing: "border-box",
    display: "flex",
    flexWrap: "wrap",
    alignItems: {
      default: "center",
      [mq.phone]: "stretch",
    },
    gap: "0.5rem",
    width: "100%",
    borderWidth: vlak.hairline,
    borderStyle: "solid",
    borderColor: {
      default: vlak.divider,
      ":focus-within": vlak.accent,
    },
    borderRadius: {
      default: vlak.radiusSm,
      [mq.phone]: vlak.radiusSm,
    },
    backgroundColor: "var(--bg)",
    paddingBlock: {
      default: "0.25rem",
      [mq.phone]: 0,
    },
    paddingInlineStart: {
      default: "0.75rem",
      [mq.phone]: 0,
    },
    paddingInlineEnd: {
      default: "0.375rem",
      [mq.phone]: 0,
    },
    minHeight: {
      default: null,
      [mq.phone]: vlak.hit,
    },
    transition: `border-color ${vlak.durationSnap} ${vlak.ease}`,
  },
  input: {
    boxSizing: "border-box",
    flexGrow: 1,
    minWidth: 0,
    appearance: "none",
    WebkitAppearance: "none",
    borderWidth: 0,
    backgroundColor: "transparent",
    color: "var(--text)",
    caretColor: "var(--text)",
    fontFamily: "inherit",
    fontSize: {
      default: "0.875rem",
      [mq.phone]: "1rem",
    },
    letterSpacing: "-0.01em",
    outline: "none",
    paddingBlock: {
      default: "0.4375rem",
      [mq.phone]: 0,
    },
    paddingInline: {
      default: 0,
      [mq.phone]: "0.875rem",
    },
    minHeight: {
      default: vlak.hit,
      [mq.phone]: vlak.hit,
    },
    "::placeholder": {
      color: vlak.gray,
    },
  },
  reveal: {
    maxWidth: 0,
    opacity: 0,
    overflow: "hidden",
    transition: `max-width ${vlak.duration} ${vlak.ease}, opacity ${vlak.duration} ${vlak.ease}`,
  },
  revealIn: {
    maxWidth: "10rem",
    opacity: 1,
  },
  btn: {
    height: {
      default: vlak.hit,
      [mq.phone]: vlak.hit,
    },
    minHeight: {
      default: null,
      [mq.phone]: vlak.hit,
    },
    paddingInline: {
      default: "1rem",
      [mq.phone]: "1rem",
    },
    fontSize: {
      default: "0.78125rem",
      [mq.phone]: vlak.controlFs,
    },
    minWidth: vlak.hit,
    borderRadius: {
      default: 0,
      [mq.phone]: 0,
    },
    whiteSpace: "nowrap",
    fontFamily: "inherit",
    fontWeight: 600,
    letterSpacing: "-0.01em",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    backgroundColor: vlak.ink,
    color: vlak.paper,
    borderWidth: 0,
  },
  subscribed: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: 600,
    letterSpacing: "-0.01em",
    color: vlak.ink,
    animationName: fadeIn,
    animationDuration: vlak.durationConfirm,
    animationTimingFunction: vlak.ease,
  },
  error: {
    flexBasis: "100%",
    margin: 0,
    padding: "0.5rem",
    fontSize: vlak.controlFs,
    color: vlak.ink,
  },
});

/** One field, one action; asynchronous actions only confirm after they resolve. */
export const InlineForm = React.forwardRef<HTMLFormElement, InlineFormProps>(function InlineForm({
  placeholder = "Your e-mail",
  buttonLabel = "Subscribe",
  successLabel = "You're on the list",
  pendingLabel = "Submitting…",
  errorLabel = "Could not submit. Please try again.",
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  validate = (v) => /.+@.+\..+/.test(v),
  onSubmit,
  className,
  style,
  inputProps,
  ...props
}, ref) {
  const [inner, setInner] = React.useState(defaultValue);
  const value = controlledValue ?? inner;
  const [state, setState] = React.useState<"idle" | "pending" | "success" | "error">("idle");
  const submitting = React.useRef(false);
  const errorId = React.useId();
  const valid = validate(value);
  const pending = state === "pending";
  const sx = rs(["rs-inline-field", className], styles.field);
  const input = rs(["rs-inline-input", inputProps?.className], styles.input);
  const reveal = rs(["rs-reveal", valid && "rs-reveal-in"], styles.reveal, valid && styles.revealIn);
  const btn = rs(["rs-btn-primary", "rs-inline-btn", "rs-inline-field-btn"], styles.btn);
  const ok = rs(["rs-subscribed"], styles.subscribed);
  const error = rs(["rs-inline-error"], styles.error);

  return (
    <form
      ref={ref}
      {...props}
      className={sx.className}
      style={{ ...sx.style, ...style }}
      aria-busy={pending || undefined}
      onSubmit={async (e) => {
        e.preventDefault();
        if (!valid || submitting.current) return;
        if (!onSubmit) { setState("error"); return; }
        submitting.current = true;
        setState("pending");
        try {
          await onSubmit(value);
          setState("success");
        } catch {
          setState("error");
        } finally {
          submitting.current = false;
        }
      }}
    >
      {state === "success" ? (
        <div role="status" className={ok.className} style={ok.style}>
          <Icon name="check" size={16} />{successLabel}
        </div>
      ) : <>
        <input
          {...inputProps}
          className={input.className}
          style={{ ...input.style, ...inputProps?.style }}
          placeholder={placeholder}
          aria-label={inputProps?.["aria-label"] ?? placeholder}
          aria-describedby={[inputProps?.["aria-describedby"], state === "error" ? errorId : undefined].filter(Boolean).join(" ") || undefined}
          value={value}
          disabled={pending || inputProps?.disabled}
          onChange={(e) => {
            inputProps?.onChange?.(e);
            if (e.defaultPrevented) return;
            if (controlledValue === undefined) setInner(e.target.value);
            onValueChange?.(e.target.value);
            if (state === "error") setState("idle");
          }}
        />
        <span className={reveal.className} style={reveal.style}>
          <button type="submit" className={btn.className} style={btn.style} disabled={!valid || pending || inputProps?.disabled} tabIndex={valid ? 0 : -1}>
            {pending ? pendingLabel : buttonLabel}
          </button>
        </span>
        {state === "error" && <p id={errorId} role="alert" className={error.className} style={error.style}>{errorLabel}</p>}
      </>}
    </form>
  );
});
