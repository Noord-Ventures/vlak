import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { IdentityDocument } from "../src/components/identity-document";
import { TaxSummary } from "../src/components/tax-summary";
import { BenefitProgram } from "../src/components/benefit-program";
import { ApplicationStatus } from "../src/components/application-status";
import { EvidenceChecklist } from "../src/components/evidence-checklist";
import type { EvidenceChecklistItem } from "../src/components/evidence-checklist";
import { Button } from "../src/components/button";
import { vlak } from "../src/tokens.stylex";

afterEach(cleanup);

const evidence: EvidenceChecklistItem = { id: "address", label: "Proof of address", requirement: "Required", fileName: "Example-address.pdf", receivedLabel: "Received 12 September", status: "Awaiting review", actions: [{ id: "view", label: "View record" }, { id: "replace", label: "Request replacement" }] };

describe("IdentityDocument", () => {
  it("shows only the supplied masked identity and never infers status from expiry", () => {
    const { container } = render(<IdentityDocument documentTitle="Residence document" holderName="Robin Ellis" maskedIdentifier="•••• 2048" issuedLabel="12 June 1990" expiresLabel="12 June 2000" issuer="Example civic office" status="Verification pending" />);
    expect(screen.getByText("•••• 2048")).toBeTruthy();
    expect(screen.getByText("Verification pending")).toBeTruthy();
    expect(screen.getByText("12 June 2000")).toBeTruthy();
    expect(container.textContent).not.toMatch(/expired|verified|years old/i);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("describes missing identifiers, issuer and dates without inventing verification", () => {
    render(<IdentityDocument documentTitle="Residence document" holderName="Robin Ellis" maskedIdentifier=" " status="Not reviewed" />);
    for (const text of ["Identifier not supplied", "Issuer not supplied", "Issue date not supplied", "Expiry date not supplied", "Not reviewed"]) expect(screen.getByText(text)).toBeTruthy();
  });
});

describe("TaxSummary", () => {
  it("renders authoritative totals and literal currencies without computing from the displayed lines", () => {
    render(<TaxSummary label="Annual assessment" periodLabel="2025" status="Provisional" reference="Example 204" items={[{ id: "charge", label: "Assessed amount", amount: "€ 100.00" }, { id: "paid", label: "Payment received", amount: "− € 10.00" }]} totals={[{ id: "due", label: "Supplied total", amount: "€ 999.00" }, { id: "interest", label: "Interest", amount: "€ 0.00" }]} dueLabel="As stated by the authority" />);
    const table = screen.getByRole("table", { name: "Annual assessment 2025" }) as HTMLTableElement;
    expect(within(table).getByRole("columnheader", { name: "Amount" }).getAttribute("scope")).toBe("col");
    expect(within(table).getByRole("rowheader", { name: "Supplied total" }).getAttribute("scope")).toBe("row");
    expect(table.tFoot?.textContent).toContain("€ 999.00");
    expect(table.tFoot?.textContent).toContain("€ 0.00");
    expect(screen.queryByText("€ 90.00")).toBeNull();
    expect(screen.getByText("Provisional")).toBeTruthy();
  });

  it("makes absent assessment data explicit instead of calculating zero", () => {
    render(<TaxSummary label="Annual assessment" periodLabel="Period not supplied" status="Not issued" items={[]} totals={[]} />);
    for (const text of ["Assessment reference not supplied", "Assessment lines not supplied", "Totals not supplied", "Payment timing not supplied"]) expect(screen.getByText(text)).toBeTruthy();
    expect(screen.queryByText(/^0(?:[.,]00)?$/)).toBeNull();
  });
});

describe("BenefitProgram", () => {
  it("keeps availability, individual eligibility and criterion statuses independent", () => {
    render(<BenefitProgram programName="Community project grant" status="Applications closed" eligibility="Not assessed" awardLabel="Award amount not supplied" criteria={[{ id: "location", label: "Project location", status: "Met" }, { id: "plan", label: "Project plan", status: "Met" }]} />);
    expect(screen.getByText("Applications closed")).toBeTruthy();
    expect(screen.getByText("Not assessed")).toBeTruthy();
    expect(screen.getAllByText("Met")).toHaveLength(2);
    expect(screen.queryByText(/you are eligible|approved/i)).toBeNull();
  });

  it("shows missing award, provider, deadline and criteria as missing", () => {
    render(<BenefitProgram programName="Community project grant" status="Availability unknown" eligibility="Eligibility unknown" criteria={[]} />);
    for (const text of ["Provider not supplied", "Award amount not supplied", "Deadline not supplied", "Eligibility criteria not supplied"]) expect(screen.getByText(text)).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });
});

describe("ApplicationStatus", () => {
  it("preserves source order and marks only the explicitly current milestone", () => {
    const { container } = render(<ApplicationStatus applicationTitle="Grant application" reference="Example 204" status="Under review" updatedLabel="Update supplied by provider" milestones={[
      { id: "received", label: "Received", status: "Recorded", dateLabel: "20 September", dateTime: "2026-09-20T10:00:00+02:00" },
      { id: "review", label: "Evidence review", status: "In progress", current: true, dateLabel: "14 September" },
      { id: "decision", label: "Decision", status: "Not issued" },
    ]} nextStep="Wait for the provider's message" />);
    const milestones = within(screen.getByRole("list", { name: "Application milestones" })).getAllByRole("listitem");
    expect(milestones.map(item => item.textContent)).toEqual(["ReceivedRecorded20 September", "Evidence reviewIn progress14 September", "DecisionNot issuedDate not supplied"]);
    expect(milestones.map(item => item.getAttribute("aria-current"))).toEqual([null, "step", null]);
    expect(milestones[1]?.className).toContain("rs-application-status-current");
    expect(container.querySelector("time")?.dateTime).toBe("2026-09-20T10:00:00+02:00");
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(screen.getByText("Under review")).toBeTruthy();
  });

  it("does not select a milestone from its status and makes empty case data explicit", () => {
    const { container, rerender } = render(<ApplicationStatus applicationTitle="Grant application" status="Unknown" milestones={[{ id: "review", label: "Review", status: "In progress" }]} />);
    expect(container.querySelector("[aria-current]")).toBeNull();
    expect(screen.getByText("Date not supplied")).toBeTruthy();
    rerender(<ApplicationStatus applicationTitle="Grant application" status="Unknown" milestones={[]} />);
    for (const text of ["Case reference not supplied", "Update time not supplied", "Application milestones not supplied", "Next step not supplied"]) expect(screen.getByText(text)).toBeTruthy();
  });
});

describe("EvidenceChecklist", () => {
  it("requests keyboard actions without submitting a form or claiming the evidence changed", async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const { rerender } = render(<form onSubmit={submit}><EvidenceChecklist label="Application evidence" items={[evidence]} onAction={action} /></form>);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "View record: Proof of address" }));
    await user.keyboard("{Enter}");
    expect(action).toHaveBeenLastCalledWith("address", "view");
    await user.tab();
    await user.keyboard(" ");
    expect(action).toHaveBeenLastCalledWith("address", "replace");
    expect(submit).not.toHaveBeenCalled();
    expect(screen.getByText("Awaiting review")).toBeTruthy();
    expect(screen.getByText("Example-address.pdf")).toBeTruthy();
    rerender(<EvidenceChecklist label="Application evidence" items={[{ ...evidence, status: "Replacement requested by host" }]} onAction={action} />);
    expect(screen.getByRole("status").textContent).toBe("Replacement requested by host");
  });

  it("blocks pending rows, disabled rows and disabled choices without blocking other items", async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    render(<EvidenceChecklist label="Application evidence" onAction={action} items={[
      { ...evidence, id: "pending", label: "Pending evidence", pending: true, pendingLabel: "Waiting for the upload service" },
      { ...evidence, id: "locked", label: "Locked evidence", disabled: true },
      { ...evidence, id: "available", label: "Available evidence", actions: [{ id: "view", label: "View record", disabled: true }, { id: "replace", label: "Request replacement" }] },
    ]} />);
    for (const button of screen.getAllByRole("button")) {
      if (button.getAttribute("aria-label") === "Request replacement: Available evidence") continue;
      expect((button as HTMLButtonElement).disabled).toBe(true);
      await user.click(button);
    }
    expect(action).not.toHaveBeenCalled();
    const pendingStatus = screen.getAllByRole("status").find(item => item.textContent?.includes("Waiting for the upload service"));
    expect(pendingStatus?.getAttribute("aria-live")).toBe("polite");
    expect(pendingStatus?.textContent).toContain("Awaiting review");
    expect(pendingStatus?.closest('[aria-busy="true"]')).toBeNull();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Request replacement: Available evidence" }));
    await user.keyboard("{Enter}");
    expect(action).toHaveBeenCalledExactlyOnceWith("available", "replace");
  });

  it("describes repeated evidence names with their own requirement, file record and status", () => {
    render(<EvidenceChecklist label="Application evidence" onAction={() => {}} items={[
      { ...evidence, id: "applicant", fileName: "Applicant.pdf", requirement: "Applicant evidence", receivedLabel: undefined },
      { ...evidence, id: "partner", fileName: "Partner.pdf", requirement: "Partner evidence", receivedLabel: undefined },
    ]} />);
    const applicant = screen.getByRole("button", { name: "View record: Proof of address", description: "Applicant evidence Applicant.pdf Awaiting review" });
    const partner = screen.getByRole("button", { name: "View record: Proof of address", description: "Partner evidence Partner.pdf Awaiting review" });
    expect(applicant.getAttribute("aria-describedby")).not.toBe(partner.getAttribute("aria-describedby"));
  });

  it("renders actions only with a handler and never converts a file record into approval", () => {
    const { rerender } = render(<EvidenceChecklist label="Application evidence" items={[evidence]} />);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText("Awaiting review")).toBeTruthy();
    rerender(<EvidenceChecklist label="Application evidence" items={[{ id: "unknown", label: "Additional evidence", status: "Not reviewed" }]} />);
    expect(screen.getByText("Requirement not supplied")).toBeTruthy();
    expect(screen.getByText("File details not supplied")).toBeTruthy();
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.queryByRole("progressbar")).toBeNull();
    rerender(<EvidenceChecklist label="Application evidence" items={[]} />);
    expect(screen.getByText("Evidence requirements not supplied")).toBeTruthy();
  });

  it("keeps action targets at least 44px", () => {
    render(<EvidenceChecklist label="Application evidence" items={[evidence]} onAction={() => {}} />);
    for (const button of screen.getAllByRole("button")) {
      expect(getComputedStyle(button).minHeight).toBe(vlak.hit);
      expect(getComputedStyle(button).minWidth).toBe(vlak.hit);
    }
  });
});

const specimens = [
  <IdentityDocument key="identity" documentTitle="Residence document" holderName="Robin Ellis" status="Not reviewed" />,
  <TaxSummary key="tax" label="Annual assessment" periodLabel="2025" status="Provisional" items={[{ id: "line", label: "Assessment", amount: "€ 100.00" }]} totals={[{ id: "total", label: "Amount payable", amount: "€ 100.00" }]} />,
  <BenefitProgram key="benefit" programName="Community grant" status="Open" eligibility="Not assessed" criteria={[{ id: "location", label: "Project location", status: "Not reviewed" }]} />,
  <ApplicationStatus key="application" applicationTitle="Grant application" status="Under review" milestones={[{ id: "review", label: "Evidence review", status: "In progress", current: true }]} />,
  <EvidenceChecklist key="evidence" label="Application evidence" items={[evidence]} onAction={() => {}} />,
];

describe("civic accessibility and native roots", () => {
  it("shows missing nullable statuses and amounts explicitly while preserving a supplied numeric zero", () => {
    render(<>
      <IdentityDocument documentTitle="Identity record" holderName={null} status={null} />
      <TaxSummary label="Assessment record" periodLabel={null} status={null} items={[{ id: "line", label: "Unknown amount", amount: null }]} totals={[{ id: "zero", label: "Supplied zero", amount: 0 }]} />
      <BenefitProgram programName="Programme record" status={null} eligibility={null} criteria={[]} />
      <ApplicationStatus applicationTitle="Case record" status={null} milestones={[]} />
      <EvidenceChecklist label="Evidence record" items={[{ id: "evidence", label: "Document", status: null }]} />
    </>);
    for (const name of ["Identity record", "Assessment record", "Programme record", "Case record", "Evidence record"]) expect(within(screen.getByRole("group", { name })).getByText("Status not supplied")).toBeTruthy();
    expect(screen.getByText("Holder not supplied")).toBeTruthy();
    expect(screen.getByText("Assessment period not supplied")).toBeTruthy();
    expect(screen.getByText("Amount not supplied")).toBeTruthy();
    expect(screen.getByText("Eligibility not supplied")).toBeTruthy();
    expect(screen.getByRole("cell", { name: "0" })).toBeTruthy();
  });

  for (const specimen of specimens) {
    it(`${specimen.key} has accessible semantics and forwards ref/native attributes`, async () => {
      const ref = React.createRef<HTMLDivElement>();
      const { container } = render(<main>{React.cloneElement(specimen as React.ReactElement<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>, { ref, className: "civic-custom", style: { marginTop: 9 }, "aria-label": "Example civic record", id: "civic-record" })}</main>);
      expect(ref.current).toBe(screen.getByRole("group", { name: "Example civic record" }));
      expect(ref.current?.classList.contains("civic-custom")).toBe(true);
      expect(ref.current?.style.marginTop).toBe("9px");
      expect(ref.current?.id).toBe("civic-record");
      expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
    });
  }

  for (const specimen of specimens.slice(0, 4)) {
    it(`${specimen.key} preserves a caller-owned action's keyboard behavior`, async () => {
      const user = userEvent.setup();
      const action = vi.fn();
      render(React.cloneElement(specimen, {}, <Button type="button" onClick={action}>View source record</Button>));
      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "View source record" }));
      await user.keyboard("{Enter}");
      await user.keyboard(" ");
      expect(action).toHaveBeenCalledTimes(2);
    });
  }
});
