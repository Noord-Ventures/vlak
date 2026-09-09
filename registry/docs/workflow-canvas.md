# Workflow canvas

An interactive graph with draggable nodes, connections, viewport controls, anchored panels, and node actions.

Category: ai  
Name: `workflow-canvas`  
Also known as: AI Elements Canvas, AI Elements Connection, AI Elements Controls, AI Elements Edge, AI Elements Node, AI Elements Panel, AI Elements Toolbar, React Flow, WorkflowCanvas, WorkflowNode, WorkflowEdge, WorkflowConnection, WorkflowControls, WorkflowPanel, WorkflowToolbar, Interactive graph  
Page: https://vlak.dev/ai/workflow-canvas/

## When to use

- Import this optional entry and its stylesheet only where a graph is needed. React Flow is an optional peer dependency.
- Supply nodes, edges, and change callbacks for a controlled graph, or defaultNodes and defaultEdges for engine-owned state. The application persists and executes the graph.
- Use type=vlak for the supplied node and edge renderers. Custom nodeTypes can compose WorkflowNode and WorkflowToolbar; custom connection lines can use WorkflowConnection.
- WorkflowPanel anchors overlays in six viewport positions. WorkflowToolbar stays anchored to a selected node and composes Vlak's keyboard-aware Toolbar.
- WorkflowControls binds the existing CanvasControls to pan, zoom, fit, reset, and interaction lock. React Flow props remain available, including connection validation, viewport changes, and accessibility configuration.
- For copied source, import @xyflow/react/dist/base.css in a CSS layer named vlak.engine before vlak.components. The package's workflow.css supplies that ordering.
- Set an explicit height through style when the default 32rem does not suit the container. Use a separate form or Patchbay when users need keyboard-only creation of connections.

## When not to

- Using Flow, an ordered pipeline layout, as an interactive graph engine.
- Turning off React Flow's keyboard accessibility without supplying equivalent controls.
- Treating a connected graph as executed work. Execution, persistence, permissions, and undo history belong to the application.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react @xyflow/react
```

This optional entry point keeps its rendering dependencies out of the core React import.

```tsx
import "@noorddev/vlak-react/css";
import "@noorddev/vlak-react/workflow.css";
import { WorkflowCanvas, WorkflowConnection, WorkflowControls, WorkflowEdge, WorkflowNode, WorkflowPanel, WorkflowToolbar } from "@noorddev/vlak-react/components/workflow-canvas";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add workflow-canvas
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/workflow-canvas.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<section class="rs-workflow-canvas" aria-label="Workflow"><div class="rs-workflow-canvas-node"><header class="rs-workflow-canvas-header"><div class="rs-workflow-canvas-title">Review brief</div></header><div class="rs-workflow-canvas-content">Summarize the supplied document.</div></div></section>
```

## Example

```tsx
"use client";
import "@noorddev/vlak-react/workflow.css";
import { addEdge, useNodesState, useEdgesState, type Edge } from "@xyflow/react";
import { WorkflowCanvas, WorkflowControls, WorkflowPanel, type WorkflowGraphNode } from "@noorddev/vlak-react/components/workflow-canvas";

export function ReviewWorkflow() {
  const [nodes, , onNodesChange] = useNodesState<WorkflowGraphNode>([
    { id: "brief", type: "vlak", position: { x: 0, y: 0 }, data: { title: "Read brief", target: false } },
    { id: "review", type: "vlak", position: { x: 380, y: 0 }, data: { title: "Review", source: false } },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  return <WorkflowCanvas nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
    onConnect={connection => setEdges(current => addEdge({ ...connection, type: "vlak" }, current))}>
    <WorkflowControls />
    <WorkflowPanel position="top-left">Review workflow</WorkflowPanel>
  </WorkflowCanvas>;
}
```

## Props

### WorkflowCanvas

Optional React Flow adapter. Supply a bounded height and controlled changes or defaultNodes/defaultEdges.

No props of its own.

### WorkflowConnection

Pointer-following connection preview while creating an edge.

No props of its own.

### WorkflowControls

Binds Vlak's canvas controls to the graph viewport and interaction lock.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `string` | `"Workflow controls"` |  |

### WorkflowEdge

Bezier edge with engine-managed hit testing and optional temporary or animated state.

No props of its own.

### WorkflowNode

A graph node surface. Render inside React Flow so its handles use the graph's geometry.

Extends `Omit<HTMLAttributes<HTMLDivElement>, "title">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` (required) | `ReactNode` |  |  |
| `description` | `ReactNode` |  |  |
| `footer` | `ReactNode` |  |  |
| `actions` | `ReactNode` |  |  |
| `source` | `boolean` | `true` |  |
| `target` | `boolean` | `true` |  |
| `sourcePosition` | `Position` | `Position.Right` |  |
| `targetPosition` | `Position` | `Position.Left` |  |
| `selected` | `boolean` | `false` |  |
| `connectable` | `boolean` | `true` |  |

### WorkflowPanel

Overlay anchored to one of React Flow's six viewport positions.

No props of its own.

### WorkflowToolbar

Node-anchored toolbar with Vlak's arrow-key action navigation.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `actions` (required) | `ToolbarAction[]` |  |  |
| `label` (required) | `string` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Focuses nodes, edges, viewport controls, and supplied actions |
| Enter, Space | Selects a focused node or edge through React Flow |
| Arrow keys | Moves a selected, draggable node; moves between actions inside the node toolbar |
| Delete, Backspace | Deletes selected graph elements through the supplied change callbacks |
| Escape | Cancels the current graph selection or connection gesture |

## Accessibility

- React Flow supplies keyboard movement, focusable nodes and edges, instruction text, and movement announcements. ariaLabelConfig can localize those messages.
- Visible connection handles have 44px pointer targets. The application should provide a form-based connection action for keyboard-only creation.
- The node action Toolbar retains its single Tab stop and arrow-key focus movement.
- Animated edges stop moving with reduced motion. Surfaces use Vlak paper, ink, hairlines, and 4px corners.

## Classes

`rs-workflow-canvas`, `rs-workflow-canvas-node`, `rs-workflow-canvas-selected`, `rs-workflow-canvas-header`, `rs-workflow-canvas-title`, `rs-workflow-canvas-description`, `rs-workflow-canvas-content`, `rs-workflow-canvas-footer`, `rs-workflow-canvas-handle`, `rs-workflow-canvas-dot`, `rs-workflow-canvas-edge`, `rs-workflow-canvas-temporary`, `rs-workflow-canvas-animated`, `rs-workflow-canvas-endpoint`, `rs-workflow-canvas-panel`, `rs-workflow-canvas-controls`

## Dependencies

Registry dependencies: [button](button.md), [canvas-controls](canvas-controls.md), [toolbar](toolbar.md).  
React: `packages/react/src/components/workflow-canvas.tsx`  
CSS: `packages/core/css/components/workflow-canvas.css`
