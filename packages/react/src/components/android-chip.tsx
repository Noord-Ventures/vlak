"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Icon } from "./icon";

const styles = stylex.create({
	chip: {
		appearance: "none",
		boxSizing: "border-box",
		position: "relative",
		isolation: "isolate",
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		minWidth: 48,
		minHeight: 48,
		padding: "8px 16px",
		borderWidth: 0,
		borderRadius: 8,
		backgroundColor: "transparent",
		color: vlak.ink,
		fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
		fontSize: 14,
		fontWeight: 500,
		lineHeight: 1.4,
		cursor: { default: "pointer", ":disabled": "not-allowed" },
		opacity: { default: 1, ":disabled": 0.45 },
		outlineWidth: { default: null, ":focus-visible": 2 },
		outlineStyle: { default: null, ":focus-visible": "solid" },
		outlineColor: { default: null, ":focus-visible": vlak.ink },
		outlineOffset: 0,
		"::before": {
			content: '""',
			position: "absolute",
			zIndex: -1,
			inset: "8px 0",
			borderWidth: 1,
			borderStyle: "solid",
			borderColor: vlak.controlBorder,
			borderRadius: 8,
			backgroundColor: {
				default: vlak.paper,
				":hover": { default: null, [mq.hover]: vlak.controlFill },
			},
			transition: {
				default: "background-color 240ms cubic-bezier(.2,0,0,1)",
				[mq.reduce]: "none",
			},
		},
	},
	selected: {
		color: { default: vlak.paper, [mq.forcedColors]: "HighlightText" },
		fontWeight: 600,
		"::before": {
			backgroundColor: { default: vlak.ink, [mq.forcedColors]: "Highlight" },
			borderColor: { default: vlak.ink, [mq.forcedColors]: "Highlight" },
		},
	},
	icon: {
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
		width: 20,
		height: 20,
	},
});
export interface AndroidChipProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	selected?: boolean;
	defaultSelected?: boolean;
	onSelectedChange?: (selected: boolean) => void;
	icon?: React.ReactNode;
}
export const AndroidChip = React.forwardRef<
	HTMLButtonElement,
	AndroidChipProps
>(function AndroidChip(
	{
		selected,
		defaultSelected = false,
		onSelectedChange,
		icon,
		onClick,
		className,
		style,
		children,
		type = "button",
		...props
	},
	ref,
) {
	const [inner, setInner] = React.useState(defaultSelected);
	const current = selected ?? inner;
	const sx = rs(
		["rs-android-chip", current && "rs-android-chip-selected", className],
		styles.chip,
		current && styles.selected,
	);
	const glyph = rs(["rs-android-chip-icon"], styles.icon);
	return (
		<button
			ref={ref}
			type={type}
			{...props}
			aria-pressed={current}
			onClick={(event) => {
				onClick?.(event);
				if (!event.defaultPrevented) {
					if (selected === undefined) setInner(!current);
					onSelectedChange?.(!current);
				}
			}}
			className={sx.className}
			style={{ ...sx.style, ...style }}
		>
			{(current || icon != null) && (
				<span {...glyph} aria-hidden="true">
					{current ? <Icon name="check" size={16} /> : icon}
				</span>
			)}
			{children}
		</button>
	);
});
