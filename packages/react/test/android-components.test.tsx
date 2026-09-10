import * as React from "react";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import {
	AndroidAppBar,
	AndroidAppBarAction,
} from "../src/components/android-app-bar";
import { AndroidNavigation } from "../src/components/android-navigation";
import { AndroidSearchBar } from "../src/components/android-search-bar";
import { AndroidSwitch } from "../src/components/android-switch";
import { AndroidList, AndroidListRow } from "../src/components/android-list";
import { AndroidChip } from "../src/components/android-chip";
import { AndroidFab } from "../src/components/android-fab";
import {
	AndroidSheet,
	AndroidSheetTitle,
	AndroidSheetBody,
} from "../src/components/android-sheet";

afterEach(cleanup);
beforeAll(() => {
	HTMLDialogElement.prototype.showModal = function () {
		this.open = true;
	};
	HTMLDialogElement.prototype.close = function () {
		this.open = false;
		this.dispatchEvent(new Event("close"));
	};
});
const noViolations = async (el: Element) =>
	expect(
		await axe(el, { rules: { "color-contrast": { enabled: false } } }),
	).toHaveNoViolations();
const destinations = [
	{ value: "home", label: "Home" },
	{ value: "locked", label: "Unavailable", disabled: true },
	{ value: "files", label: "Files" },
	{ value: "settings", label: "Settings" },
];

describe("Android app bar and FAB", () => {
	it("exposes a heading and labelled native actions without submitting forms", async () => {
		const user = userEvent.setup();
		const action = vi.fn();
		const submit = vi.fn();
		const barRef = React.createRef<HTMLElement>();
		const actionRef = React.createRef<HTMLButtonElement>();
		const fabRef = React.createRef<HTMLButtonElement>();
		const { container } = render(
			<form onSubmit={submit}>
				<AndroidAppBar
					ref={barRef}
					title="Documents"
					variant="medium"
					navigation={
						<AndroidAppBarAction
							ref={actionRef}
							aria-label="Go back"
							onClick={action}
						>
							←
						</AndroidAppBarAction>
					}
					actions={
						<AndroidAppBarAction disabled aria-label="More">
							⋯
						</AndroidAppBarAction>
					}
				/>
				<AndroidFab ref={fabRef} icon={<span>+</span>} onClick={action}>
					New document
				</AndroidFab>
			</form>,
		);
		expect(screen.getByRole("heading", { name: "Documents" })).toBeTruthy();
		expect(barRef.current?.tagName).toBe("HEADER");
		await user.tab();
		expect(document.activeElement).toBe(actionRef.current);
		await user.keyboard("{Enter}");
		await user.tab();
		expect(document.activeElement).toBe(fabRef.current);
		await user.keyboard(" ");
		expect(action).toHaveBeenCalledTimes(2);
		expect(submit).not.toHaveBeenCalled();
		await noViolations(container);
	});
	it("passes native attrs and prevents disabled FAB activation", async () => {
		const action = vi.fn();
		const user = userEvent.setup();
		render(
			<AndroidFab
				aria-label="Add"
				icon="+"
				disabled
				data-target="demo"
				onClick={action}
			/>,
		);
		await user.click(screen.getByRole("button", { name: "Add" }));
		expect(action).not.toHaveBeenCalled();
		expect(screen.getByRole("button").getAttribute("data-target")).toBe("demo");
	});
});

describe("Android navigation", () => {
	it("moves focus past disabled destinations without changing selection until activation", async () => {
		const user = userEvent.setup();
		const change = vi.fn();
		const { container } = render(
			<AndroidNavigation
				items={destinations}
				onValueChange={change}
				aria-label="Workspace"
			/>,
		);
		await user.tab();
		expect(document.activeElement).toBe(
			screen.getByRole("button", { name: "Home" }),
		);
		await user.keyboard("{ArrowRight}");
		expect(document.activeElement).toBe(
			screen.getByRole("button", { name: "Files" }),
		);
		expect(change).not.toHaveBeenCalled();
		await user.keyboard(" ");
		expect(change).toHaveBeenLastCalledWith("files");
		expect(
			screen
				.getByRole("button", { name: "Files" })
				.getAttribute("aria-current"),
		).toBe("page");
		await user.keyboard("{End}");
		expect(document.activeElement).toBe(
			screen.getByRole("button", { name: "Settings" }),
		);
		await user.keyboard("{Home}");
		expect(document.activeElement).toBe(
			screen.getByRole("button", { name: "Home" }),
		);
		await noViolations(container);
	});
	it("supports rail keys, controlled selection and native links", async () => {
		const user = userEvent.setup();
		const change = vi.fn();
		const ref = React.createRef<HTMLElement>();
		render(
			<AndroidNavigation
				ref={ref}
				orientation="vertical"
				value="home"
				items={[
					...destinations,
					{ value: "guide", label: "Guide", href: "#guide" },
					{ value: "secret", label: "Secret", href: "#secret", disabled: true },
				]}
				onValueChange={change}
			/>,
		);
		await user.tab();
		await user.keyboard("{ArrowDown}{Enter}");
		expect(change).toHaveBeenCalledWith("files");
		expect(
			screen.getByRole("button", { name: "Home" }).getAttribute("aria-current"),
		).toBe("page");
		expect(
			screen.getByRole("link", { name: "Guide" }).getAttribute("href"),
		).toBe("#guide");
		expect(
			ref.current?.querySelector('[aria-disabled="true"][href]'),
		).toBeNull();
		await user.keyboard("{End}");
		expect(document.activeElement).toBe(
			screen.getByRole("link", { name: "Guide" }),
		);
	});
	it("honours prevented navigation keyboard events", async () => {
		const user = userEvent.setup();
		render(
			<AndroidNavigation
				items={destinations}
				onKeyDown={(e) => e.preventDefault()}
			/>,
		);
		await user.tab();
		await user.keyboard("{ArrowRight}");
		expect(document.activeElement).toBe(
			screen.getByRole("button", { name: "Home" }),
		);
	});
});

describe("Android search", () => {
	it("searches, clears with Escape or its button, and keeps focus in the field", async () => {
		const user = userEvent.setup();
		const change = vi.fn();
		const ref = React.createRef<HTMLInputElement>();
		const { container } = render(
			<AndroidSearchBar
				ref={ref}
				aria-label="Search files"
				onValueChange={change}
			/>,
		);
		await user.type(screen.getByRole("searchbox"), "notes");
		expect(change).toHaveBeenLastCalledWith("notes");
		await user.keyboard("{Escape}");
		expect(ref.current?.value).toBe("");
		await user.type(ref.current!, "camera");
		await user.click(screen.getByRole("button", { name: "Clear search" }));
		expect(ref.current?.value).toBe("");
		expect(document.activeElement).toBe(ref.current);
		await noViolations(container);
	});
	it("preserves controlled values and protects readonly fields", async () => {
		const user = userEvent.setup();
		const change = vi.fn();
		const { rerender } = render(
			<AndroidSearchBar
				aria-label="Search"
				value="fixed"
				onValueChange={change}
			/>,
		);
		await user.click(screen.getByRole("button", { name: "Clear search" }));
		expect(change).toHaveBeenCalledWith("");
		expect((screen.getByRole("searchbox") as HTMLInputElement).value).toBe(
			"fixed",
		);
		rerender(
			<AndroidSearchBar
				aria-label="Search"
				value="fixed"
				readOnly
				onValueChange={change}
			/>,
		);
		change.mockClear();
		expect(screen.queryByRole("button")).toBeNull();
		await user.click(screen.getByRole("searchbox"));
		await user.keyboard("{Escape}");
		expect(change).not.toHaveBeenCalled();
	});
	it("routes clears through native onChange for controlled form integrations", async () => {
		const user = userEvent.setup();
		const change = vi.fn();
		function NativeForm() {
			const [query, setQuery] = React.useState("notes");
			return (
				<AndroidSearchBar
					aria-label="Search"
					value={query}
					onChange={(event) => {
						change(event.target.value);
						setQuery(event.target.value);
					}}
				/>
			);
		}
		render(<NativeForm />);
		await user.click(screen.getByRole("button", { name: "Clear search" }));
		expect(change).toHaveBeenCalledWith("");
		expect((screen.getByRole("searchbox") as HTMLInputElement).value).toBe("");
	});
	it("restores its initial value on form reset and submits its current native value", async () => {
		const user = userEvent.setup();
		render(
			<form aria-label="Search form">
				<AndroidSearchBar
					name="query"
					aria-label="Search"
					defaultValue="seed"
				/>
				<button type="reset">Reset</button>
			</form>,
		);
		const input = screen.getByRole("searchbox") as HTMLInputElement;
		await user.clear(input);
		await user.type(input, "updated");
		expect(new FormData(input.form!).get("query")).toBe("updated");
		await user.click(screen.getByRole("button", { name: "Reset" }));
		expect(input.value).toBe("seed");
	});
});

describe("Android switch", () => {
	it("uses a native checkbox for keyboard, labels, form values and reset", async () => {
		const user = userEvent.setup();
		const change = vi.fn();
		const ref = React.createRef<HTMLInputElement>();
		const { container } = render(
			<form>
				<label htmlFor="sync">Background sync</label>
				<AndroidSwitch
					id="sync"
					name="sync"
					value="enabled"
					defaultChecked
					ref={ref}
					onCheckedChange={change}
				/>
				<button type="reset">Reset</button>
			</form>,
		);
		const input = screen.getByRole("switch") as HTMLInputElement;
		expect(ref.current).toBe(input);
		expect(new FormData(input.form!).get("sync")).toBe("enabled");
		await user.tab();
		await user.keyboard(" ");
		expect(input.checked).toBe(false);
		expect(change).toHaveBeenCalledWith(false);
		expect(new FormData(input.form!).has("sync")).toBe(false);
		await user.click(screen.getByRole("button", { name: "Reset" }));
		expect(input.checked).toBe(true);
		await noViolations(container);
	});
	it("keeps controlled state and never toggles when disabled", async () => {
		const user = userEvent.setup();
		const change = vi.fn();
		const { rerender } = render(
			<AndroidSwitch
				aria-label="Sync"
				checked={false}
				onCheckedChange={change}
			/>,
		);
		await user.click(screen.getByRole("switch"));
		expect(change).toHaveBeenCalledWith(true);
		expect((screen.getByRole("switch") as HTMLInputElement).checked).toBe(
			false,
		);
		change.mockClear();
		rerender(
			<AndroidSwitch
				aria-label="Sync"
				disabled
				checked={false}
				onCheckedChange={change}
			/>,
		);
		await user.click(screen.getByRole("switch"));
		expect(change).not.toHaveBeenCalled();
	});
	it("respects cancelled native change and form reset", async () => {
		const user = userEvent.setup();
		const change = vi.fn();
		const { rerender } = render(
			<AndroidSwitch
				aria-label="Sync"
				onChange={(e) => e.preventDefault()}
				onCheckedChange={change}
			/>,
		);
		await user.click(screen.getByRole("switch"));
		expect(change).not.toHaveBeenCalled();
		rerender(
			<form onReset={(e) => e.preventDefault()}>
				<AndroidSwitch aria-label="Sync" />
				<button type="reset">Reset</button>
			</form>,
		);
		await user.click(screen.getByRole("switch"));
		await user.click(screen.getByRole("button", { name: "Reset" }));
		expect((screen.getByRole("switch") as HTMLInputElement).checked).toBe(true);
	});
});

describe("Android list and chip", () => {
	it("keeps trailing switches outside row buttons and gives static rows no extra tab stop", async () => {
		const user = userEvent.setup();
		const open = vi.fn();
		const ref = React.createRef<HTMLLIElement>();
		const { container } = render(
			<AndroidList aria-label="Preferences">
				<AndroidListRow
					ref={ref}
					headline="Wi-Fi"
					supportingText="Studio network"
					onAction={open}
					trailing={<AndroidSwitch aria-label="Wi-Fi enabled" />}
				/>
				<AndroidListRow headline="Device name" supportingText="Pixel" />
				<AndroidListRow headline="Unavailable" onAction={open} disabled />
			</AndroidList>,
		);
		expect(screen.getAllByRole("listitem")).toHaveLength(3);
		expect(ref.current?.tagName).toBe("LI");
		await user.tab();
		expect(document.activeElement).toBe(
			screen.getByRole("button", { name: "Wi-Fi Studio network" }),
		);
		await user.keyboard("{Enter}");
		expect(open).toHaveBeenCalledTimes(1);
		await user.tab();
		expect(document.activeElement).toBe(screen.getByRole("switch"));
		await user.keyboard(" ");
		expect(open).toHaveBeenCalledTimes(1);
		expect(
			screen
				.getByRole("button", { name: "Wi-Fi Studio network" })
				.querySelector("input"),
		).toBeNull();
		await noViolations(container);
	});
	it("toggles filter state with Space and lets callers cancel or control selection", async () => {
		const user = userEvent.setup();
		const change = vi.fn();
		const { container, rerender } = render(
			<AndroidChip onSelectedChange={change}>Unread</AndroidChip>,
		);
		await user.tab();
		await user.keyboard(" ");
		expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe(
			"true",
		);
		expect(change).toHaveBeenCalledWith(true);
		await noViolations(container);
		rerender(
			<AndroidChip selected={false} onSelectedChange={change}>
				Unread
			</AndroidChip>,
		);
		await user.keyboard("{Enter}");
		expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe(
			"false",
		);
		change.mockClear();
		rerender(
			<AndroidChip
				onClick={(e) => e.preventDefault()}
				onSelectedChange={change}
			>
				Unread
			</AndroidChip>,
		);
		await user.keyboard(" ");
		expect(change).not.toHaveBeenCalled();
	});
});

function SheetExample() {
	const [open, setOpen] = React.useState(false);
	return (
		<>
			<button type="button" onClick={() => setOpen(true)}>
				Open settings
			</button>
			<AndroidSheet open={open} onOpenChange={setOpen}>
				<AndroidSheetTitle>Connection settings</AndroidSheetTitle>
				<AndroidSheetBody>Choose how this device connects.</AndroidSheetBody>
				<AndroidSwitch aria-label="Wi-Fi" />
			</AndroidSheet>
		</>
	);
}

describe("Android sheet", () => {
	it("names and describes its native modal, closes on a request and restores focus", async () => {
		const user = userEvent.setup();
		const { container } = render(<SheetExample />);
		const opener = screen.getByRole("button", { name: "Open settings" });
		await user.click(opener);
		const dialog = screen.getByRole("dialog", {
			name: "Connection settings",
		}) as HTMLDialogElement;
		expect(dialog.open).toBe(true);
		expect(dialog.contains(document.activeElement)).toBe(true);
		expect(dialog.getAttribute("aria-describedby")).toBe(
			screen.getByText("Choose how this device connects.").id,
		);
		await noViolations(container);
		fireEvent(dialog, new Event("cancel", { cancelable: true }));
		expect(dialog.open).toBe(false);
		expect(document.activeElement).toBe(opener);
	});
	it("supports uncontrolled dismissal and a forwarded native dialog ref", async () => {
		const user = userEvent.setup();
		const change = vi.fn();
		const ref = React.createRef<HTMLDialogElement>();
		render(
			<AndroidSheet
				defaultOpen
				ref={ref}
				onOpenChange={change}
				aria-label="Details"
			>
				<p>Details</p>
			</AndroidSheet>,
		);
		expect(ref.current?.open).toBe(true);
		await user.click(screen.getByRole("button", { name: "Close" }));
		expect(change).toHaveBeenCalledWith(false);
		expect(ref.current?.open).toBe(false);
	});
	it("does not dismiss when disabled or when a caller cancels Escape", () => {
		const close = vi.fn();
		const { rerender } = render(
			<AndroidSheet
				open
				dismissable={false}
				onClose={close}
				aria-label="Required choice"
			/>,
		);
		let dialog = screen.getByRole("dialog") as HTMLDialogElement;
		expect(dialog.getAttribute("closedby")).toBe("none");
		expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
		fireEvent(dialog, new Event("cancel", { cancelable: true }));
		expect(close).not.toHaveBeenCalled();
		rerender(
			<AndroidSheet
				open
				onCancel={(e) => e.preventDefault()}
				onClose={close}
				aria-label="Choice"
			/>,
		);
		dialog = screen.getByRole("dialog") as HTMLDialogElement;
		fireEvent(dialog, new Event("cancel", { cancelable: true }));
		expect(close).not.toHaveBeenCalled();
	});
	it("reports native method-dialog closes", () => {
		const close = vi.fn();
		render(<AndroidSheet defaultOpen onClose={close} aria-label="Choice" />);
		act(() => {
			(screen.getByRole("dialog") as HTMLDialogElement).close();
		});
		expect(close).toHaveBeenCalledTimes(1);
	});
});
