"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { DialogContext, useDialogPart, useNativeDialog } from "./dialog";
import { Icon } from "./icon";

const enter = stylex.keyframes({
	from: { transform: "translateY(32px)", opacity: 0 },
	to: { transform: "translateY(0)", opacity: 1 },
});

const styles = stylex.create({
	open: {
		animationName: { default: enter, [mq.reduce]: "none" },
		animationDuration: "280ms",
		animationTimingFunction: "cubic-bezier(.2,0,0,1)",
	},
	sheet: {
		boxSizing: "border-box",
		position: "fixed",
		insetInline: 0,
		top: "auto",
		bottom: 0,
		width: "min(640px, 100%)",
		maxWidth: "100%",
		maxHeight: "90dvh",
		margin: "0 auto",
		padding: "28px 24px max(24px, env(safe-area-inset-bottom))",
		overflowY: "auto",
		overscrollBehavior: "contain",
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: vlak.divider,
		borderBottomWidth: 0,
		borderRadius: "28px 28px 0 0",
		backgroundColor: vlak.paper,
		color: vlak.ink,
		fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
		boxShadow: "none",
		"::backdrop": {
			backgroundColor: [
				"rgba(0,0,0,.32)",
				`color-mix(in srgb, ${vlak.ink} 32%, transparent)`,
			],
		},
	},
	handle: {
		position: "absolute",
		top: 12,
		insetInlineStart: "calc(50% - 16px)",
		width: 32,
		height: 4,
		borderRadius: 2,
		backgroundColor: { default: vlak.gray, [mq.forcedColors]: "CanvasText" },
	},
	close: {
		appearance: "none",
		float: "inline-end",
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		width: 48,
		height: 48,
		margin: "-4px -12px 4px 8px",
		padding: 12,
		borderWidth: 0,
		borderRadius: "50%",
		color: vlak.ink,
		backgroundColor: {
			default: "transparent",
			":hover": { default: null, [mq.hover]: vlak.controlFill },
		},
		cursor: "pointer",
		outlineWidth: { default: null, ":focus-visible": 2 },
		outlineStyle: { default: null, ":focus-visible": "solid" },
		outlineColor: { default: null, ":focus-visible": vlak.ink },
		outlineOffset: 0,
	},
	title: {
		margin: "8px 0 16px",
		fontSize: 24,
		fontWeight: 500,
		lineHeight: 1.3,
		overflowWrap: "anywhere",
	},
	body: {
		margin: "0 0 24px",
		fontSize: 16,
		lineHeight: 1.5,
		color: vlak.gray,
		overflowWrap: "anywhere",
	},
});
export interface AndroidSheetProps
	extends Omit<
		React.DialogHTMLAttributes<HTMLDialogElement>,
		"open" | "onClose"
	> {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	onClose?: () => void;
	dismissable?: boolean;
	lightDismiss?: boolean;
	closeLabel?: string;
}
export const AndroidSheet = React.forwardRef<
	HTMLDialogElement,
	AndroidSheetProps
>(function AndroidSheet(
	{
		open,
		defaultOpen = false,
		onOpenChange,
		onClose,
		dismissable = true,
		lightDismiss = true,
		closeLabel = "Close",
		className,
		style,
		children,
		...props
	},
	forwardedRef,
) {
	const [inner, setInner] = React.useState(defaultOpen);
	const current = open ?? inner;
	const close = () => {
		if (open === undefined) setInner(false);
		onOpenChange?.(false);
		onClose?.();
	};
	const { ref, context, dialogProps } = useNativeDialog(
		{ open: current, onClose: close, dismissable, lightDismiss },
		props,
		forwardedRef,
	);
	const sx = rs(
		["rs-android-sheet", current && "rs-android-sheet-open", className],
		styles.sheet,
		current && styles.open,
	);
	const handle = rs(["rs-android-sheet-handle"], styles.handle);
	const closeSx = rs(["rs-android-sheet-close"], styles.close);
	return (
		<DialogContext.Provider value={context}>
			<dialog
				ref={ref}
				{...props}
				{...dialogProps}
				className={sx.className}
				style={{ ...sx.style, ...style }}
			>
				<span {...handle} aria-hidden="true" />
				{dismissable && (
					<button
						type="button"
						{...closeSx}
						aria-label={closeLabel}
						onClick={close}
					>
						<Icon name="close" size={24} />
					</button>
				)}
				{children}
			</dialog>
		</DialogContext.Provider>
	);
});
export const AndroidSheetTitle = React.forwardRef<
	HTMLHeadingElement,
	React.HTMLAttributes<HTMLHeadingElement>
>(function AndroidSheetTitle({ id, className, style, ...props }, ref) {
	const titleId = useDialogPart("title", id);
	const sx = rs(["rs-android-sheet-title", className], styles.title);
	return (
		<h2
			ref={ref}
			{...props}
			id={titleId}
			className={sx.className}
			style={{ ...sx.style, ...style }}
		/>
	);
});
export const AndroidSheetBody = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(function AndroidSheetBody({ id, className, style, ...props }, ref) {
	const bodyId = useDialogPart("body", id);
	const sx = rs(["rs-android-sheet-body", className], styles.body);
	return (
		<p
			ref={ref}
			{...props}
			id={bodyId}
			className={sx.className}
			style={{ ...sx.style, ...style }}
		/>
	);
});
