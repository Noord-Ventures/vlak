"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Background, BaseEdge, Handle, NodeToolbar, Panel, Position, ReactFlow, getBezierPath, useReactFlow, useStore, useStoreApi, useViewport, type ConnectionLineComponentProps, type Edge, type EdgeProps, type Node, type NodeProps, type NodeToolbarProps, type PanelProps, type ReactFlowProps } from "@xyflow/react";
import { rs } from "../rs";
import { mq, vlak } from "../tokens.stylex";
import { Button } from "./button";
import { CanvasControls } from "./canvas-controls";
import { Toolbar, type ToolbarProps } from "./toolbar";

export type WorkflowNodeData = Record<string, unknown> & { title: string; description?: React.ReactNode; content?: React.ReactNode; footer?: React.ReactNode; source?: boolean; target?: boolean };
export type WorkflowGraphNode = Node<WorkflowNodeData, "vlak">;
export interface WorkflowNodeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  actions?: React.ReactNode;
  source?: boolean;
  target?: boolean;
  sourcePosition?: Position;
  targetPosition?: Position;
  selected?: boolean;
  connectable?: boolean;
}

const dash = stylex.keyframes({ to: { strokeDashoffset: -20 } });
const styles = stylex.create({
  canvas: {
    width: "100%", height: "32rem", minHeight: "16rem", minWidth: 0, borderWidth: 1, borderStyle: "solid", borderColor: vlak.divider, borderRadius: vlak.radiusSm, overflow: "hidden", backgroundColor: vlak.paper, color: vlak.ink,
    // Engine surfaces inherit the same palette as Vlak nodes, including generic edges and arrow markers.
    "--xy-background-color": { default: vlak.paper, [mq.forcedColors]: "Canvas" },
    "--xy-background-pattern-color": { default: vlak.divider, [mq.forcedColors]: "GrayText" },
    "--xy-edge-stroke": { default: vlak.gray, [mq.forcedColors]: "CanvasText" },
    "--xy-edge-stroke-selected": { default: vlak.ink, [mq.forcedColors]: "Highlight" },
    "--xy-connectionline-stroke": { default: vlak.gray, [mq.forcedColors]: "CanvasText" },
    "--xy-handle-background-color": { default: vlak.ink, [mq.forcedColors]: "CanvasText" },
    "--xy-node-color": { default: vlak.ink, [mq.forcedColors]: "CanvasText" },
    "--xy-node-border": { default: `1px solid ${vlak.controlBorder}`, [mq.forcedColors]: "1px solid CanvasText" },
    "--xy-node-border-selected": { default: `1px solid ${vlak.ink}`, [mq.forcedColors]: "1px solid Highlight" },
    "--xy-selection-background-color": { default: `color-mix(in srgb, ${vlak.ink} 10%, transparent)`, [mq.forcedColors]: "transparent" },
    "--xy-selection-border": { default: `1px solid ${vlak.controlBorder}`, [mq.forcedColors]: "1px solid Highlight" },
    "--xy-resize-background-color": { default: vlak.ink, [mq.forcedColors]: "Highlight" },
    "--xy-attribution-background-color": { default: vlak.paper, [mq.forcedColors]: "Canvas" },
    "--xy-attribution-color": { default: vlak.gray, [mq.forcedColors]: "LinkText" },
    "--xy-minimap-background-color": { default: vlak.paper, [mq.forcedColors]: "Canvas" },
    "--xy-minimap-mask-background-color": { default: `color-mix(in srgb, ${vlak.ink} 8%, transparent)`, [mq.forcedColors]: "transparent" },
    "--xy-minimap-mask-stroke-color": { default: vlak.gray, [mq.forcedColors]: "CanvasText" },
    "--xy-minimap-node-background-color": { default: vlak.controlFill, [mq.forcedColors]: "Canvas" },
    "--xy-minimap-node-stroke-color": { default: vlak.controlBorder, [mq.forcedColors]: "CanvasText" },
  },
  node: { position: "relative", boxSizing: "border-box", width: "18rem", maxWidth: "100%", backgroundColor: vlak.paper, color: vlak.ink, borderWidth: 1, borderStyle: "solid", borderColor: { default: vlak.controlBorder, [mq.forcedColors]: "CanvasText" }, borderRadius: vlak.radiusSm },
  selected: { outlineWidth: 2, outlineStyle: "solid", outlineColor: vlak.ink, outlineOffset: 3 },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", padding: "1rem" },
  title: { fontSize: "0.875rem", fontWeight: 600 },
  description: { marginTop: "0.25rem", color: vlak.gray, fontSize: "0.8125rem", lineHeight: 1.45 },
  content: { padding: "1rem", borderTopWidth: 1, borderTopStyle: "solid", borderTopColor: vlak.divider, fontSize: "0.875rem", lineHeight: 1.45 },
  footer: { padding: "0.75rem 1rem", borderTopWidth: 1, borderTopStyle: "solid", borderTopColor: vlak.divider, fontSize: "0.8125rem", color: vlak.gray },
  handle: {
    // React Flow measures this box to anchor edges; the pseudo-element expands only pointer hit testing.
    width: 8, height: 8, minWidth: 8, minHeight: 8, borderWidth: 0, borderRadius: "50%", backgroundColor: "transparent", cursor: "crosshair",
    "::before": { content: '""', position: "absolute", inset: `calc(50% - ${vlak.hit} / 2)`, width: vlak.hit, height: vlak.hit, pointerEvents: "inherit" },
  },
  dot: { display: "block", position: "absolute", inset: "calc(50% - 4px)", borderRadius: "50%", backgroundColor: vlak.ink, pointerEvents: "none" },
  // Let React Flow's focus/selection selectors own stroke so lower engine layers retain keyboard feedback.
  edge: { "--xy-edge-stroke": { default: vlak.gray, [mq.forcedColors]: "CanvasText" }, "--xy-edge-stroke-selected": { default: vlak.ink, [mq.forcedColors]: "Highlight" }, "--xy-edge-stroke-width": "1.5", "--xy-connectionline-stroke": { default: vlak.gray, [mq.forcedColors]: "CanvasText" }, "--xy-connectionline-stroke-width": "1.5", fill: "none" },
  temporary: { strokeDasharray: "5 5" },
  animated: { strokeDasharray: "5 5", animationName: { default: dash, [mq.reduce]: "none" }, animationDuration: "1s", animationTimingFunction: "linear", animationIterationCount: "infinite" },
  endpoint: { fill: vlak.paper, stroke: vlak.ink, strokeWidth: 1.5 },
  panel: { padding: "0.25rem", borderWidth: 1, borderStyle: "solid", borderColor: vlak.divider, borderRadius: vlak.radiusSm, backgroundColor: vlak.paper, color: vlak.ink, maxWidth: "calc(100% - 24px)" },
  controls: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.25rem" },
});

/** A graph node surface. Render inside React Flow so its handles use the graph's geometry. */
export const WorkflowNode = React.forwardRef<HTMLDivElement, WorkflowNodeProps>(function WorkflowNode({ title, description, children, footer, actions, source = true, target = true, sourcePosition = Position.Right, targetPosition = Position.Left, selected = false, connectable = true, className, style, ...props }, ref) {
  const root = rs(["rs-workflow-canvas-node", selected && "rs-workflow-canvas-selected", className], styles.node, selected && styles.selected);
  const handle = rs(["rs-workflow-canvas-handle"], styles.handle);
  const dot = rs(["rs-workflow-canvas-dot"], styles.dot);
  return <div ref={ref} {...props} className={root.className} style={{ ...root.style, ...style }}>
    {target && <Handle {...handle} type="target" position={targetPosition} isConnectable={connectable} aria-hidden="true"><span {...dot} /></Handle>}
    <header {...rs(["rs-workflow-canvas-header"], styles.header)}><div><div {...rs(["rs-workflow-canvas-title"], styles.title)}>{title}</div>{description && <div {...rs(["rs-workflow-canvas-description"], styles.description)}>{description}</div>}</div>{actions && <div className="nodrag nopan nokey">{actions}</div>}</header>
    {children && <div {...rs(["rs-workflow-canvas-content"], styles.content)}>{children}</div>}
    {footer && <footer {...rs(["rs-workflow-canvas-footer"], styles.footer)}>{footer}</footer>}
    {source && <Handle {...handle} type="source" position={sourcePosition} isConnectable={connectable} aria-hidden="true"><span {...dot} /></Handle>}
  </div>;
});

function DefaultNode({ data, selected, isConnectable, sourcePosition, targetPosition }: NodeProps<WorkflowGraphNode>) {
  return <WorkflowNode title={data.title} description={data.description} footer={data.footer} source={data.source} target={data.target} sourcePosition={sourcePosition} targetPosition={targetPosition} selected={selected} connectable={isConnectable}>{data.content}</WorkflowNode>;
}

/** Bezier edge with engine-managed hit testing and optional temporary or animated state. */
export function WorkflowEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerStart, markerEnd, style, selected, animated, data, label, labelStyle, interactionWidth }: EdgeProps<Edge<{ temporary?: boolean }>>) {
  const [path, labelX, labelY] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });
  const temporary = !!data?.temporary;
  const moving = !!animated;
  const paint = rs(["rs-workflow-canvas-edge", temporary && "rs-workflow-canvas-temporary", moving && "rs-workflow-canvas-animated"], styles.edge, temporary && styles.temporary, moving && styles.animated);
  return <BaseEdge id={id} path={path} markerStart={markerStart} markerEnd={markerEnd} label={label} labelX={labelX} labelY={labelY} labelStyle={labelStyle} interactionWidth={interactionWidth} className={paint.className} style={{ ...paint.style, ...(selected ? { strokeWidth: 2 } : {}), ...style }} />;
}

/** Pointer-following connection preview while creating an edge. */
export function WorkflowConnection({ fromX, fromY, toX, toY, fromPosition, toPosition, connectionStatus }: ConnectionLineComponentProps) {
  const [path] = getBezierPath({ sourceX: fromX, sourceY: fromY, targetX: toX, targetY: toY, sourcePosition: fromPosition, targetPosition: toPosition });
  const paint = rs(["rs-workflow-canvas-edge", "rs-workflow-canvas-temporary"], styles.edge, styles.temporary);
  // biome-ignore lint/a11y/noAriaHiddenOnFocusable: The decorative SVG group explicitly disables focus.
  return <g aria-hidden="true" focusable="false" data-status={connectionStatus}><path {...paint} className={`react-flow__connection-path ${paint.className ?? ""}`} d={path} /><circle {...rs(["rs-workflow-canvas-endpoint"], styles.endpoint)} cx={toX} cy={toY} r={4} /></g>;
}

const nodeTypes = { vlak: DefaultNode };
const edgeTypes = { vlak: WorkflowEdge };

/** Optional React Flow adapter. Supply a bounded height and controlled changes or defaultNodes/defaultEdges. */
export function WorkflowCanvas<N extends Node = WorkflowGraphNode, E extends Edge = Edge>({ children, className, style, ...props }: ReactFlowProps<N, E>) {
  const root = rs(["rs-workflow-canvas", className], styles.canvas);
  return <div className={root.className} style={{ ...root.style, ...style }}><ReactFlow<N, E> nodeTypes={nodeTypes} edgeTypes={edgeTypes} defaultEdgeOptions={{ type: "vlak" }} connectionLineComponent={WorkflowConnection} deleteKeyCode={["Backspace", "Delete"]} panOnScroll selectionOnDrag panOnDrag={false} zoomOnDoubleClick={false} fitView {...props}>
    <Background color="var(--divider)" bgColor="var(--bg)" gap={20} size={1} />{children}
  </ReactFlow></div>;
}

/** Overlay anchored to one of React Flow's six viewport positions. */
export function WorkflowPanel({ className, style, ...props }: PanelProps) {
  const root = rs(["rs-workflow-canvas-panel", className], styles.panel);
  return <Panel {...props} className={root.className} style={{ ...root.style, ...style }} />;
}

export interface WorkflowControlsProps extends Omit<PanelProps, "children"> { label?: string }
/** Binds Vlak's canvas controls to the graph viewport and interaction lock. */
export function WorkflowControls({ label = "Workflow controls", position = "bottom-left", ...props }: WorkflowControlsProps) {
  const flow = useReactFlow();
  const { zoom } = useViewport();
  const minZoom = useStore(state => state.minZoom);
  const maxZoom = useStore(state => state.maxZoom);
  const locked = useStore(state => !state.nodesDraggable && !state.nodesConnectable && !state.elementsSelectable);
  return <WorkflowPanel position={position} {...props}><div {...rs(["rs-workflow-canvas-controls"], styles.controls)}>
    <CanvasControls label={label} zoom={zoom} minZoom={minZoom} maxZoom={maxZoom} onZoomChange={value => { void flow.zoomTo(value); }} onFit={() => { void flow.fitView(); }} onReset={() => { void flow.setViewport({ x: 0, y: 0, zoom: 1 }); }} />
    <WorkflowInteractionLock locked={locked} />
  </div></WorkflowPanel>;
}

// React Flow exposes its provider store for interaction controls; node positions remain caller-owned.
function WorkflowInteractionLock({ locked }: { locked: boolean }) {
  const store = useStoreApi();
  const previous = React.useRef<{ nodesDraggable: boolean; nodesConnectable: boolean; elementsSelectable: boolean } | undefined>(undefined);
  return <Button variant="subtle" aria-label={locked ? "Unlock workflow" : "Lock workflow"} aria-pressed={locked} onClick={() => {
    if (locked) store.setState(previous.current ?? { nodesDraggable: true, nodesConnectable: true, elementsSelectable: true });
    else { const state = store.getState(); previous.current = { nodesDraggable: state.nodesDraggable, nodesConnectable: state.nodesConnectable, elementsSelectable: state.elementsSelectable }; store.setState({ nodesDraggable: false, nodesConnectable: false, elementsSelectable: false }); }
  }}>{locked ? "Unlock" : "Lock"}</Button>;
}

export interface WorkflowToolbarProps extends Omit<NodeToolbarProps, "children"> { actions: ToolbarProps["actions"]; label: string }
/** Node-anchored toolbar with Vlak's arrow-key action navigation. */
export function WorkflowToolbar({ actions, label, className, style, ...props }: WorkflowToolbarProps) {
  const root = rs(["rs-workflow-canvas-panel", "nokey", className], styles.panel);
  return <NodeToolbar {...props} className={root.className} style={{ ...root.style, ...style }}><Toolbar label={label} actions={actions} /></NodeToolbar>;
}
