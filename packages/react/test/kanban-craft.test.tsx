import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { KanbanBoard, type KanbanCard } from "../src/components/kanban-board";
import { vlak } from "../src/tokens.stylex";

afterEach(cleanup);

const columns = [{ id: "planned", label: "Planned" }, { id: "active", label: "Active" }, { id: "complete", label: "Complete" }];
const cards: KanbanCard[] = [
  { id: "brief", title: "Write the brief", columnId: "planned", description: "Outline the work" },
  { id: "references", title: "Collect references", columnId: "planned" },
  { id: "layout", title: "Explore layouts", columnId: "active" },
];
const transfer = () => ({ effectAllowed: "none", setData: vi.fn(), getData: vi.fn() });
const cardElement = (title: string) => screen.getByRole("button", { name: `Move ${title}` }).closest("li")!;

describe("Kanban card craft and movement", () => {
  it("separates title/handle and controls into aligned rows with full-size targets", () => {
    render(<KanbanBoard columns={columns} defaultValue={cards} />);
    const card = cardElement("Write the brief");
    const header = card.querySelector(".rs-kanban-card-header")!;
    const controls = card.querySelector(".rs-kanban-controls")!;
    expect(within(header as HTMLElement).getByText("Write the brief")).toBeTruthy();
    expect(within(header as HTMLElement).getByRole("button", { name: "Move Write the brief" })).toBeTruthy();
    expect(within(header as HTMLElement).queryByRole("combobox")).toBeNull();
    expect(within(controls as HTMLElement).getByRole("combobox", { name: "Move Write the brief to" })).toBeTruthy();
    expect(within(controls as HTMLElement).getAllByRole("button")).toHaveLength(2);
    expect(header.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(getComputedStyle(card).display).toBe("grid");
    expect(getComputedStyle(card).borderRadius).toBe(vlak.radiusSm);
    expect(getComputedStyle(header).gridTemplateColumns).toContain(vlak.hit);
    expect(getComputedStyle(header).alignItems).toBe("center");
    expect(getComputedStyle(controls).flexWrap).toBe("wrap");
    expect(getComputedStyle(card.querySelector(".rs-kanban-reorder")!).marginInlineStart).toBe("auto");
    for (const button of within(card).getAllByRole("button")) {
      expect(getComputedStyle(button).minWidth).toBe(vlak.hit);
      expect(getComputedStyle(button).minHeight).toBe(vlak.hit);
      expect(getComputedStyle(button).borderRadius).toBe(vlak.radiusSm);
    }
  });

  it("keeps the first narrow column bounded and makes intentional horizontal scrolling reachable", () => {
    render(<KanbanBoard columns={columns} defaultValue={cards} style={{ width: 220 }} />);
    const viewport = screen.getByRole("group", { name: "Board columns" });
    const paint = getComputedStyle(viewport);
    expect(paint.gridAutoColumns.replaceAll(" ", "")).toBe("minmax(min(100%,17rem),1fr)");
    expect(paint.width).toBe("100%");
    expect(paint.maxWidth).toBe("100%");
    expect(paint.boxSizing).toBe("border-box");
    expect(paint.overflowX).toBe("auto");
    expect(viewport.tabIndex).toBe(0);
  });

  it("reorders with Alt-arrow and move buttons while retaining handle focus", async () => {
    const change = vi.fn();
    const user = userEvent.setup();
    render(<KanbanBoard columns={columns} defaultValue={cards} onValueChange={change} />);
    screen.getByRole("button", { name: "Move Write the brief" }).focus();
    await user.keyboard("{Alt>}{ArrowDown}{/Alt}");
    expect(change.mock.lastCall?.[0].map((card: KanbanCard) => card.id)).toEqual(["references", "brief", "layout"]);
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Move Write the brief" }));
    await user.click(screen.getByRole("button", { name: "Move Write the brief up" }));
    expect(change.mock.lastCall?.[0].map((card: KanbanCard) => card.id)).toEqual(["brief", "references", "layout"]);
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Move Write the brief" }));
    expect(screen.getByRole("status").textContent).toContain("position 1 of 2");
  });

  it("moves by native destination and focuses the control in its new column", async () => {
    render(<KanbanBoard columns={columns} defaultValue={cards} />);
    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Move Write the brief to" }), "complete");
    const moved = within(screen.getByRole("region", { name: "Complete 1" })).getByRole("combobox", { name: "Move Write the brief to" });
    expect(document.activeElement).toBe(moved);
    expect(screen.getByRole("status").textContent).toBe("Write the brief moved to Complete.");
  });

  it("waits for controlled movement to commit before announcing or transferring focus", async () => {
    const change = vi.fn();
    const { rerender } = render(<KanbanBoard columns={columns} value={cards} onValueChange={change} />);
    const source = screen.getByRole("combobox", { name: "Move Write the brief to" });
    await userEvent.selectOptions(source, "active");
    expect((source as HTMLSelectElement).value).toBe("planned");
    expect(screen.getByRole("status").textContent).toBe("");
    expect(document.activeElement).toBe(source);
    rerender(<KanbanBoard columns={columns} value={change.mock.lastCall![0]} onValueChange={change} />);
    expect(document.activeElement).toBe(screen.getByRole("combobox", { name: "Move Write the brief to" }));
    expect(screen.getByRole("status").textContent).toBe("Write the brief moved to Active.");
  });

  it("retains same-column pointer-drop reordering", () => {
    const change = vi.fn();
    render(<KanbanBoard columns={columns} defaultValue={cards} onValueChange={change} />);
    const dataTransfer = transfer();
    const handle = screen.getByRole("button", { name: "Move Write the brief" });
    handle.focus();
    fireEvent.dragStart(handle, { dataTransfer });
    expect(dataTransfer.setData).toHaveBeenCalledWith("text/plain", "brief");
    fireEvent.drop(cardElement("Collect references"), { dataTransfer });
    expect(change).toHaveBeenCalledOnce();
    expect(change.mock.lastCall?.[0].map((card: KanbanCard) => card.id)).toEqual(["references", "brief", "layout"]);
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Move Write the brief" }));
  });

  it("drops across columns before a target card or into an empty column without duplicate movement", () => {
    const change = vi.fn();
    render(<KanbanBoard columns={columns} defaultValue={cards} onValueChange={change} />);
    const dataTransfer = transfer();
    fireEvent.dragStart(screen.getByRole("button", { name: "Move Write the brief" }), { dataTransfer });
    fireEvent.drop(cardElement("Explore layouts"), { dataTransfer });
    expect(change).toHaveBeenCalledOnce();
    const active = screen.getByRole("list", { name: "Active cards" });
    expect(within(active).getAllByRole("listitem").map(item => item.querySelector(".rs-kanban-title")?.textContent)).toEqual(["Write the brief", "Explore layouts"]);
    fireEvent.dragStart(screen.getByRole("button", { name: "Move Write the brief" }), { dataTransfer });
    fireEvent.drop(screen.getByRole("region", { name: "Complete 0" }), { dataTransfer });
    expect(change).toHaveBeenCalledTimes(2);
    expect(within(screen.getByRole("list", { name: "Complete cards" })).getByText("Write the brief")).toBeTruthy();
  });

  it("keeps disabled cards immovable and ignores external drop data", () => {
    const change = vi.fn();
    render(<KanbanBoard columns={columns} defaultValue={[{ ...cards[0]!, disabled: true }]} onValueChange={change} />);
    const handle = screen.getByRole("button", { name: "Move Write the brief" });
    expect(handle.getAttribute("draggable")).toBe("false");
    expect((handle as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("combobox") as HTMLSelectElement).disabled).toBe(true);
    fireEvent.keyDown(handle, { key: "ArrowDown", altKey: true });
    fireEvent.drop(screen.getByRole("region", { name: "Complete 0" }), { dataTransfer: { getData: () => "brief" } });
    expect(change).not.toHaveBeenCalled();
  });

  it("keeps named controls, list structure and accessible defaults", async () => {
    const { container } = render(<KanbanBoard columns={columns} defaultValue={cards} />);
    expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });
});
