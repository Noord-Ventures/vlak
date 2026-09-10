import * as React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { Command, CommandDialog } from "../src/components/command";

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  HTMLDialogElement.prototype.close = function () { this.open = false; };
});
afterEach(cleanup);

const active = (input: HTMLElement) => {
  const id = input.getAttribute("aria-activedescendant");
  return id ? document.getElementById(id) : null;
};
const groups = [{ label: "Pages", items: [
  { label: "Components", keywords: "buttons actions" },
  { label: "Tokens", keywords: "color palette" },
  { label: "Icons" },
] }];

describe("Command search", () => {
  it("initializes uncontrolled search and reports changes while filtering labels and keywords", async () => {
    const changed = vi.fn();
    render(<Command defaultValue="palette" onValueChange={changed} groups={groups} />);
    const input = screen.getByRole("combobox", { name: "Command" });
    expect((input as HTMLInputElement).value).toBe("palette");
    expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(["Tokens"]);
    expect(changed).not.toHaveBeenCalled();
    await userEvent.clear(input);
    expect(changed).toHaveBeenLastCalledWith("");
    expect(screen.getAllByRole("option")).toHaveLength(3);
    await userEvent.type(input, "icons");
    expect(changed).toHaveBeenLastCalledWith("icons");
    expect(active(input)).toBe(screen.getByRole("option", { name: "Icons" }));
  });

  it("keeps controlled search and its results until the application accepts a change", () => {
    const changed = vi.fn();
    const { rerender } = render(<Command value="tok" defaultValue="ignored" onValueChange={changed} inputLabel="Search Vlak" groups={groups} />);
    const input = screen.getByRole("combobox", { name: "Search Vlak" });
    fireEvent.change(input, { target: { value: "icons" } });
    expect(changed).toHaveBeenCalledWith("icons");
    expect((input as HTMLInputElement).value).toBe("tok");
    expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(["Tokens"]);
    rerender(<Command value="icons" onValueChange={changed} inputLabel="Search Vlak" groups={groups} />);
    expect((input as HTMLInputElement).value).toBe("icons");
    expect(active(input)).toBe(screen.getByRole("option", { name: "Icons" }));
    expect(changed).toHaveBeenCalledTimes(1);
  });

  it("preserves external ranking and keyboard selection through CommandDialog", async () => {
    const picked = vi.fn();
    const close = vi.fn();
    const ref = React.createRef<HTMLDialogElement>();
    render(<CommandDialog ref={ref} open aria-label="Site search" inputLabel="Search Vlak" value="unmatched query" shouldFilter={false} onClose={close} groups={[
      { label: "Components", items: [{ label: "Widget" }, { label: "Button", onSelect: picked }] },
      { label: "Docs", items: [{ label: "Installation" }] },
    ]} />);
    const input = screen.getByRole("combobox", { name: "Search Vlak" });
    expect(ref.current).toBe(screen.getByRole("dialog", { name: "Site search" }));
    expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(["Widget", "Button", "Installation"]);
    expect(screen.getByRole("group", { name: "Docs" })).toBeTruthy();
    expect(document.activeElement).toBe(input);
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(picked).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledOnce();
  });

  it("resets active results for new queries or ordering, preserving selection across equivalent renders", async () => {
    const onDone = vi.fn();
    const { rerender } = render(<Command value="" shouldFilter={false} onDone={onDone} groups={groups} />);
    const input = screen.getByRole("combobox");
    await userEvent.keyboard("{End}");
    expect(active(input)?.textContent).toBe("Icons");
    rerender(<Command value="" shouldFilter={false} onDone={onDone} groups={groups.map(group => ({ ...group, items: group.items.map(item => ({ ...item })) }))} />);
    expect(active(input)?.textContent).toBe("Icons");
    const reordered = [{ label: "Pages", items: [{ label: "Icons" }, { label: "Components" }, { label: "Tokens" }] }];
    rerender(<Command value="" shouldFilter={false} onDone={onDone} groups={reordered} />);
    expect(active(input)).toBe(screen.getAllByRole("option")[0]);
    await userEvent.keyboard("{ArrowDown}");
    expect(active(input)?.textContent).toBe("Components");
    rerender(<Command value="new query" shouldFilter={false} onDone={onDone} groups={reordered} />);
    expect(active(input)).toBe(screen.getAllByRole("option")[0]);
    rerender(<Command value="new query" shouldFilter={false} onDone={onDone} groups={[]} />);
    expect(input.getAttribute("aria-activedescendant")).toBeNull();
    await userEvent.keyboard("{End}{ArrowDown}{Enter}");
    expect(onDone).not.toHaveBeenCalled();
    rerender(<Command value="new query" shouldFilter={false} onDone={onDone} groups={[{ items: [{ label: "Only result" }] }]} />);
    await userEvent.keyboard("{End}{ArrowDown}");
    expect(active(input)).toBe(screen.getByRole("option", { name: "Only result" }));
  });

  it("starts at the first match when a query returns after an empty search", async () => {
    const first = vi.fn();
    const second = vi.fn();
    render(<Command defaultValue="response" groups={[{ items: [
      { id: "response", label: "Response", onSelect: first },
      { id: "response-actions", label: "Response actions", onSelect: second },
    ] }]} />);
    const input = screen.getByRole("combobox");
    await userEvent.keyboard("{ArrowDown}");
    expect(active(input)?.textContent).toBe("Response actions");
    await userEvent.keyboard("zzz");
    expect(input.getAttribute("aria-activedescendant")).toBeNull();
    await userEvent.keyboard("{Backspace}{Backspace}{Backspace}");
    expect(active(input)).toBe(screen.getByRole("option", { name: "Response" }));
    await userEvent.keyboard("{Enter}");
    expect(first).toHaveBeenCalledOnce();
    expect(second).not.toHaveBeenCalled();
  });

  it("does not revive the previous selection when ranked results disappear and return", async () => {
    const { rerender } = render(<Command value="" shouldFilter={false} groups={groups} />);
    const input = screen.getByRole("combobox");
    await userEvent.keyboard("{End}");
    expect(active(input)?.textContent).toBe("Icons");
    rerender(<Command value="" shouldFilter={false} groups={[]} />);
    expect(input.getAttribute("aria-activedescendant")).toBeNull();
    rerender(<Command value="" shouldFilter={false} groups={groups} />);
    expect(active(input)).toBe(screen.getByRole("option", { name: "Components" }));
    await userEvent.keyboard("{ArrowDown}");
    expect(active(input)?.textContent).toBe("Tokens");
    rerender(<Command value="" shouldFilter={false} groups={[{ label: "Pages", items: [...groups[0]!.items].reverse() }]} />);
    expect(active(input)?.textContent).toBe("Icons");
    rerender(<Command value="" shouldFilter={false} groups={groups} />);
    expect(active(input)).toBe(screen.getByRole("option", { name: "Components" }));
  });

  it("leaves IME confirmation and candidate navigation to the input", () => {
    const picked = vi.fn();
    const done = vi.fn();
    render(<Command shouldFilter={false} onDone={done} groups={[{ items: [{ label: "First", onSelect: picked }, { label: "Second" }] }]} />);
    const input = screen.getByRole("combobox");
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: "検索" } });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(active(input)?.textContent).toBe("First");
    fireEvent.compositionEnd(input);
    fireEvent.keyDown(input, { key: "Enter", keyCode: 229 });
    fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    expect(picked).not.toHaveBeenCalled();
    expect(done).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: "Enter" });
    expect(picked).toHaveBeenCalledOnce();
    expect(done).toHaveBeenCalledOnce();
  });

  it("distinguishes commands with matching labels by their stable ids", async () => {
    const component = { id: "component-calendar", label: "Calendar", onSelect: vi.fn() };
    const pattern = { id: "interface-calendar", label: "Calendar", onSelect: vi.fn() };
    const { rerender } = render(<Command shouldFilter={false} groups={[{ items: [component, pattern] }]} />);
    const input = screen.getByRole("combobox");
    const [componentRow, patternRow] = screen.getAllByRole("option", { name: "Calendar" });
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(pattern.onSelect).toHaveBeenCalledOnce();
    expect(component.onSelect).not.toHaveBeenCalled();
    rerender(<Command shouldFilter={false} groups={[{ items: [pattern, component] }]} />);
    expect(screen.getAllByRole("option", { name: "Calendar" })).toEqual([patternRow, componentRow]);
    expect(active(input)).toBe(patternRow);
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(component.onSelect).toHaveBeenCalledOnce();
  });

  it("applies the active secondary-text paint only to the current option", async () => {
    render(<Command groups={[{ items: [
      { label: "Tokens", description: "Shared paper and ink values", hint: "⌘1" },
      { label: "Icons", description: "Monochrome symbols", hint: "⌘2" },
    ] }]} />);
    const tokens = screen.getByRole("option", { name: "Tokens" });
    const icons = screen.getByRole("option", { name: "Icons" });
    expect(tokens.querySelector(".rs-command-description-active")).toBeTruthy();
    expect(tokens.querySelector(".rs-command-hint-active")).toBeTruthy();
    expect(icons.querySelector(".rs-command-description-active, .rs-command-hint-active")).toBeNull();
    await userEvent.keyboard("{ArrowDown}");
    expect(tokens.querySelector(".rs-command-description-active, .rs-command-hint-active")).toBeNull();
    expect(icons.querySelector(".rs-command-description-active")).toBeTruthy();
    expect(icons.querySelector(".rs-command-hint-active")).toBeTruthy();
    expect(tokens.querySelector(".rs-command-description")).toBeTruthy();
    expect(tokens.querySelector(".rs-command-hint")).toBeTruthy();
  });

  it("separates an option's accessible name from its description and hint", async () => {
    const picked = vi.fn();
    const { container } = render(<Command inputLabel="Search Vlak" groups={[{ label: "Foundations", items: [{ label: "Tokens", description: <em>Shared paper and ink values</em>, hint: "⌘2", onSelect: picked }] }]} />);
    const option = screen.getByRole("option", { name: "Tokens" });
    const describedBy = option.getAttribute("aria-describedby")!.split(" ").map(id => document.getElementById(id)?.textContent);
    expect(describedBy).toEqual(["Shared paper and ink values", "⌘2"]);
    expect(option.querySelector(".rs-command-description em")?.textContent).toBe("Shared paper and ink values");
    await userEvent.click(option);
    expect(picked).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(screen.getByRole("combobox"));
    expect(await axe(container)).toHaveNoViolations();
  });
});
