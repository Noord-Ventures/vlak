import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { Button } from "../src/components/button";
import { ButtonGroup } from "../src/components/button-group";
import { vlak } from "../src/tokens.stylex";

afterEach(cleanup);

describe("Button subtle and icon variants", () => {
  it("joins subtle group buttons with opaque surfaces and application-owned selected paint", async () => {
    const user = userEvent.setup();
    function Selector() {
      const [value, setValue] = React.useState("Ready");
      return <ButtonGroup aria-label="Widget state">{["Ready", "Loading"].map(state => <Button key={state} variant="subtle" aria-pressed={value === state} onClick={() => setValue(state)}>{state}</Button>)}</ButtonGroup>;
    }
    render(<Selector />);
    const group = screen.getByRole("group", { name: "Widget state" });
    const ready = screen.getByRole("button", { name: "Ready" });
    const loading = screen.getByRole("button", { name: "Loading" });
    expect(getComputedStyle(group).gap).toBe(vlak.hairline);
    expect(loading.classList.contains("rs-btn-grouped-subtle")).toBe(true);
    expect(getComputedStyle(loading).backgroundColor).toBe(vlak.paper);
    expect(getComputedStyle(ready).backgroundColor).toBe(vlak.controlFill);
    expect(getComputedStyle(ready).borderRadius).toBe("0");
    await user.tab();
    await user.tab();
    await user.keyboard("{Enter}");
    expect(loading.getAttribute("aria-pressed")).toBe("true");
    expect(ready.getAttribute("aria-pressed")).toBe("false");
    expect(getComputedStyle(loading).backgroundColor).toBe(vlak.controlFill);
    expect(getComputedStyle(ready).backgroundColor).toBe(vlak.paper);
  });

  it("keeps a subtle action borderless and transparent without changing the existing variants", () => {
    render(<><Button>Primary</Button><Button variant="ghost">Ghost</Button><Button variant="subtle">Subtle</Button></>);
    expect(screen.getByRole("button", { name: "Primary" }).classList.contains("rs-btn-primary")).toBe(true);
    expect(screen.getByRole("button", { name: "Ghost" }).classList.contains("rs-btn-ghost")).toBe(true);
    const subtle = screen.getByRole("button", { name: "Subtle" });
    expect(subtle.classList.contains("rs-btn-subtle")).toBe(true);
    expect(subtle.classList.contains("rs-btn-primary")).toBe(false);
    expect(subtle.classList.contains("rs-btn-ghost")).toBe(false);
    const paint = getComputedStyle(subtle);
    expect(paint.borderWidth).toBe("0px");
    expect(paint.backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(paint.opacity).toBe("1");
    expect(paint.minHeight).toBe(vlak.hit);
  });

  it("reserves a square icon target without flex stretching or inline padding", () => {
    render(<Button variant="subtle" size="icon" aria-label="More actions"><span aria-hidden="true">+</span></Button>);
    const button = screen.getByRole("button", { name: "More actions" });
    expect(button.classList.contains("rs-btn-icon")).toBe(true);
    const paint = getComputedStyle(button);
    expect(paint.width).toBe(vlak.hit);
    expect(paint.height).toBe(vlak.hit);
    expect(paint.minWidth).toBe(vlak.hit);
    expect(paint.maxWidth).toBe(vlak.hit);
    expect(paint.minHeight).toBe(vlak.hit);
    expect(paint.maxHeight).toBe(vlak.hit);
    expect(paint.flexBasis).toBe(vlak.hit);
    expect(paint.flexGrow).toBe("0");
    expect(paint.flexShrink).toBe("0");
    expect(paint.paddingInline).toBe("0");
  });

  it("forwards native semantics, ref, styles, and keyboard activation for a named icon", async () => {
    const user = userEvent.setup();
    const ref = React.createRef<HTMLButtonElement>();
    const onClick = vi.fn();
    const { container } = render(<Button ref={ref} variant="subtle" size="icon" aria-label="Share response" className="custom" style={{ marginTop: 8 }} data-action="share" onClick={onClick}><span aria-hidden="true">↗</span></Button>);
    const button = screen.getByRole("button", { name: "Share response" });
    expect(ref.current).toBe(button);
    expect(button.getAttribute("type")).toBe("button");
    expect(button.dataset.action).toBe("share");
    expect(button.style.marginTop).toBe("8px");
    expect(button.classList.contains("custom")).toBe(true);
    await user.tab();
    expect(document.activeElement).toBe(button);
    await user.keyboard("{Enter} ");
    expect(onClick).toHaveBeenCalledTimes(2);
    const result = await axe(container, { rules: { "color-contrast": { enabled: false } } });
    (expect(result) as unknown as { toHaveNoViolations(): void }).toHaveNoViolations();
  });

  it("preserves native disabled behavior while an aria-disabled action can retain focus", async () => {
    const user = userEvent.setup();
    const disabled = vi.fn();
    render(<><Button variant="subtle" size="icon" disabled aria-label="Unavailable" onClick={disabled}>×</Button><Button variant="subtle" size="icon" aria-disabled="true" aria-label="Pending">…</Button></>);
    const unavailable = screen.getByRole("button", { name: "Unavailable" });
    const pending = screen.getByRole("button", { name: "Pending" });
    await user.click(unavailable);
    expect(disabled).not.toHaveBeenCalled();
    await user.tab();
    expect(document.activeElement).toBe(pending);
    expect(pending.hasAttribute("disabled")).toBe(false);
    expect(getComputedStyle(pending).opacity).toBe("0.4");
  });
});
