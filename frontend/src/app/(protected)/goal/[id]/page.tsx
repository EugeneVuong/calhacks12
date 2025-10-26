"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
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
import { NodeDetailModal } from "@/components/goals/node-detail-modal";
import { CustomNode } from "@/components/goals/custom-node";

import "@xyflow/react/dist/style.css";

// Custom styles for better node appearance
const nodeStyles = `
  .react-flow__node {
    cursor: pointer;
  }
  .react-flow__node:hover {
    transform: scale(1.05);
    transition: transform 0.2s ease;
  }
  .react-flow__handle {
    background: #3b82f6;
    border: 2px solid white;
  }
  .react-flow__handle:hover {
    background: #2563eb;
  }
`;

const position = { x: 0, y: 0 };

// Define different node trees for different prompts
const promptNodeTrees: Record<string, { nodes: Node[]; edges: Edge[] }> = {
  "Machine Learning Fundamentals": {
    nodes: [
      { id: "ml-1", type: "input", data: { label: "ML Fundamentals" }, position },
      { id: "ml-2", data: { label: "Linear Algebra" }, position },
      { id: "ml-3", data: { label: "Calculus" }, position },
      { id: "ml-4", data: { label: "Probability" }, position },
      { id: "ml-5", data: { label: "Supervised Learning" }, position },
      { id: "ml-6", data: { label: "Unsupervised Learning" }, position },
      { id: "ml-7", data: { label: "Neural Networks" }, position },
      { id: "ml-8", data: { label: "Deep Learning" }, position },
    ],
    edges: [
      { id: "e-ml-12", source: "ml-1", target: "ml-2", type: "bezier", animated: false, markerEnd: { type: "arrowclosed" } },
      { id: "e-ml-13", source: "ml-1", target: "ml-3", type: "bezier", animated: false, markerEnd: { type: "arrowclosed" } },
      { id: "e-ml-14", source: "ml-1", target: "ml-4", type: "bezier", animated: false, markerEnd: { type: "arrowclosed" } },
      { id: "e-ml-25", source: "ml-2", target: "ml-5", type: "bezier", animated: false, markerEnd: { type: "arrowclosed" } },
      { id: "e-ml-35", source: "ml-3", target: "ml-5", type: "bezier", animated: false, markerEnd: { type: "arrowclosed" } },
      { id: "e-ml-45", source: "ml-4", target: "ml-5", type: "bezier", animated: false, markerEnd: { type: "arrowclosed" } },
      { id: "e-ml-26", source: "ml-2", target: "ml-6", type: "bezier", animated: false, markerEnd: { type: "arrowclosed" } },
      { id: "e-ml-57", source: "ml-5", target: "ml-7", type: "bezier", animated: false, markerEnd: { type: "arrowclosed" } },
      { id: "e-ml-78", source: "ml-7", target: "ml-8", type: "bezier", animated: false, markerEnd: { type: "arrowclosed" } },
    ],
  },
  "Web Development Path": {
    nodes: [
      { id: "web-1", type: "input", data: { label: "Web Dev" }, position },
      { id: "web-2", data: { label: "HTML" }, position },
      { id: "web-3", data: { label: "CSS" }, position },
      { id: "web-4", data: { label: "JavaScript" }, position },
      { id: "web-5", data: { label: "React" }, position },
      { id: "web-6", data: { label: "Node.js" }, position },
      { id: "web-7", data: { label: "Databases" }, position },
      { id: "web-8", data: { label: "Full Stack" }, position },
    ],
    edges: [
      { id: "e-web-12", source: "web-1", target: "web-2", type: "bezier", animated: false, markerEnd: { type: "arrowclosed" } },
      { id: "e-web-13", source: "web-1", target: "web-3", type: "bezier", animated: false, markerEnd: { type: "arrowclosed" } },
      { id: "e-web-14", source: "web-1", target: "web-4", type: "bezier", animated: false, markerEnd: { type: "arrowclosed" } },
      { id: "e-web-45", source: "web-4", target: "web-5", type: "bezier", animated: false, markerEnd: { type: "arrowclosed" } },
      { id: "e-web-46", source: "web-4", target: "web-6", type: "bezier", animated: false, markerEnd: { type: "arrowclosed" } },
      { id: "e-web-67", source: "web-6", target: "web-7", type: "bezier", animated: false, markerEnd: { type: "arrowclosed" } },
      { id: "e-web-58", source: "web-5", target: "web-8", type: "bezier", animated: false, markerEnd: { type: "arrowclosed" } },
      { id: "e-web-68", source: "web-6", target: "web-8", type: "bezier", animated: false, markerEnd: { type: "arrowclosed" } },
    ],
  },
  "Data Science Journey": {
    nodes: [
      { id: "ds-1", type: "input", data: { label: "Data Science" }, position },
      { id: "ds-2", data: { label: "Python" }, position },
      { id: "ds-3", data: { label: "Pandas" }, position },
      { id: "ds-4", data: { label: "NumPy" }, position },
      { id: "ds-5", data: { label: "Visualization" }, position },
      { id: "ds-6", data: { label: "SQL" }, position },
      { id: "ds-7", data: { label: "Statistics" }, position },
      { id: "ds-8", data: { label: "ML Models" }, position },
    ],
    edges: [
      { id: "e-ds-12", source: "ds-1", target: "ds-2", type: "bezier", animated: false, markerEnd: { type: "arrowclosed" } },
      { id: "e-ds-23", source: "ds-2", target: "ds-3", type: "bezier", animated: false, markerEnd: { type: "arrowclosed" } },
      { id: "e-ds-24", source: "ds-2", target: "ds-4", type: "bezier", animated: false, markerEnd: { type: "arrowclosed" } },
      { id: "e-ds-15", source: "ds-1", target: "ds-5", type: "bezier", animated: false, markerEnd: { type: "arrowclosed" } },
      { id: "e-ds-16", source: "ds-1", target: "ds-6", type: "bezier", animated: false, markerEnd: { type: "arrowclosed" } },
      { id: "e-ds-17", source: "ds-1", target: "ds-7", type: "bezier", animated: false, markerEnd: { type: "arrowclosed" } },
      { id: "e-ds-58", source: "ds-5", target: "ds-8", type: "bezier", animated: false, markerEnd: { type: "arrowclosed" } },
      { id: "e-ds-68", source: "ds-6", target: "ds-8", type: "bezier", animated: false, markerEnd: { type: "arrowclosed" } },
    ],
  },
};

export const initialNodes: Node[] = [
  {
    id: "1",
    type: "input",
    data: { 
      label: "Learning Path",
      topic: "Learning Path",
      resources: [
        {
          title: "Getting Started Guide",
          url: "https://example.com/guide",
          type: "Documentation",
          description: "A comprehensive guide to get you started"
        }
      ],
      quiz_questions: [
        {
          question: "What is the first step in any learning journey?",
          options: {
            A: "Set clear goals",
            B: "Start immediately",
            C: "Read everything",
            D: "Ask for help"
          },
          correct_answer: "A",
          explanation: "Setting clear goals helps you stay focused and motivated throughout your learning journey."
        }
      ],
      related_harder_topics: ["Advanced Techniques", "Specialization"]
    },
    position,
  },
  {
    id: "2",
    data: { 
      label: "Fundamentals",
      topic: "Fundamentals",
      resources: [
        {
          title: "Basic Concepts Tutorial",
          url: "https://example.com/basics",
          type: "Tutorial",
          description: "Learn the fundamental concepts"
        },
        {
          title: "Practice Exercises",
          url: "https://example.com/practice",
          type: "Exercise",
          description: "Hands-on practice with basic concepts"
        }
      ],
      quiz_questions: [
        {
          question: "Which of the following is most important when learning fundamentals?",
          options: {
            A: "Speed",
            B: "Understanding",
            C: "Memorization",
            D: "Perfection"
          },
          correct_answer: "B",
          explanation: "Understanding the fundamentals deeply is more important than speed or memorization."
        },
        {
          question: "How should you approach learning new concepts?",
          options: {
            A: "Skip the basics",
            B: "Build on previous knowledge",
            C: "Learn everything at once",
            D: "Avoid practice"
          },
          correct_answer: "B",
          explanation: "Building on previous knowledge helps create strong foundations for future learning."
        }
      ],
      related_harder_topics: ["Intermediate Concepts", "Advanced Applications"]
    },
    position,
  },
  {
    id: "2a",
    data: { 
      label: "Practice",
      topic: "Practice",
      resources: [
        {
          title: "Interactive Exercises",
          url: "https://example.com/interactive",
          type: "Interactive",
          description: "Hands-on interactive learning"
        }
      ],
      quiz_questions: [
        {
          question: "What is the best way to practice?",
          options: {
            A: "Once a week",
            B: "Consistently daily",
            C: "Only when motivated",
            D: "In large chunks"
          },
          correct_answer: "B",
          explanation: "Consistent daily practice is more effective than sporadic large sessions."
        }
      ],
      related_harder_topics: ["Mastery", "Expertise"]
    },
    position,
  },
  {
    id: "2b",
    data: { 
      label: "Application",
      topic: "Application",
      resources: [
        {
          title: "Real-world Projects",
          url: "https://example.com/projects",
          type: "Project",
          description: "Apply your knowledge in real projects"
        }
      ],
      quiz_questions: [
        {
          question: "When should you start applying what you learn?",
          options: {
            A: "After mastering everything",
            B: "Immediately while learning",
            C: "Only in formal settings",
            D: "Never"
          },
          correct_answer: "B",
          explanation: "Applying knowledge immediately helps reinforce learning and identify gaps."
        }
      ],
      related_harder_topics: ["Advanced Projects", "Professional Development"]
    },
    position,
  },
  {
    id: "2c",
    data: { 
      label: "Review",
      topic: "Review",
      resources: [
        {
          title: "Review Techniques",
          url: "https://example.com/review",
          type: "Guide",
          description: "Effective review strategies"
        }
      ],
      quiz_questions: [
        {
          question: "How often should you review material?",
          options: {
            A: "Never",
            B: "Only before exams",
            C: "Regularly at spaced intervals",
            D: "Once and forget"
          },
          correct_answer: "C",
          explanation: "Regular spaced review helps move information from short-term to long-term memory."
        }
      ],
      related_harder_topics: ["Mastery", "Retention Strategies"]
    },
    position,
  },
  {
    id: "2d",
    data: { 
      label: "Assessment",
      topic: "Assessment",
      resources: [
        {
          title: "Self-Assessment Tools",
          url: "https://example.com/assessment",
          type: "Tool",
          description: "Evaluate your progress"
        }
      ],
      quiz_questions: [
        {
          question: "What is the purpose of assessment?",
          options: {
            A: "To pass tests",
            B: "To identify strengths and weaknesses",
            C: "To compare with others",
            D: "To avoid learning"
          },
          correct_answer: "B",
          explanation: "Assessment helps identify what you know well and what needs more attention."
        }
      ],
      related_harder_topics: ["Advanced Assessment", "Performance Optimization"]
    },
    position,
  },
  {
    id: "3",
    data: { 
      label: "Mastery",
      topic: "Mastery",
      resources: [
        {
          title: "Advanced Techniques",
          url: "https://example.com/advanced",
          type: "Advanced",
          description: "Master-level techniques and strategies"
        }
      ],
      quiz_questions: [
        {
          question: "What characterizes mastery?",
          options: {
            A: "Knowing everything",
            B: "Being able to teach others",
            C: "Perfect scores",
            D: "Speed"
          },
          correct_answer: "B",
          explanation: "True mastery is demonstrated by the ability to teach and explain concepts to others."
        }
      ],
      related_harder_topics: ["Expertise", "Innovation"]
    },
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

function FlowComponent({ 
  nodes: propNodes, 
  edges: propEdges, 
  onNodeClick 
}: { 
  nodes: Node[]; 
  edges: Edge[];
  onNodeClick: (nodeData: any) => void;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(propNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(propEdges);
  const reactFlowInstance = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  const onInit = useCallback((instance: any) => {
    reactFlowInstance.current = instance;
  }, []);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge({ ...params, type: "bezier", animated: false }, eds)
      ),
    [setEdges]
  );

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      onNodeClick(node.data);
    },
    [onNodeClick]
  );

  const onLayout = useCallback(
    (direction: string) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(nodes, edges, direction);

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);

      // Fit view after layout changes
      setTimeout(() => {
        if (reactFlowInstance.current && typeof reactFlowInstance.current.fitView === 'function') {
          reactFlowInstance.current.fitView({ padding: 0.2 });
        }
      }, 0);
    },
    [nodes, edges, setNodes, setEdges]
  );

  // Update nodes and edges when props change
  useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      propNodes,
      propEdges
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);

    // Fit view after layout changes
    setTimeout(() => {
      if (reactFlowInstance.current && typeof reactFlowInstance.current.fitView === 'function') {
        reactFlowInstance.current.fitView({ padding: 0.2 });
      }
    }, 100);
  }, [propNodes, propEdges, setNodes, setEdges]);

  return (
    <div className="h-screen w-full">
      <style>{nodeStyles}</style>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        onNodeClick={handleNodeClick}
        connectionLineType={ConnectionLineType.Bezier}
        fitView
        fitViewOptions={{ padding: 0.2, includeHiddenNodes: false }}
        defaultEdgeOptions={{ markerEnd: { type: "arrowclosed" } }}
        nodeTypes={{
          default: CustomNode,
          input: CustomNode,
          output: CustomNode,
        }}
      >
        <Background />
        <Panel position="top-right" className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="text-sm text-gray-600">
            <p className="font-medium">💡 Click on any node to explore resources and take quizzes!</p>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default function GoalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [dynamicSkillTrees, setDynamicSkillTrees] = useState<Record<string, { nodes: Node[]; edges: Edge[] }>>({});
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Load dynamically generated skill trees from sessionStorage
    const storedTrees = sessionStorage.getItem('skill-trees');
    if (storedTrees) {
      try {
        const treeTitles = JSON.parse(storedTrees);
        const trees: Record<string, { nodes: Node[]; edges: Edge[] }> = {};
        
        treeTitles.forEach((title: string) => {
          const treeData = sessionStorage.getItem(`skill-tree-${title}`);
          if (treeData) {
            const data = JSON.parse(treeData);
            // Convert the backend format to ReactFlow format
            trees[title] = convertToReactFlowFormat(data);
          }
        });
        
        setDynamicSkillTrees(trees);
      } catch (e) {
        console.error('Error loading skill trees:', e);
      }
    }
    
    // Load selected prompt from sessionStorage
    const saved = sessionStorage.getItem(`goal-${id}-prompt`);
    if (saved && (promptNodeTrees[saved] || dynamicSkillTrees[saved])) {
      setSelectedPrompt(saved);
    }
    
    const handlePromptChange = (event: CustomEvent) => {
      const newPrompt = event.detail.prompt;
      if (promptNodeTrees[newPrompt] || dynamicSkillTrees[newPrompt]) {
        setIsTransitioning(true);
        setTimeout(() => {
          setSelectedPrompt(newPrompt);
          setTimeout(() => setIsTransitioning(false), 150);
        }, 200);
      }
    };

    window.addEventListener('promptChanged', handlePromptChange as EventListener);
    
    return () => {
      window.removeEventListener('promptChanged', handlePromptChange as EventListener);
    };
  }, [id, dynamicSkillTrees]);
  
  useEffect(() => {
    // Re-check when dynamicSkillTrees changes
    const saved = sessionStorage.getItem(`goal-${id}-prompt`);
    if (saved && (promptNodeTrees[saved] || dynamicSkillTrees[saved])) {
      setSelectedPrompt(saved);
    }
  }, [dynamicSkillTrees, id]);
  
  function convertToReactFlowFormat(data: any): { nodes: Node[]; edges: Edge[] } {
    const nodes = data.nodes.map((node: any) => ({
      id: node.id,
      type: node.type || 'default',
      data: { label: node.label },
      position: position,
    }));
    
    const edges = data.edges.map((edge: any) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type || 'bezier',
      animated: edge.animated || false,
      markerEnd: edge.markerEnd || { type: "arrowclosed" },
    }));
    
    return { nodes, edges };
  }
  
  // Merge static and dynamic skill trees
  const allSkillTrees = { ...promptNodeTrees, ...dynamicSkillTrees };

  // Always use initial nodes/edges to prevent hydration mismatch
  // Only change after component is mounted and we have the selected prompt
  const currentPromptData = isMounted && selectedPrompt ? allSkillTrees[selectedPrompt] : null;
  const currentNodes = currentPromptData?.nodes || initialNodes;
  const currentEdges = currentPromptData?.edges || initialEdges;
  
  // Ensure consistent rendering between server and client
  const opacityClass = (isMounted && isTransitioning) ? 'opacity-20' : 'opacity-100';

  const handleNodeClick = (nodeData: any) => {
    setSelectedNode(nodeData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNode(null);
  };

  return (
    <div className={`h-screen w-full transition-opacity duration-200 ${opacityClass}`} suppressHydrationWarning>
      <ReactFlowProvider>
        <FlowComponent 
          nodes={currentNodes} 
          edges={currentEdges} 
          onNodeClick={handleNodeClick}
        />
      </ReactFlowProvider>
      <NodeDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        nodeData={selectedNode}
      />
    </div>
  );
}
