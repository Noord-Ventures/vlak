"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";

const styles = stylex.create({
	list: {
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
		gap: 2,
		padding: 0,
		margin: 0,
		listStyleType: "none",
		fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
		color: vlak.ink,
	},
	row: {
		boxSizing: "border-box",
		display: "flex",
		alignItems: "center",
		gap: 8,
		minHeight: 56,
		minWidth: 0,
		backgroundColor: vlak.controlFill,
		borderRadius: {
			default: 4,
			":first-child": "16px 16px 4px 4px",
			":last-child": "4px 4px 16px 16px",
			":only-child": 16,
		},
	},
	body: {
		boxSizing: "border-box",
		display: "flex",
		alignItems: "center",
		gap: 16,
		flex: "1 1 0%",
		minWidth: 0,
		minHeight: 56,
		padding: "10px 16px",
		borderWidth: 0,
		borderRadius: "inherit",
		backgroundColor: "transparent",
		color: "inherit",
		fontFamily: "inherit",
		fontSize: 16,
		lineHeight: 1.5,
		textAlign: "start",
	},
	action: {
		appearance: "none",
		cursor: { default: "pointer", ":disabled": "not-allowed" },
		backgroundColor: {
			default: "transparent",
			":hover": { default: null, [mq.hover]: vlak.controlFill },
		},
		opacity: { default: 1, ":disabled": 0.45 },
		outlineWidth: { default: null, ":focus-visible": 2 },
		outlineStyle: { default: null, ":focus-visible": "solid" },
		outlineColor: { default: null, ":focus-visible": vlak.ink },
		outlineOffset: -2,
	},
	twoLine: { minHeight: 72 },
	threeLine: { minHeight: 88 },
	leading: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
		minWidth: 24,
		minHeight: 24,
	},
	copy: {
		display: "flex",
		flexDirection: "column",
		minWidth: 0,
		gap: 2,
		overflowWrap: "anywhere",
	},
	headline: { fontSize: 16, fontWeight: 500, lineHeight: 1.5 },
	secondary: {
		fontSize: 14,
		fontWeight: 400,
		lineHeight: 1.4,
		color: vlak.ink,
	},
	trailing: {
		display: "flex",
		alignItems: "center",
		gap: 8,
		flexShrink: 0,
		paddingInlineEnd: 16,
		fontSize: 14,
		color: vlak.ink,
	},
});
export interface AndroidListProps
	extends React.HTMLAttributes<HTMLUListElement> {}

export const AndroidList = React.forwardRef<HTMLUListElement, AndroidListProps>(
	function AndroidList({ className, style, ...props }, ref) {
		const sx = rs(["rs-android-list", className], styles.list);
		return (
			<ul
				ref={ref}
				{...props}
				className={sx.className}
				style={{ ...sx.style, ...style }}
			/>
		);
	},
);
export interface AndroidListRowProps
	extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "children"> {
	headline: React.ReactNode;
	supportingText?: React.ReactNode;
	overline?: React.ReactNode;
	leading?: React.ReactNode;
	trailing?: React.ReactNode;
	onAction?: React.MouseEventHandler<HTMLButtonElement>;
	disabled?: boolean;
	/** Native attributes for the row's optional button. Trailing controls remain siblings. */
	actionProps?: Omit<
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		"children" | "onClick" | "disabled" | "className" | "style"
	>;
}
export const AndroidListRow = React.forwardRef<
	HTMLLIElement,
	AndroidListRowProps
>(function AndroidListRow(
	{
		headline,
		supportingText,
		overline,
		leading,
		trailing,
		onAction,
		disabled,
		actionProps,
		className,
		style,
		...props
	},
	ref,
) {
	const sx = rs(["rs-android-list-row", className], styles.row);
	const body = rs(
		[
			"rs-android-list-body",
			!!onAction && "rs-android-list-action",
			supportingText != null && "rs-android-list-two-line",
			overline != null && "rs-android-list-three-line",
		],
		styles.body,
		!!onAction && styles.action,
		supportingText != null && styles.twoLine,
		overline != null && styles.threeLine,
	);
	const lead = rs(["rs-android-list-leading"], styles.leading);
	const copy = rs(["rs-android-list-copy"], styles.copy);
	const title = rs(["rs-android-list-headline"], styles.headline);
	const secondary = rs(["rs-android-list-secondary"], styles.secondary);
	const trail = rs(["rs-android-list-trailing"], styles.trailing);
	const content = (
		<>
			{leading != null && (
				<span {...lead} aria-hidden="true">
					{leading}
				</span>
			)}
			<span {...copy}>
				{overline != null && <span {...secondary}>{overline}</span>}
				<span {...title}>{headline}</span>
				{supportingText != null && <span {...secondary}>{supportingText}</span>}
			</span>
		</>
	);
	return (
		<li
			ref={ref}
			{...props}
			className={sx.className}
			style={{ ...sx.style, ...style }}
		>
			{onAction ? (
				<button
					type="button"
					{...actionProps}
					{...body}
					disabled={disabled}
					onClick={onAction}
				>
					{content}
				</button>
			) : (
				<div {...body}>{content}</div>
			)}
			{trailing != null && <span {...trail}>{trailing}</span>}
		</li>
	);
});
