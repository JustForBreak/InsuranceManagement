'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { IconTrendingUp } from '@tabler/icons-react'
import { Area, AreaChart, CartesianGrid, XAxis, Pie, PieChart, Cell } from 'recharts'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdminCreditManagement } from '@/components/admin-credit-management'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { UsersTab } from '@/components/dashboard/users-tab'
import { PoliciesTab } from '@/components/dashboard/policies-tab'
import { CreditRiskTab } from '@/components/dashboard/credit-risk-tab'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface AdminData {
  stats: {
    totalUsers: number
    activePolicies: number
    totalClaims: number
    pendingClaims: number
    monthlyRevenue: number
    growthRate: number
  }
  claimTrends: any[]
  policyDistribution: any[]
  recentClaims: any[]
}

const chartConfig = {
  approved: {
    label: 'Approved',
    color: 'hsl(var(--chart-1))',
  },
  rejected: {
    label: 'Rejected',
    color: 'hsl(var(--chart-2))',
  },
  pending: {
    label: 'Pending',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig

export function AdminDashboard() {
  const { theme, resolvedTheme } = useTheme()
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Helper function to get CSS variable value
  const getCSSVariable = (varName: string): string => {
    if (typeof window === 'undefined') return ''
    return getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim()
  }

  // Get actual color values from CSS variables
  const getChartColors = () => {
    if (!mounted) return { chart1: '#8884d8', chart2: '#82ca9d', chart3: '#ffc658', chart4: '#ff7300' }
    
    return {
      chart1: getCSSVariable('--chart-1') || 'oklch(0.646 0.222 41.116)',
      chart2: getCSSVariable('--chart-2') || 'oklch(0.6 0.118 184.704)',
      chart3: getCSSVariable('--chart-3') || 'oklch(0.398 0.07 227.392)',
      chart4: getCSSVariable('--chart-4') || 'oklch(0.828 0.189 84.429)',
    }
  }

  const chartColors = getChartColors()
  
  // Define colors for claim trends
  const approvedColor = '#22c55e' // green-500
  const rejectedColor = '#ef4444' // red-500

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard/admin')
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Error fetching admin data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Determine theme mode - fallback to checking document class if theme is not available
  const isDarkMode = mounted && (
    resolvedTheme === 'dark' || 
    (typeof window !== 'undefined' && document.documentElement.classList.contains('dark'))
  )

  if (loading || !data) {
    return <div className="flex items-center justify-center p-8">Loading...</div>
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Admin Dashboard Header */}
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive overview of your insurance management system
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="flex flex-col gap-4">
        <TabsList className="sticky top-[var(--header-height)] z-10 bg-background/80 backdrop-blur px-4 lg:px-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="credit-risk">Credit Risk</TabsTrigger>
        </TabsList>

      <TabsContent value="overview" className="space-y-6">
        {/* Stats Cards */}
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
          <Card className="@container/card border-l-4 border-l-blue-500">
            <CardHeader>
              <CardDescription>Total Users</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {data.stats.totalUsers.toLocaleString()}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <IconTrendingUp className="size-4" />
                  +{data.stats.growthRate}%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Growing steadily <IconTrendingUp className="size-4" />
              </div>
              <div className="text-muted-foreground">Registered customers</div>
            </CardFooter>
          </Card>

          <Card className="@container/card border-l-4 border-l-emerald-500">
            <CardHeader>
              <CardDescription>Active Policies</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {data.stats.activePolicies.toLocaleString()}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <IconTrendingUp className="size-4" />
                  +8.2%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Strong retention <IconTrendingUp className="size-4" />
              </div>
              <div className="text-muted-foreground">Policies in force</div>
            </CardFooter>
          </Card>

          <Card className="@container/card border-l-4 border-l-amber-500">
            <CardHeader>
              <CardDescription>Total Claims</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {data.stats.totalClaims}
              </CardTitle>
              <CardAction>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  {data.stats.pendingClaims} Pending
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                {data.stats.pendingClaims} awaiting review
              </div>
              <div className="text-muted-foreground">Claims this period</div>
            </CardFooter>
          </Card>

          <Card className="@container/card border-l-4 border-l-purple-500">
            <CardHeader>
              <CardDescription>Monthly Revenue</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                ${(data.stats.monthlyRevenue / 1000).toFixed(0)}k
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <IconTrendingUp className="size-4" />
                  +{data.stats.growthRate}%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Revenue up this month <IconTrendingUp className="size-4" />
              </div>
              <div className="text-muted-foreground">Premium collections</div>
            </CardFooter>
          </Card>
        </div>

        {/* Credit Management Section */}
        <AdminCreditManagement />

        {/* Charts Section */}
        <div className="grid gap-6 px-4 lg:px-6 md:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Claim Trends</CardTitle>
              <CardDescription>Monthly claim statistics and approval rates</CardDescription>
            </CardHeader>
            <CardContent>
              {mounted && data.claimTrends && data.claimTrends.length > 0 ? (
                <Chart
                  options={{
                    chart: {
                      type: 'area',
                      stacked: true,
                      fontFamily: 'inherit',
                      toolbar: { show: false },
                      zoom: { enabled: false },
                    },
                    dataLabels: {
                      enabled: false,
                    },
                    stroke: {
                      curve: 'smooth',
                      width: 2,
                    },
                    xaxis: {
                      categories: data.claimTrends.map((item) => item.month),
                      labels: {
                        style: {
                          colors: isDarkMode ? 'hsl(var(--foreground))' : 'hsl(var(--foreground))',
                          fontFamily: 'inherit',
                        },
                      },
                      axisBorder: {
                        show: false,
                      },
                      axisTicks: {
                        show: false,
                      },
                    },
                    yaxis: {
                      labels: {
                        style: {
                          colors: isDarkMode ? 'hsl(var(--foreground))' : 'hsl(var(--foreground))',
                          fontFamily: 'inherit',
                        },
                      },
                    },
                    fill: {
                      type: 'gradient',
                      gradient: {
                        opacityFrom: 0.4,
                        opacityTo: 0.1,
                        stops: [0, 100],
                      },
                    },
                    colors: [
                      approvedColor,
                      rejectedColor,
                    ],
                    legend: {
                      position: 'bottom',
                      fontSize: '12px',
                      fontFamily: 'inherit',
                      labels: {
                        colors: isDarkMode ? 'hsl(var(--foreground))' : 'hsl(var(--foreground))',
                      },
                    },
                    grid: {
                      borderColor: isDarkMode ? 'hsl(var(--border))' : 'hsl(var(--border))',
                      strokeDashArray: 4,
                      xaxis: {
                        lines: {
                          show: false,
                        },
                      },
                      yaxis: {
                        lines: {
                          show: true,
                        },
                      },
                    },
                    tooltip: {
                      theme: isDarkMode ? 'dark' : 'light',
                    },
                    theme: {
                      mode: isDarkMode ? 'dark' : 'light',
                    },
                  }}
                  series={[
                    {
                      name: 'Approved',
                      data: data.claimTrends.map((item) => item.approved),
                    },
                    {
                      name: 'Rejected',
                      data: data.claimTrends.map((item) => item.rejected),
                    },
                  ]}
                  type="area"
                  height={300}
                />
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  {loading ? 'Loading...' : 'No claim trends data available'}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Policy Distribution</CardTitle>
              <CardDescription>Active policies by type</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center min-h-[300px]">
              {mounted && data.policyDistribution && data.policyDistribution.length > 0 ? (
                <div className="mx-auto aspect-square max-h-[280px] w-full">
                  <Chart
                    options={{
                      chart: {
                        type: 'donut',
                        fontFamily: 'inherit',
                      },
                      labels: data.policyDistribution.map((item) => item.type),
                      colors: data.policyDistribution.map((item, index) => {
                        // Use fill from data if available, otherwise use chart colors
                        if (item.fill && !item.fill.includes('var(')) {
                          return item.fill
                        }
                        const colorIndex = (index % 4) + 1
                        return colorIndex === 1 ? chartColors.chart1 :
                               colorIndex === 2 ? chartColors.chart2 :
                               colorIndex === 3 ? chartColors.chart3 :
                               chartColors.chart4
                      }),
                      dataLabels: {
                        enabled: false,
                      },
                      legend: {
                        position: 'bottom',
                        fontSize: '12px',
                        fontFamily: 'inherit',
                        labels: {
                          colors: isDarkMode ? 'hsl(var(--foreground))' : 'hsl(var(--foreground))',
                        },
                      },
                      tooltip: {
                        custom: function ({ series, seriesIndex, w }) {
                          const policyItem = data.policyDistribution[seriesIndex];
                          return `
                            <div class="flex flex-col gap-0.5 p-2">
                              <span class="font-semibold">${policyItem.type}: ${series[seriesIndex]} policies</span>
                              <span class="text-muted-foreground text-xs">${policyItem.count} total</span>
                            </div>
                          `;
                        },
                        theme: isDarkMode ? 'dark' : 'light',
                      },
                      plotOptions: {
                        pie: {
                          donut: {
                            size: '60%',
                          },
                        },
                      },
                      theme: {
                        mode: isDarkMode ? 'dark' : 'light',
                      },
                    }}
                    series={data.policyDistribution.map((item) => item.value)}
                    type="donut"
                    height={280}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-12">
                  <div className="text-4xl mb-4">📊</div>
                  <p className="text-muted-foreground">
                    {loading ? 'Loading...' : 'No policy data available'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Claims Table */}
        <div className="px-4 lg:px-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Recent Claims</CardTitle>
              <CardDescription>Latest claim submissions requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Claim ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentClaims.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No recent claims found
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.recentClaims.map((claim) => (
                      <TableRow key={claim.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium font-mono">{claim.id}</TableCell>
                        <TableCell className="font-medium">{claim.customer}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{claim.type}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          ${claim.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              claim.status === 'Approved'
                                ? 'default'
                                : claim.status === 'Pending'
                                ? 'outline'
                                : claim.status === 'Under Review'
                                ? 'secondary'
                                : 'destructive'
                            }
                            className={
                              claim.status === 'Approved'
                                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400'
                                : claim.status === 'Pending'
                                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400'
                                : ''
                            }
                          >
                            {claim.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{claim.date}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="users" className="px-4 lg:px-6">
        <UsersTab />
      </TabsContent>

      <TabsContent value="policies" className="px-4 lg:px-6">
        <PoliciesTab />
      </TabsContent>

      <TabsContent value="credit-risk" className="px-4 lg:px-6">
        <CreditRiskTab />
      </TabsContent>
    </Tabs>
    </div>
  )
}
