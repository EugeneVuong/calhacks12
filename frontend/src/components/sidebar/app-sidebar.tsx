"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Target } from "lucide-react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

// User data
const userData = {
  name: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/shadcn.jpg",
};

// Prompts list (static examples)
const staticPrompts = [
  "Machine Learning Fundamentals",
  "Web Development Path",
  "Data Science Journey",
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const isGoalDetailPage = pathname?.startsWith("/goal/") && pathname !== "/goal";
  const [selectedPrompt, setSelectedPrompt] = React.useState<string | null>(null);
  const [isMounted, setIsMounted] = React.useState(false);
  const [skillTrees, setSkillTrees] = React.useState<string[]>([]);
  const [showInput, setShowInput] = React.useState(false);
  const [newPrompt, setNewPrompt] = React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);

  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
      isActive: pathname === "/dashboard",
    },
    {
      title: "Goal",
      url: "/goal",
      icon: Target,
      isActive: pathname === "/goal",
    },
  ];

  // Load selected prompt from sessionStorage (client-only)
  React.useEffect(() => {
    // Ensure we're on the client before accessing window
    if (typeof window === 'undefined') return;
    
    setIsMounted(true);
    
    // Load stored skill trees
    const stored = sessionStorage.getItem('skill-trees');
    if (stored) {
      try {
        const trees = JSON.parse(stored);
        setSkillTrees(trees);
      } catch (e) {
        console.error('Error loading skill trees:', e);
      }
    }
    
    // Load selected prompt based on current page
    const goalId = pathname?.split("/")[2];
    if (goalId) {
      const saved = sessionStorage.getItem(`goal-${goalId}-prompt`);
      if (saved) {
        setSelectedPrompt(saved);
      }
    }

    const handlePromptChange = (event: CustomEvent) => {
      setSelectedPrompt(event.detail.prompt);
    };

    window.addEventListener('promptChanged', handlePromptChange as EventListener);
    
    return () => {
      window.removeEventListener('promptChanged', handlePromptChange as EventListener);
    };
  }, [pathname]);

  const handleGenerateSkillTree = async () => {
    if (!newPrompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch("/api/skill-tree", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: newPrompt }),
      });

      if (!response.ok) throw new Error("Failed to generate skill tree");

      const data = await response.json();
      
      // Store the skill tree
      const stored = sessionStorage.getItem('skill-trees');
      const trees = stored ? JSON.parse(stored) : [];
      trees.push(data.title);
      sessionStorage.setItem('skill-trees', JSON.stringify(trees));
      
      // Store the tree data
      sessionStorage.setItem(`skill-tree-${data.title}`, JSON.stringify(data));
      
      // Update state
      setSkillTrees(trees);
      setNewPrompt("");
      setShowInput(false);
    } catch (error) {
      console.error("Error generating skill tree:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    // If on a goal detail page, store the selected prompt
    const goalId = pathname?.split("/")[2];
    if (goalId) {
      sessionStorage.setItem(`goal-${goalId}-prompt`, prompt);
      // Dispatch custom event to update the page without reload
      window.dispatchEvent(new CustomEvent('promptChanged', { detail: { prompt } }));
      setSelectedPrompt(prompt);
    } else {
      // If on /goal or /dashboard, navigate to /goal/1 with this prompt selected
      sessionStorage.setItem('goal-1-prompt', prompt);
      router.push('/goal/1');
    }
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <h1 className="font-semibold text-lg group-data-[collapsible=icon]:hidden p-2">
            Mentora
          </h1>
          <SidebarTrigger className="h-8 w-8 p-2" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        
        {/* Show prompts list on all pages */}
        <SidebarGroup suppressHydrationWarning>
            <div className="flex items-center justify-between mb-2">
              <SidebarGroupLabel>Learning Paths</SidebarGroupLabel>
              <button
                onClick={() => setShowInput(!showInput)}
                className="text-sm text-primary hover:text-primary/80 px-2 py-1 rounded"
              >
                {showInput ? "Cancel" : "+ New"}
              </button>
            </div>
            {showInput && (
              <div className="mb-3 p-2 border rounded">
                <input
                  type="text"
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  placeholder="e.g., I want to be an AI Engineer..."
                  className="w-full px-2 py-1 text-sm border rounded mb-2"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !isGenerating) {
                      handleGenerateSkillTree();
                    }
                  }}
                />
                <button
                  onClick={handleGenerateSkillTree}
                  disabled={isGenerating || !newPrompt.trim()}
                  className="w-full px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
                >
                  {isGenerating ? "Generating..." : "Generate"}
                </button>
              </div>
            )}
            <ScrollArea className="h-[calc(100vh-300px)]">
              <SidebarMenu>
                {/* Render dynamic skill trees first */}
                {skillTrees.map((prompt) => (
                  <SidebarMenuItem key={prompt}>
                    <SidebarMenuButton
                      tooltip={prompt}
                      onClick={() => handlePromptClick(prompt)}
                      isActive={isMounted && selectedPrompt === prompt}
                      suppressHydrationWarning
                    >
                      <span className="group-data-[collapsible=icon]:hidden">{prompt}</span>
                      <span className="group-data-[collapsible=icon]:block hidden">
                        {prompt.charAt(0)}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                {/* Then static prompts */}
                {staticPrompts.map((prompt) => (
                  <SidebarMenuItem key={prompt}>
                    <SidebarMenuButton
                      tooltip={prompt}
                      onClick={() => handlePromptClick(prompt)}
                      isActive={isMounted && selectedPrompt === prompt}
                      suppressHydrationWarning
                    >
                      <span className="group-data-[collapsible=icon]:hidden">{prompt}</span>
                      <span className="group-data-[collapsible=icon]:block hidden">
                        {prompt.charAt(0)}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
