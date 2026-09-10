"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { setRef } from "../merge-refs";

const styles = stylex.create({
	input: {
		appearance: "none",
		boxSizing: "border-box",
		position: "relative",
		display: "inline-block",
		verticalAlign: "middle",
		flexShrink: 0,
		width: 52,
		height: 48,
		margin: 0,
		padding: 0,
		borderWidth: 0,
		backgroundColor: "transparent",
		cursor: { default: "pointer", ":disabled": "not-allowed" },
		opacity: { default: 1, ":disabled": 0.45 },
		borderRadius: 24,
		outlineWidth: { default: null, ":focus-visible": 2 },
		outlineStyle: { default: null, ":focus-visible": "solid" },
		outlineColor: { default: null, ":focus-visible": vlak.ink },
		outlineOffset: 2,
		"::before": {
			content: '""',
			position: "absolute",
			inset: "8px 0",
			borderWidth: 2,
			borderStyle: "solid",
			borderColor: {
				default: vlak.controlBorder,
				[mq.forcedColors]: "ButtonText",
			},
			borderRadius: 16,
			backgroundColor: vlak.controlFill,
		},
		"::after": {
			content: '""',
			position: "absolute",
			insetInlineStart: 8,
			top: 16,
			width: 16,
			height: 16,
			borderRadius: "50%",
			backgroundColor: { default: vlak.gray, [mq.forcedColors]: "ButtonText" },
			transition: {
				default:
					"width 240ms cubic-bezier(.2,0,0,1), height 240ms cubic-bezier(.2,0,0,1), inset-inline-start 240ms cubic-bezier(.2,0,0,1), top 240ms cubic-bezier(.2,0,0,1)",
				[mq.reduce]: "none",
			},
		},
	},
	checked: {
		"::before": {
			borderColor: { default: vlak.ink, [mq.forcedColors]: "Highlight" },
			backgroundColor: { default: vlak.ink, [mq.forcedColors]: "Highlight" },
		},
		"::after": {
			insetInlineStart: 24,
			top: 12,
			width: 24,
			height: 24,
			backgroundColor: {
				default: vlak.paper,
				[mq.forcedColors]: "HighlightText",
			},
		},
	},
});
export interface AndroidSwitchProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
	onCheckedChange?: (checked: boolean) => void;
}
export const AndroidSwitch = React.forwardRef<
	HTMLInputElement,
	AndroidSwitchProps
>(function AndroidSwitch(
	{
		checked,
		defaultChecked = false,
		onCheckedChange,
		onChange,
		className,
		style,
		...props
	},
	forwardedRef,
) {
	const [inner, setInner] = React.useState(defaultChecked);
	const input = React.useRef<HTMLInputElement | null>(null);
	const current = checked ?? inner;
	React.useEffect(() => {
		const form = props.form
			? input.current?.ownerDocument.getElementById(props.form)
			: input.current?.form;
		if (!(form instanceof HTMLFormElement) || checked !== undefined) return;
		const reset = (event: Event) =>
			queueMicrotask(() => {
				if (!event.defaultPrevented) setInner(defaultChecked);
			});
		form.addEventListener("reset", reset);
		return () => form.removeEventListener("reset", reset);
	}, [checked, defaultChecked, props.form]);
	const sx = rs(
		["rs-android-switch", current && "rs-android-switch-checked", className],
		styles.input,
		current && styles.checked,
	);
	return (
		<input
			{...props}
			ref={(node) => {
				input.current = node;
				setRef(forwardedRef, node);
			}}
			type="checkbox"
			role="switch"
			checked={current}
			aria-checked={current}
			onChange={(event) => {
				onChange?.(event);
				if (!event.defaultPrevented) {
					if (checked === undefined) setInner(event.target.checked);
					onCheckedChange?.(event.target.checked);
				}
			}}
			className={sx.className}
			style={{ ...sx.style, ...style }}
		/>
	);
});
