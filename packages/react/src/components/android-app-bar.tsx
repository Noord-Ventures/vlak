"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";

const styles = stylex.create({
	bar: {
		boxSizing: "border-box",
		display: "grid",
		gridTemplateColumns: "auto minmax(0, 1fr) auto",
		alignItems: "center",
		columnGap: 8,
		minHeight: 64,
		paddingInline: 16,
		paddingBlock: 8,
		backgroundColor: vlak.paper,
		color: vlak.ink,
		fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
	},
	medium: { minHeight: 112, alignItems: "start", rowGap: 8 },
	title: {
		gridRow: 1,
		minWidth: 0,
		margin: 0,
		fontSize: 22,
		fontWeight: 500,
		lineHeight: 1.3,
		overflowWrap: "anywhere",
	},
	leadingTitle: { gridColumn: "1 / 3" },
	mediumTitle: {
		gridColumn: "1 / -1",
		gridRow: 2,
		fontSize: 28,
		paddingBottom: 8,
	},
	navigation: {
		gridColumn: 1,
		gridRow: 1,
		display: "flex",
		alignItems: "center",
		minHeight: 48,
	},
	actions: {
		gridColumn: 3,
		gridRow: 1,
		display: "flex",
		alignItems: "center",
		flexWrap: "wrap",
		justifyContent: "end",
		gap: 4,
	},
	action: {
		appearance: "none",
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
		width: 48,
		height: 48,
		padding: 12,
		borderWidth: 0,
		borderRadius: "50%",
		color: vlak.ink,
		backgroundColor: {
			default: "transparent",
			":hover": { default: null, [mq.hover]: vlak.controlFill },
		},
		cursor: { default: "pointer", ":disabled": "not-allowed" },
		opacity: { default: 1, ":disabled": 0.45 },
		outlineWidth: { default: null, ":focus-visible": 2 },
		outlineStyle: { default: null, ":focus-visible": "solid" },
		outlineColor: { default: null, ":focus-visible": vlak.ink },
		outlineOffset: 2,
	},
});

export interface AndroidAppBarProps
	extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
	title: React.ReactNode;
	navigation?: React.ReactNode;
	actions?: React.ReactNode;
	variant?: "small" | "medium";
}

export const AndroidAppBar = React.forwardRef<HTMLElement, AndroidAppBarProps>(
	function AndroidAppBar(
		{
			title,
			navigation,
			actions,
			variant = "small",
			className,
			style,
			children,
			...props
		},
		ref,
	) {
		const medium = variant === "medium";
		const sx = rs(
			["rs-android-app-bar", medium && "rs-android-app-bar-medium", className],
			styles.bar,
			medium && styles.medium,
		);
		const nav = rs(["rs-android-app-bar-navigation"], styles.navigation);
		const heading = rs(
			[
				"rs-android-app-bar-title",
				!navigation && !medium && "rs-android-app-bar-leading-title",
				medium && "rs-android-app-bar-medium-title",
			],
			styles.title,
			!navigation && !medium && styles.leadingTitle,
			medium && styles.mediumTitle,
		);
		const action = rs(["rs-android-app-bar-actions"], styles.actions);
		return (
			<header
				ref={ref}
				{...props}
				className={sx.className}
				style={{ ...sx.style, ...style }}
			>
				<div {...nav}>{navigation}</div>
				<h2 {...heading}>{title}</h2>
				<div {...action}>{actions}</div>
				{children}
			</header>
		);
	},
);

export const AndroidAppBarAction = React.forwardRef<
	HTMLButtonElement,
	React.ButtonHTMLAttributes<HTMLButtonElement>
>(function AndroidAppBarAction(
	{ className, style, type = "button", ...props },
	ref,
) {
	const sx = rs(["rs-android-app-bar-action", className], styles.action);
	return (
		<button
			ref={ref}
			type={type}
			{...props}
			className={sx.className}
			style={{ ...sx.style, ...style }}
		/>
	);
});
