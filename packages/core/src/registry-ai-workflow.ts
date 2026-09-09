import type { VlakComponent } from "./schema";

export const aiWorkflowComponents: VlakComponent[] = [{
  name: "workflow-canvas",
  title: "Workflow canvas",
  description: "An interactive graph with draggable nodes, connections, viewport controls, anchored panels, and node actions.",
  category: "ai",
  classes: ["rs-workflow-canvas", "rs-workflow-canvas-node", "rs-workflow-canvas-selected", "rs-workflow-canvas-header", "rs-workflow-canvas-title", "rs-workflow-canvas-description", "rs-workflow-canvas-content", "rs-workflow-canvas-footer", "rs-workflow-canvas-handle", "rs-workflow-canvas-dot", "rs-workflow-canvas-edge", "rs-workflow-canvas-temporary", "rs-workflow-canvas-animated", "rs-workflow-canvas-endpoint", "rs-workflow-canvas-panel", "rs-workflow-canvas-controls"],
  css: ["components/workflow-canvas.css"],
  react: "components/workflow-canvas.tsx",
  reactImport: "@noorddev/vlak-react/components/workflow-canvas",
  dependencies: ["@xyflow/react"],
  styles: ["@noorddev/vlak-react/workflow.css"],
  registryDependencies: ["button", "canvas-controls", "toolbar"],
  snippet: '<section class="rs-workflow-canvas" aria-label="Workflow"><div class="rs-workflow-canvas-node"><header class="rs-workflow-canvas-header"><div class="rs-workflow-canvas-title">Review brief</div></header><div class="rs-workflow-canvas-content">Summarize the supplied document.</div></div></section>',
  example: "\"use client\";\nimport \"@noorddev/vlak-react/workflow.css\";\nimport { addEdge, useNodesState, useEdgesState, type Edge } from \"@xyflow/react\";\nimport { WorkflowCanvas, WorkflowControls, WorkflowPanel, type WorkflowGraphNode } from \"@noorddev/vlak-react/components/workflow-canvas\";\n\nexport function ReviewWorkflow() {\n  const [nodes, , onNodesChange] = useNodesState<WorkflowGraphNode>([\n    { id: \"brief\", type: \"vlak\", position: { x: 0, y: 0 }, data: { title: \"Read brief\", target: false } },\n    { id: \"review\", type: \"vlak\", position: { x: 380, y: 0 }, data: { title: \"Review\", source: false } },\n  ]);\n  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);\n  return <WorkflowCanvas nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}\n    onConnect={connection => setEdges(current => addEdge({ ...connection, type: \"vlak\" }, current))}>\n    <WorkflowControls />\n    <WorkflowPanel position=\"top-left\">Review workflow</WorkflowPanel>\n  </WorkflowCanvas>;\n}",
  usage: {
    use: ["Import this optional entry and its stylesheet only where a graph is needed. React Flow is an optional peer dependency.", "Supply nodes, edges, and change callbacks for a controlled graph, or defaultNodes and defaultEdges for engine-owned state. The application persists and executes the graph.", "Use type=vlak for the supplied node and edge renderers. Custom nodeTypes can compose WorkflowNode and WorkflowToolbar; custom connection lines can use WorkflowConnection.", "WorkflowPanel anchors overlays in six viewport positions. WorkflowToolbar stays anchored to a selected node and composes Vlak's keyboard-aware Toolbar.", "WorkflowControls binds the existing CanvasControls to pan, zoom, fit, reset, and interaction lock. React Flow props remain available, including connection validation, viewport changes, and accessibility configuration.", "For copied source, import @xyflow/react/dist/base.css in a CSS layer named vlak.engine before vlak.components. The package's workflow.css supplies that ordering.", "Set an explicit height through style when the default 32rem does not suit the container. Use a separate form or Patchbay when users need keyboard-only creation of connections."],
    avoid: ["Using Flow, an ordered pipeline layout, as an interactive graph engine.", "Turning off React Flow's keyboard accessibility without supplying equivalent controls.", "Treating a connected graph as executed work. Execution, persistence, permissions, and undo history belong to the application."],
  },
  keyboard: [
    { keys: "Tab", does: "Focuses nodes, edges, viewport controls, and supplied actions" },
    { keys: "Enter, Space", does: "Selects a focused node or edge through React Flow" },
    { keys: "Arrow keys", does: "Moves a selected, draggable node; moves between actions inside the node toolbar" },
    { keys: "Delete, Backspace", does: "Deletes selected graph elements through the supplied change callbacks" },
    { keys: "Escape", does: "Cancels the current graph selection or connection gesture" },
  ],
  a11y: ["React Flow supplies keyboard movement, focusable nodes and edges, instruction text, and movement announcements. ariaLabelConfig can localize those messages.", "Visible connection handles have 44px pointer targets. The application should provide a form-based connection action for keyboard-only creation.", "The node action Toolbar retains its single Tab stop and arrow-key focus movement.", "Animated edges stop moving with reduced motion. Surfaces use Vlak paper, ink, hairlines, and 4px corners."],
  aliases: ["AI Elements Canvas", "AI Elements Connection", "AI Elements Controls", "AI Elements Edge", "AI Elements Node", "AI Elements Panel", "AI Elements Toolbar", "React Flow", "WorkflowCanvas", "WorkflowNode", "WorkflowEdge", "WorkflowConnection", "WorkflowControls", "WorkflowPanel", "WorkflowToolbar", "Interactive graph"],
}];
