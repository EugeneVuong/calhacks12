import type { Metadata } from "next";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Chatbot from "@/components/chatbox";
import { AppSidebar } from "@/components/sidebar";

export const metadata: Metadata = {
  title: "Home",
  description: "Home section",
};

export default function HomeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-screen w-full overflow-hidden">
        <ResizablePanelGroup
          direction="horizontal"
          className="w-full overflow-y-auto"
        >
          <ResizablePanel>
            <main className="flex h-screen w-full">{children}</main>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            collapsible={true}
            collapsedSize={35}
            minSize={0}
            className="h-full overflow-y-auto"
          >
            <aside className="flex h-screen w-full">
              <Chatbot />
            </aside>
          </ResizablePanel>
        </ResizablePanelGroup>
      </SidebarInset>
    </SidebarProvider>
  );
}
