"use client";

import { useState, useCallback } from "react";
import { ChatInput } from "@/components/chatbox/chat-input";
import { generateRoadmap } from "@/lib/api";
import {
  createRoadmap,
  updateRoadmap,
  updateRoadmapError,
  subscribeToRoadmap,
} from "@/lib/roadmap-service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [currentMode, setCurrentMode] = useState<string>("Teacher Mode");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      setIsLoading(true);
      let roadmapId: string | null = null;

      try {
        // Create pending roadmap in Firebase
        roadmapId = await createRoadmap(text);
        toast.info("Generating your learning roadmap...", {
          description:
            "This may take a moment. You can navigate away and we'll notify you when it's ready.",
        });

        // Subscribe to roadmap changes to detect completion
        const unsubscribe = subscribeToRoadmap(roadmapId, (roadmap) => {
          if (roadmap?.status === "completed") {
            toast.success("Roadmap ready!", {
              description:
                "Your learning roadmap has been generated successfully.",
            });
            unsubscribe();
          } else if (roadmap?.status === "error") {
            toast.error("Failed to generate roadmap", {
              description: roadmap.error || "An error occurred",
            });
            unsubscribe();
          }
        });

        // Call backend to generate roadmap
        const result = await generateRoadmap(text);

        // Update Firebase with generated data
        await updateRoadmap(roadmapId, result.nodes, result.edges);

        // Redirect to roadmap page
        router.push(`/roadmap/${roadmapId}`);
      } catch (error) {
        console.error("Error generating roadmap:", error);

        // Update Firebase with error status
        if (roadmapId) {
          await updateRoadmapError(
            roadmapId,
            error instanceof Error
              ? error.message
              : "Failed to generate roadmap"
          );
        }

        toast.error("Failed to generate roadmap", {
          description:
            error instanceof Error
              ? error.message
              : "An error occurred while generating your roadmap",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, router]
  );

  const handleModeChange = (mode: string) => {
    setCurrentMode(mode);
  };

  const getTitle = () => {
    if (currentMode === "Teacher Mode") {
      return "Hello! What do you want to learn today?";
    } else if (currentMode === "Mentor Mode") {
      return "Hello! What are going to be checking on today?";
    }
    return "Hello! What do you want to learn today?";
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto min-h-screen">
      <h1 className="text-2xl font-bold mb-4">{getTitle()}</h1>
      <div className="w-full relative">
        <ChatInput onSend={handleSend} onModeChange={handleModeChange} />
        {isLoading && (
          <div className="absolute top-2 right-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
        )}
      </div>
    </div>
  );
}
