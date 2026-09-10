"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { setRef } from "../merge-refs";
import { Icon } from "./icon";

const styles = stylex.create({
	bar: {
		width: "100%",
		maxWidth: "100%",
		boxSizing: "border-box",
		display: "flex",
		alignItems: "center",
		gap: 8,
		minHeight: 56,
		minWidth: 0,
		paddingInline: 12,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: vlak.controlBorder,
		borderRadius: 28,
		backgroundColor: vlak.controlFill,
		color: vlak.ink,
	},
	icon: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
		width: 24,
		height: 24,
		marginInline: 4,
	},
	input: {
		appearance: "none",
		boxSizing: "border-box",
		flex: "1 1 0%",
		width: 0,
		minWidth: 44,
		minHeight: 48,
		padding: "8px 0",
		margin: 0,
		borderWidth: 0,
		borderRadius: 4,
		backgroundColor: "transparent",
		color: vlak.ink,
		fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
		fontSize: 16,
		lineHeight: 1.5,
		outlineWidth: { default: null, ":focus-visible": 2 },
		outlineStyle: { default: null, ":focus-visible": "solid" },
		outlineColor: { default: null, ":focus-visible": vlak.ink },
		outlineOffset: 0,
		"::placeholder": { color: vlak.ink, opacity: 1 },
		"::-webkit-search-cancel-button": { appearance: "none" },
	},
	clear: {
		appearance: "none",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
		width: 44,
		height: 44,
		marginInlineEnd: -6,
		padding: 0,
		borderWidth: 0,
		borderRadius: "50%",
		backgroundColor: {
			default: "transparent",
			":hover": { default: null, [mq.hover]: vlak.controlFill },
		},
		color: vlak.ink,
		cursor: "pointer",
		outlineWidth: { default: null, ":focus-visible": 2 },
		outlineStyle: { default: null, ":focus-visible": "solid" },
		outlineColor: { default: null, ":focus-visible": vlak.ink },
		outlineOffset: 0,
	},
	disabled: { opacity: 0.45 },
});
export interface AndroidSearchBarProps
	extends Omit<
		React.InputHTMLAttributes<HTMLInputElement>,
		"type" | "value" | "defaultValue" | "size"
	> {
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	clearLabel?: string;
	containerClassName?: string;
	containerStyle?: React.CSSProperties;
}
export const AndroidSearchBar = React.forwardRef<
	HTMLInputElement,
	AndroidSearchBarProps
>(function AndroidSearchBar(
	{
		value,
		defaultValue = "",
		onValueChange,
		onChange,
		onKeyDown,
		disabled,
		readOnly,
		clearLabel = "Clear search",
		className,
		style,
		containerClassName,
		containerStyle,
		...props
	},
	forwardedRef,
) {
	const [inner, setInner] = React.useState(defaultValue);
	const input = React.useRef<HTMLInputElement | null>(null);
	const current = value ?? inner;
	const update = (next: string) => {
		if (value === undefined) setInner(next);
		onValueChange?.(next);
	};
	const clearValue = () => {
		const node = input.current;
		if (!node) return;
		// Use the input's native event path so onChange and form libraries also see clears.
		Object.getOwnPropertyDescriptor(
			HTMLInputElement.prototype,
			"value",
		)?.set?.call(node, "");
		node.dispatchEvent(new Event("input", { bubbles: true }));
	};
	React.useEffect(() => {
		const form = props.form
			? input.current?.ownerDocument.getElementById(props.form)
			: input.current?.form;
		if (!(form instanceof HTMLFormElement) || value !== undefined) return;
		const reset = (event: Event) =>
			queueMicrotask(() => {
				if (!event.defaultPrevented) setInner(defaultValue);
			});
		form.addEventListener("reset", reset);
		return () => form.removeEventListener("reset", reset);
	}, [value, defaultValue, props.form]);
	const bar = rs(
		[
			"rs-android-search-bar",
			disabled && "rs-android-search-bar-disabled",
			containerClassName,
		],
		styles.bar,
		disabled && styles.disabled,
	);
	const sx = rs(["rs-android-search-input", className], styles.input);
	const icon = rs(["rs-android-search-icon"], styles.icon);
	const clear = rs(["rs-android-search-clear"], styles.clear);
	return (
		<div className={bar.className} style={{ ...bar.style, ...containerStyle }}>
			<span {...icon} aria-hidden="true">
				<Icon name="search" size={24} />
			</span>
			<input
				{...props}
				ref={(node) => {
					input.current = node;
					setRef(forwardedRef, node);
				}}
				type="search"
				disabled={disabled}
				readOnly={readOnly}
				value={current}
				onChange={(event) => {
					onChange?.(event);
					if (!event.defaultPrevented) update(event.target.value);
				}}
				onKeyDown={(event) => {
					onKeyDown?.(event);
					if (
						!event.defaultPrevented &&
						event.key === "Escape" &&
						current &&
						!readOnly
					) {
						event.preventDefault();
						event.stopPropagation();
						clearValue();
					}
				}}
				className={sx.className}
				style={{ ...sx.style, ...style }}
			/>
			{current && !disabled && !readOnly ? (
				<button
					type="button"
					{...clear}
					aria-label={clearLabel}
					onClick={() => {
						clearValue();
						input.current?.focus();
					}}
				>
					<Icon name="close" size={24} />
				</button>
			) : null}
		</div>
	);
});
