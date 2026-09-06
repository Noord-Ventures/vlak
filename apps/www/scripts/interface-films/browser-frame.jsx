import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import {
	Button,
	ButtonGroup,
	Icon,
	Input,
	InputAddon,
	InputGroup,
} from "@noorddev/vlak-react";

const toolbarHeight = 64;
const clamp = (value) => Math.max(0, Math.min(1, value));
const ease = (value) => {
	const p = clamp(value);
	return p * p * p * (p * (p * 6 - 15) + 10);
};
function BrowserChrome({ slug, title }) {
	const control = (icon, label) => (
		<Button
			variant="ghost"
			aria-label={label}
			key={icon}
			style={{ width: 44, paddingInline: 0, flexShrink: 0 }}
		>
			<Icon name={icon} size={16} />
		</Button>
	);
	return (
		<div
			style={{
				height: toolbarHeight,
				display: "grid",
				gridTemplateColumns: "132px minmax(0, 1fr) 132px",
				alignItems: "center",
				gap: 20,
				padding: "10px 12px",
				boxSizing: "border-box",
			}}
		>
			<ButtonGroup aria-label="Browser navigation">
				{control("arrow-left", "Back")}
				{control("arrow-right", "Forward")}
				{control("refresh", "Reload")}
			</ButtonGroup>
			<InputGroup
				style={{ width: "100%", maxWidth: 620, justifySelf: "center" }}
			>
				<InputAddon>
					<Icon name="lock" size={14} />
				</InputAddon>
				<Input
					aria-label={`${title} address`}
					readOnly
					tabIndex={-1}
					value={`vlak.dev/interfaces/${slug}`}
				/>
			</InputGroup>
			<ButtonGroup aria-label="Window controls">
				{control("minus", "Minimize")}
				{control("expand", "Maximize")}
				{control("close", "Close")}
			</ButtonGroup>
		</div>
	);
}

// Only the outer recording viewport supplies geometry/paint. Browser controls
// are unmodified Vlak components, and the original app stays in its own root.
export function createBrowserFrame({
	world,
	camera,
	host,
	slug,
	title,
	width,
	height,
	density = 3,
}) {
	const shell = document.createElement("div"),
		chrome = document.createElement("div"),
		viewport = document.createElement("div");
	shell.dataset.filmBrowser = slug;
	shell.style.cssText =
		"position:absolute;transform-origin:0 0;border:1px solid var(--divider);background:var(--bg);box-sizing:content-box;";
	chrome.dataset.browserChrome = "";
	chrome.setAttribute("inert", "");
	chrome.style.cssText = `position:absolute;left:0;top:0;width:${width}px;height:${toolbarHeight}px;zoom:${density};transform-origin:0 0;background:var(--bg);border-bottom:1px solid var(--divider);box-sizing:border-box;`;
	viewport.dataset.browserViewport = "";
	viewport.style.cssText =
		"position:absolute;left:0;overflow:hidden;background:var(--bg);";
	world.insertBefore(shell, camera);
	shell.append(chrome, viewport);
	viewport.append(camera);
	const root = createRoot(chrome);
	flushSync(() => root.render(<BrowserChrome slug={slug} title={title} />));
	let last = null;
	return {
		layout({ time, scale, screenY }) {
			const left = 960 - (width * scale) / 2,
				top = screenY - (height * scale) / 2;
			shell.style.left = `${left - 1}px`;
			shell.style.top = `${top - toolbarHeight * scale - 1}px`;
			shell.style.width = `${width * scale}px`;
			shell.style.height = `${(height + toolbarHeight) * scale}px`;
			shell.style.opacity = String(ease(time / 0.35));
			chrome.style.transform = `scale(${scale / density})`;
			viewport.style.top = `${toolbarHeight * scale}px`;
			viewport.style.width = `${width * scale}px`;
			viewport.style.height = `${height * scale}px`;
			last = {
				left: left - 1,
				top: top - toolbarHeight * scale - 1,
				width: width * scale + 2,
				height: (height + toolbarHeight) * scale + 2,
				content: { left, top, width: width * scale, height: height * scale },
			};
			return { left, top };
		},
		inspect() {
			return {
				style: "Vlak browser",
				address: `vlak.dev/interfaces/${slug}`,
				title,
				toolbarHeight,
				components: [
					"ButtonGroup",
					"Button",
					"Icon",
					"InputGroup",
					"InputAddon",
					"Input",
				],
				bounds: last,
				board: { width: host.offsetWidth, height: host.offsetHeight },
			};
		},
		dispose() {
			root.unmount();
		},
	};
}
