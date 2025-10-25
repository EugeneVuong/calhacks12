"use client";

import { useState, useMemo } from "react";

interface HierarchicalNode {
  id: string;
  name: string;
  type: string;
  status: string;
  parent?: string;
  children?: HierarchicalNode[];
  depth?: number;
}

interface SkillTreeData {
  id: string;
  name: string;
  type: string;
  status: string;
  parent?: string;
}

function HierarchicalSkillTree({
  skills,
  links,
}: {
  skills: SkillTreeData[];
  links: { source: string; target: string }[];
}) {
  const [selectedNode, setSelectedNode] = useState<HierarchicalNode | null>(
    null
  );
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(["emotional-intelligence"])
  );

  // Create hierarchical data structure
  const hierarchicalData = useMemo(() => {
    // Create root node for emotional intelligence
    const rootData: SkillTreeData[] = [
      {
        id: "emotional-intelligence",
        name: "Emotional Intelligence",
        type: "Core Skill",
        status: "Done",
      },
    ];

    // Add all skills as children of emotional intelligence
    skills.forEach((skill) => {
      if (skill.id !== "emotional-intelligence") {
        rootData.push({
          ...skill,
          parent: "emotional-intelligence",
        });
      }
    });

    // Build hierarchy manually
    const buildHierarchy = (data: SkillTreeData[]): HierarchicalNode[] => {
      const nodeMap = new Map<string, HierarchicalNode>();
      const rootNodes: HierarchicalNode[] = [];

      // Create all nodes
      data.forEach((item) => {
        nodeMap.set(item.id, {
          id: item.id,
          name: item.name,
          type: item.type,
          status: item.status,
          parent: item.parent,
          children: [],
          depth: 0,
        });
      });

      // Build parent-child relationships
      data.forEach((item) => {
        const node = nodeMap.get(item.id)!;
        if (item.parent) {
          const parent = nodeMap.get(item.parent);
          if (parent) {
            if (!parent.children) parent.children = [];
            parent.children.push(node);
            node.depth = (parent.depth || 0) + 1;
          }
        } else {
          rootNodes.push(node);
        }
      });

      return rootNodes;
    };

    return buildHierarchy(rootData);
  }, [skills]);

  const toggleExpanded = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Done":
      case "completed":
        return "bg-green-500";
      case "In Process":
      case "in-progress":
        return "bg-yellow-500";
      case "not-started":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "Done":
      case "completed":
        return "Completed";
      case "In Process":
      case "in-progress":
        return "In Progress";
      case "not-started":
        return "Not Started";
      default:
        return "Unknown";
    }
  };

  const renderNode = (node: HierarchicalNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);

    return (
      <div key={node.id} className="mb-2">
        <div
          className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
            selectedNode?.id === node.id
              ? "ring-2 ring-blue-500 bg-blue-50"
              : "bg-white"
          }`}
          style={{ marginLeft: `${level * 20}px` }}
          onClick={() => setSelectedNode(node)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(node.id);
              }}
              className="mr-2 w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200"
            >
              {isExpanded ? "−" : "+"}
            </button>
          )}
          {!hasChildren && <div className="w-6 h-6 mr-2" />}

          <div
            className={`w-3 h-3 rounded-full mr-3 ${getStatusColor(
              node.status
            )}`}
          />

          <div className="flex-1">
            <h3 className="font-semibold text-lg">{node.name}</h3>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Type:</span> {node.type} |
              <span className="font-medium ml-1">Status:</span>{" "}
              {getStatusText(node.status)}
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-2">
            {node.children!.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!hierarchicalData || hierarchicalData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">No Skills Available</h3>
          <p className="text-muted-foreground">
            No skill data found to display
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6 overflow-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Hierarchical Skills Tree</h2>
        <p className="text-gray-600">
          Click on any skill to view details, use +/− to expand/collapse
        </p>
      </div>

      <div className="space-y-2">
        {hierarchicalData.map((node) => renderNode(node))}
      </div>

      {/* Selected skill details */}
      {selectedNode && (
        <div className="fixed top-4 right-4 bg-white p-6 rounded-lg shadow-lg border max-w-sm z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">{selectedNode.name}</h3>
            <button
              onClick={() => setSelectedNode(null)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
            >
              Close
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold mb-2">Skill Information</h4>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">ID:</span> {selectedNode.id}
                </p>
                <p>
                  <span className="font-medium">Type:</span> {selectedNode.type}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  {getStatusText(selectedNode.status)}
                </p>
                <p>
                  <span className="font-medium">Depth:</span>{" "}
                  {selectedNode.depth || 0}
                </p>
              </div>
            </div>

            {selectedNode.children && selectedNode.children.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Child Skills</h4>
                <div className="space-y-1">
                  {selectedNode.children.map((child) => (
                    <div key={child.id} className="text-sm text-gray-600">
                      {child.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-semibold mb-2">Related Skills</h4>
              <div className="space-y-1">
                {links
                  .filter(
                    (link) =>
                      link.source === selectedNode.id ||
                      link.target === selectedNode.id
                  )
                  .map((link, index) => {
                    const relatedSkillId =
                      link.source === selectedNode.id
                        ? link.target
                        : link.source;
                    const relatedSkill = skills.find(
                      (s) => s.id === relatedSkillId
                    );
                    return (
                      <div key={index} className="text-sm text-gray-600">
                        {relatedSkill?.name || relatedSkillId}
                      </div>
                    );
                  })}
                {links.filter(
                  (link) =>
                    link.source === selectedNode.id ||
                    link.target === selectedNode.id
                ).length === 0 && (
                  <p className="text-sm text-gray-500">No related skills</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { HierarchicalSkillTree };
export type { HierarchicalNode, SkillTreeData };
