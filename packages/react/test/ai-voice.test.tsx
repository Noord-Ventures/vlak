import * as React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MicSelector } from "../src/components/mic-selector";
import { SpeechInput } from "../src/components/speech-input";
import { VoiceSelector } from "../src/components/voice-selector";
import { Transcription } from "../src/components/transcription";
import { Persona } from "../src/components/persona";

const mediaDescriptor = Object.getOwnPropertyDescriptor(navigator, "mediaDevices");
afterEach(() => {
  cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals();
  if (mediaDescriptor) Object.defineProperty(navigator, "mediaDevices", mediaDescriptor);
  else Reflect.deleteProperty(navigator, "mediaDevices");
});
const device = (deviceId: string, label: string) => ({ deviceId, label, kind: "audioinput", groupId: "group", toJSON() { return {}; } }) as MediaDeviceInfo;
function mediaDevices(devices = [device("mic", "Studio microphone")]) {
  const events = new EventTarget();
  const stop = vi.fn(); const stream = { getTracks: () => [{ stop }] } as unknown as MediaStream;
  const media = Object.assign(events, { enumerateDevices: vi.fn().mockResolvedValue(devices), getUserMedia: vi.fn().mockResolvedValue(stream) });
  Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: media });
  return { media, stop, stream };
}
async function accessible(container: HTMLElement) {
  const result = await axe(container, { rules: { "color-contrast": { enabled: false } } });
  (expect(result) as unknown as { toHaveNoViolations(): void }).toHaveNoViolations();
}
function recognitionMock() {
  class Recognition {
    static latest: Recognition;
    continuous = false; interimResults = false; lang = "";
    onstart: (() => void) | null = null; onend: (() => void) | null = null;
    onerror: ((event: { error: string }) => void) | null = null;
    onresult: ((event: { resultIndex: number; results: { length: number; [index: number]: { isFinal: boolean; length: number; [index: number]: { transcript: string } } } }) => void) | null = null;
    start = vi.fn(() => this.onstart?.()); stop = vi.fn(() => this.onend?.()); abort = vi.fn();
    constructor() { Recognition.latest = this; }
  }
  vi.stubGlobal("SpeechRecognition", Recognition); return Recognition;
}
function recorderMock() {
  class Recorder {
    static latest: Recorder;
    static isTypeSupported = vi.fn((type: string) => type === "audio/mp4");
    mimeType: string; state = "inactive";
    ondataavailable: ((event: { data: Blob }) => void) | null = null;
    onstop: (() => void) | null = null; onerror: (() => void) | null = null;
    constructor(_stream: MediaStream, options?: MediaRecorderOptions) { Recorder.latest = this; this.mimeType = options?.mimeType ?? "audio/ogg"; }
    start = vi.fn(() => { this.state = "recording"; });
    stop = vi.fn(() => { this.state = "inactive"; this.ondataavailable?.({ data: new Blob(["audio"], { type: this.mimeType }) }); this.onstop?.(); });
  }
  vi.stubGlobal("MediaRecorder", Recorder); return Recorder;
}

describe("MicSelector", () => {
  it("enumerates without permission, searches by keyboard and forwards its ref", async () => {
    const { media } = mediaDevices([device("desk", "Desk microphone"), device("studio", "Studio microphone")]);
    const user = userEvent.setup(); const onValueChange = vi.fn(); const ref = React.createRef<HTMLDivElement>();
    const { container } = render(<MicSelector ref={ref} data-example="input" className="custom" style={{ marginTop: 4 }} onValueChange={onValueChange} />);
    await waitFor(() => expect((screen.getByRole("combobox", { name: "Microphone" }) as HTMLInputElement).disabled).toBe(false));
    expect(media.getUserMedia).not.toHaveBeenCalled();
    const input = screen.getByRole("combobox"); await user.click(input); await user.type(input, "Studio"); await user.keyboard("{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("studio"); expect(ref.current?.dataset.example).toBe("input"); expect(ref.current?.style.marginTop).toBe("4px");
    await accessible(container);
  });

  it("requests permission only on activation, releases temporary input and refreshes device changes", async () => {
    const { media, stop } = mediaDevices([device("mic", "")]); const user = userEvent.setup();
    render(<MicSelector value="mic" />);
    await screen.findByRole("button", { name: "Allow microphone access" });
    await waitFor(() => expect((screen.getByRole("button", { name: "Allow microphone access" }) as HTMLButtonElement).disabled).toBe(false));
    media.enumerateDevices.mockResolvedValue([device("mic", "Studio microphone")]);
    await user.click(screen.getByRole("button", { name: "Allow microphone access" }));
    await waitFor(() => expect(stop).toHaveBeenCalled()); expect(media.getUserMedia).toHaveBeenCalledOnce();
    media.enumerateDevices.mockResolvedValue([]); act(() => media.dispatchEvent(new Event("devicechange")));
    await screen.findByText("The selected microphone is disconnected. Choose another input.");
  });

  it("keeps denied permission retryable and stops a late stream after unmount", async () => {
    const { media, stream, stop } = mediaDevices([]); const user = userEvent.setup();
    media.getUserMedia.mockRejectedValueOnce(new DOMException("Denied", "NotAllowedError"));
    const { unmount } = render(<MicSelector />);
    await waitFor(() => expect((screen.getByRole("button", { name: "Allow microphone access" }) as HTMLButtonElement).disabled).toBe(false));
    await user.click(screen.getByRole("button", { name: "Allow microphone access" }));
    await screen.findByText(/Microphone permission was denied/);
    let resolve: ((stream: MediaStream) => void) | undefined;
    media.getUserMedia.mockImplementationOnce(() => new Promise(done => { resolve = done; }));
    await user.click(screen.getByRole("button", { name: "Allow microphone access" })); unmount();
    await act(async () => { resolve?.(stream); }); expect(stop).toHaveBeenCalledOnce();
  });
});

describe("SpeechInput", () => {
  it("keeps its live status mounted without empty spacing, then spaces visible feedback", async () => {
    recognitionMock(); const user = userEvent.setup();
    const { rerender } = render(<SpeechInput onTranscript={() => {}} />);
    const status = screen.getByRole("status"); const root = status.parentElement!;
    expect(status.textContent).toBe("");
    expect(getComputedStyle(root).gap || "0px").toBe("0px");
    expect(getComputedStyle(status).marginTop).toBe("0px");
    expect(screen.getByRole("button").getAttribute("aria-describedby")).toContain(status.id);
    await user.click(screen.getByRole("button", { name: "Start speech input" }));
    expect(screen.getByRole("status")).toBe(status);
    expect(status.textContent).toBe("Listening…");
    expect(getComputedStyle(status).marginTop).toBe("0.5rem");
    rerender(<SpeechInput onTranscript={() => {}} lang="nl-NL" />);
    expect(screen.getByRole("status")).toBe(status);
    expect(status.textContent).toBe("");
    expect(getComputedStyle(status).marginTop).toBe("0px");
  });

  it("is disabled with an explanation when browser capture is unavailable", async () => {
    const { container } = render(<SpeechInput onTranscript={() => {}} />);
    expect((screen.getByRole("button", { name: "Start speech input" }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole("status").textContent).toContain("unavailable"); await accessible(container);
  });

  it("captures final/interim recognition by keyboard, stops and releases on unmount", async () => {
    const Recognition = recognitionMock(); const user = userEvent.setup();
    const onTranscript = vi.fn(); const onInterimTranscript = vi.fn(); const onStatusChange = vi.fn(); const ref = React.createRef<HTMLButtonElement>();
    const { container, unmount } = render(<SpeechInput ref={ref} onTranscript={onTranscript} onInterimTranscript={onInterimTranscript} onStatusChange={onStatusChange} lang="nl-NL" data-control="speech" />);
    expect(ref.current?.dataset.control).toBe("speech"); await user.tab(); await user.keyboard("{Enter}");
    expect(Recognition.latest.lang).toBe("nl-NL"); expect(screen.getByRole("button", { name: "Stop speech input" })).toBeTruthy();
    act(() => Recognition.latest.onresult?.({ resultIndex: 0, results: [{ isFinal: true, length: 1, 0: { transcript: "Hello world" } }, { isFinal: false, length: 1, 0: { transcript: "Next" } }] }));
    expect(onTranscript).toHaveBeenCalledExactlyOnceWith("Hello world"); expect(onInterimTranscript).toHaveBeenCalledWith("Next");
    await accessible(container); await user.click(screen.getByRole("button", { name: "Stop speech input" }));
    expect(Recognition.latest.stop).toHaveBeenCalledOnce(); expect(onStatusChange).toHaveBeenLastCalledWith("idle");
    await user.click(screen.getByRole("button", { name: "Start speech input" })); const last = Recognition.latest; unmount(); expect(last.abort).toHaveBeenCalled();
  });

  it("records the selected device with a supported MIME and passes real bytes to the application", async () => {
    const { media, stop } = mediaDevices(); const Recorder = recorderMock(); const user = userEvent.setup();
    const onTranscript = vi.fn(); const onAudioRecorded = vi.fn().mockResolvedValue(" Recorded answer ");
    render(<SpeechInput mode="recording" deviceId="mic" onTranscript={onTranscript} onAudioRecorded={onAudioRecorded} />);
    expect(media.getUserMedia).not.toHaveBeenCalled(); await user.click(screen.getByRole("button", { name: "Start speech input" }));
    expect(media.getUserMedia).toHaveBeenCalledWith({ audio: { deviceId: { exact: "mic" } } });
    expect(Recorder.latest.mimeType).toBe("audio/mp4"); await user.click(screen.getByRole("button", { name: "Stop speech input" }));
    await screen.findByText("Transcript ready."); const blob = onAudioRecorded.mock.calls[0]![0] as Blob;
    expect(blob.size).toBeGreaterThan(0); expect(blob.type).toBe("audio/mp4"); expect(onTranscript).toHaveBeenCalledExactlyOnceWith("Recorded answer"); expect(stop).toHaveBeenCalled();
  });

  it("cancels pending transcription, guards duplicate input, ignores late text and permits retry", async () => {
    mediaDevices(); recorderMock(); const user = userEvent.setup();
    let resolve: ((text: string) => void) | undefined;
    const onAudioRecorded = vi.fn().mockImplementationOnce(() => new Promise(done => { resolve = done; })); const onTranscript = vi.fn();
    render(<SpeechInput mode="recording" onTranscript={onTranscript} onAudioRecorded={onAudioRecorded} />);
    await user.click(screen.getByRole("button", { name: "Start speech input" })); await user.click(screen.getByRole("button", { name: "Stop speech input" }));
    const signal = onAudioRecorded.mock.calls[0]![1].signal as AbortSignal;
    await user.click(screen.getByRole("button", { name: "Cancel speech input" })); expect(signal.aborted).toBe(true);
    await act(async () => { resolve?.("Stale answer"); }); expect(onTranscript).not.toHaveBeenCalled();
    onAudioRecorded.mockRejectedValueOnce(new Error("Transcription is offline. Try again."));
    await user.click(screen.getByRole("button", { name: "Start speech input" })); await user.click(screen.getByRole("button", { name: "Stop speech input" }));
    await screen.findByText("Transcription is offline. Try again."); expect((screen.getByRole("button", { name: "Start speech input" }) as HTMLButtonElement).disabled).toBe(false);
  });

  it("releases microphone permission that resolves after cancellation", async () => {
    const { media, stream, stop } = mediaDevices(); recorderMock(); const user = userEvent.setup();
    let resolve: ((stream: MediaStream) => void) | undefined; media.getUserMedia.mockImplementationOnce(() => new Promise(done => { resolve = done; }));
    render(<SpeechInput mode="recording" onTranscript={() => {}} onAudioRecorded={async () => ""} />);
    await user.click(screen.getByRole("button", { name: "Start speech input" })); await user.click(screen.getByRole("button", { name: "Cancel speech input" }));
    await act(async () => { resolve?.(stream); }); expect(stop).toHaveBeenCalledOnce();
  });
});

describe("Transcription", () => {
  it("keeps transcript scroll groups named without adding page landmarks", async () => {
    const { container } = render(<main><Transcription label="Brief transcript" segments={[]} /><Transcription label="Review transcript" segments={[]} /></main>);
    expect(screen.queryByRole("region")).toBeNull();
    expect(screen.getByRole("group", { name: "Brief transcript" }).tabIndex).toBe(0);
    expect(screen.getByRole("group", { name: "Review transcript" }).tabIndex).toBe(0);
    await accessible(container);
  });
  const segments = [{ id: "one", text: "First phrase", startSecond: 0, endSecond: 3, speaker: "Mina" }, { id: "two", text: "Second phrase", startSecond: 3, endSecond: 7 }];
  it("highlights timed text and seeks only on keyboard activation, not playback updates", async () => {
    const user = userEvent.setup(); const onSeek = vi.fn(); const ref = React.createRef<HTMLDivElement>();
    const { container, rerender } = render(<Transcription ref={ref} segments={segments} currentTime={1} onSeek={onSeek} className="custom" />);
    expect(ref.current?.classList.contains("custom")).toBe(true);
    expect(screen.getByRole("button", { name: /First phrase/ }).getAttribute("aria-current")).toBe("true");
    rerender(<Transcription segments={segments} currentTime={4} onSeek={onSeek} />); expect(onSeek).not.toHaveBeenCalled();
    const second = screen.getByRole("button", { name: /Second phrase/ }); second.focus(); await user.keyboard("{Enter}"); expect(onSeek).toHaveBeenCalledExactlyOnceWith(3); await accessible(container);
  });
  it("renders noninteractive text and preserves a reader's manual scrolling", () => {
    const { rerender } = render(<Transcription segments={segments} autoScroll currentTime={0} />);
    expect(screen.queryByRole("button")).toBeNull(); fireEvent.wheel(screen.getByRole("group", { name: "Transcript" }));
    expect(screen.getByRole("button", { name: "Follow transcript" })).toBeTruthy();
    rerender(<Transcription segments={segments} autoScroll currentTime={4} />); expect(screen.getByRole("button", { name: "Follow transcript" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Follow transcript" })); expect(screen.queryByRole("button")).toBeNull();
  });
});

describe("VoiceSelector and Persona", () => {
  const voices = [{ id: "one", name: "Mina", provider: "Example provider", language: "English", attributes: ["Warm"], previewSrc: "/sample.wav", previewText: "A short spoken sample." }, { id: "two", name: "Noor", provider: "Example provider", language: "Dutch" }];
  it("searches supplied metadata by keyboard, preserves controlled selection and previews audio", async () => {
    const user = userEvent.setup(); const onValueChange = vi.fn();
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function(this: HTMLMediaElement) { this.dispatchEvent(new Event("play")); return Promise.resolve(); });
    const pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function(this: HTMLMediaElement) { this.dispatchEvent(new Event("pause")); });
    const { container, rerender } = render(<VoiceSelector voices={voices} value="one" onValueChange={onValueChange} />);
    expect(play).not.toHaveBeenCalled(); await user.click(screen.getByRole("button", { name: "Preview voice" })); expect(play).toHaveBeenCalledOnce();
    const input = screen.getByRole("combobox", { name: "Voice" }); await user.click(input); await user.clear(input); await user.type(input, "Dutch"); await user.keyboard("{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("two"); expect(screen.getByText("A short spoken sample.")).toBeTruthy();
    rerender(<VoiceSelector voices={voices} value="two" onValueChange={onValueChange} />); expect(pause).toHaveBeenCalled(); expect(screen.queryByRole("button", { name: "Preview voice" })).toBeNull(); await accessible(container);
  });
  it("reports a failed voice preview and permits retry", async () => {
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockRejectedValueOnce(new Error("Denied")); const user = userEvent.setup();
    render(<VoiceSelector voices={voices} defaultValue="one" />); await user.click(screen.getByRole("button", { name: "Preview voice" }));
    await screen.findByText("The voice sample could not play. Try again."); play.mockResolvedValueOnce(); await user.click(screen.getByRole("button", { name: "Preview voice" })); expect(play).toHaveBeenCalledTimes(2);
  });
  it("exposes five persona states, accepts a custom visual and pauses when hidden", async () => {
    const ref = React.createRef<HTMLDivElement>();
    const { container, rerender } = render(<Persona ref={ref} label="Assistant" state="listening" size={24} className="custom" />);
    expect(screen.getByRole("img", { name: "Assistant: listening" })).toBe(ref.current); expect(ref.current?.style.width).toBe("24px");
    expect(container.querySelector(".rs-persona-running")).toBeTruthy();
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden"); fireEvent(document, new Event("visibilitychange")); expect(container.querySelector(".rs-persona-running")).toBeNull();
    for (const state of ["idle", "thinking", "speaking", "asleep"] as const) { rerender(<Persona label="Assistant" state={state} />); expect(screen.getByRole("img", { name: `Assistant: ${state}` })).toBeTruthy(); }
    rerender(<Persona label="Assistant"><span>Custom visual</span></Persona>); expect(screen.getByText("Custom visual")).toBeTruthy(); expect(container.querySelector(".rs-persona-bar")).toBeNull(); await accessible(container);
  });
});
