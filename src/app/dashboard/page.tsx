'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { AdminDashboard } from '@/components/admin-dashboard'
import { UserDashboard } from '@/components/user-dashboard'

function DashboardContent() {
  const searchParams = useSearchParams()
  const role = searchParams.get('role') || 'user'

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" role={role} />
      <SidebarInset>
        <SiteHeader role={role} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {role === 'admin' ? <AdminDashboard /> : <UserDashboard />}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
