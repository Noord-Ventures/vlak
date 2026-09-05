"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs, type Leaves } from "../rs";
import { cx } from "../cx";
import { setRef } from "../merge-refs";
import { Icon } from "./icon";

export interface NativeDialogOptions {
  open: boolean;
  onClose?: () => void;
  /**
   * Escape (and any other platform close request) asks the parent to
   * close. Off, the dialog must be answered; maps to closedby="none".
   */
  dismissable?: boolean;
  /** A click on the backdrop closes too; maps to closedby="any". */
  lightDismiss?: boolean;
  /** Renders a labelled close button in the top corner. */
  closeLabel?: string;
}

export interface DialogProps
  extends Omit<React.DialogHTMLAttributes<HTMLDialogElement>, "open" | "onClose">,
    NativeDialogOptions {
  /** Extra StyleX leaves merged after the dialog frame (command palette). */
  extraStyles?: Leaves;
}

export const dialogStyles = stylex.create({
  frame: {
    boxSizing: "border-box",
    maxWidth: {
      default: "20rem",
      [mq.phone]: "calc(100vw - 32px)",
    },
    width: {
      default: null,
      [mq.phone]: "calc(100vw - 32px)",
    },
    borderWidth: vlak.hairline,
    borderStyle: "solid",
    borderColor: vlak.divider,
    borderRadius: vlak.radiusSm,
    padding: {
      default: "1.25rem",
      [mq.phone]: "24px 20px",
    },
    backgroundColor: vlak.paper,
    color: vlak.ink,
    boxShadow: "none",
    "::backdrop": {
      // The page fades toward its own ground: paper in light, near-black in dark.
      backgroundColor: ["rgba(0,0,0,0.25)", `color-mix(in srgb, ${vlak.paper} 55%, transparent)`],
    },
  },
  title: {
    display: "block",
    fontSize: {
      default: "0.9375rem",
      [mq.phone]: "1.125rem",
    },
    fontWeight: 600,
    letterSpacing: "-0.01em",
    color: vlak.ink,
    marginTop: 0,
    marginInlineEnd: 0,
    marginBottom: {
      default: "0.375rem",
      [mq.phone]: "0.625rem",
    },
    marginInlineStart: 0,
  },
  body: {
    fontSize: {
      default: "0.84375rem",
      [mq.phone]: "1rem",
    },
    color: vlak.gray,
    letterSpacing: "-0.01em",
    lineHeight: 1.45,
    marginTop: 0,
    marginInlineEnd: 0,
    marginBottom: {
      default: "1rem",
      [mq.phone]: "1.25rem",
    },
    marginInlineStart: 0,
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    flexDirection: {
      default: "row",
      [mq.phone]: "column",
    },
    alignItems: {
      default: "flex-end",
      [mq.phone]: "stretch",
    },
    gap: {
      default: "0.5rem",
      [mq.phone]: "0.625rem",
    },
  },
  /** Corner close button. Floats so the title wraps around it. */
  close: {
    transition: {
      default: vlak.transition,
      [mq.reduce]: "none",
    },
    float: "inline-end",
    boxSizing: "border-box",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: {
      default: vlak.hit,
      [mq.phone]: vlak.hit,
    },
    height: {
      default: vlak.hit,
      [mq.phone]: vlak.hit,
    },
    marginTop: {
      default: "-0.5rem",
      [mq.phone]: "-0.75rem",
    },
    marginInlineEnd: {
      default: "-0.5rem",
      [mq.phone]: "-0.75rem",
    },
    marginInlineStart: "0.5rem",
    padding: 0,
    borderWidth: 0,
    borderRadius: vlak.radiusSm,
    backgroundColor: {
      default: "transparent",
      ":hover": vlak.controlFill,
    },
    color: vlak.ink,
    cursor: "pointer",
    outlineWidth: {
      default: null,
      ":focus-visible": 2,
    },
    outlineStyle: {
      default: null,
      ":focus-visible": "solid",
    },
    outlineColor: {
      default: null,
      ":focus-visible": vlak.ink,
    },
    outlineOffset: {
      default: null,
      ":focus-visible": 2,
    },
  },
});

/* ── Shared native <dialog> behaviour: naming context, close requests, focus ── */

type DialogPart = "title" | "body";

interface DialogContextValue {
  titleId: string;
  bodyId: string;
  register: (part: DialogPart, id: string) => () => void;
}

export const DialogContext = React.createContext<DialogContextValue | null>(null);

/**
 * Title and body parts call this: it hands back the id the dialog
 * points aria-labelledby / aria-describedby at, and registers the
 * part so the attribute only exists while the part is rendered.
 */
export function useDialogPart(part: DialogPart, explicitId?: string): string | undefined {
  const ctx = React.useContext(DialogContext);
  const id = explicitId ?? (part === "title" ? ctx?.titleId : ctx?.bodyId);
  React.useEffect(() => {
    if (!ctx || !id) return;
    return ctx.register(part, id);
  }, [ctx, part, id]);
  return id;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface NativeDialogProps {
  onCancel?: React.ReactEventHandler<HTMLDialogElement>;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
}

/**
 * Drives a native <dialog> from an `open` prop. Escape and light dismiss
 * become an `onClose` call; the parent's `open` stays the source of
 * truth. Returns the ref, the attributes for the element, and the
 * context value the title/body parts register into.
 */
export function useNativeDialog(
  { open, onClose, dismissable = true, lightDismiss = false }: NativeDialogOptions,
  props: NativeDialogProps,
  forwardedRef?: React.ForwardedRef<HTMLDialogElement>,
) {
  const ref = React.useRef<HTMLDialogElement | null>(null);
  const openRef = React.useRef(open);
  const restoreTo = React.useRef<Element | null>(null);
  const [parts, setParts] = React.useState<{ title?: string; body?: string }>({});
  const base = React.useId();

  const setDialogRef = React.useCallback(
    (node: HTMLDialogElement | null) => {
      ref.current = node;
      setRef(forwardedRef, node);
    },
    [forwardedRef],
  );

  const register = React.useCallback((part: DialogPart, id: string) => {
    setParts((current) => (current[part] === id ? current : { ...current, [part]: id }));
    return () => {
      setParts((current) => (current[part] === id ? { ...current, [part]: undefined } : current));
    };
  }, []);

  const context = React.useMemo<DialogContextValue>(
    () => ({ titleId: `${base}-title`, bodyId: `${base}-body`, register }),
    [base, register],
  );

  React.useEffect(() => {
    openRef.current = open;
    const dialog = ref.current;
    if (!dialog) return;
    if (open) {
      if (dialog.open) return;
      restoreTo.current = document.activeElement;
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.open = true;
      if (!dialog.contains(document.activeElement)) {
        const target =
          dialog.querySelector<HTMLElement>("[autofocus]") ?? dialog.querySelector<HTMLElement>(FOCUSABLE) ?? dialog;
        target.focus();
      }
      return;
    }
    if (dialog.open) dialog.close();
    const previous = restoreTo.current;
    restoreTo.current = null;
    const active = document.activeElement;
    if (previous instanceof HTMLElement && previous.isConnected && (active === document.body || dialog.contains(active))) {
      previous.focus();
    }
  }, [open]);

  const closedBy = !dismissable ? "none" : lightDismiss ? "any" : "closerequest";

  const onCancel = (e: React.SyntheticEvent<HTMLDialogElement>) => {
    props.onCancel?.(e);
    if (e.defaultPrevented) return;
    // The platform never closes on its own: the parent flips `open`.
    e.preventDefault();
    if (dismissable) onClose?.();
  };

  const onNativeClose = () => {
    // Closed by the platform (a forced close request, a method="dialog"
    // form) while the parent still says open: tell it.
    if (openRef.current) onClose?.();
  };

  const labelledBy = props["aria-labelledby"] ?? (props["aria-label"] ? undefined : parts.title);
  const describedBy = cx(props["aria-describedby"], parts.body) || undefined;

  return {
    ref: setDialogRef,
    context,
    dialogProps: {
      onCancel,
      onClose: onNativeClose,
      "aria-labelledby": labelledBy,
      "aria-describedby": describedBy,
      ...({ closedby: closedBy } as object),
    },
  };
}

export interface DialogCloseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** The accessible name. */
  label: string;
}

/**
 * Corner close: a labelled button with the close mark. The caller
 * paints it with its own class over dialogStyles.close.
 */
export function DialogCloseButton({ label, ...props }: DialogCloseButtonProps) {
  return (
    <button type="button" aria-label={label} {...props}>
      <Icon name="close" />
    </button>
  );
}

/**
 * A native <dialog>. Focus trapping, Escape, and the backdrop come
 * from the platform; the title names it and the body describes it.
 */
export const Dialog = React.forwardRef<HTMLDialogElement, DialogProps>(function Dialog(
  { open, onClose, dismissable, lightDismiss, closeLabel, className, style, children, extraStyles, ...props },
  forwardedRef,
) {
  const { ref, context, dialogProps } = useNativeDialog({ open, onClose, dismissable, lightDismiss }, props, forwardedRef);
  const sx = rs(["rs-dialog", className], dialogStyles.frame, ...((extraStyles ?? []) as Leaves));
  const close = rs(["rs-dialog-close"], dialogStyles.close);
  return (
    <DialogContext.Provider value={context}>
      <dialog ref={ref} {...props} {...dialogProps} className={sx.className} style={{ ...sx.style, ...style }}>
        {closeLabel != null && (
          <DialogCloseButton label={closeLabel} className={close.className} style={close.style} onClick={() => onClose?.()} />
        )}
        {children}
      </dialog>
    </DialogContext.Provider>
  );
});

export interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Heading level. The dialog is named by this element either way. */
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
}

export const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(function DialogTitle(
  { as: Tag = "h2", className, style, id, ...props },
  ref,
) {
  const titleId = useDialogPart("title", id);
  const sx = rs(["rs-dialog-title", className], dialogStyles.title);
  return <Tag ref={ref as React.Ref<never>} {...props} id={titleId} className={sx.className} style={{ ...sx.style, ...style }} />;
});

export const DialogBody = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(function DialogBody(
  { className, style, id, ...props },
  ref,
) {
  const bodyId = useDialogPart("body", id);
  const sx = rs(["rs-dialog-body", className], dialogStyles.body);
  return <p ref={ref} {...props} id={bodyId} className={sx.className} style={{ ...sx.style, ...style }} />;
});

export const DialogActions = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function DialogActions(
  { className, style, ...props },
  ref,
) {
  const sx = rs(["rs-dialog-actions", className], dialogStyles.actions);
  return <div ref={ref} {...props} className={sx.className} style={{ ...sx.style, ...style }} />;
});
