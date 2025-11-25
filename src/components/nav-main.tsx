"use client"

import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react"
import Link from "next/link"                   // ← ADD THIS
import { usePathname } from "next/navigation"   // ← ADD THIS

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  const pathname = usePathname() // ← to highlight active state
  
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {/* QUICK CREATE BUTTON – NOW CLICKABLE & ACTIVE STATE */}
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/quick-create" className="flex items-center gap-2">
              <SidebarMenuButton
                asChild // ← this makes the whole button clickable via Link
                tooltip="Quick Create"
                className={
                  pathname === "/quick-create"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "hover:bg-accent hover:text-accent-foreground"
                }
              >
                <div>
                  <IconCirclePlusFilled />
                  <span>Quick Create</span>
                </div>
              </SidebarMenuButton>
            </Link>

          
          </SidebarMenuItem>
        </SidebarMenu>

        {/* REST OF THE MENU */}
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}