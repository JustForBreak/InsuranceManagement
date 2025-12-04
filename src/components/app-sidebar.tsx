"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import {
  IconChartBar,
  IconDashboard,
  IconReceipt,
  IconShield,
  IconUsers,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
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

const adminNavMain = [
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
]

const userNavMain = [
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
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  role?: string
  onQuickCreate?: () => void
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return "U"
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export function AppSidebar({ role = 'user', onQuickCreate, ...props }: AppSidebarProps) {
  const [user, setUser] = useState<{ name: string; email: string; avatar: string; initials: string } | null>(null)

  useEffect(() => {
    const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        const userName = parsedUser.name || 
          `${parsedUser.firstName || ''} ${parsedUser.lastName || ''}`.trim() || 
          parsedUser.email?.split('@')[0] || 
          'User'
        const userEmail = parsedUser.email || ''
        const initials = getInitials(userName)
        
        setUser({
          name: userName,
          email: userEmail,
          avatar: `/avatars/${parsedUser.role || 'user'}.jpg`,
          initials: initials,
        })
      } catch (e) {
        console.error('Error parsing user data:', e)
        setUser({
          name: 'User',
          email: '',
          avatar: '/avatars/user.jpg',
          initials: 'U',
        })
      }
    } else {
      setUser({
        name: 'User',
        email: '',
        avatar: '/avatars/user.jpg',
        initials: 'U',
      })
    }
  }, [])

  const navMain = role === 'admin' ? adminNavMain : userNavMain
  
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <IconShield className="!size-5" />
                <span className="text-base font-semibold">Insurance Portal</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} onQuickCreate={onQuickCreate} />
      </SidebarContent>
      <SidebarFooter>
        {user && <NavUser user={user} />}
      </SidebarFooter>
    </Sidebar>
  )
}
