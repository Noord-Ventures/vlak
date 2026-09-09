import * as React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AudioPlayer, useAudioPlayer } from "../src/components/audio-player";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
function nativeMedia() {
  const pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function(this: HTMLMediaElement) { this.dispatchEvent(new Event("pause")); });
  const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function(this: HTMLMediaElement) { this.dispatchEvent(new Event("play")); return Promise.resolve(); });
  const load = vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
  return { pause, play, load };
}
describe("AudioPlayer", () => {
  it("hydrates media that loaded before React attached event handlers", async () => {
    nativeMedia(); const user = userEvent.setup();
    const ref = (media: HTMLAudioElement | null) => {
      if (!media) return;
      Object.defineProperty(media, "duration", { configurable: true, value: 8 });
      media.currentTime = 2; media.volume = 0.4; media.muted = true;
    };
    render(<AudioPlayer ref={ref} title="Already loaded" src="/cached.wav" />);
    const forward = screen.getByRole("button", { name: "Forward 10 seconds" });
    expect((forward as HTMLButtonElement).disabled).toBe(false);
    expect(screen.getByRole("button", { name: "Unmute audio" })).toBeTruthy();
    await user.click(forward);
    expect(screen.getByRole("slider", { name: "Playback position" }).getAttribute("aria-valuetext")).toBe("0:08 of 0:08");
  });
  it("plays generated speech by keyboard, exposes its media ref and seeks within duration", async () => {
    const { play } = nativeMedia(); const user = userEvent.setup(); const onTimeChange = vi.fn(); const onPlayingChange = vi.fn();
    const ref = React.createRef<HTMLAudioElement>();
    const { container } = render(<AudioPlayer ref={ref} title="Spoken brief" data={{ base64: "YXVkaW8=", mediaType: "audio/wav" }} transcript="The project is ready." onTimeChange={onTimeChange} onPlayingChange={onPlayingChange} className="custom" />);
    expect(ref.current?.src).toBe("data:audio/wav;base64,YXVkaW8="); expect(play).not.toHaveBeenCalled();
    Object.defineProperty(ref.current, "duration", { configurable: true, value: 15 }); fireEvent.durationChange(ref.current!);
    const button = screen.getByRole("button", { name: "Play audio" }); button.focus(); await user.keyboard("{Enter}"); expect(play).toHaveBeenCalledOnce(); expect(onPlayingChange).toHaveBeenCalledWith(true);
    await user.click(screen.getByRole("button", { name: "Forward 10 seconds" })); expect(ref.current?.currentTime).toBe(10);
    await user.click(screen.getByRole("button", { name: "Forward 10 seconds" })); expect(ref.current?.currentTime).toBe(15); expect(onTimeChange).toHaveBeenLastCalledWith(15);
    await user.click(screen.getByRole("button", { name: "Back 10 seconds" })); expect(ref.current?.currentTime).toBe(5);
    await user.click(screen.getByRole("button", { name: "Mute audio" })); expect(ref.current?.muted).toBe(true);
    const result = await axe(container, { rules: { "color-contrast": { enabled: false } } });
    (expect(result) as unknown as { toHaveNoViolations(): void }).toHaveNoViolations();
  });
  it("reports failed playback, reloads on retry and invalidates stale play results on source changes", async () => {
    const { play, pause, load } = nativeMedia(); const user = userEvent.setup();
    play.mockRejectedValueOnce(new Error("Blocked"));
    const ref = React.createRef<HTMLAudioElement>(); const { rerender, unmount } = render(<AudioPlayer ref={ref} title="Audio" src="/first.wav" />);
    await user.click(screen.getByRole("button", { name: "Play audio" })); await screen.findByText("Audio could not play. Try again.");
    await user.click(screen.getByRole("button", { name: "Retry audio" })); expect(load).toHaveBeenCalledOnce();
    let reject: ((error: Error) => void) | undefined;
    play.mockImplementationOnce(() => new Promise((_resolve, fail) => { reject = fail; }));
    await user.click(screen.getByRole("button", { name: "Play audio" })); const old = ref.current;
    rerender(<AudioPlayer ref={ref} title="Audio" src="/second.wav" />); expect(ref.current).not.toBe(old); expect(pause).toHaveBeenCalled();
    await act(async () => { reject?.(new Error("Old source")); }); expect(screen.queryByText("Audio could not play. Try again.")).toBeNull();
    expect((screen.getByRole("button", { name: "Play audio" }) as HTMLButtonElement).disabled).toBe(false);
    unmount(); expect(pause).toHaveBeenCalledTimes(2);
  });
  it("supports application-composed controls through the native controller", async () => {
    const { play } = nativeMedia(); const user = userEvent.setup();
    function Controls() { const audio = useAudioPlayer(); return <button type="button" onClick={() => { void audio.play(); }}>{audio.playing ? "Playing custom audio" : "Custom play"}</button>; }
    render(<AudioPlayer title="Custom audio" src="/sample.wav"><Controls /></AudioPlayer>);
    expect(screen.queryByRole("button", { name: "Play audio" })).toBeNull(); await user.click(screen.getByRole("button", { name: "Custom play" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Playing custom audio" })).toBeTruthy()); expect(play).toHaveBeenCalledOnce();
  });
});
