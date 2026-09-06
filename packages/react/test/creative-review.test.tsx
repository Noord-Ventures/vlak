import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AudioMeter } from "../src/components/audio-meter";
import { ChannelStrip } from "../src/components/channel-strip";
import { ColorInspector } from "../src/components/color-inspector";
import { LayerStack } from "../src/components/layer-stack";
import { ClipTimeline } from "../src/components/clip-timeline";

afterEach(cleanup);

describe("creative review regressions", () => {
  it("names each clip viewport from its own visible timeline label", () => {
    const props = { duration: 60, unit: "seconds" as const, tracks: [{ id: "video", label: "Video" }], clips: [] };
    render(<><ClipTimeline {...props} label="Assembly" /><ClipTimeline {...props} label="Sequence" /></>);
    const assembly = screen.getByRole("region", { name: "Assembly" });
    const sequence = screen.getByRole("region", { name: "Sequence" });
    expect(assembly.getAttribute("aria-labelledby")).not.toBe(sequence.getAttribute("aria-labelledby"));
    expect(assembly.tabIndex).toBe(0);
    expect(sequence.tabIndex).toBe(0);
  });

  it("preserves readonly channel values in an associated form and omits a disabled channel", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const props = { label: "Dialogue", name: "dialogue", form: "mix", readOnly: true, value: { gain: -3.5, pan: 20, muted: true, solo: false }, onValueChange: change };
    const { rerender } = render(<><form id="mix" aria-label="Mix" /><ChannelStrip {...props} /></>);
    const form = screen.getByRole("form", { name: "Mix" }) as HTMLFormElement;
    expect(Object.fromEntries(new FormData(form))).toEqual({ "dialogue.gain": "-3.5", "dialogue.pan": "20", "dialogue.muted": "true", "dialogue.solo": "false" });
    await user.click(screen.getByRole("button", { name: "Mute" }));
    expect(change).not.toHaveBeenCalled();
    rerender(<><form id="mix" aria-label="Mix" /><ChannelStrip {...props} disabled /></>);
    expect([...new FormData(screen.getByRole("form", { name: "Mix" }) as HTMLFormElement)]).toEqual([]);
  });

  it("never displays one channel value while submitting a silently clamped one", () => {
    const { container } = render(<form><ChannelStrip label="Dialogue" name="dialogue" value={{ gain: 100, pan: 150, muted: false, solo: false }} /></form>);
    expect(screen.getByText("100 dB · Outside range")).toBeTruthy();
    expect(screen.getByText("150% right · Outside range")).toBeTruthy();
    expect((screen.getByRole("slider", { name: "Gain" }) as HTMLInputElement).disabled).toBe(true);
    expect((screen.getByRole("slider", { name: "Pan" }) as HTMLInputElement).disabled).toBe(true);
    const form = new FormData(container.querySelector("form")!);
    expect(form.has("dialogue.gain")).toBe(false);
    expect(form.has("dialogue.pan")).toBe(false);
  });

  it("describes channel pan as direction and percentage rather than an unqualified signed number", () => {
    render(<ChannelStrip label="Dialogue" value={{ gain: -3, pan: -25, muted: false, solo: false }} />);
    expect(screen.getByRole("slider", { name: "Pan" }).getAttribute("aria-valuetext")).toBe("25% left");
  });

  it("preserves precise in-range channel values in the display, native controls and form data", () => {
    const { container } = render(<form><ChannelStrip label="Dialogue" name="dialogue" value={{ gain: 0.15, pan: 0.5, muted: false, solo: false }} /></form>);
    const gain = screen.getByRole("slider", { name: "Gain" }) as HTMLInputElement;
    const pan = screen.getByRole("slider", { name: "Pan" }) as HTMLInputElement;
    expect(gain.validity.stepMismatch).toBe(false);
    expect(pan.validity.stepMismatch).toBe(false);
    expect(gain.value).toBe("0.15");
    expect(pan.value).toBe("0.5");
    expect(screen.getByText("0.15 dB")).toBeTruthy();
    expect(screen.getByText("0.5% right")).toBeTruthy();
    const data = new FormData(container.querySelector("form")!);
    expect(data.get("dialogue.gain")).toBe("0.15");
    expect(data.get("dialogue.pan")).toBe("0.5");
  });

  it("accepts arbitrary valid alpha precision in native form validation and edits", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { container } = render(<form><ColorInspector label="Fill" name="fill" defaultValue={{ hex: "#808080", alpha: 0.333 }} onValueChange={change} /></form>);
    const form = container.querySelector("form")!;
    const alpha = screen.getByRole("spinbutton", { name: "Alpha" }) as HTMLInputElement;
    expect(alpha.validity.stepMismatch).toBe(false);
    expect(form.checkValidity()).toBe(true);
    expect(new FormData(form).get("fill.alpha")).toBe("0.333");
    await user.clear(alpha);
    await user.type(alpha, "0.1234");
    expect(change).toHaveBeenLastCalledWith({ hex: "#808080", alpha: 0.1234 });
    expect(form.checkValidity()).toBe(true);
    expect(container.querySelector<HTMLElement>(".rs-color-inspector-swatch")?.style.opacity).toBe("0.1234");
    fireEvent.change(alpha, { target: { value: "1.01" } });
    expect(form.checkValidity()).toBe(false);
    expect(alpha.getAttribute("aria-invalid")).toBe("true");
  });

  it("keeps visible visibility and lock labels inside their accessible toggle names", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const layer = { id: "title", label: "Title", visible: true, locked: false };
    const { rerender } = render(<LayerStack label="Layers" layers={[layer]} onLayersChange={change} />);
    const visibility = screen.getByRole("button", { name: "Title visibility" });
    const lock = screen.getByRole("button", { name: "Title lock" });
    for (const button of [visibility, lock]) expect(button.getAttribute("aria-label")?.toLowerCase()).toContain(button.textContent!.toLowerCase());
    visibility.focus();
    await user.keyboard(" ");
    expect(change).toHaveBeenLastCalledWith([{ ...layer, visible: false }]);
    expect(visibility.getAttribute("aria-pressed")).toBe("true");
    rerender(<LayerStack label="Layers" layers={[{ ...layer, visible: false, locked: true }]} onLayersChange={change} />);
    expect(screen.getByRole("button", { name: "Title visibility" }).textContent).toBe("Visibility");
    expect(screen.getByRole("button", { name: "Title lock" }).textContent).toBe("Lock");
    expect(screen.getByRole("button", { name: "Title lock" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("does not draw an audio meter when finite endpoints produce an infinite span", () => {
    render(<AudioMeter label="Output" min={-1e308} max={1e308} channels={[{ id: "left", label: "Left", level: 0 }]} />);
    expect(screen.queryByRole("meter")).toBeNull();
    expect(screen.getByText("Meter range unavailable")).toBeTruthy();
    expect(screen.getByText("0 dB")).toBeTruthy();
  });

  it("accepts a decimal-second end at the duration while rejecting meaningful overflow", async () => {
    const user = userEvent.setup();
    const select = vi.fn();
    const { container } = render(<ClipTimeline label="Short edit" unit="seconds" duration={0.3} tracks={[{ id: "track", label: "Track" }]} clips={[
      { id: "clip", trackId: "track", label: "Clip", start: 0.1, duration: 0.2 },
      { id: "overflow", trackId: "track", label: "Overflow", start: 0.1, duration: 0.201 },
    ]} onSelectClip={select} />);
    const clip = screen.getByRole("button", { name: "Clip · Track · 0.1–0.3 seconds" });
    expect(screen.getByRole("button", { name: "Overflow · Track · Invalid interval" })).toBeTruthy();
    expect(container.querySelectorAll(".rs-clip-timeline-clip")).toHaveLength(1);
    clip.focus();
    await user.keyboard("{Enter}");
    expect(select).toHaveBeenCalledExactlyOnceWith("clip");
  });
});
