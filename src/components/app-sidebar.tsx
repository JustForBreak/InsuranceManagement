"use client"
import Link from "next/link";
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
        
        { title: "My Policies", url: "/my-policies", icon: IconShield },
        { title: "My Claims", url: "/my-claims", icon: IconReceipt },
        { title: "Documents", url: "/documents", icon: IconFileDescription },
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
    { title: "Settings", url: "/settings", icon: IconSettings },
    { title: "Get Help", url: "/support", icon: IconHelp },
  ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link href="/dashboard">
                <IconShield className="!size-5" />
                <span className="text-base font-semibold">Insurance Portal</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}