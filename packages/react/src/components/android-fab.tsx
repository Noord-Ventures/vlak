"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";

const styles = stylex.create({
	fab: {
		appearance: "none",
		boxSizing: "border-box",
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		gap: 12,
		minWidth: 56,
		minHeight: 56,
		padding: 15,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: { default: vlak.ink, [mq.forcedColors]: "ButtonText" },
		borderRadius: 16,
		backgroundColor: {
			default: vlak.ink,
			":hover": { default: null, [mq.hover]: vlak.gray },
			[mq.forcedColors]: "ButtonFace",
		},
		color: { default: vlak.paper, [mq.forcedColors]: "ButtonText" },
		fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
		fontSize: 16,
		fontWeight: 500,
		lineHeight: 1.5,
		cursor: { default: "pointer", ":disabled": "not-allowed" },
		opacity: { default: 1, ":disabled": 0.45 },
		outlineWidth: { default: null, ":focus-visible": 2 },
		outlineStyle: { default: null, ":focus-visible": "solid" },
		outlineColor: { default: null, ":focus-visible": vlak.ink },
		outlineOffset: 3,
		transition: {
			default: "background-color 240ms cubic-bezier(.2,0,0,1)",
			[mq.reduce]: "none",
		},
	},
	extended: { paddingInline: 20 },
	icon: {
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
		width: 24,
		height: 24,
	},
});
export interface AndroidFabProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	icon: React.ReactNode;
}
export const AndroidFab = React.forwardRef<HTMLButtonElement, AndroidFabProps>(
	function AndroidFab(
		{ icon, children, className, style, type = "button", ...props },
		ref,
	) {
		const sx = rs(
			[
				"rs-android-fab",
				children != null && "rs-android-fab-extended",
				className,
			],
			styles.fab,
			children != null && styles.extended,
		);
		const glyph = rs(["rs-android-fab-icon"], styles.icon);
		return (
			<button
				ref={ref}
				type={type}
				{...props}
				className={sx.className}
				style={{ ...sx.style, ...style }}
			>
				<span {...glyph} aria-hidden="true">
					{icon}
				</span>
				{children}
			</button>
		);
	},
);
