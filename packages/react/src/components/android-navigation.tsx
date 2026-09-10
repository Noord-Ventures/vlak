"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";

const styles = stylex.create({
	nav: {
		boxSizing: "border-box",
		backgroundColor: vlak.paper,
		color: vlak.ink,
		fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
	},
	list: {
		display: "flex",
		flexDirection: "row",
		alignItems: "stretch",
		justifyContent: "space-around",
		gap: 4,
		listStyleType: "none",
		padding: "8px 4px",
		margin: 0,
	},
	rail: {
		flexDirection: "column",
		alignItems: "stretch",
		justifyContent: "start",
		width: 88,
		padding: "12px 4px",
		gap: 12,
	},
	item: { minWidth: 0, flexGrow: 1, display: "flex", justifyContent: "center" },
	control: {
		appearance: "none",
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		gap: 4,
		width: "100%",
		minWidth: 48,
		minHeight: 64,
		padding: "4px 2px",
		borderWidth: 0,
		borderRadius: 16,
		fontFamily: "inherit",
		fontSize: 12,
		fontWeight: 500,
		lineHeight: 1.3,
		textAlign: "center",
		textDecoration: "none",
		color: vlak.gray,
		backgroundColor: {
			default: "transparent",
			":hover": { default: null, [mq.hover]: vlak.controlFill },
		},
		cursor: "pointer",
		outlineWidth: { default: null, ":focus-visible": 2 },
		outlineStyle: { default: null, ":focus-visible": "solid" },
		outlineColor: { default: null, ":focus-visible": vlak.ink },
		outlineOffset: -2,
	},
	current: { color: vlak.ink, fontWeight: 600 },
	disabled: { opacity: 0.45, cursor: "not-allowed" },
	indicator: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		width: 56,
		height: 32,
		borderRadius: 16,
		transition: {
			default: "background-color 240ms cubic-bezier(.2,0,0,1)",
			[mq.reduce]: "none",
		},
	},
	activeIndicator: {
		backgroundColor: { default: vlak.ink, [mq.forcedColors]: "Highlight" },
		color: { default: vlak.paper, [mq.forcedColors]: "HighlightText" },
	},
	label: { overflowWrap: "anywhere", paddingInline: 2 },
});
export interface AndroidNavigationItem {
	value: string;
	label: string;
	icon?: React.ReactNode;
	href?: string;
	disabled?: boolean;
	target?: React.HTMLAttributeAnchorTarget;
	rel?: string;
}
export interface AndroidNavigationProps
	extends Omit<React.HTMLAttributes<HTMLElement>, "defaultValue" | "onChange"> {
	items: AndroidNavigationItem[];
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	orientation?: "horizontal" | "vertical";
}
export const AndroidNavigation = React.forwardRef<
	HTMLElement,
	AndroidNavigationProps
>(function AndroidNavigation(
	{
		items,
		value,
		defaultValue,
		onValueChange,
		orientation = "horizontal",
		className,
		style,
		onKeyDown,
		...props
	},
	ref,
) {
	const [inner, setInner] = React.useState(
		defaultValue ?? items.find((item) => !item.disabled)?.value,
	);
	const current = value ?? inner;
	const sx = rs(["rs-android-navigation", className], styles.nav);
	const list = rs(
		[
			"rs-android-navigation-list",
			orientation === "vertical" && "rs-android-navigation-rail",
		],
		styles.list,
		orientation === "vertical" && styles.rail,
	);
	function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
		onKeyDown?.(event);
		if (
			event.defaultPrevented ||
			event.altKey ||
			event.ctrlKey ||
			event.metaKey
		)
			return;
		const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
		const previousKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
		if (![nextKey, previousKey, "Home", "End"].includes(event.key)) return;
		const controls = Array.from(
			event.currentTarget.querySelectorAll<HTMLElement>(
				"[data-android-destination]:not([aria-disabled='true'])",
			),
		);
		const index = controls.indexOf(document.activeElement as HTMLElement);
		if (index < 0 || !controls.length) return;
		event.preventDefault();
		const rtl =
			orientation === "horizontal" &&
			getComputedStyle(event.currentTarget).direction === "rtl";
		const direction = (event.key === nextKey ? 1 : -1) * (rtl ? -1 : 1);
		controls[
			event.key === "Home"
				? 0
				: event.key === "End"
					? controls.length - 1
					: (index + direction + controls.length) % controls.length
		]?.focus();
	}
	return (
		<nav
			ref={ref}
			aria-label="Main navigation"
			{...props}
			onKeyDown={handleKeyDown}
			className={sx.className}
			style={{ ...sx.style, ...style }}
		>
			<ul {...list}>
				{items.map((item) => {
					const active = item.value === current;
					const row = rs(["rs-android-navigation-item"], styles.item);
					const control = rs(
						[
							"rs-android-navigation-control",
							active && "rs-android-navigation-current",
							item.disabled && "rs-android-navigation-disabled",
						],
						styles.control,
						active && styles.current,
						item.disabled && styles.disabled,
					);
					const indicator = rs(
						[
							"rs-android-navigation-indicator",
							active && "rs-android-navigation-active-indicator",
						],
						styles.indicator,
						active && styles.activeIndicator,
					);
					const label = rs(["rs-android-navigation-label"], styles.label);
					const content = (
						<>
							<span {...indicator} aria-hidden="true">
								{item.icon ?? item.label.slice(0, 1)}
							</span>
							<span {...label}>{item.label}</span>
						</>
					);
					const shared = {
						...control,
						"data-android-destination": "",
						"aria-current": active ? ("page" as const) : undefined,
						"aria-disabled": item.disabled || undefined,
						onClick: () => {
							if (!item.disabled) {
								if (value === undefined) setInner(item.value);
								onValueChange?.(item.value);
							}
						},
					};
					return (
						<li key={item.value} {...row}>
							{item.href ? (
								<a
									{...shared}
									href={item.disabled ? undefined : item.href}
									target={item.target}
									rel={item.rel}
									tabIndex={item.disabled ? -1 : undefined}
								>
									{content}
								</a>
							) : (
								<button {...shared} type="button" disabled={item.disabled}>
									{content}
								</button>
							)}
						</li>
					);
				})}
			</ul>
		</nav>
	);
});
