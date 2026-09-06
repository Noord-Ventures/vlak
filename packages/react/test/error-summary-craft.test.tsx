import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { ErrorSummary } from "../src/components/error-summary";
import { Form } from "../src/components/form";
import { Input } from "../src/components/input";
import { vlak } from "../src/tokens.stylex";

afterEach(cleanup);

function ErrorForm() {
  return (
    <Form aria-label="Contact details" onSubmit={(event) => event.preventDefault()}>
      <ErrorSummary title="Check your details" errors={[{ id: "email", message: "Enter an email address" }]} autoFocus />
      <Input id="email" label="Email" type="email" error="Enter an email address" />
    </Form>
  );
}

describe("ErrorSummary visual craft", () => {
  it("uses a quiet rounded frame and a modest title above regular-weight actions", () => {
    render(<ErrorForm />);
    const summary = screen.getByRole("alert", { name: "Check your details" });
    const heading = screen.getByRole("heading", { name: "Check your details" });
    const link = screen.getByRole("link", { name: "Enter an email address" });
    const frame = getComputedStyle(summary);
    expect(frame.borderRadius).toBe(vlak.radiusSm);
    expect(frame.padding).toBe("1rem");
    expect(frame.boxSizing).toBe("border-box");
    expect(getComputedStyle(heading).fontSize).toBe("0.875rem");
    expect(getComputedStyle(heading).fontWeight).toBe("600");
    const action = getComputedStyle(link);
    expect(action.fontSize).toBe("0.875rem");
    expect(action.fontWeight).toBe("400");
    expect(action.minHeight).toBe(vlak.hit);
    expect(action.minWidth).toBe(vlak.hit);
    expect(action.overflowWrap).toBe("anywhere");
    expect(getComputedStyle(screen.getByRole("list")).listStyle).toBe("none");
    expect(getComputedStyle(screen.getByRole("form")).gap).toBe("1rem");
    expect(summary.nextElementSibling?.className).toContain("rs-field");
  });

  it("keeps the alert name, list semantics and keyboard navigation to the invalid field", async () => {
    const { container } = render(<ErrorForm />);
    expect(document.activeElement).toBe(screen.getByRole("alert", { name: "Check your details" }));
    expect(screen.getByRole("listitem")).toBeTruthy();
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole("link", { name: "Enter an email address" }));
    await userEvent.keyboard("{Enter}");
    expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Email" }));
    expect(screen.getByRole("textbox").getAttribute("aria-invalid")).toBe("true");
    expect((await axe(container, { rules: { "color-contrast": { enabled: false } } })).violations).toEqual([]);
  });
});
