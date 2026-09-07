import * as React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { JointPanel } from "../src/components/joint-panel";
import { RobotPose } from "../src/components/robot-pose";
import type { RobotPoseRecord } from "../src/components/robot-pose";
import { RobotMissionQueue } from "../src/components/robot-mission-queue";

afterEach(cleanup);
const joints = [{ id: "shoulder", label: "Shoulder", unit: "deg", reported: 12.5, minimum: -90, maximum: 90 }, { id: "slide", label: "Slide", unit: "m", reported: 0, minimum: 0, maximum: 0.5 }] as const;
const poses: [RobotPoseRecord, RobotPoseRecord] = [
  { id: "tool", label: "Tool in base", frame: "base", timeLabel: "12:00:00.125", status: "Recorded", translation: { x: 0, y: 0.125, z: -0.05, unit: "m" }, orientation: { representation: "Quaternion, x y z w", components: [{ id: "qx", label: "qx", value: 0 }, { id: "qy", label: "qy", value: 0 }, { id: "qz", label: "qz", value: 0 }, { id: "qw", label: "qw", value: 2 }] } },
  { id: "map", label: "Base in map", frame: "map", timeLabel: null, status: null, translation: { x: 1.25, y: null, z: 0, unit: "m" }, orientation: { representation: "Euler, intrinsic x-y-z", components: [{ id: "rx", label: "x", value: 0, unit: "deg" }, { id: "ry", label: "y", value: null, unit: "deg" }, { id: "rz", label: "z", value: 180, unit: "deg" }] } },
];
const steps = [{ id: "inspect", label: "Inspect station", status: "Not started", actions: [{ id: "review", label: "Review plan", description: "Records a planning review only" }] }, { id: "return", label: "Return to dock", status: "Not started" }] as const;

describe("JointPanel", () => {
  it("edits bounded targets with a native keyboard while preserving reported positions", async () => {
    const user = userEvent.setup();
    const request = vi.fn();
    render(<JointPanel label="Arm joints" joints={joints} defaultValue={{ shoulder: 0, slide: 0 }} onRequestTargets={request} />);
    const input = screen.getByRole("spinbutton", { name: "Shoulder draft target (deg)" }) as HTMLInputElement;
    await user.tab();
    expect(document.activeElement).toBe(input);
    await user.keyboard("{Control>}a{/Control}20");
    expect(input.value).toBe("20");
    expect(screen.getByText("Reported: 12.5 deg")).toBeTruthy();
    screen.getByRole("button", { name: "Request targets" }).focus();
    await user.keyboard("{Enter}");
    expect(request).toHaveBeenLastCalledWith({ shoulder: 20, slide: 0 });
    expect(screen.getByText("Reported: 0 m")).toBeTruthy();
  });
  it("keeps controlled requests separate and preserves exact fractional drafts", () => {
    const change = vi.fn();
    render(<JointPanel label="Arm joints" joints={joints} value={{ shoulder: 0.125, slide: 0 }} onValueChange={change} />);
    const input = screen.getByRole("spinbutton", { name: "Shoulder draft target (deg)" }) as HTMLInputElement;
    expect(input.validity.stepMismatch).toBe(false);
    fireEvent.change(input, { target: { value: "10" } });
    expect(change).toHaveBeenLastCalledWith({ shoulder: 10, slide: 0 });
    expect(input.value).toBe("0.125");
  });
  it("retains missing and invalid drafts, rejects bounds and unlisted targets", () => {
    const request = vi.fn();
    const { container, rerender } = render(<JointPanel label="Arm joints" joints={joints} defaultValue={{ slide: 0 }} onRequestTargets={request} />);
    const input = screen.getByRole("spinbutton", { name: "Shoulder draft target (deg)" }) as HTMLInputElement;
    expect(input.value).toBe("");
    expect(input.checkValidity()).toBe(false);
    expect(screen.getByText("Enter a target")).toBeTruthy();
    fireEvent.change(input, { target: { value: "91" } });
    expect(input.value).toBe("91");
    expect(input.checkValidity()).toBe(false);
    expect(screen.getByText("Target must be between -90 and 90 deg")).toBeTruthy();
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
    rerender(<JointPanel label="Arm joints" joints={joints} value={{ shoulder: 0, slide: 0, unknown: Number.NaN }} onRequestTargets={request} />);
    expect(screen.getByText("Draft contains unlisted joints: unknown")).toBeTruthy();
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/);
    rerender(<JointPanel label="Arm joints" joints={[{ ...joints[0], minimum: null, reported: Number.NaN }]} value={{ shoulder: 0 }} onRequestTargets={request} />);
    expect(screen.getByText("Reported: Unavailable")).toBeTruthy();
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
  });
  it("submits, resets, and retains read-only values while disabling pending requests", async () => {
    const ref = React.createRef<HTMLFieldSetElement>();
    const { container, rerender } = render(<form><JointPanel ref={ref} label="Arm joints" joints={joints} defaultValue={{ shoulder: 0, slide: 0 }} name="target" onRequestTargets={vi.fn()} /></form>);
    const form = container.querySelector("form")!;
    fireEvent.change(screen.getByRole("spinbutton", { name: "Shoulder draft target (deg)" }), { target: { value: "10" } });
    expect(new FormData(form).get("target.shoulder")).toBe("10");
    act(() => form.reset());
    await waitFor(() => expect(new FormData(form).get("target.shoulder")).toBe("0"));
    expect(ref.current?.tagName).toBe("FIELDSET");
    rerender(<form><JointPanel label="Arm joints" joints={joints} value={{ shoulder: 0, slide: 0 }} name="target" readOnly onRequestTargets={vi.fn()} /></form>);
    expect(new FormData(container.querySelector("form")!).get("target.slide")).toBe("0");
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
    rerender(<form><JointPanel label="Arm joints" joints={joints} value={{ shoulder: 0, slide: 0 }} name="target" pending onRequestTargets={vi.fn()} /></form>);
    expect(new FormData(container.querySelector("form")!).has("target.slide")).toBe(false);
    expect(screen.getByRole("status").textContent).toContain("pending; reported positions unchanged");
  });
  it("does not render ambiguous or empty joint catalogs", () => {
    const { rerender } = render(<JointPanel label="Arm joints" joints={[joints[0], joints[0]]} />);
    expect(screen.queryByRole("spinbutton")).toBeNull();
    expect(screen.getByText(/Joint records unavailable/)).toBeTruthy();
    rerender(<JointPanel label="Arm joints" joints={[]} />);
    expect(screen.getByText("No joint records supplied")).toBeTruthy();
  });
});

describe("RobotPose", () => {
  it("navigates supplied records through the Vlak selector without converting values", async () => {
    const user = userEvent.setup();
    render(<RobotPose label="Recorded poses" poses={poses} />);
    expect(screen.getByText("Quaternion, x y z w", { exact: false })).toBeTruthy();
    expect(screen.getByText("2", { exact: true })).toBeTruthy();
    await user.tab();
    const select = screen.getByRole("combobox", { name: "Pose record" });
    expect(document.activeElement).toBe(select);
    await user.keyboard("{Enter}{End}{Enter}");
    expect(screen.getByText("Euler, intrinsic x-y-z", { exact: false })).toBeTruthy();
    expect(screen.getByText("180", { exact: true })).toBeTruthy();
    expect(screen.getByText("map", { exact: true })).toBeTruthy();
    expect(screen.getAllByText("Not supplied").length).toBeGreaterThan(0);
  });
  it("preserves controlled selection and resets the named uncontrolled record", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const ref = React.createRef<HTMLFieldSetElement>();
    const { container, rerender } = render(<form><RobotPose ref={ref} label="Recorded poses" poses={poses} defaultValue="tool" name="pose" /></form>);
    await user.click(screen.getByRole("combobox"));
    await user.keyboard("{End}{Enter}");
    expect(new FormData(container.querySelector("form")!).get("pose")).toBe("map");
    act(() => container.querySelector("form")!.reset());
    await waitFor(() => expect(new FormData(container.querySelector("form")!).get("pose")).toBe("tool"));
    expect(ref.current?.tagName).toBe("FIELDSET");
    rerender(<RobotPose label="Recorded poses" poses={poses} value="tool" onValueChange={change} />);
    await user.click(screen.getByRole("combobox"));
    await user.keyboard("{End}{Enter}");
    expect(change).toHaveBeenLastCalledWith("map");
    expect(screen.getByText("base", { exact: true })).toBeTruthy();
  });
  it("keeps read-only selection submitted and disables it in a disabled fieldset", () => {
    const { container, rerender } = render(<form><RobotPose label="Recorded poses" poses={poses} value="tool" name="pose" readOnly /></form>);
    expect((screen.getByRole("combobox") as HTMLButtonElement).disabled).toBe(true);
    expect(new FormData(container.querySelector("form")!).get("pose")).toBe("tool");
    rerender(<form><RobotPose label="Recorded poses" poses={poses} value="tool" name="pose" disabled /></form>);
    expect(new FormData(container.querySelector("form")!).has("pose")).toBe(false);
  });
  it("exposes missing, invalid, and unknown poses without invented zeros or normalization", () => {
    const { container, rerender } = render(<RobotPose label="Recorded poses" poses={[{ ...poses[0], translation: { ...poses[0].translation, y: Number.NaN }, orientation: { representation: "", components: [] } }]} />);
    expect(screen.getByText("Unavailable", { exact: true })).toBeTruthy();
    expect(screen.getByText("Orientation components unavailable")).toBeTruthy();
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/);
    rerender(<RobotPose label="Recorded poses" poses={poses} value="unlisted" />);
    expect(screen.getByText("Selected pose unavailable")).toBeTruthy();
    rerender(<RobotPose label="Recorded poses" poses={poses} value={null} />);
    expect(screen.getByText("No pose selected")).toBeTruthy();
    rerender(<RobotPose label="Recorded poses" poses={[]} />);
    expect(screen.getByText("No pose records supplied")).toBeTruthy();
    rerender(<RobotPose label="Recorded poses" poses={[poses[0], poses[0]]} />);
    expect(screen.getByText(/Pose records unavailable/)).toBeTruthy();
  });
});

describe("RobotMissionQueue", () => {
  it("requests a reordered identifier list through native buttons without altering recorded order", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(<RobotMissionQueue label="Inspection mission" steps={steps} onOrderChange={change} />);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Move step 1, Inspect station down" }));
    await user.keyboard("{Enter}");
    expect(change).toHaveBeenLastCalledWith(["return", "inspect"]);
    expect(screen.getAllByRole("listitem")[0]!.textContent).toContain("Inspect station");
    expect(screen.getAllByText("Recorded: Not started")).toHaveLength(2);
  });
  it("requests host actions and retains confirmed and pending state independently", async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    const { rerender } = render(<RobotMissionQueue label="Inspection mission" steps={steps} onAction={action} />);
    const button = screen.getByRole("button", { name: "Review plan: step 1, Inspect station" });
    button.focus();
    await user.keyboard(" ");
    expect(action).toHaveBeenLastCalledWith("inspect", "review");
    expect(screen.getAllByText("Recorded: Not started")).toHaveLength(2);
    rerender(<RobotMissionQueue label="Inspection mission" steps={[{ ...steps[0], pending: true, confirmedLabel: "Earlier review recorded" }, steps[1]]} onAction={action} onOrderChange={vi.fn()} />);
    expect((screen.getByRole("button", { name: "Review plan: step 1, Inspect station" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Move step 2, Return to dock up" }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText("Host confirmation: Earlier review recorded")).toBeTruthy();
    expect(screen.getByRole("status").textContent).toBe("Request pending; recorded status unchanged");
  });
  it("preserves ordered form records, refs, native attributes, and read-only actions", () => {
    const ref = React.createRef<HTMLFieldSetElement>();
    const { container, rerender } = render(<form><RobotMissionQueue ref={ref} label="Inspection mission" steps={steps} name="mission" data-host="test" readOnly onAction={vi.fn()} /></form>);
    expect(new FormData(container.querySelector("form")!).getAll("mission")).toEqual(["inspect", "return"]);
    expect(ref.current?.getAttribute("data-host")).toBe("test");
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
    rerender(<form><RobotMissionQueue label="Inspection mission" steps={steps} name="mission" disabled /></form>);
    expect(new FormData(container.querySelector("form")!).has("mission")).toBe(false);
  });
  it("rejects ambiguous step and action identities and handles missing records", () => {
    const { rerender } = render(<RobotMissionQueue label="Inspection mission" steps={[steps[0], steps[0]]} onAction={vi.fn()} />);
    expect(screen.getByText(/Mission records unavailable/)).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
    rerender(<RobotMissionQueue label="Inspection mission" steps={[{ ...steps[0], actions: [steps[0].actions![0], steps[0].actions![0]] }]} />);
    expect(screen.getByText(/Mission records unavailable/)).toBeTruthy();
    rerender(<RobotMissionQueue label="Inspection mission" steps={[]} />);
    expect(screen.getByText("No mission steps supplied")).toBeTruthy();
  });
  it("does not print an array count when a consumed host action leaves no actions", () => {
    const { container } = render(<RobotMissionQueue label="Inspection mission" steps={[{ ...steps[0], actions: [] }]} onAction={vi.fn()} />);
    expect(screen.queryByRole("button")).toBeNull();
    expect(container.querySelector("li")?.textContent).toBe("Inspect stationRecorded: Not started");
  });
});

describe("robotics accessibility", () => {
  const examples = [<JointPanel key="joints" label="Arm joints" joints={joints} defaultValue={{ shoulder: 0, slide: 0 }} onRequestTargets={vi.fn()} />, <RobotPose key="poses" label="Recorded poses" poses={poses} />, <RobotMissionQueue key="mission" label="Inspection mission" steps={steps} onOrderChange={vi.fn()} onAction={vi.fn()} />];
  for (const example of examples) it(`${example.key} exposes controls and exact supplied state`, async () => {
    const { container } = render(<main>{example}</main>);
    expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });
  it("names the open pose selection menu", async () => {
    const user = userEvent.setup();
    const { container } = render(<main><RobotPose label="Recorded poses" poses={poses} /></main>);
    await user.click(screen.getByRole("combobox"));
    expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });
});
