import * as React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { PlatformRange, PlatformSwitch } from "../../../apps/www/app/interfaces/mobile-os/platform-controls";

afterEach(cleanup);

it("forwards refs to the focusable native inputs and clears them on unmount", () => {
  const switchRef = React.createRef<HTMLInputElement>();
  const rangeRef = React.createRef<HTMLInputElement>();
  const { unmount } = render(<>
    <PlatformSwitch ref={switchRef} aria-label="Wi-Fi" checked onCheckedChange={() => {}} />
    <PlatformRange ref={rangeRef} aria-label="Volume" value={35} onValueChange={() => {}} />
  </>);
  expect(switchRef.current).toBe(screen.getByRole("switch", { name: "Wi-Fi" }));
  expect(switchRef.current?.type).toBe("checkbox");
  switchRef.current?.focus();
  expect(document.activeElement).toBe(switchRef.current);
  expect(rangeRef.current).toBe(screen.getByRole("slider", { name: "Volume" }));
  expect(rangeRef.current?.type).toBe("range");
  rangeRef.current?.focus();
  expect(document.activeElement).toBe(rangeRef.current);
  unmount();
  expect(switchRef.current).toBeNull();
  expect(rangeRef.current).toBeNull();
});

describe("Mobile OS platform switches", () => {
  it("keeps independent native switches operable with Space and their label hit area", async () => {
    const user = userEvent.setup();
    function Phones() {
      const [ios, setIOS] = React.useState(false);
      const [android, setAndroid] = React.useState(true);
      return <>
        <PlatformSwitch aria-label="iPhone Wi-Fi" checked={ios} onCheckedChange={setIOS} />
        <PlatformSwitch aria-label="Android Wi-Fi" checked={android} onCheckedChange={setAndroid} />
      </>;
    }
    render(<Phones />);
    const ios = screen.getByRole("switch", { name: "iPhone Wi-Fi" }) as HTMLInputElement;
    const android = screen.getByRole("switch", { name: "Android Wi-Fi" }) as HTMLInputElement;
    expect(ios.tagName).toBe("INPUT");
    expect(ios.type).toBe("checkbox");
    expect(ios.checked).toBe(false);
    await user.tab();
    expect(document.activeElement).toBe(ios);
    await user.keyboard(" ");
    expect(ios.checked).toBe(true);
    expect(android.checked).toBe(true);
    expect(document.activeElement).toBe(ios);
    await user.click(ios.closest("label")!);
    expect(ios.checked).toBe(false);
    expect(android.checked).toBe(true);
  });

  it("submits the native checked value and preserves form attributes", () => {
    const { container, rerender } = render(<form>
      <PlatformSwitch aria-label="Low power mode" name="low-power" value="enabled" checked onCheckedChange={() => {}} />
    </form>);
    const form = container.querySelector("form")!;
    expect(new FormData(form).get("low-power")).toBe("enabled");
    rerender(<form>
      <PlatformSwitch aria-label="Low power mode" name="low-power" value="enabled" checked={false} onCheckedChange={() => {}} />
    </form>);
    expect(new FormData(form).has("low-power")).toBe(false);
  });

  it("keeps a disabled switch inert and outside sequential keyboard focus", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<>
      <PlatformSwitch aria-label="Wi-Fi" checked disabled onCheckedChange={onCheckedChange} />
      <button type="button">Continue</button>
    </>);
    const control = screen.getByRole("switch", { name: "Wi-Fi" }) as HTMLInputElement;
    await user.click(control.closest("label")!);
    expect(control.checked).toBe(true);
    expect(onCheckedChange).not.toHaveBeenCalled();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Continue" }));
  });
});

describe("Mobile OS platform ranges", () => {
  it("exposes the native range bounds, value, and vertical orientation", () => {
    render(<PlatformRange aria-label="Display brightness" orientation="vertical" value={80} min={30} max={100} step={5} onValueChange={() => {}} />);
    const range = screen.getByRole("slider", { name: "Display brightness" }) as HTMLInputElement;
    expect(range.tagName).toBe("INPUT");
    expect(range.type).toBe("range");
    expect(range.min).toBe("30");
    expect(range.max).toBe("100");
    expect(range.step).toBe("5");
    expect(range.valueAsNumber).toBe(80);
    expect(range.getAttribute("aria-orientation")).toBe("vertical");
  });

  it("reports numeric input changes while retaining separate device values and focus", async () => {
    const user = userEvent.setup();
    const changed = vi.fn();
    function Phones() {
      const [ios, setIOS] = React.useState(80);
      const [android, setAndroid] = React.useState(35);
      return <>
        <PlatformRange aria-label="iPhone brightness" value={ios} min={30} max={100} onValueChange={value => { changed(value); setIOS(value); }} />
        <PlatformRange aria-label="Android volume" value={android} min={0} max={100} onValueChange={setAndroid} />
      </>;
    }
    render(<Phones />);
    const ios = screen.getByRole("slider", { name: "iPhone brightness" }) as HTMLInputElement;
    const android = screen.getByRole("slider", { name: "Android volume" }) as HTMLInputElement;
    await user.tab();
    expect(document.activeElement).toBe(ios);
    // jsdom has no native range keyboard or pointer default action. Dispatch the
    // native input event here; real-browser journeys verify those interactions.
    fireEvent.input(ios, { target: { value: "55" } });
    expect(changed.mock.calls).toEqual([[55]]);
    expect(ios.valueAsNumber).toBe(55);
    expect(android.valueAsNumber).toBe(35);
    expect(document.activeElement).toBe(ios);
  });

  it("reflects external controlled updates without replacing the focused native input", () => {
    const { rerender } = render(<PlatformRange aria-label="Media volume" value={35} min={0} max={100} onValueChange={() => {}} />);
    const range = screen.getByRole("slider", { name: "Media volume" }) as HTMLInputElement;
    range.focus();
    rerender(<PlatformRange aria-label="Media volume" value={70} min={0} max={100} onValueChange={() => {}} />);
    expect(screen.getByRole("slider", { name: "Media volume" })).toBe(range);
    expect(range.valueAsNumber).toBe(70);
    expect(document.activeElement).toBe(range);
  });

  it("keeps a disabled range outside sequential keyboard focus", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<>
      <PlatformRange aria-label="Volume" value={35} min={0} max={100} disabled onValueChange={onValueChange} />
      <button type="button">Continue</button>
    </>);
    const range = screen.getByRole("slider", { name: "Volume" }) as HTMLInputElement;
    expect(range.disabled).toBe(true);
    await user.click(range);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Continue" }));
    expect(range.valueAsNumber).toBe(35);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

it("exposes one named control per adapter without accessibility violations", async () => {
  const { container } = render(<>
    <PlatformSwitch aria-label="Airplane Mode" checked={false} onCheckedChange={() => {}} />
    <PlatformRange aria-label="Text size" value={100} min={100} max={125} step={5} onValueChange={() => {}} />
    <PlatformRange aria-label="Brightness" value={80} min={30} max={100} orientation="vertical" onValueChange={() => {}} />
  </>);
  expect(screen.getAllByRole("switch")).toHaveLength(1);
  expect(screen.getAllByRole("slider")).toHaveLength(2);
  const results = await axe(container, { rules: { "color-contrast": { enabled: false } } });
  expect(results.violations).toEqual([]);
});
