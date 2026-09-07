import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { PatientBanner } from "../src/components/patient-banner";
import { MedicationSchedule, type MedicationScheduleItem } from "../src/components/medication-schedule";
import { AppointmentCard } from "../src/components/appointment-card";
import { CarePlan, type CarePlanTask } from "../src/components/care-plan";
import { Button } from "../src/components/button";
import { vlak } from "../src/tokens.stylex";

afterEach(cleanup);

const medication: MedicationScheduleItem = {
  id: "morning", name: "Example medication", dose: "Supplied dose", timeLabel: "08:00", dateTime: "2026-09-14T08:00:00+02:00", status: "Not recorded", instructions: "Supplied instructions",
  actions: [{ id: "taken", label: "Record as taken" }, { id: "not-taken", label: "Record as not taken" }],
};
const task: CarePlanTask = { id: "questions", title: "Prepare questions", owner: "Robin Ellis", dueLabel: "17 September", status: "Open", completed: false };

describe("PatientBanner", () => {
  it("preserves explicit unknown and none-recorded values without deriving age", () => {
    render(<PatientBanner patientName="Robin Ellis" identifiers={[{ id: "birth", label: "Date of birth", value: "12 March 1988" }]} contextItems={[{ id: "allergies", label: "Allergies", value: "Not reviewed" }, { id: "access", label: "Access requirements", value: "None recorded" }]} />);
    expect(screen.getByRole("group", { name: "Robin Ellis" })).toBeTruthy();
    expect(screen.getByText("Not reviewed")).toBeTruthy();
    expect(screen.getByText("None recorded")).toBeTruthy();
    expect(screen.getByText("12 March 1988")).toBeTruthy();
    expect(screen.queryByText(/years old|no allergies/i)).toBeNull();
  });

  it("labels missing context as missing and forwards native root attributes and its ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<PatientBanner ref={ref} patientName="Robin Ellis" className="patient-custom" style={{ marginTop: 7 }} data-record="demo" aria-label="Current patient" />);
    expect(screen.getByText("Identifiers not supplied")).toBeTruthy();
    expect(screen.getByText("Patient context not supplied")).toBeTruthy();
    expect(ref.current).toBe(screen.getByRole("group", { name: "Current patient" }));
    expect(ref.current?.classList.contains("patient-custom")).toBe(true);
    expect(ref.current?.style.marginTop).toBe("7px");
    expect(ref.current?.dataset.record).toBe("demo");
    expect(screen.queryByText(/none recorded|no allergies/i)).toBeNull();
  });
});

describe("MedicationSchedule", () => {
  it("distinguishes repeated medication actions by their scheduled time and dose when focused", async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    render(<MedicationSchedule items={[
      { ...medication, id: "morning", dose: "Morning supplied dose", actions: [{ id: "taken", label: "Record as taken" }] },
      { ...medication, id: "evening", dose: "Evening supplied dose", timeLabel: "20:00", dateTime: undefined, actions: [{ id: "taken", label: "Record as taken" }] },
    ]} timeZone="Europe/Amsterdam" onAction={action} />);
    const morning = screen.getByRole("button", { name: "Record as taken: Example medication", description: "08:00 Morning supplied dose Not recorded" });
    const evening = screen.getByRole("button", { name: "Record as taken: Example medication", description: "20:00 Evening supplied dose Not recorded" });
    await user.tab();
    expect(document.activeElement).toBe(morning);
    await user.keyboard("{Enter}");
    expect(action).toHaveBeenLastCalledWith("morning", "taken");
    await user.tab();
    expect(document.activeElement).toBe(evening);
    await user.keyboard("{Enter}");
    expect(action).toHaveBeenLastCalledWith("evening", "taken");
    expect(morning.getAttribute("aria-describedby")).not.toBe(evening.getAttribute("aria-describedby"));
  });

  it("requests a keyboard recording choice without claiming persistence or submitting a form", async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const ref = React.createRef<HTMLDivElement>();
    const { rerender } = render(<form onSubmit={submit}><MedicationSchedule ref={ref} items={[medication]} timeZone="Europe/Amsterdam, UTC+02:00" onAction={action} /></form>);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Record as taken: Example medication" }));
    await user.keyboard("{Enter}");
    expect(action).toHaveBeenLastCalledWith("morning", "taken");
    expect(screen.getByText("Not recorded")).toBeTruthy();
    expect(submit).not.toHaveBeenCalled();
    await user.tab();
    await user.keyboard(" ");
    expect(action).toHaveBeenLastCalledWith("morning", "not-taken");
    expect(ref.current).toBe(screen.getByRole("group", { name: "Medication schedule" }));
    rerender(<MedicationSchedule items={[{ ...medication, status: "Taken, recorded by caller" }]} timeZone="Europe/Amsterdam, UTC+02:00" onAction={action} />);
    expect(screen.getByText("Taken, recorded by caller")).toBeTruthy();
  });

  it("blocks pending, disabled-row, and disabled-choice actions while leaving other rows usable", async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    render(<MedicationSchedule timeZone="Supplied timezone" onAction={action} items={[
      { ...medication, id: "pending", name: "Pending entry", pending: true, pendingLabel: "Waiting for the record service" },
      { ...medication, id: "disabled", name: "Disabled entry", disabled: true },
      { ...medication, id: "ready", name: "Available entry", actions: [{ id: "taken", label: "Record as taken", disabled: true }, { id: "not-taken", label: "Record as not taken" }] },
    ]} />);
    for (const button of screen.getAllByRole("button")) {
      if (button.getAttribute("aria-label") !== "Record as not taken: Available entry") {
        expect((button as HTMLButtonElement).disabled).toBe(true);
        await user.click(button);
      }
    }
    expect(action).not.toHaveBeenCalled();
    expect(screen.getByText("Waiting for the record service")).toBeTruthy();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Record as not taken: Available entry" }));
    await user.keyboard("{Enter}");
    expect(action).toHaveBeenCalledExactlyOnceWith("ready", "not-taken");
  });

  it("renders supplied time and instructions without inferred overdue status or inactive controls", () => {
    const { container } = render(<MedicationSchedule items={[{ ...medication, dateTime: "2000-01-01T08:00:00+02:00" }]} timeZone="Timezone supplied by clinic" />);
    expect(container.querySelector("time")?.getAttribute("datetime")).toBe("2000-01-01T08:00:00+02:00");
    expect(screen.getByText("Timezone supplied by clinic")).toBeTruthy();
    expect(screen.getByText("Supplied instructions")).toBeTruthy();
    expect(screen.getByText("Not recorded")).toBeTruthy();
    expect(screen.queryByText(/overdue|missed|saved/i)).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("distinguishes an empty supplied list from a clinical absence", () => {
    render(<MedicationSchedule items={[]} timeZone="Timezone not supplied" />);
    expect(screen.getByText("No medication entries supplied")).toBeTruthy();
    expect(screen.queryByText("No medications")).toBeNull();
  });
});

describe("AppointmentCard", () => {
  const appointment = { appointmentTitle: "Care team check-in", dateLabel: "18 September 2026", timeLabel: "10:30–11:00", timeZone: "Europe/Amsterdam, UTC+02:00", dateTime: "2026-09-18T10:30:00+02:00", status: "Awaiting confirmation" };

  it("preserves supplied time and status while explicitly marking omitted details", () => {
    const ref = React.createRef<HTMLDivElement>();
    const { container } = render(<AppointmentCard ref={ref} {...appointment} data-booking="demo" />);
    expect(screen.getByText("Awaiting confirmation")).toBeTruthy();
    expect(screen.getByText("10:30–11:00 · Europe/Amsterdam, UTC+02:00")).toBeTruthy();
    expect(screen.getByText("Clinician not supplied")).toBeTruthy();
    expect(screen.getByText("Location not supplied")).toBeTruthy();
    expect(container.querySelector("time")?.dateTime).toBe(appointment.dateTime);
    expect(ref.current).toBe(screen.getByRole("group", { name: "Care team check-in" }));
    expect(ref.current?.dataset.booking).toBe("demo");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("keeps child actions keyboard reachable and leaves booking state to the caller", async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    render(<AppointmentCard {...appointment} clinician="Alex Morgan" location="Demo clinic"><Button onClick={action}>View booking details</Button></AppointmentCard>);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "View booking details" }));
    await user.keyboard("{Enter}");
    expect(action).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Awaiting confirmation")).toBeTruthy();
  });
});

describe("CarePlan", () => {
  it("requests completion by keyboard and waits for caller-provided task state", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const ref = React.createRef<HTMLDivElement>();
    const { rerender } = render(<CarePlan ref={ref} tasks={[task]} onCompletedChange={change} />);
    await user.tab();
    const checkbox = screen.getByRole("checkbox", { name: "Prepare questions" }) as HTMLInputElement;
    expect(document.activeElement).toBe(checkbox);
    await user.keyboard(" ");
    expect(change).toHaveBeenLastCalledWith("questions", true);
    expect(checkbox.checked).toBe(false);
    expect(screen.getByText("Open")).toBeTruthy();
    expect(ref.current).toBe(screen.getByRole("group", { name: "Care plan" }));
    rerender(<CarePlan tasks={[{ ...task, completed: true, status: "Completed by caller" }]} onCompletedChange={change} />);
    expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(true);
    await user.keyboard(" ");
    expect(change).toHaveBeenLastCalledWith("questions", false);
    expect(screen.getByText("Completed by caller")).toBeTruthy();
  });

  it("blocks pending and disabled tasks independently", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(<CarePlan onCompletedChange={change} tasks={[
      { ...task, id: "pending", title: "Pending task", pending: true, pendingLabel: "Waiting for confirmation" },
      { ...task, id: "locked", title: "Coordinator task", disabled: true },
      { ...task, id: "available", title: "Available task" },
    ]} />);
    for (const name of ["Pending task", "Coordinator task"]) {
      const checkbox = screen.getByRole("checkbox", { name }) as HTMLInputElement;
      expect(checkbox.disabled).toBe(true);
      await user.click(checkbox);
    }
    expect(change).not.toHaveBeenCalled();
    expect(screen.getByText("Waiting for confirmation")).toBeTruthy();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("checkbox", { name: "Available task" }));
    await user.keyboard(" ");
    expect(change).toHaveBeenCalledExactlyOnceWith("available", true);
  });

  it("keeps unknown completion and absent owner/due date explicit instead of inventing editable values", () => {
    render(<CarePlan tasks={[{ id: "unknown", title: "Review contact method", status: "Completion not reviewed" }]} onCompletedChange={vi.fn()} />);
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.getByText("Completion not reviewed")).toBeTruthy();
    expect(screen.getByText("Owner not supplied")).toBeTruthy();
    expect(screen.getByText("Due date not supplied")).toBeTruthy();
  });

  it("shows tasks as read-only without a callback and describes empty data honestly", () => {
    const { rerender } = render(<CarePlan tasks={[task]} />);
    expect(screen.getByText("Prepare questions")).toBeTruthy();
    expect(screen.queryByRole("checkbox")).toBeNull();
    rerender(<CarePlan tasks={[]} />);
    expect(screen.getByText("No care tasks supplied")).toBeTruthy();
  });
});

describe("care workflow accessibility", () => {
  const examples = [
    <PatientBanner key="patient" patientName="Robin Ellis" contextItems={[{ id: "allergies", label: "Allergies", value: "Not reviewed" }]} />,
    <MedicationSchedule key="medication" items={[medication, { ...medication, id: "pending", pending: true }]} timeZone="Europe/Amsterdam" onAction={() => {}} />,
    <AppointmentCard key="appointment" appointmentTitle="Care team check-in" dateLabel="18 September" timeLabel="10:30" timeZone="Europe/Amsterdam" status="Confirmed"><Button>View booking details</Button></AppointmentCard>,
    <CarePlan key="care" tasks={[task, { ...task, id: "pending", pending: true }]} onCompletedChange={() => {}} />,
  ];
  for (const example of examples) it(`${example.key} has named controls and semantic content`, async () => {
    const { container } = render(<main>{example}</main>);
    expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });

  it("keeps medication actions and care checkbox labels at 44px minimum targets", () => {
    render(<><MedicationSchedule items={[medication]} timeZone="Supplied timezone" onAction={() => {}} /><CarePlan tasks={[task]} onCompletedChange={() => {}} /></>);
    for (const button of within(screen.getByRole("group", { name: "Medication schedule" })).getAllByRole("button")) {
      expect(getComputedStyle(button).minHeight).toBe(vlak.hit);
      expect(getComputedStyle(button).minWidth).toBe(vlak.hit);
    }
    const label = screen.getByRole("checkbox").closest("label")!;
    expect(getComputedStyle(label).minHeight).toBe(vlak.hit);
  });
});
