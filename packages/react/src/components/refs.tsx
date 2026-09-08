import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";

export interface CiteProps extends React.HTMLAttributes<HTMLElement> {}
export interface RefsProps extends React.OlHTMLAttributes<HTMLOListElement> {}
export interface RefItemProps extends React.LiHTMLAttributes<HTMLLIElement> {}
export interface CiteBoxProps extends React.HTMLAttributes<HTMLDivElement> {}


const styles = stylex.create({
  cite: {
    fontSize: "0.65625rem",
    fontWeight: 600,
    letterSpacing: 0,
    lineHeight: 0,
    verticalAlign: "super",
    whiteSpace: "nowrap",
  },
  citeA: {
    color: {
      default: vlak.gray,
      ":hover": { default: null, [mq.hover]: vlak.accent },
    },
    textDecoration: "none",
    transition: {
      default: vlak.transition,
      [mq.reduce]: "none",
    },
  },
  refs: {
    listStyle: "none",
    counterReset: "ref",
    marginTop: "0.25rem",
    marginBottom: "0.5rem",
    marginInlineStart: 0,
    marginInlineEnd: 0,
    padding: 0,
  },
  item: {
    counterIncrement: "ref",
    position: "relative",
    paddingTop: "0.625rem",
    paddingBottom: "0.625rem",
    fontSize: "0.8125rem",
    fontWeight: 500,
    lineHeight: 1.45,
    color: vlak.gray,
    letterSpacing: "-0.01em",
    borderBottomWidth: vlak.hairline,
    borderBottomStyle: "solid",
    borderBottomColor: {
      default: vlak.divider,
      ":last-child": "transparent",
    },
    scrollMarginTop: 88,
    ":target": {
      backgroundColor: "var(--table-alt)",
    },
    "::before": {
      content: "counter(ref)",
      position: "absolute",
      insetInlineStart: "-1rem",
      top: "0.6875rem",
      width: "0.75rem",
      textAlign: "end",
      fontSize: "0.6875rem",
      fontWeight: 600,
      color: "var(--accent)",
    },
  },
  authors: {
    color: "var(--text)",
    fontWeight: 500,
  },
  doi: {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: "0.6875rem",
    color: {
      default: vlak.gray,
      ":hover": { default: null, [mq.hover]: "var(--text)" },
    },
    textDecoration: "none",
    borderBottomWidth: vlak.hairline,
    borderBottomStyle: "solid",
    borderBottomColor: {
      default: vlak.divider,
      ":hover": { default: null, [mq.hover]: vlak.accent },
    },
    transition: {
      default: vlak.transition,
      [mq.reduce]: "none",
    },
    wordBreak: "break-all",
  },
  box: {
    borderWidth: vlak.hairline,
    borderStyle: "solid",
    borderColor: vlak.divider,
    borderRadius: vlak.radius,
    padding: {
      default: "1.25rem",
      [mq.phone]: "14px 16px",
    },
    marginTop: "0.5rem",
  },
  boxLabel: {
    fontSize: "0.75rem",
    fontWeight: 600,
    color: vlak.gray,
    letterSpacing: "-0.01em",
    marginBottom: "0.5rem",
  },
  boxText: {
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: vlak.gray,
    lineHeight: 1.45,
    userSelect: "all",
  },
});

/** Inline superscript citation. */
export const Cite = React.forwardRef<HTMLElement, CiteProps>(function Cite(
  { className, style, children, ...props },
  ref,
) {
  const sx = rs(["rs-cite", className], styles.cite);
  return (
    <sup ref={ref} {...props} className={sx.className} style={{ ...sx.style, ...style }}>
      {children}
    </sup>
  );
});

export const CiteLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(function CiteLink(
  { className, style, ...props },
  ref,
) {
  const sx = rs([className, "rs-cite-cite-a"], styles.citeA);
  return <a ref={ref} {...props} className={sx.className} style={{ ...sx.style, ...style }} />;
});

/** Numbered 1px list. Numerals hang in the gutter. */
export const Refs = React.forwardRef<HTMLOListElement, RefsProps>(function Refs(
  { className, style, ...props },
  ref,
) {
  const sx = rs(["rs-refs", className], styles.refs);
  return <ol ref={ref} {...props} className={sx.className} style={{ ...sx.style, ...style }} />;
});

export const RefItem = React.forwardRef<HTMLLIElement, RefItemProps>(function RefItem(
  { className, style, ...props },
  ref,
) {
  const sx = rs([className, "rs-cite-item"], styles.item);
  return <li ref={ref} {...props} className={sx.className} style={{ ...sx.style, ...style }} />;
});

export const RefAuthors = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(function RefAuthors(
  { className, style, ...props },
  ref,
) {
  const sx = rs(["rs-ref-authors", className], styles.authors);
  return <span ref={ref} {...props} className={sx.className} style={{ ...sx.style, ...style }} />;
});

export const RefDoi = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(function RefDoi(
  { className, style, ...props },
  ref,
) {
  const sx = rs(["rs-ref-doi", className], styles.doi);
  return <a ref={ref} {...props} className={sx.className} style={{ ...sx.style, ...style }} />;
});

export const CiteBox = React.forwardRef<HTMLDivElement, CiteBoxProps>(function CiteBox(
  { className, style, ...props },
  ref,
) {
  const sx = rs(["rs-cite-box", className], styles.box);
  return <div ref={ref} {...props} className={sx.className} style={{ ...sx.style, ...style }} />;
});

export const CiteBoxLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function CiteBoxLabel(
  { className, style, ...props },
  ref,
) {
  const sx = rs(["rs-cite-box-label", className], styles.boxLabel);
  return <div ref={ref} {...props} className={sx.className} style={{ ...sx.style, ...style }} />;
});

export const CiteBoxText = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function CiteBoxText(
  { className, style, ...props },
  ref,
) {
  const sx = rs(["rs-cite-box-text", className], styles.boxText);
  return <div ref={ref} {...props} className={sx.className} style={{ ...sx.style, ...style }} />;
});
