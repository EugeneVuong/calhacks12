"use client";

import { useState } from "react";

interface SkillNode {
  id: string;
  name: string;
  type: string;
  status: string;
}

interface SkillLink {
  source: string | SkillNode;
  target: string | SkillNode;
}

interface SkillTreeProps {
  skills: SkillNode[];
  links: SkillLink[];
}

function SkillTree({ skills, links }: SkillTreeProps) {
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);

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

  return (
    <div className="w-full h-full min-h-[400px] p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Skills Overview</h2>
        <p className="text-gray-600">Click on any skill to view details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <div
            key={skill.id}
            className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
              selectedNode?.id === skill.id ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={() => setSelectedNode(skill)}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">{skill.name}</h3>
              <div
                className={`w-3 h-3 rounded-full ${getStatusColor(
                  skill.status
                )}`}
              />
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium">Type:</span> {skill.type}
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                {getStatusText(skill.status)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Selected skill details */}
      {selectedNode && (
        <div className="mt-6 p-6 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">{selectedNode.name}</h3>
            <button
              onClick={() => setSelectedNode(null)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
            >
              Close Details
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Skill Information</h4>
              <div className="space-y-2">
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
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Related Skills</h4>
              <div className="space-y-1">
                {links
                  .filter(
                    (link) =>
                      (typeof link.source === "string"
                        ? link.source
                        : link.source.id) === selectedNode.id ||
                      (typeof link.target === "string"
                        ? link.target
                        : link.target.id) === selectedNode.id
                  )
                  .map((link, index) => {
                    const relatedSkillId =
                      (typeof link.source === "string"
                        ? link.source
                        : link.source.id) === selectedNode.id
                        ? typeof link.target === "string"
                          ? link.target
                          : link.target.id
                        : typeof link.source === "string"
                        ? link.source
                        : link.source.id;
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
                    (typeof link.source === "string"
                      ? link.source
                      : link.source.id) === selectedNode.id ||
                    (typeof link.target === "string"
                      ? link.target
                      : link.target.id) === selectedNode.id
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

export { SkillTree };
export type { SkillNode, SkillLink };
