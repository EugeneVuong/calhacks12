"use client";

import React from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import { BookOpen, HelpCircle } from "lucide-react";

export function CustomNode({ data, selected }: NodeProps) {
  const hasResources = data.resources && data.resources.length > 0;
  const hasQuizzes = data.quiz_questions && data.quiz_questions.length > 0;

  return (
    <div 
      className={`px-3 py-2 bg-white rounded-lg`}
    >
      <div className="text-center">
        <h3 className="font-semibold text-sm mb-1.5">{data.label}</h3>
        
        <div className="flex justify-center gap-1.5">
          {hasResources && (
            <Badge variant="secondary" className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 h-5">
              <BookOpen className="h-2.5 w-2.5" />
              {data.resources.length}
            </Badge>
          )}
          {hasQuizzes && (
            <Badge variant="outline" className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 h-5">
              <HelpCircle className="h-2.5 w-2.5" />
              {data.quiz_questions.length}
            </Badge>
          )}
        </div>
      </div>
      
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-blue-500"
      />
    </div>
  );
}
