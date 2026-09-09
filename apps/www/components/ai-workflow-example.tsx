"use client";

import { useCallback, useState } from "react";
import { addEdge, useEdgesState, useNodesState, useReactFlow, type Connection, type NodeProps } from "@xyflow/react";
import { Button, Select } from "@noorddev/vlak-react";
import { WorkflowCanvas, WorkflowControls, WorkflowNode, WorkflowPanel, WorkflowToolbar, type WorkflowGraphNode } from "@noorddev/vlak-react/components/workflow-canvas";
import "@noorddev/vlak-react/workflow.css";

const initialNodes: WorkflowGraphNode[] = [
  { id: "brief", type: "vlak", position: { x: 0, y: 40 }, data: { title: "Read brief", description: "Document input", content: "launch-brief.md", target: false } },
  { id: "review", type: "vlak", position: { x: 380, y: 40 }, data: { title: "Review", description: "Summarize the supplied scope", content: "Ready for a source", footer: "Waiting" } },
  { id: "publish", type: "vlak", position: { x: 760, y: 40 }, data: { title: "Prepare draft", description: "Keep the result for review", content: "Approval required", source: false } },
];
function ReviewNode({ id, data, selected, isConnectable }: NodeProps<WorkflowGraphNode>) {
  const flow = useReactFlow();
  return <><WorkflowToolbar label={`${data.title} actions`} actions={[
    { id: "review", label: "Mark reviewed", onAction: () => flow.updateNodeData(id, { footer: "Reviewed locally" }) },
    { id: "remove", label: "Remove", onAction: () => { void flow.deleteElements({ nodes: [{ id }] }); } },
  ]} /><WorkflowNode title={data.title} description={data.description} source={data.source} target={data.target} selected={selected} connectable={isConnectable} footer={data.footer}>{data.content}</WorkflowNode></>;
}
const nodeTypes = { vlak: ReviewNode };

export function WorkflowExample({ formLabel = "Connect workflow steps" }: { formLabel?: string } = {}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([{ id: "brief-review", source: "brief", target: "review", type: "vlak" }]);
  const [source, setSource] = useState("review");
  const [target, setTarget] = useState("publish");
  const [message, setMessage] = useState("");
  const connect = useCallback((connection: Connection) => {
    if (connection.source === connection.target) { setMessage("Choose two different steps."); return; }
    setEdges(current => addEdge({ ...connection, type: "vlak" }, current));
    setMessage("Connection added.");
  }, [setEdges]);
  return <div style={{ display: "grid", gap: 24, width: "100%" }}>
    <WorkflowCanvas nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={connect} isValidConnection={connection => connection.source !== connection.target} style={{ height: "30rem" }}>
      <WorkflowPanel position="top-left">{nodes.length} {nodes.length === 1 ? "step" : "steps"} · {edges.length} {edges.length === 1 ? "connection" : "connections"}</WorkflowPanel>
      <WorkflowPanel position="top-right"><Button variant="subtle" onClick={() => { setNodes(initialNodes); setEdges([{ id: "brief-review", source: "brief", target: "review", type: "vlak" }]); setMessage("Workflow reset."); }}>Reset</Button></WorkflowPanel>
      <WorkflowControls />
    </WorkflowCanvas>
    <form aria-label={formLabel} style={{ display: "flex", gap: 12, alignItems: "end", flexWrap: "wrap" }} onSubmit={event => { event.preventDefault(); connect({ source, target, sourceHandle: null, targetHandle: null }); }}>
      <Select aria-label="Source step" value={source} onValueChange={setSource} options={nodes.filter(node => node.data.source !== false).map(node => ({ value: node.id, label: node.data.title }))} />
      <Select aria-label="Target step" value={target} onValueChange={setTarget} options={nodes.filter(node => node.data.target !== false).map(node => ({ value: node.id, label: node.data.title }))} />
      <Button type="submit" variant="subtle" disabled={source === target || !nodes.some(node => node.id === source) || !nodes.some(node => node.id === target)}>Connect steps</Button>
    </form>
    <p role="status">{message || "Drag the nodes, connect their handles, or use the form. Select a node to reveal its actions."}</p>
  </div>;
}
