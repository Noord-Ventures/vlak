import * as React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { AudioMeter } from "../src/components/audio-meter";
import { ChannelStrip } from "../src/components/channel-strip";
import { ParameterKnob } from "../src/components/parameter-knob";
import { TimecodeField } from "../src/components/timecode-field";
import { ClipTimeline } from "../src/components/clip-timeline";
import { RenderQueue } from "../src/components/render-queue";
import { LayerStack } from "../src/components/layer-stack";
import { ColorInspector } from "../src/components/color-inspector";
import { SpacingControl } from "../src/components/spacing-control";

afterEach(cleanup);
const channel = { gain: -3, pan: 0, muted: false, solo: false };
const layers = [{ id: "title", label: "Title", visible: true, locked: false }, { id: "background", label: "Background", visible: true, locked: true }];
const tracks = [{ id: "v", label: "Video" }];
const clips = [{ id: "opening", trackId: "v", label: "Opening", start: 0, duration: 18 }];

describe("AudioMeter", () => {
  it("keeps actual readings and peaks while clamping native meters to the visible range", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<AudioMeter ref={ref} label="Output" data-source="audio" channels={[{ id: "a", label: "Left", level: 3, peak: 6 }, { id: "b", label: "Right", level: Number.NEGATIVE_INFINITY }]} />);
    const meters = screen.getAllByRole("meter") as HTMLMeterElement[];
    expect(meters[0]!.value).toBe(0);
    expect(meters[0]!.getAttribute("aria-valuetext")).toBe("3 dB");
    expect(meters[1]!.value).toBe(-60);
    expect(meters[1]!.getAttribute("aria-valuetext")).toBe("−∞ dB");
    expect(screen.getByText("Peak: 6 dB")).toBeTruthy();
    expect(ref.current?.dataset.source).toBe("audio");
  });
  it("distinguishes zero, missing, invalid, and empty channels", () => {
    const { container, rerender } = render(<AudioMeter label="Output" channels={[{ id: "a", label: "Left", level: 0 }, { id: "b", label: "Right", level: null }, { id: "c", label: "Aux", level: Number.NaN }]} />);
    expect(screen.getAllByRole("meter")).toHaveLength(1);
    expect(screen.getAllByText("Unavailable")).toHaveLength(2);
    expect(container.innerHTML).not.toContain("NaN");
    rerender(<AudioMeter label="Output" min={0} max={0} channels={[{ id: "a", label: "Left", level: 0 }]} />);
    expect(screen.getByText("Meter range unavailable")).toBeTruthy();
    expect(screen.queryByRole("meter")).toBeNull();
    rerender(<AudioMeter label="Output" channels={[]} />);
    expect(screen.getByText("No channels supplied")).toBeTruthy();
  });
});

describe("ChannelStrip", () => {
  it("updates gain and pan and supports keyboard mute/solo, native form submission and reset", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const ref = React.createRef<HTMLFieldSetElement>();
    const { container } = render(<form><ChannelStrip ref={ref} label="Dialogue" name="dialogue" defaultValue={channel} onValueChange={change} /></form>);
    fireEvent.change(screen.getByRole("slider", { name: "Gain" }), { target: { value: "-6" } });
    fireEvent.change(screen.getByRole("slider", { name: "Pan" }), { target: { value: "25" } });
    screen.getByRole("button", { name: "Mute" }).focus();
    await user.keyboard("{Enter}");
    await user.tab();
    await user.keyboard(" ");
    expect(change).toHaveBeenLastCalledWith({ gain: -6, pan: 25, muted: true, solo: true });
    expect(new FormData(container.querySelector("form")!).get("dialogue.gain")).toBe("-6");
    expect(new FormData(container.querySelector("form")!).get("dialogue.muted")).toBe("true");
    expect(ref.current?.tagName).toBe("FIELDSET");
    act(() => container.querySelector("form")!.reset());
    await waitFor(() => expect(screen.getByRole("button", { name: "Mute" }).getAttribute("aria-pressed")).toBe("false"));
    expect((screen.getByRole("slider", { name: "Gain" }) as HTMLInputElement).value).toBe("-3");
  });
  it("preserves controlled state and prevents disabled and read-only interaction", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { rerender } = render(<ChannelStrip label="Dialogue" value={channel} onValueChange={change} />);
    await user.click(screen.getByRole("button", { name: "Mute" }));
    expect(change).toHaveBeenLastCalledWith({ ...channel, muted: true });
    expect(screen.getByRole("button", { name: "Mute" }).getAttribute("aria-pressed")).toBe("false");
    change.mockClear();
    rerender(<ChannelStrip label="Dialogue" value={channel} onValueChange={change} readOnly />);
    await user.click(screen.getByRole("button", { name: "Solo" }));
    expect(change).not.toHaveBeenCalled();
    expect((screen.getByRole("slider", { name: "Gain" }) as HTMLInputElement).disabled).toBe(true);
  });
});

describe("ParameterKnob", () => {
  it("snaps callbacks and displayed values to legal steps when max is not on the step grid", () => {
    const change = vi.fn();
    const { rerender, container } = render(<ParameterKnob label="Mix" min={0} max={100} step={60} defaultValue={100} onValueChange={change} />);
    const input = screen.getByRole("slider") as HTMLInputElement;
    expect(input.value).toBe("60");
    expect(input.validity.stepMismatch).toBe(false);
    fireEvent.change(input, { target: { value: "35" } });
    expect(change).toHaveBeenLastCalledWith(60);
    rerender(<ParameterKnob label="Mix" min={0} max={1} step={Number.MIN_VALUE} value={1} />);
    expect(screen.getByText("Invalid range")).toBeTruthy();
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/);
  });

  it("focuses a native range with accurate bounds, step, value text, form and reset behavior", async () => {
    const user = userEvent.setup();
    const ref = React.createRef<HTMLInputElement>();
    const { container } = render(<form><ParameterKnob ref={ref} label="Mix" name="mix" min={0} max={1} step={0.1} defaultValue={0.2} unit="ratio" /></form>);
    await user.tab();
    expect(document.activeElement).toBe(ref.current);
    expect(ref.current?.type).toBe("range");
    expect(ref.current?.step).toBe("0.1");
    fireEvent.change(ref.current!, { target: { value: "0.4" } });
    expect(ref.current?.getAttribute("aria-valuetext")).toBe("0.4 ratio");
    expect(new FormData(container.querySelector("form")!).get("mix")).toBe("0.4");
    act(() => container.querySelector("form")!.reset());
    await waitFor(() => expect(ref.current?.value).toBe("0.2"));
  });
  it("preserves controlled zero, blocks read-only changes and rejects invalid ranges", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { container, rerender } = render(<ParameterKnob label="Mix" value={0} onValueChange={change} readOnly />);
    screen.getByRole("slider").focus();
    await user.keyboard("{ArrowRight}");
    fireEvent.change(screen.getByRole("slider"), { target: { value: "10" } });
    expect(change).not.toHaveBeenCalled();
    expect((screen.getByRole("slider") as HTMLInputElement).value).toBe("0");
    rerender(<ParameterKnob label="Mix" min={10} max={10} value={Number.NaN} />);
    expect(screen.getByText("Invalid range")).toBeTruthy();
    expect((screen.getByRole("slider") as HTMLInputElement).disabled).toBe(true);
    expect(container.innerHTML).not.toContain("NaN");
  });
});

describe("TimecodeField", () => {
  it("edits text from the keyboard and validates frame limits without losing incomplete input", async () => {
    const user = userEvent.setup();
    const ref = React.createRef<HTMLInputElement>();
    const change = vi.fn();
    render(<TimecodeField ref={ref} label="In point" frameRate={24} defaultValue="00:01:00:23" onValueChange={change} />);
    expect(ref.current?.checkValidity()).toBe(true);
    await user.clear(ref.current!);
    await user.type(ref.current!, "00:01:00:24");
    expect(change).toHaveBeenLastCalledWith("00:01:00:24");
    expect(ref.current?.value).toBe("00:01:00:24");
    expect(ref.current?.checkValidity()).toBe(false);
    expect(ref.current?.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByText(/frames from 00 to 23/)).toBeTruthy();
    await user.clear(ref.current!);
    await user.type(ref.current!, "00:");
    expect(ref.current?.value).toBe("00:");
  });
  it("rejects fractional rates, preserves controlled values and resets external native forms", async () => {
    const { container, rerender } = render(<><form id="timecode-form" /><TimecodeField label="In point" frameRate={24} form="timecode-form" name="in" defaultValue="00:00:00:00" /></>);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "00:00:03:12" } });
    act(() => container.querySelector("form")!.reset());
    await waitFor(() => expect(new FormData(container.querySelector("form")!).get("in")).toBe("00:00:00:00"));
    rerender(<TimecodeField label="In point" frameRate={29.97} value="00:00:00:00" />);
    expect((screen.getByRole("textbox") as HTMLInputElement).checkValidity()).toBe(false);
    expect(screen.getByText("Use an integer non-drop frame rate from 1 to 99.")).toBeTruthy();
    rerender(<TimecodeField label="In point" frameRate={24} value="00:00:00:00" />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "00:00:01:00" } });
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("00:00:00:00");
  });
});

describe("ClipTimeline", () => {
  it("seeks and requests selection from full-size keyboard controls without taking over caller state", async () => {
    const user = userEvent.setup();
    const select = vi.fn();
    const seek = vi.fn();
    render(<ClipTimeline label="Assembly" tracks={tracks} clips={clips} duration={60} unit="seconds" position={0} onSeek={seek} onSelectClip={select} />);
    fireEvent.change(screen.getByRole("slider", { name: "Seek in seconds" }), { target: { value: "12.5" } });
    expect(seek).toHaveBeenLastCalledWith(12.5);
    expect((screen.getByRole("slider") as HTMLInputElement).value).toBe("0");
    screen.getByRole("button", { name: /Opening/ }).focus();
    await user.keyboard("{Enter}");
    expect(select).toHaveBeenLastCalledWith("opening");
    expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByRole("region", { name: "Assembly" }).tabIndex).toBe(0);
  });
  it("retains invalid and unassigned clip text and rejects non-integer frame geometry", () => {
    const { container, rerender } = render(<ClipTimeline label="Assembly" tracks={tracks} clips={[{ ...clips[0]!, trackId: "missing", start: Number.NaN }]} duration={60} unit="seconds" />);
    expect(screen.getByText(/Unknown track · Invalid interval/)).toBeTruthy();
    expect(container.innerHTML).not.toContain("NaN");
    rerender(<ClipTimeline label="Assembly" tracks={tracks} clips={[{ ...clips[0]!, start: 0.5 }]} duration={60} unit="frames" />);
    expect(screen.getByText(/Invalid interval/)).toBeTruthy();
    expect(container.querySelector(".rs-clip-timeline-clip")).toBeNull();
    rerender(<ClipTimeline label="Assembly" tracks={[]} clips={[]} duration={0} unit="frames" onSeek={() => {}} />);
    expect(screen.getByText("Timeline duration unavailable")).toBeTruthy();
    expect(screen.queryByRole("slider")).toBeNull();
    expect(screen.getByText("No tracks supplied")).toBeTruthy();
  });
});

describe("RenderQueue", () => {
  it("exposes only caller-supported actions with job-specific keyboard labels and no fake progress", async () => {
    const user = userEvent.setup();
    const cancel = vi.fn();
    const retry = vi.fn();
    render(<RenderQueue label="Exports" jobs={[{ id: "a", label: "Master", status: "rendering", progress: 0 }, { id: "b", label: "Review", status: "failed" }, { id: "c", label: "Poster", status: "complete" }]} onCancel={cancel} onRetry={retry} />);
    expect((screen.getByRole("progressbar") as HTMLProgressElement).value).toBe(0);
    await user.tab();
    await user.keyboard("{Enter}");
    expect(cancel).toHaveBeenLastCalledWith("a");
    await user.tab();
    await user.keyboard(" ");
    expect(retry).toHaveBeenLastCalledWith("b");
    expect(screen.getByText("Rendering")).toBeTruthy();
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });
  it("keeps unavailable progress separate from zero and omits unhandled actions", () => {
    const { container, rerender } = render(<RenderQueue label="Exports" jobs={[{ id: "a", label: "Master", status: "rendering", progress: Number.NaN }, { id: "b", label: "Review", status: "queued" }]} />);
    expect(screen.getByText("Progress unavailable")).toBeTruthy();
    expect(screen.getByText("Progress not reported")).toBeTruthy();
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
    expect(container.innerHTML).not.toContain("NaN");
    rerender(<RenderQueue label="Exports" jobs={[]} />);
    expect(screen.getByText("No render jobs")).toBeTruthy();
  });
});

describe("LayerStack", () => {
  it("requests selection, visibility, unlocking and order changes through keyboard controls", async () => {
    const user = userEvent.setup();
    const select = vi.fn();
    const change = vi.fn();
    render(<LayerStack label="Layers" layers={layers} onSelect={select} onLayersChange={change} />);
    await user.tab();
    await user.keyboard("{Enter}");
    expect(select).toHaveBeenLastCalledWith("title");
    await user.tab();
    await user.keyboard(" ");
    expect(change.mock.lastCall?.[0][0]).toMatchObject({ id: "title", visible: false });
    expect(screen.getByRole("button", { name: "Title visibility" }).getAttribute("aria-pressed")).toBe("true");
    await user.click(screen.getByRole("button", { name: "Move Title down" }));
    expect(change.mock.lastCall?.[0].map((layer: { id: string }) => layer.id)).toEqual(["background", "title"]);
    expect((screen.getByRole("button", { name: "Move Background up" }) as HTMLButtonElement).disabled).toBe(true);
    await user.click(screen.getByRole("button", { name: "Background lock" }));
    expect(change.mock.lastCall?.[0][1]).toMatchObject({ id: "background", locked: false });
  });
  it("shows static records without callbacks and has no actions for an empty stack", () => {
    const { rerender } = render(<LayerStack label="Layers" layers={layers} selectedId="title" />);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText("Title · Selected")).toBeTruthy();
    rerender(<LayerStack label="Layers" layers={[]} />);
    expect(screen.getByText("No layers")).toBeTruthy();
  });
});

describe("ColorInspector", () => {
  it("edits actual hex and transparent alpha, submits forms, and resets without losing zero", async () => {
    const user = userEvent.setup();
    const { container } = render(<form><ColorInspector label="Fill" name="fill" defaultValue={{ hex: "#808080", alpha: 1 }} /></form>);
    await user.clear(screen.getByRole("textbox", { name: "Hex" }));
    const color = `#${"12"}${"34"}${"56"}`;
    await user.type(screen.getByRole("textbox", { name: "Hex" }), color);
    fireEvent.change(screen.getByRole("spinbutton", { name: "Alpha" }), { target: { value: "0" } });
    const swatch = container.querySelector<HTMLElement>(".rs-color-inspector-swatch")!;
    expect(swatch.style.backgroundColor).toBe("rgb(18, 52, 86)");
    expect(swatch.style.opacity).toBe("0");
    expect(new FormData(container.querySelector("form")!).get("fill.alpha")).toBe("0");
    act(() => container.querySelector("form")!.reset());
    await waitFor(() => expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("#808080"));
  });
  it("preserves editable invalid values, hides invalid previews, and retains controlled state", () => {
    const change = vi.fn();
    const { container, rerender } = render(<ColorInspector label="Fill" defaultValue={{ hex: "oops", alpha: null }} />);
    expect(container.querySelector(".rs-color-inspector-swatch")).toBeNull();
    expect((screen.getByRole("textbox") as HTMLInputElement).checkValidity()).toBe(false);
    expect(screen.getByText("Enter a six-digit hex color beginning with #.")).toBeTruthy();
    rerender(<ColorInspector label="Fill" value={{ hex: "#808080", alpha: 0 }} onValueChange={change} />);
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "" } });
    expect(change).toHaveBeenLastCalledWith({ hex: "#808080", alpha: null });
    expect((screen.getByRole("spinbutton") as HTMLInputElement).value).toBe("0");
  });
});

describe("SpacingControl", () => {
  it("edits independent sides, links the next edit, preserves empty values and resets link state", async () => {
    const user = userEvent.setup();
    const { container } = render(<form><SpacingControl label="Padding" name="padding" defaultValue={{ top: 0, right: 2, bottom: 3, left: 4 }} /></form>);
    fireEvent.change(screen.getByRole("spinbutton", { name: "Top (px)" }), { target: { value: "8" } });
    expect((screen.getByRole("spinbutton", { name: "Right (px)" }) as HTMLInputElement).value).toBe("2");
    screen.getByRole("button", { name: "Link sides" }).focus();
    await user.keyboard("{Enter}");
    expect((screen.getByRole("spinbutton", { name: "Right (px)" }) as HTMLInputElement).value).toBe("2");
    fireEvent.change(screen.getByRole("spinbutton", { name: "Top (px)" }), { target: { value: "0" } });
    for (const field of screen.getAllByRole("spinbutton")) expect((field as HTMLInputElement).value).toBe("0");
    expect(new FormData(container.querySelector("form")!).get("padding.left")).toBe("0");
    fireEvent.change(screen.getByRole("spinbutton", { name: "Top (px)" }), { target: { value: "" } });
    for (const field of screen.getAllByRole("spinbutton")) expect((field as HTMLInputElement).value).toBe("");
    act(() => container.querySelector("form")!.reset());
    await waitFor(() => expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe("false"));
    expect((screen.getByRole("spinbutton", { name: "Left (px)" }) as HTMLInputElement).value).toBe("4");
  });
  it("uses supplied bounds and preserves controlled values and link state", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const link = vi.fn();
    const { rerender } = render(<SpacingControl label="Padding" min={0} max={100} step={0.5} linked={false} onLinkedChange={link} value={{ top: 0, right: 0, bottom: 0, left: 0 }} onValueChange={change} />);
    await user.click(screen.getByRole("button"));
    expect(link).toHaveBeenLastCalledWith(true);
    expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe("false");
    fireEvent.change(screen.getByRole("spinbutton", { name: "Top (px)" }), { target: { value: "-1" } });
    expect(change).toHaveBeenLastCalledWith({ top: -1, right: 0, bottom: 0, left: 0 });
    expect((screen.getByRole("spinbutton", { name: "Top (px)" }) as HTMLInputElement).value).toBe("0");
    rerender(<SpacingControl label="Padding" min={10} max={0} />);
    expect(screen.getByText("Spacing bounds unavailable")).toBeTruthy();
    expect((screen.getAllByRole("spinbutton")[0] as HTMLInputElement).disabled).toBe(true);
  });
});

describe("creative accessibility", () => {
  const examples = [
    <AudioMeter key="audio" label="Output" channels={[{ id: "left", label: "Left", level: -12 }]} />,
    <ChannelStrip key="channel" label="Dialogue" />,
    <ParameterKnob key="knob" label="Mix" />,
    <TimecodeField key="timecode" label="In point" frameRate={24} />,
    <ClipTimeline key="timeline" label="Assembly" tracks={tracks} clips={clips} duration={60} unit="seconds" onSeek={() => {}} onSelectClip={() => {}} />,
    <RenderQueue key="queue" label="Exports" jobs={[{ id: "a", label: "Master", status: "rendering", progress: 42 }]} onCancel={() => {}} />,
    <LayerStack key="layers" label="Layers" layers={layers} onSelect={() => {}} onLayersChange={() => {}} />,
    <ColorInspector key="color" label="Fill" />,
    <SpacingControl key="spacing" label="Padding" />,
  ];
  for (const example of examples) it(`${example.key} exposes named controls and text equivalents`, async () => {
    const { container } = render(<main>{example}</main>);
    expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });
});
