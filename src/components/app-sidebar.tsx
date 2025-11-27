"use client"

import * as React from "react"
import {
  IconChartBar,
  IconDashboard,
  IconFileDescription,
  IconHelp,
  IconInnerShadowTop,
  IconReceipt,
  IconSearch,
  IconSettings,
  IconShield,
  IconUsers,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const adminData = {
  user: {
    name: "Admin User",
    email: "admin@example.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Users",
      url: "/dashboard/users",
      icon: IconUsers,
    },
    {
      title: "Policies",
      url: "/dashboard/policies",
      icon: IconShield,
    },
    {
      title: "Claims",
      url: "/claims",
      icon: IconReceipt,
    },
    {
      title: "Analytics",
      url: "/dashboard/credit-risk",
      icon: IconChartBar,
    },
  ],
  documents: [
    {
      name: "Reports",
      url: "#",
      icon: IconFileDescription,
    },
    {
      name: "Settings",
      url: "#",
      icon: IconSettings,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
}

const userData = {
  user: {
    name: "John Doe",
    email: "user@example.com",
    avatar: "/avatars/user.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "My Policies",
      url: "/dashboard/policies",
      icon: IconShield,
    },
    {
      title: "My Claims",
      url: "/claims",
      icon: IconReceipt,
    },
    {
      title: "Documents",
      url: "/dashboard",
      icon: IconFileDescription,
    },
  ],
  documents: [
    {
      name: "Policy Documents",
      url: "#",
      icon: IconFileDescription,
    },
    {
      name: "Claim History",
      url: "#",
      icon: IconReceipt,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  role?: string
}

export function AppSidebar({ role = 'user', ...props }: AppSidebarProps) {
  const data = role === 'admin' ? adminData : userData
  
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconShield className="!size-5" />
                <span className="text-base font-semibold">Insurance Portal</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
