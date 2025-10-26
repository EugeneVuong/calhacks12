"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { BarChart3, Target, BookOpen } from "lucide-react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

// User data
const userData = {
  name: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/shadcn.jpg",
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
      isActive: pathname === "/dashboard",
    },
    {
      title: "Topics",
      url: "/topic",
      icon: BookOpen,
      isActive: pathname.startsWith("/topic"),
    },
    {
      title: "Goal",
      url: "/goal",
      icon: Target,
      isActive: pathname === "/goal",
    },
  ];

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
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
