import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";

export interface FlowProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface FlowStepProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface FlowAddProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const at560 = "@media (min-width: 560px)";
const at940 = "@media (min-width: 940px)";
const at1280 = "@media (min-width: 1280px)";
const at1448 = "@media (min-width: 1448px)";

const styles = stylex.create({
  flow: {
    display: "grid",
    gridTemplateColumns: {
      default: "1fr",
      [at560]: "repeat(2, 184px)",
      [at940]: "repeat(3, 184px)",
      [at1280]: "repeat(4, 184px)",
      [at1448]: "repeat(5, 184px)",
    },
    width: {
      default: null,
      [at560]: "fit-content",
    },
    gap: vlak.gutter,
  },
  step: {
    position: "relative",
    borderWidth: vlak.hairline,
    borderStyle: "dashed",
    borderColor: {
      default: vlak.divider,
      ":hover": { default: null, [mq.hover]: vlak.accent },
    },
    borderRadius: vlak.radiusSm,
    paddingTop: "0.875rem",
    paddingInlineEnd: "2.125rem",
    paddingBottom: "1rem",
    paddingInlineStart: "0.875rem",
    backgroundColor: "var(--bg)",
    transition: {
      default: vlak.transition,
      [mq.reduce]: "none",
    },
    "::after": {
      content: '""',
      position: "absolute",
      top: "0.9375rem",
      insetInlineEnd: "0.8125rem",
      width: "0.5rem",
      height: "0.875rem",
      backgroundImage: "radial-gradient(currentColor 1.1px, transparent 1.3px)",
      backgroundSize: "4px 5px",
      color: "var(--text-secondary)",
      opacity: 0.4,
    },
  },
  num: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.875rem",
    height: "1.875rem",
    borderRadius: "50%",
    borderWidth: vlak.hairline,
    borderStyle: "solid",
    borderColor: vlak.divider,
    backgroundColor: "var(--bg)",
    fontSize: "0.8125rem",
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums",
    color: "var(--text)",
    marginBottom: "0.875rem",
  },
  title: {
    display: "inline-block",
    fontSize: "0.90625rem",
    fontWeight: 600,
    letterSpacing: "-0.01em",
    color: "var(--text)",
    borderBottomWidth: vlak.hairline,
    borderBottomStyle: "dashed",
    borderBottomColor: vlak.divider,
    paddingBottom: 1,
    marginTop: 0,
    marginBottom: "0.5rem",
    marginInlineStart: 0,
    marginInlineEnd: 0,
  },
  body: {
    fontSize: "0.78125rem",
    lineHeight: 1.45,
    color: vlak.gray,
    letterSpacing: "-0.005em",
    margin: 0,
  },
  subs: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.3125rem",
    marginTop: "0.6875rem",
  },
  sub: {
    fontSize: "0.6875rem",
    lineHeight: 1,
    paddingBlock: "0.1875rem",
    paddingInline: "0.4375rem",
    borderWidth: vlak.hairline,
    borderStyle: "dashed",
    borderColor: vlak.divider,
    borderRadius: vlak.radiusSm,
    color: vlak.gray,
    letterSpacing: "-0.005em",
  },
  subAdd: {
    width: "1.125rem",
    paddingTop: "0.1875rem",
    paddingBottom: "0.1875rem",
    paddingInlineStart: 0,
    paddingInlineEnd: 0,
    textAlign: "center",
    opacity: 0.7,
  },
  add: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginTop: "0.875rem",
    borderWidth: vlak.hairline,
    borderStyle: "dashed",
    borderColor: {
      default: vlak.divider,
      ":hover": { default: null, [mq.hover]: vlak.accent },
    },
    borderRadius: vlak.radiusSm,
    paddingTop: "0.75rem",
    paddingBottom: "0.75rem",
    paddingInlineStart: "0.875rem",
    paddingInlineEnd: "0.875rem",
    fontSize: "0.8125rem",
    fontWeight: 600,
    letterSpacing: "-0.01em",
    color: {
      default: vlak.gray,
      ":hover": { default: null, [mq.hover]: "var(--text)" },
    },
    backgroundColor: "transparent",
    width: 184,
    maxWidth: "100%",
    transition: {
      default: vlak.transition,
      [mq.reduce]: "none",
    },
    fontFamily: "inherit",
    cursor: "pointer",
  },
  plus: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.125rem",
    height: "1.125rem",
    borderWidth: vlak.hairline,
    borderStyle: "solid",
    borderColor: "currentColor",
    borderRadius: "50%",
    fontSize: "0.8125rem",
    lineHeight: 1,
  },
});

/** Dashed 1px pipeline. */
export const Flow = React.forwardRef<HTMLDivElement, FlowProps>(function Flow(
  { className, style, ...props },
  ref,
) {
  const sx = rs(["rs-flow", className], styles.flow);
  return <div ref={ref} {...props} className={sx.className} style={{ ...sx.style, ...style }} />;
});

export const FlowStep = React.forwardRef<HTMLDivElement, FlowStepProps>(function FlowStep(
  { className, style, ...props },
  ref,
) {
  const sx = rs(["rs-flow-step", className], styles.step);
  return <div ref={ref} {...props} className={sx.className} style={{ ...sx.style, ...style }} />;
});

export const FlowNum = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(function FlowNum(
  { className, style, ...props },
  ref,
) {
  const sx = rs(["rs-flow-num", className], styles.num);
  return <span ref={ref} {...props} className={sx.className} style={{ ...sx.style, ...style }} />;
});

export const FlowTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(function FlowTitle(
  { className, style, ...props },
  ref,
) {
  const sx = rs([className, "rs-flow-title"], styles.title);
  return <h3 ref={ref} {...props} className={sx.className} style={{ ...sx.style, ...style }} />;
});

export const FlowBody = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(function FlowBody(
  { className, style, ...props },
  ref,
) {
  const sx = rs([className, "rs-flow-body"], styles.body);
  return <p ref={ref} {...props} className={sx.className} style={{ ...sx.style, ...style }} />;
});

export const FlowSubs = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function FlowSubs(
  { className, style, ...props },
  ref,
) {
  const sx = rs(["rs-flow-subs", className], styles.subs);
  return <div ref={ref} {...props} className={sx.className} style={{ ...sx.style, ...style }} />;
});

export const FlowSub = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(function FlowSub(
  { className, style, ...props },
  ref,
) {
  const sx = rs([className, "rs-flow-sub"], styles.sub);
  return <span ref={ref} {...props} className={sx.className} style={{ ...sx.style, ...style }} />;
});

export const FlowSubAdd = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(function FlowSubAdd(
  { className, style, ...props },
  ref,
) {
  const sx = rs(["rs-flow-sub-add", className], styles.sub, styles.subAdd);
  return <span ref={ref} {...props} className={sx.className} style={{ ...sx.style, ...style }} />;
});

export const FlowAdd = React.forwardRef<HTMLButtonElement, FlowAddProps>(function FlowAdd(
  { className, style, children, ...props },
  ref,
) {
  const sx = rs(["rs-flow-add", className], styles.add);
  const plus = rs(["rs-flow-plus"], styles.plus);
  return (
    <button ref={ref} type="button" {...props} className={sx.className} style={{ ...sx.style, ...style }}>
      <span className={plus.className} style={plus.style}>
        +
      </span>
      {children}
    </button>
  );
});

export const FlowPlus = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(function FlowPlus(
  { className, style, ...props },
  ref,
) {
  const sx = rs(["rs-flow-plus", className], styles.plus);
  return <span ref={ref} {...props} className={sx.className} style={{ ...sx.style, ...style }} />;
});
