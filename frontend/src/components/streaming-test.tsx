"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StreamingTest() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [error, setError] = useState("");

  const testStreaming = async () => {
    setIsStreaming(true);
    setStreamedText("");
    setError("");

    try {
      const response = await fetch("/api/letta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: "Tell me a short story about a robot learning to paint.",
          agentId: "agent-afeee9a5-ad56-48e8-952b-dc8371a75ca4",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.trim() === '' || !line.startsWith('data: ')) continue;
          
          try {
            const data = JSON.parse(line.slice(6)); // Remove 'data: ' prefix
            
            if (data.error) {
              throw new Error(data.error);
            }
            
            if (data.content) {
              fullContent += data.content;
              setStreamedText(fullContent);
              console.log('Streaming chunk:', data.content);
            }
            
            if (data.done) {
              setIsStreaming(false);
              return;
            }
          } catch (e) {
            console.warn('Failed to parse streaming data:', line, e);
            continue;
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsStreaming(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Streaming Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testStreaming} 
            disabled={isStreaming}
            className="w-full"
          >
            {isStreaming ? "Streaming..." : "Test Streaming"}
          </Button>

          {isStreaming && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-blue-600 text-sm">Streaming response...</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">Error: {error}</p>
            </div>
          )}

          {streamedText && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-medium text-green-800 mb-2">Streamed Response:</h3>
              <p className="text-green-700 whitespace-pre-wrap">{streamedText}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
