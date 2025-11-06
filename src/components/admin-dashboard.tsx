'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react'
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
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)

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

  if (loading || !data) {
    return <div className="flex items-center justify-center p-8">Loading...</div>
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card className="@container/card">
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

        <Card className="@container/card">
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

        <Card className="@container/card">
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

        <Card className="@container/card">
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

      {/* Charts Section */}
      <div className="grid gap-4 px-4 lg:px-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Claim Trends</CardTitle>
            <CardDescription>Monthly claim statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <AreaChart
                accessibilityLayer
                data={data.claimTrends}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <defs>
                  <linearGradient id="fillApproved" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-approved)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-approved)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillRejected" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-rejected)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-rejected)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="approved"
                  type="natural"
                  fill="url(#fillApproved)"
                  fillOpacity={0.4}
                  stroke="var(--color-approved)"
                  stackId="a"
                />
                <Area
                  dataKey="rejected"
                  type="natural"
                  fill="url(#fillRejected)"
                  fillOpacity={0.4}
                  stroke="var(--color-rejected)"
                  stackId="a"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Policy Distribution</CardTitle>
            <CardDescription>Active policies by type</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer
              config={{
                count: {
                  label: 'Policies',
                },
              }}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={data.policyDistribution}
                  dataKey="value"
                  nameKey="type"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  {data.policyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="type" />}
                  className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Claims Table */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Claims</CardTitle>
            <CardDescription>Latest claim submissions</CardDescription>
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
                {data.recentClaims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell className="font-medium">{claim.id}</TableCell>
                    <TableCell>{claim.customer}</TableCell>
                    <TableCell>{claim.type}</TableCell>
                    <TableCell>${claim.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          claim.status === 'Approved'
                            ? 'default'
                            : claim.status === 'Pending'
                            ? 'outline'
                            : 'secondary'
                        }
                      >
                        {claim.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{claim.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

