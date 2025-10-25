import type { Metadata } from "next";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { AppSidebar } from "@/components/sidebar";
import Chatbot from "@/components/chatbox";

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
      <SidebarInset>
        <ResizablePanelGroup
          direction="horizontal"
          className="w-full overflow-y-auto"
        >
          <ResizablePanel defaultSize={70} minSize={30}>
            <main className="flex flex-1 flex-col">{children}</main>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            defaultSize={30}
            minSize={20}
            className="h-full overflow-y-auto"
          >
            <aside className="h-full flex flex-col overflow-y-auto">
              <Chatbot />
            </aside>
          </ResizablePanel>
        </ResizablePanelGroup>
      </SidebarInset>
    </SidebarProvider>
  );
}
