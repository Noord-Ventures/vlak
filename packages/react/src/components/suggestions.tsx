"use client";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { rs } from "../rs";
import { Button, type ButtonProps } from "./button";

export interface SuggestionsProps extends React.HTMLAttributes<HTMLDivElement> { wrap?: boolean }
export interface SuggestionProps extends Omit<ButtonProps, "onClick" | "onSelect" | "value"> { value: string; onSelect?: (value: string) => void }
const styles = stylex.create({ root: { display: "flex", gap: "0.5rem", overflowX: "auto", paddingBlock: "0.25rem", minWidth: 0, maxWidth: "100%" }, wrap: { flexWrap: "wrap" }, item: { flexShrink: 0, width: "auto", whiteSpace: "nowrap" } });
export const Suggestions = React.forwardRef<HTMLDivElement, SuggestionsProps>(function Suggestions({ wrap = false, className, style, ...props }, ref) { const root = rs(["rs-suggestions", wrap && "rs-suggestions-wrap", className], styles.root, wrap && styles.wrap); return <div ref={ref} role="group" aria-label="Suggested prompts" {...props} className={root.className} style={{ ...root.style, ...style }} />; });
export const Suggestion = React.forwardRef<HTMLButtonElement, SuggestionProps>(function Suggestion({ value, onSelect, children, className, style, ...props }, ref) { const root = rs(["rs-suggestions-item", className], styles.item); return <Button ref={ref} variant="ghost" {...props} className={root.className} style={{ ...root.style, ...style }} onClick={() => onSelect?.(value)}>{children ?? value}</Button>; });
