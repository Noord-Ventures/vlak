import * as React from "react";
import { renderToString } from "react-dom/server";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { PlaybackControls } from "../src/components/playback-controls";
import { MediaScrubber, formatMediaTime } from "../src/components/media-scrubber";
import { MediaPlayer } from "../src/components/media-player";
import { Waveform } from "../src/components/waveform";
import { CanvasControls } from "../src/components/canvas-controls";
import { ImageViewer } from "../src/components/image-viewer";
import { MessageComposer } from "../src/components/message-composer";
import { FileBrowser, type BrowserEntry } from "../src/components/file-browser";
import { KanbanBoard } from "../src/components/kanban-board";
import { Scheduler } from "../src/components/scheduler";

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new Event("close")); };
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const entries: BrowserEntry[] = [
  { id: "proofs", name: "Proofs", kind: "folder", children: [
    { id: "final", name: "Final", kind: "folder", children: [{ id: "cover", name: "Cover.pdf", kind: "file", size: "1 MB" }] },
    { id: "notes", name: "Notes.txt", kind: "file" },
  ] },
];
const columns = [{ id: "todo", label: "To do" }, { id: "done", label: "Done" }];
const cards = [{ id: "proof", title: "Review proof", columnId: "todo" }, { id: "send", title: "Send to press", columnId: "todo" }];
const events = [{ id: "review", title: "Proof review", start: new Date(2026, 8, 7, 9), end: new Date(2026, 8, 7, 9, 30) }];

describe("Playback and seeking", () => {
  it("operates transport through the keyboard and respects custom previous labels", async () => {
    const user = userEvent.setup(); const previous = vi.fn();
    render(<PlaybackControls onPrevious={previous} previousLabel="Restart recording" />);
    screen.getByRole("button", { name: "Play" }).focus(); await user.keyboard(" ");
    expect(screen.getByRole("button", { name: "Pause" })).toBeTruthy();
    screen.getByRole("button", { name: "Restart recording" }).focus(); await user.keyboard("{Enter}");
    expect(previous).toHaveBeenCalledOnce();
  });

  it("keeps controlled playback state owned by the caller", async () => {
    const change = vi.fn(); const user = userEvent.setup();
    render(<PlaybackControls playing={false} onPlayingChange={change} />);
    await user.click(screen.getByRole("button", { name: "Play" }));
    expect(change).toHaveBeenCalledWith(true); expect(screen.getByRole("button", { name: "Play" })).toBeTruthy();
  });

  it("announces seconds as elapsed time and selects chapters", async () => {
    const user = userEvent.setup(); const change = vi.fn();
    render(<MediaScrubber duration={240} defaultValue={42} buffered={180} onValueChange={change} chapters={[{ time: 0, label: "Opening" }, { time: 90, label: "Detail" }]} />);
    const slider = screen.getByRole("slider", { name: "Playback position" });
    expect(slider.getAttribute("aria-valuetext")).toBe("0:42 of 4:00");
    expect(document.querySelector<HTMLElement>(".rs-media-scrubber-buffered")?.style.width).toBe("75%");
    await user.selectOptions(screen.getByRole("combobox", { name: "Chapter" }), "1");
    expect(change).toHaveBeenCalledWith(90); expect((slider as HTMLInputElement).value).toBe("90");
  });

  it("disables seeking while duration is unknown and formats hour-long media", () => {
    render(<MediaScrubber duration={Number.NaN} value={Infinity} />);
    expect((screen.getByRole("slider") as HTMLInputElement).disabled).toBe(true);
    expect(formatMediaTime(3665)).toBe("1:01:05"); expect(formatMediaTime(Infinity)).toBe("0:00");
  });

  it("reveals a position preview on focus without replacing the range name", () => {
    render(<MediaScrubber duration={100} defaultValue={25} preview={time => <span>Preview {time}</span>} />);
    fireEvent.focus(screen.getByRole("slider")); expect(screen.getByText("Preview 25")).toBeTruthy();
    fireEvent.blur(screen.getByRole("slider")); expect(screen.queryByText("Preview 25")).toBeNull();
  });

  it("binds transport, seeking, mute and speed to a real media element", async () => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) { this.dispatchEvent(new Event("play")); return Promise.resolve(); });
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (this: HTMLMediaElement) { this.dispatchEvent(new Event("pause")); });
    const user = userEvent.setup(); const ref = React.createRef<HTMLMediaElement>();
    render(<MediaPlayer ref={ref} src="recording.wav" kind="audio" title="Recording" />);
    const media = ref.current!; Object.defineProperty(media, "duration", { configurable: true, value: 120 });
    fireEvent.loadedMetadata(media);
    await user.click(screen.getByRole("button", { name: "Play" })); expect(screen.getByRole("button", { name: "Pause" })).toBeTruthy();
    fireEvent.change(screen.getByRole("slider", { name: "Playback position" }), { target: { value: "59" } }); expect(media.currentTime).toBe(59);
    await user.click(screen.getByRole("button", { name: "Mute" })); expect(media.muted).toBe(true);
    await user.selectOptions(screen.getByRole("combobox", { name: "Playback speed" }), "1.5"); expect(media.playbackRate).toBe(1.5);
  });

  it("makes playback failures recoverable and resets buffering for a new source", async () => {
    const load = vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
    const user = userEvent.setup(); const { container, rerender } = render(<MediaPlayer src="first.wav" kind="audio" title="Recording" />);
    const media = container.querySelector("audio")!;
    fireEvent.error(media); expect(screen.getByRole("status").textContent).toContain("could not load");
    await user.click(screen.getByRole("button", { name: "Retry media" })); expect(load).toHaveBeenCalledOnce();
    Object.defineProperty(media, "duration", { configurable: true, value: 100 });
    Object.defineProperty(media, "buffered", { configurable: true, value: { length: 1, end: () => 80 } });
    fireEvent.loadedMetadata(media); fireEvent.progress(media);
    expect(container.querySelector<HTMLElement>(".rs-media-scrubber-buffered")?.style.width).toBe("80%");
    rerender(<MediaPlayer src="second.wav" kind="audio" title="Recording" />);
    expect(container.querySelector<HTMLElement>(".rs-media-scrubber-buffered")?.style.width).toBe("0%");
  });
});

describe("Waveform and image controls", () => {
  it("bounds waveform rendering and exposes editable, noncrossing selection endpoints", () => {
    const region = vi.fn();
    const { container } = render(<Waveform samples={Array.from({ length: 10000 }, () => 0.5)} label="Recording" defaultRegion={{ start: 0.2, end: 0.7 }} onRegionChange={region} />);
    expect(container.querySelectorAll("svg rect").length).toBeLessThanOrEqual(240);
    const start = screen.getByRole("slider", { name: "Selection start" }) as HTMLInputElement;
    expect(start.max).toBe("0.7");
    fireEvent.change(start, { target: { value: "0.4" } }); expect(region).toHaveBeenCalledWith({ start: 0.4, end: 0.7 });
  });

  it("does not reread amplitude samples when only the playhead changes", () => {
    let reads = 0;
    const samples = new Proxy([0.2, 0.4, 0.8], { get(target, key) { if (typeof key === "string" && /^\d+$/.test(key)) reads++; return Reflect.get(target, key); } });
    const { rerender } = render(<Waveform samples={samples} label="Recording" value={0.1} />); const initial = reads;
    rerender(<Waveform samples={samples} label="Recording" value={0.8} />); expect(reads).toBe(initial);
  });

  it("zooms by keyboard within bounds and resets to the original scale", async () => {
    const user = userEvent.setup();
    render(<CanvasControls defaultZoom={1} minZoom={1} maxZoom={1.5} step={0.5} />);
    expect((screen.getByRole("button", { name: "Zoom out" }) as HTMLButtonElement).disabled).toBe(true);
    screen.getByRole("button", { name: "Zoom in" }).focus(); await user.keyboard("{Enter}");
    expect(screen.getByText("150%")).toBeTruthy(); expect((screen.getByRole("button", { name: "Zoom in" }) as HTMLButtonElement).disabled).toBe(true);
    await user.click(screen.getByRole("button", { name: "Reset" })); expect(screen.getByText("100%")).toBeTruthy();
  });

  it("navigates images with the keyboard and closes the lightbox back to its opener", async () => {
    const user = userEvent.setup();
    render(<ImageViewer images={[{ src: "one.jpg", alt: "First proof" }, { src: "two.jpg", alt: "Second proof" }]} />);
    const canvas = screen.getByRole("group", { name: /Image viewer canvas/ }); canvas.focus(); await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("img", { name: "Second proof" })).toBeTruthy();
    const opener = screen.getByRole("button", { name: "Open lightbox" }); await user.click(opener);
    const dialog = screen.getByRole("dialog", { name: "Image viewer" }); expect((dialog as HTMLDialogElement).open).toBe(true);
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    expect(screen.queryByRole("dialog")).toBeNull(); expect(document.activeElement).toBe(opener);
  });
});

describe("Product patterns", () => {
  it("sends by shortcut, prevents duplicate submissions, and retains failed drafts", async () => {
    const user = userEvent.setup(); let reject!: () => void;
    const send = vi.fn(() => new Promise<void>((_resolve, failed) => { reject = () => failed(new Error("offline")); }));
    render(<MessageComposer onSend={send} defaultValue="Check the proof" />);
    const input = screen.getByRole("textbox", { name: "Message" }); input.focus(); await user.keyboard("{Control>}{Enter}{/Control}");
    expect(send).toHaveBeenCalledWith({ text: "Check the proof", files: [] }); expect((input as HTMLTextAreaElement).disabled).toBe(true);
    fireEvent.submit(screen.getByRole("form", { name: "Message" })); expect(send).toHaveBeenCalledOnce();
    await act(async () => reject());
    expect((input as HTMLTextAreaElement).value).toBe("Check the proof"); expect(screen.getByRole("status").textContent).toContain("draft is still here");
  });

  it("does not send during IME composition and clears successful drafts with attachments", async () => {
    const user = userEvent.setup(); const send = vi.fn();
    render(<MessageComposer onSend={send} sendOnEnter allowAttachments defaultValue="Hello" />);
    const input = screen.getByRole("textbox"); fireEvent.keyDown(input, { key: "Enter", isComposing: true }); expect(send).not.toHaveBeenCalled();
    const file = new File(["proof"], "proof.txt", { type: "text/plain" });
    await user.upload(screen.getByLabelText("Attach files"), file);
    await user.click(screen.getByRole("button", { name: "Send" }));
    await waitFor(() => expect((input as HTMLTextAreaElement).value).toBe(""));
    expect(send).toHaveBeenCalledWith({ text: "Hello", files: [file] }); expect(screen.queryByRole("list", { name: "Attachments" })).toBeNull();
  });

  it("exposes application-owned stop without preventing draft edits during generation", async () => {
    const user = userEvent.setup(); const stop = vi.fn(); const send = vi.fn();
    const { rerender } = render(<MessageComposer generating onStop={stop} onSend={send} />);
    expect(screen.queryByRole("button", { name: "Send" })).toBeNull();
    await user.type(screen.getByRole("textbox"), "Next question");
    await user.keyboard("{Control>}{Enter}{/Control}"); expect(send).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Stop response" })); expect(stop).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Stop response" })).toBeTruthy();
    rerender(<MessageComposer generating={false} onStop={stop} onSend={send} />);
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe("Next question");
    expect(screen.getByRole("button", { name: "Send" })).toBeTruthy();
  });

  it("opens nested folders, keeps the active tree path visible, searches, and selects files in grid view", async () => {
    const user = userEvent.setup(); const open = vi.fn();
    render(<FileBrowser entries={entries} onOpen={open} />);
    await user.click(screen.getByRole("button", { name: "Proofs Folder" }));
    await user.click(screen.getByRole("button", { name: "Final Folder" }));
    expect(screen.getByRole("treeitem", { name: "Final" }).getAttribute("aria-selected")).toBe("true");
    await user.click(screen.getByRole("button", { name: "Grid" }));
    const cover = screen.getByRole("button", { name: "Cover.pdf 1 MB" }); cover.focus(); await user.keyboard(" ");
    expect(cover.getAttribute("aria-pressed")).toBe("true"); await user.click(screen.getByRole("button", { name: "Open selected" })); expect(open).toHaveBeenCalledWith(expect.objectContaining({ id: "cover" }));
    await user.type(screen.getByRole("searchbox"), "absent"); expect(screen.getByRole("status").textContent).toContain("No files match");
  });

  it("moves cards by native destination selection and preserves keyboard focus", async () => {
    const user = userEvent.setup(); const change = vi.fn();
    render(<KanbanBoard columns={columns} defaultValue={cards} onValueChange={change} />);
    await user.selectOptions(screen.getByRole("combobox", { name: "Move Review proof to" }), "done");
    expect(change).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ id: "proof", columnId: "done" })]));
    const moved = screen.getByRole("combobox", { name: "Move Review proof to" }); expect(document.activeElement).toBe(moved);
    expect(within(screen.getByRole("region", { name: /Done/ })).getByText("Review proof")).toBeTruthy();
  });

  it("reorders cards by keyboard without losing their column", async () => {
    const user = userEvent.setup(); const change = vi.fn();
    render(<KanbanBoard columns={columns} defaultValue={cards} onValueChange={change} />);
    screen.getByRole("button", { name: "Move Review proof" }).focus(); await user.keyboard("{Alt>}{ArrowDown}{/Alt}");
    expect(change.mock.lastCall?.[0].map((card: { id: string }) => card.id)).toEqual(["send", "proof"]);
  });

  it("navigates all scheduler views and exposes named new-event times", async () => {
    const user = userEvent.setup(); const slot = vi.fn();
    render(<Scheduler events={events} defaultValue={new Date(2026, 8, 7)} defaultView="agenda" onSlotSelect={slot} />);
    expect(screen.getByText("Proof review")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("New event time"), { target: { value: "14:30" } });
    await user.click(screen.getByRole("button", { name: "Add event" })); expect(slot).toHaveBeenCalledWith(new Date(2026, 8, 7, 14, 30));
    await user.selectOptions(screen.getByRole("combobox", { name: "Schedule view" }), "week"); expect(screen.getByRole("region", { name: "Week calendar" })).toBeTruthy();
    await user.selectOptions(screen.getByRole("combobox", { name: "Schedule view" }), "month"); expect(screen.getByRole("table", { name: "September 2026" })).toBeTruthy();
    screen.getByRole("button", { name: "Next month" }).focus(); await user.keyboard("{Enter}"); expect(screen.getByRole("table", { name: "October 2026" })).toBeTruthy();
  });

  it("reschedules through a dialog while preserving event duration", async () => {
    const user = userEvent.setup(); const move = vi.fn();
    render(<Scheduler events={events} defaultValue={new Date(2026, 8, 7)} defaultView="agenda" onEventMove={move} />);
    await user.click(screen.getByRole("button", { name: "Reschedule Proof review" }));
    const dialog = screen.getByRole("dialog", { name: "Reschedule Proof review" });
    fireEvent.change(within(dialog).getByLabelText("Date"), { target: { value: "2026-09-08" } });
    fireEvent.change(within(dialog).getByLabelText("Start time"), { target: { value: "11:00" } });
    await user.click(within(dialog).getByRole("button", { name: "Save schedule" }));
    expect(move).toHaveBeenCalledWith(events[0], { start: new Date(2026, 8, 8, 11), end: new Date(2026, 8, 8, 11, 30) });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders a stable server shell before introducing browser-zone dates", () => {
    const html = renderToString(<Scheduler events={events} defaultValue={new Date("2026-09-07T00:00:00Z")} />);
    const explicit = renderToString(<Scheduler events={events} defaultValue={new Date("2026-09-07T00:00:00Z")} timeZone="America/Los_Angeles" />);
    expect(html).toBe(explicit); expect(html).toContain("Loading schedule"); expect(html).not.toContain("Proof review");
  });

  it("converts civil scheduling times in an explicit zone and rejects DST gaps", async () => {
    const user = userEvent.setup(); const slot = vi.fn();
    render(<Scheduler events={[]} defaultValue={new Date("2026-03-08T12:00:00Z")} defaultView="agenda" timeZone="America/New_York" onSlotSelect={slot} />);
    fireEvent.change(screen.getByLabelText("New event time"), { target: { value: "02:30" } });
    await user.click(screen.getByRole("button", { name: "Add event" }));
    expect(slot).not.toHaveBeenCalled(); expect(screen.getByRole("status").textContent).toContain("does not exist in America/New_York");
    fireEvent.change(screen.getByLabelText("New event time"), { target: { value: "03:30" } });
    await user.click(screen.getByRole("button", { name: "Add event" }));
    expect(slot).toHaveBeenCalledWith(new Date("2026-03-08T07:30:00Z"));
  });

  it("chooses the earlier instant for repeated fall-back times", async () => {
    const user = userEvent.setup(); const slot = vi.fn();
    render(<Scheduler events={[]} defaultValue={new Date("2026-10-25T12:00:00Z")} defaultView="agenda" timeZone="Europe/Amsterdam" onSlotSelect={slot} />);
    fireEvent.change(screen.getByLabelText("New event time"), { target: { value: "02:30" } });
    await user.click(screen.getByRole("button", { name: "Add event" }));
    expect(slot).toHaveBeenCalledWith(new Date("2026-10-25T00:30:00Z"));
  });
});

describe("Media and product accessibility", () => {
  const fixtures = [
    ["playback", <PlaybackControls key="playback" />], ["scrubber", <MediaScrubber key="scrubber" duration={100} />],
    ["player", <MediaPlayer key="player" kind="audio" src="recording.wav" title="Recording" />],
    ["waveform", <Waveform key="waveform" samples={[0.2, 0.6]} label="Recording" onValueChange={() => {}} onRegionChange={() => {}} />],
    ["canvas", <CanvasControls key="canvas" />], ["images", <ImageViewer key="images" images={[{ src: "proof.jpg", alt: "Proof" }]} />],
    ["composer", <MessageComposer key="composer" onSend={() => {}} />], ["files", <FileBrowser key="files" entries={entries} />],
    ["kanban", <KanbanBoard key="kanban" columns={columns} defaultValue={cards} />],
    ["scheduler", <Scheduler key="scheduler" events={events} defaultValue={new Date(2026, 8, 7)} />],
  ] as const;
  it.each(fixtures)("%s has named controls and no axe violations", async (_name, fixture) => {
    const { container } = render(fixture);
    expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });
});
