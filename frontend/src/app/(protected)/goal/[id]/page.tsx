"use client";

import React, { useCallback, useRef } from "react";
import {
  Background,
  ReactFlow,
  addEdge,
  ConnectionLineType,
  Panel,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
  Position,
  ReactFlowProvider,
} from "@xyflow/react";
import dagre from "@dagrejs/dagre";

import "@xyflow/react/dist/style.css";

const position = { x: 0, y: 0 };
const edgeType = "default";

export const initialNodes: Node[] = [
  {
    id: "1",
    type: "input",
    data: { label: "input" },
    position,
  },
  {
    id: "2",
    data: { label: "node 2" },
    position,
  },
  {
    id: "2a",
    data: { label: "node 2a" },
    position,
  },
  {
    id: "2b",
    data: { label: "node 2b" },
    position,
  },
  {
    id: "2c",
    data: { label: "node 2c" },
    position,
  },
  {
    id: "2d",
    data: { label: "node 2d" },
    position,
  },
  {
    id: "3",
    data: { label: "node 3" },
    position,
  },
];

export const initialEdges: Edge[] = [
  {
    id: "e12",
    source: "1",
    target: "2",
    type: "bezier",
    animated: false,
    markerEnd: { type: "arrowclosed" },
  },
  {
    id: "e13",
    source: "1",
    target: "3",
    type: "bezier",
    animated: false,
    markerEnd: { type: "arrowclosed" },
  },
  {
    id: "e22a",
    source: "2",
    target: "2a",
    type: "bezier",
    animated: false,
    markerEnd: { type: "arrowclosed" },
  },
  {
    id: "e22b",
    source: "2",
    target: "2b",
    type: "bezier",
    animated: false,
    markerEnd: { type: "arrowclosed" },
  },
  {
    id: "e22c",
    source: "2",
    target: "2c",
    type: "bezier",
    animated: false,
    markerEnd: { type: "arrowclosed" },
  },
  {
    id: "e2c2d",
    source: "2c",
    target: "2d",
    type: "bezier",
    animated: false,
    markerEnd: { type: "arrowclosed" },
  },
];

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction = "TB"
) => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      targetPosition: (isHorizontal ? Position.Left : Position.Top) as Position,
      sourcePosition: (isHorizontal
        ? Position.Right
        : Position.Bottom) as Position,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };

    return newNode;
  });

  return { nodes: newNodes, edges };
};

function FlowComponent() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowInstance = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge({ ...params, type: "bezier", animated: false }, eds)
      ),
    [setEdges]
  );

  const onLayout = useCallback(
    (direction: string) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(nodes, edges, direction);

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);

      // Fit view after layout changes
      setTimeout(() => {
        reactFlowInstance.current?.fitView({ padding: 0.2 });
      }, 0);
    },
    [nodes, edges, setNodes, setEdges]
  );

  // Apply initial layout
  React.useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);

    // Fit view after initial layout
    setTimeout(() => {
      reactFlowInstance.current?.fitView({ padding: 0.2 });
    }, 100);
  }, [setNodes, setEdges]);

  return (
    <div className="h-screen w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        connectionLineType={ConnectionLineType.Bezier}
        ref={reactFlowInstance}
        fitView
        fitViewOptions={{ padding: 0.2, includeHiddenNodes: false }}
        defaultEdgeOptions={{ markerEnd: { type: "arrowclosed" } }}
      >
        <Background />
      </ReactFlow>
    </div>
  );
}

export default function GoalPage({ params }: { params: { id: string } }) {
  return (
    <ReactFlowProvider>
      <FlowComponent />
    </ReactFlowProvider>
  );
}
