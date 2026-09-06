import { useLayoutEffect, useRef, useState } from "react";
import {
	Button,
	Card,
	CardBody,
	Icon,
	Input,
	InputGroup,
	Spinner,
} from "@noorddev/vlak-react";

// The editable prompt becomes the submitted bubble without replacing its DOM
// node or changing its native type, radius, padding, width, or height.
export function Conversation({ onReady, onSubmit }) {
	const [draft, setDraft] = useState(""),
		[submitted, setSubmitted] = useState(false),
		[reply, setReply] = useState("");
	const card = useRef(null),
		promptField = useRef(null),
		originalField = useRef(null),
		current = useRef({ draft, submitted, reply });
	current.current = { draft, submitted, reply };
	useLayoutEffect(() => {
		originalField.current ??= promptField.current;
		onReady?.({
			setReply,
			inspect() {
				const field = promptField.current,
					container = card.current;
				if (!field || !container) return { mounted: false };
				const bounds = field.getBoundingClientRect(),
					parent = container.getBoundingClientRect(),
					scale = parent.width / container.offsetWidth || 1,
					style = getComputedStyle(field);
				return {
					mounted: true,
					...current.current,
					sameField: field === originalField.current,
					fieldType: field.tagName.toLowerCase(),
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
				<InputGroup
					style={
						submitted
							? {
									backgroundColor: "var(--text)",
									borderColor: "var(--text)",
								}
							: undefined
					}
				>
					<Input
						ref={promptField}
						plain
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
									}
								: undefined
						}
					/>
					<Button
						type="submit"
						grouped
						aria-label="Send"
						disabled={submitted || !draft.trim()}
						tabIndex={submitted ? -1 : undefined}
						aria-hidden={submitted || undefined}
						style={{
							alignSelf: "center",
							flex: "0 0 44px",
							width: 44,
							paddingInline: 0,
							visibility: submitted ? "hidden" : "visible",
						}}
					>
						<Icon name="arrow-up" />
					</Button>
				</InputGroup>
				<div style={{ position: "relative", height: 44 }}>
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
