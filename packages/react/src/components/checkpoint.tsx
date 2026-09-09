"use client";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { rs } from "../rs";
import { vlak } from "../tokens.stylex";
import { Button } from "./button";

export interface CheckpointProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onError"> { label: React.ReactNode; onRestore?: () => void | Promise<void>; restoreLabel?: string; disabled?: boolean; onError?: (error: unknown) => void }
const styles = stylex.create({ root: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem", color: vlak.gray, fontSize: "0.8125rem" }, line: { height: 1, backgroundColor: vlak.divider, flex: "1 1 1rem" }, error: { flexBasis: "100%", color: vlak.ink, margin: 0 } });
/** A restore marker. The application owns saved history and the async restore operation. */
export const Checkpoint = React.forwardRef<HTMLDivElement, CheckpointProps>(function Checkpoint({ label, onRestore, restoreLabel = "Restore checkpoint", disabled, onError, className, style, children, ...props }, ref) {
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState(false);
  const generation = React.useRef(0);
  const busy = React.useRef(false);
  React.useEffect(() => () => { generation.current++; }, []);
  const restore = async () => { if (!onRestore || busy.current || disabled) return; busy.current = true; const token = generation.current; setPending(true); setError(false); try { await onRestore(); } catch (cause) { if (token === generation.current) { setError(true); onError?.(cause); } } finally { if (token === generation.current) { busy.current = false; setPending(false); } } };
  const root = rs(["rs-checkpoint", className], styles.root);
  return <div ref={ref} {...props} className={root.className} style={{ ...root.style, ...style }}><span {...rs(["rs-checkpoint-line"], styles.line)} aria-hidden="true" /><span>{label}</span>{onRestore && <Button variant="subtle" disabled={disabled || pending} onClick={() => { void restore(); }} aria-busy={pending}>{pending ? "Restoring…" : restoreLabel}</Button>}{children}<span {...rs(["rs-checkpoint-line"], styles.line)} aria-hidden="true" />{error && <p {...rs(["rs-checkpoint-error"], styles.error)} role="alert">The checkpoint could not be restored. Try again.</p>}</div>;
});
