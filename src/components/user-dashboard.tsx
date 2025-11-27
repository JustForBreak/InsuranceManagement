'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { IconTrendingUp } from '@tabler/icons-react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
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

interface UserData {
  stats: {
    myPolicies: number
    activeClaims: number
    totalClaims: number
    nextPayment: number
    nextPaymentDate: string
    coverageTotal: number
  }
  myPolicies: any[]
  myClaims: any[]
  claimTrends: any[]
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

export function UserDashboard() {
  const [data, setData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null
        if (!storedUser) {
          setError('User not found in local storage')
          setLoading(false)
          return
        }

        const parsedUser = JSON.parse(storedUser) as { id: number }
        if (!parsedUser?.id) {
          setError('Invalid user data in local storage')
          setLoading(false)
          return
        }

        const response = await fetch(`/api/dashboard/user?userId=${parsedUser.id}`)
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Error fetching user data:', error)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center p-8 text-red-600">
        {error ?? 'Unable to load dashboard'}
      </div>
    )
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>My Policies</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {data.stats.myPolicies}
            </CardTitle>
            <CardAction>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                All Active
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Active insurance policies
            </div>
            <div className="text-muted-foreground">
              Total coverage: ${data.stats.coverageTotal.toLocaleString()}
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Active Claims</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {data.stats.activeClaims}
            </CardTitle>
            <CardAction>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                In Review
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Currently under review
            </div>
            <div className="text-muted-foreground">Claims being processed</div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Total Claims</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {data.stats.totalClaims}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp className="size-4" />
                History
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              All-time claim submissions
            </div>
            <div className="text-muted-foreground">Total filed claims</div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Next Payment</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              ${data.stats.nextPayment.toFixed(2)}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                Due Soon
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Due date: {data.stats.nextPaymentDate}
            </div>
            <div className="text-muted-foreground">Premium payment</div>
          </CardFooter>
        </Card>
      </div>

      {/* My Policies Section */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>My Policies</CardTitle>
            <CardDescription>Your active insurance policies</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Policy ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Coverage</TableHead>
                  <TableHead>Premium</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Next Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.myPolicies.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell className="font-medium">{policy.id}</TableCell>
                    <TableCell>{policy.type}</TableCell>
                    <TableCell>${policy.coverage.toLocaleString()}</TableCell>
                    <TableCell>${policy.premium.toFixed(2)}/mo</TableCell>
                    <TableCell>
                      <Badge variant="default">{policy.status}</Badge>
                    </TableCell>
                    <TableCell>{policy.nextPaymentDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Claims Section */}
      <div className="grid gap-4 px-4 lg:px-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>My Claim History</CardTitle>
            <CardDescription>Recent claim activity</CardDescription>
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
                  <linearGradient id="fillPending" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-pending)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-pending)"
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
                <Area
                  dataKey="pending"
                  type="natural"
                  fill="url(#fillPending)"
                  fillOpacity={0.4}
                  stroke="var(--color-pending)"
                  stackId="a"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Claims</CardTitle>
            <CardDescription>Your claim submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.myClaims.slice(0, 5).map((claim) => (
                <div key={claim.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                  <div className="space-y-1">
                    <div className="font-medium">{claim.id}</div>
                    <div className="text-sm text-muted-foreground">{claim.description}</div>
                    <div className="text-xs text-muted-foreground">{claim.date}</div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="font-semibold">${claim.amount.toLocaleString()}</div>
                    <Badge
                      variant={
                        claim.status === 'Approved'
                          ? 'default'
                          : claim.status === 'Under Review'
                          ? 'outline'
                          : 'secondary'
                      }
                      className="text-xs"
                    >
                      {claim.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
