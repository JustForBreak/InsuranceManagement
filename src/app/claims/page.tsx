'use client'

import * as React from 'react'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { ClaimsTab } from '@/components/dashboard/claims-tab'

interface User {
  id: number
  email: string
  name: string
  role: string
}

function ClaimsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [shouldOpenDialog, setShouldOpenDialog] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
    } catch (error) {
      console.error('Error parsing user data:', error)
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    // Check if we should open the dialog from query params
    if (searchParams.get('create') === 'true') {
      setShouldOpenDialog(true)
      // Clean up URL
      router.replace('/claims', { scroll: false })
    }
  }, [searchParams, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Map agent/customer to admin/user for dashboard components
  const dashboardRole = user.role === 'agent' ? 'admin' : 'user'

  const handleQuickCreate = () => {
    router.push('/claims?create=true')
  }

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" role={dashboardRole} onQuickCreate={handleQuickCreate} />
      <SidebarInset>
        <SiteHeader role={dashboardRole} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <ClaimsTab initialOpenDialog={shouldOpenDialog} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function ClaimsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div>Loading...</div>
      </div>
    }>
      <ClaimsPageContent />
    </Suspense>
  )
}

