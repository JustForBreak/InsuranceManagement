"use client"

import * as React from "react"
import {
  IconChartBar,
  IconDashboard,
  IconFileDescription,
  IconHelp,
  IconPlus,
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

// Real user comes from localStorage (set on login)
function useCurrentUser() {
  const [user, setUser] = React.useState<any>(null)

  React.useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch (e) {
        setUser(null)
      }
    }
  }, [])

  return user
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  role?: string
}

export function AppSidebar({ ...props }: AppSidebarProps) {
  const user = useCurrentUser()

  // If no user, show nothing (or loading)
  if (!user) {
    return null
  }

  const isAgent = user.role === 'agent'

  const navMain = isAgent
    ? [
        { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
        { title: "Users", url: "/dashboard/users", icon: IconUsers },
        { title: "Policies", url: "/dashboard/policies", icon: IconShield },
        { title: "Claims", url: "/dashboard/claims", icon: IconReceipt },
        { title: "Analytics", url: "/dashboard/analytics", icon: IconChartBar },
      ]
    : [
        
        { title: "My Policies", url: "/dashboard/policies", icon: IconShield },
        { title: "My Claims", url: "/dashboard/claims", icon: IconReceipt },
        { title: "Documents", url: "/dashboard/documents", icon: IconFileDescription },
      ]

  const documents = isAgent
    ? [
        { name: "Reports", url: "/dashboard/reports", icon: IconFileDescription },
        { name: "Settings", url: "/dashboard/settings", icon: IconSettings },
      ]
    : [
        { name: "Policy Documents", url: "/dashboard/documents", icon: IconFileDescription },
        { name: "Claim History", url: "/dashboard/claims", icon: IconReceipt },
      ]

  const navSecondary = [
    { title: "Settings", url: "/dashboard/settings", icon: IconSettings },
    { title: "Get Help", url: "/dashboard/help", icon: IconHelp },
    { title: "Search", url: "/dashboard/search", icon: IconSearch },
  ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="/dashboard">
                <IconShield className="!size-5" />
                <span className="text-base font-semibold">Insurance Portal</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />
        <NavDocuments items={documents} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}