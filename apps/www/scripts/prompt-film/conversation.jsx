import { useLayoutEffect, useRef, useState } from "react";
import {
	Button,
	Card,
	CardBody,
	Icon,
	Spinner,
	Textarea,
} from "@noorddev/vlak-react";

// The editable prompt becomes the submitted bubble without replacing its DOM
// node or changing its native type, radius, padding, width, or height.
export function Conversation({ onReady, onSubmit }) {
	const [draft, setDraft] = useState(""),
		[submitted, setSubmitted] = useState(false),
		[reply, setReply] = useState("");
	const card = useRef(null),
		textarea = useRef(null),
		originalTextarea = useRef(null),
		current = useRef({ draft, submitted, reply });
	current.current = { draft, submitted, reply };
	useLayoutEffect(() => {
		originalTextarea.current ??= textarea.current;
		onReady?.({
			setReply,
			inspect() {
				const field = textarea.current,
					container = card.current;
				if (!field || !container) return { mounted: false };
				const bounds = field.getBoundingClientRect(),
					parent = container.getBoundingClientRect(),
					scale = parent.width / container.offsetWidth || 1,
					style = getComputedStyle(field);
				return {
					mounted: true,
					...current.current,
					sameTextarea: field === originalTextarea.current,
					value: field.value,
					readOnly: field.readOnly,
					disabled: field.disabled,
					field: {
						x: (bounds.left - parent.left) / scale,
						y: (bounds.top - parent.top) / scale,
						width: bounds.width / scale,
						height: bounds.height / scale,
						fontFamily: style.fontFamily,
						fontSize: style.fontSize,
						lineHeight: style.lineHeight,
						borderRadius: style.borderRadius,
						background: style.backgroundColor,
						color: style.color,
					},
					card: {
						width: container.offsetWidth,
						height: container.offsetHeight,
					},
				};
			},
		});
	}, [onReady]);
	return (
		<Card ref={card} style={{ width: 560, maxWidth: "none" }}>
			<form
				aria-label="Message"
				style={{ display: "flex", flexDirection: "column", gap: 12 }}
				onSubmit={(event) => {
					event.preventDefault();
					if (submitted || !draft.trim()) return;
					setSubmitted(true);
					onSubmit?.(draft);
				}}
			>
				<Textarea
					ref={textarea}
					aria-label="Message"
					value={draft}
					readOnly={submitted}
					onChange={(event) => {
						if (!submitted) setDraft(event.target.value);
					}}
					onKeyDown={(event) => {
						if (
							!submitted &&
							event.key === "Enter" &&
							!event.shiftKey &&
							!event.nativeEvent.isComposing
						) {
							event.preventDefault();
							event.currentTarget.form.requestSubmit();
						}
					}}
					placeholder=""
					style={
						submitted
							? {
									backgroundColor: "var(--text)",
									color: "var(--bg)",
									borderColor: "var(--text)",
									caretColor: "transparent",
									resize: "none",
								}
							: undefined
					}
				/>
				<div style={{ position: "relative", height: 44 }}>
					<Button
						type="submit"
						disabled={submitted || !draft.trim()}
						tabIndex={submitted ? -1 : undefined}
						aria-hidden={submitted || undefined}
						style={{
							position: "absolute",
							right: 0,
							top: 0,
							width: "auto",
							paddingInline: 14,
							opacity: submitted ? 0 : 1,
							visibility: submitted ? "hidden" : "visible",
						}}
					>
						<Icon name="send" />
						Send
					</Button>
					<div
						aria-live="polite"
						aria-atomic="true"
						style={{
							position: "absolute",
							left: 0,
							right: 0,
							top: 0,
							height: 44,
							visibility: submitted ? "visible" : "hidden",
						}}
					>
						{reply ? (
							<CardBody>{reply}</CardBody>
						) : (
							<Spinner label="Thinking" />
						)}
					</div>
				</div>
			</form>
		</Card>
	);
}
