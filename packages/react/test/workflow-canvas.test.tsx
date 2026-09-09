import * as React from "react";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { Position, ReactFlowProvider, useStoreApi, type NodeProps } from "@xyflow/react";
import { WorkflowCanvas, WorkflowConnection, WorkflowControls, WorkflowEdge, WorkflowNode, WorkflowPanel, WorkflowToolbar, type WorkflowGraphNode } from "../src/components/workflow-canvas";
import { vlak } from "../src/tokens.stylex";

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); document.querySelector("style[data-engine-fixture]")?.remove(); });

// Only layout/resize are supplied by the fixture. React Flow's provider, node/edge wrappers,
// handles, focus behavior, and keyboard handlers all run unchanged.
function graphLayout() {
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (this: HTMLElement) { return this.classList.contains("react-flow__node") ? 288 : 900; });
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(function (this: HTMLElement) { return this.classList.contains("react-flow__node") ? 160 : 600; });
  const sheet = document.createElement("style");
  sheet.dataset.engineFixture = "true";
  sheet.textContent = readFileSync(createRequire(import.meta.url).resolve("@xyflow/react/dist/base.css"), "utf8");
  // jsdom does not support cascade layers. Load engine rules before Vlak's injected rules,
  // matching the shipped engine-before-components priority for these two layers.
  document.head.prepend(sheet);
  return sheet;
}

const graphNodes: WorkflowGraphNode[] = [
  { id: "review", type: "vlak", position: { x: 0, y: 0 }, width: 288, height: 160, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { title: "Review" }, handles: [{ id: null, type: "source", position: Position.Bottom, x: 140, y: 156, width: 8, height: 8 }, { id: null, type: "target", position: Position.Top, x: 140, y: -4, width: 8, height: 8 }] },
  { id: "publish", type: "vlak", position: { x: 380, y: 220 }, width: 288, height: 160, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { title: "Prepare draft" }, handles: [{ id: null, type: "source", position: Position.Bottom, x: 140, y: 156, width: 8, height: 8 }, { id: null, type: "target", position: Position.Top, x: 140, y: -4, width: 8, height: 8 }] },
];

describe("Workflow adapter", () => {
  it("keeps node slots, native attributes, ref and keyboard actions inside the graph", async () => {
    const action = vi.fn();
    const ref = React.createRef<HTMLDivElement>();
    const { container } = render(<ReactFlowProvider><WorkflowNode ref={ref} title="Review" description="One source" source={false} target={false} selected data-node="review" footer="Ready" actions={<button type="button" onClick={action}>Run review</button>}><p>Summarize the brief.</p></WorkflowNode></ReactFlowProvider>);
    expect(ref.current?.dataset.node).toBe("review");
    expect(ref.current?.className).toContain("rs-workflow-canvas-selected");
    await userEvent.tab(); await userEvent.keyboard("{Enter}");
    expect(action).toHaveBeenCalledOnce();
    expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });

  it("locks and restores the existing interaction configuration", async () => {
    let store: ReturnType<typeof useStoreApi> | undefined;
    function Probe() { store = useStoreApi(); return null; }
    render(<ReactFlowProvider><Probe /><WorkflowControls /></ReactFlowProvider>);
    act(() => { store?.setState({ nodesDraggable: true, nodesConnectable: false, elementsSelectable: true }); });
    await userEvent.click(screen.getByRole("button", { name: "Lock workflow" }));
    expect(store?.getState().nodesDraggable).toBe(false);
    expect(store?.getState().elementsSelectable).toBe(false);
    await userEvent.click(screen.getByRole("button", { name: "Unlock workflow" }));
    expect(store?.getState().nodesDraggable).toBe(true);
    expect(store?.getState().nodesConnectable).toBe(false);
    expect(store?.getState().elementsSelectable).toBe(true);
  });

  it("anchors panels and preserves keyboard navigation in a visible node toolbar", async () => {
    const remove = vi.fn();
    function PortalHost() {
      const host = React.useRef<HTMLDivElement>(null);
      const store = useStoreApi();
      React.useLayoutEffect(() => { store.setState({ domNode: host.current }); }, [store]);
      return <div ref={host}><div className="react-flow__renderer" /></div>;
    }
    render(<ReactFlowProvider initialNodes={[{ id: "review", position: { x: 0, y: 0 }, data: {}, measured: { width: 100, height: 100 } }]}><PortalHost /><WorkflowPanel position="top-right">Graph status</WorkflowPanel><WorkflowToolbar nodeId="review" isVisible label="Review actions" actions={[{ id: "run", label: "Run", onAction: vi.fn() }, { id: "remove", label: "Remove", onAction: remove }]} /></ReactFlowProvider>);
    expect(screen.getByText("Graph status").className).toContain("top");
    await userEvent.tab(); await userEvent.keyboard("{ArrowRight}{Enter}");
    expect(remove).toHaveBeenCalledOnce();
  });

  it("uses supplied handle geometry for bezier edges and pointer connection previews", () => {
    const { container } = render(<svg aria-label="Graph connections"><WorkflowEdge id="edge" source="one" target="two" sourceX={0} sourceY={10} targetX={200} targetY={80} sourcePosition={Position.Right} targetPosition={Position.Left} animated data={{ temporary: true }} /><WorkflowConnection fromX={10} fromY={20} toX={100} toY={120} fromPosition={Position.Right} toPosition={Position.Left} connectionStatus="valid" connectionLineStyle={{}} connectionLineType={"bezier" as never} fromNode={{} as never} fromHandle={{} as never} toNode={null} toHandle={null} pointer={{ x: 100, y: 120 }} /></svg>);
    expect(container.querySelector(".rs-workflow-canvas-edge")?.getAttribute("d")).toContain("200,80");
    expect(container.querySelector("circle")?.getAttribute("cx")).toBe("100");
    expect(container.querySelector("circle")?.getAttribute("cy")).toBe("120");
    expect(container.querySelector(".rs-workflow-canvas-animated")).toBeTruthy();
  });

  it("uses real graph handles and retains the engine's visible edge focus state", async () => {
    const engineSheet = graphLayout();
    const user = userEvent.setup();
    const { container } = render(<main><button type="button">Before workflow</button><WorkflowCanvas defaultNodes={graphNodes} defaultEdges={[{ id: "review-publish", source: "review", target: "publish", type: "vlak" }]} fitView={false} width={900} height={600} /></main>);
    const node = screen.getByTestId("rf__node-review");
    expect(node.querySelector(".source")?.getAttribute("data-handlepos")).toBe("bottom");
    expect(node.querySelector(".target")?.getAttribute("data-handlepos")).toBe("top");
    expect(node.querySelectorAll('.react-flow__handle[aria-hidden="true"]')).toHaveLength(2);
    expect(getComputedStyle(node.querySelector(".source")!).width).toBe("8px");
    expect(getComputedStyle(node.querySelector(".source")!).height).toBe("8px");
    const edge = screen.getByTestId("rf__edge-review-publish");
    const palette = getComputedStyle(container.querySelector(".rs-workflow-canvas")!);
    expect(palette.getPropertyValue("--xy-selection-background-color")).toBe(`color-mix(in srgb,${vlak.ink} 10%,transparent)`);
    expect(palette.getPropertyValue("--xy-selection-border")).toBe(`1px solid ${vlak.controlBorder}`);
    expect(palette.getPropertyValue("--xy-resize-background-color")).toBe(vlak.ink);
    expect(palette.getPropertyValue("--xy-edge-stroke-selected")).toBe(vlak.ink);
    expect(palette.getPropertyValue("--xy-handle-background-color")).toBe(vlak.ink);
    expect(palette.getPropertyValue("--xy-attribution-background-color")).toBe(vlak.paper);
    expect(palette.getPropertyValue("--xy-attribution-color")).toBe(vlak.gray);
    const path = edge.querySelector<SVGElement>(".react-flow__edge-path")!;
    expect(path.getAttribute("d")).toMatch(/^M144,164 /);
    expect(path.getAttribute("d")).toMatch(/524,216$/);
    expect(getComputedStyle(path).stroke).toContain("--xy-edge-stroke,");
    await user.tab(); expect(document.activeElement).toBe(screen.getByRole("button", { name: "Before workflow" }));
    await user.tab(); expect(document.activeElement).toBe(edge);
    expect(edge.classList.contains("selected")).toBe(false);
    // jsdom caches computed style across focus changes; reparse the same stylesheet to invalidate it.
    engineSheet.textContent += "\n";
    expect(getComputedStyle(path).stroke).toContain("--xy-edge-stroke-selected");
    expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });

  it("keeps action keys inside the action while the real node still supports keyboard movement", async () => {
    graphLayout();
    const user = userEvent.setup();
    const action = vi.fn(); const actionKey = vi.fn(); const changes = vi.fn();
    function ActionNode({ data, selected, isConnectable, sourcePosition, targetPosition }: NodeProps<WorkflowGraphNode>) {
      return <WorkflowNode title={data.title} selected={selected} connectable={isConnectable} sourcePosition={sourcePosition} targetPosition={targetPosition} actions={<button type="button" onClick={action} onKeyDown={actionKey}>Run review</button>} />;
    }
    render(<WorkflowCanvas defaultNodes={[{ ...graphNodes[0]!, selected: true }]} nodeTypes={{ vlak: ActionNode }} onNodesChange={changes} fitView={false} width={900} height={600} />);
    changes.mockClear();
    screen.getByRole("button", { name: "Run review" }).focus();
    await user.keyboard("{ArrowRight}{Enter}");
    expect(action).toHaveBeenCalledOnce(); expect(actionKey).toHaveBeenCalled(); expect(changes).not.toHaveBeenCalled();
    screen.getByTestId("rf__node-review").focus(); await user.keyboard("{ArrowRight}");
    expect(changes).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ id: "review", type: "position", position: { x: 5, y: 0 } })]));
  });

  it("keeps portaled toolbar arrows from moving the selected node", async () => {
    graphLayout();
    const user = userEvent.setup();
    const changes = vi.fn();
    function ToolbarNode({ data }: NodeProps<WorkflowGraphNode>) {
      return <><WorkflowToolbar label="Review tools" isVisible actions={[{ id: "review", label: "Mark reviewed", onAction: vi.fn() }, { id: "remove", label: "Remove review", onAction: vi.fn() }]} /><WorkflowNode title={data.title} /></>;
    }
    render(<WorkflowCanvas defaultNodes={[{ ...graphNodes[0]!, selected: true }]} nodeTypes={{ vlak: ToolbarNode }} onNodesChange={changes} fitView={false} width={900} height={600} />);
    changes.mockClear();
    screen.getByRole("button", { name: "Mark reviewed" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Remove review" }));
    expect(changes).not.toHaveBeenCalled();
  });
});
