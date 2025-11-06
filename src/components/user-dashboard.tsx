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

interface CreditProfile {
  name: string
  email: string
  credit_score: number
  risk_level: string
  last_checked: string
  suggested_multiplier: number
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
  const [creditProfile, setCreditProfile] = useState<CreditProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [creditLoading, setCreditLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard/user')
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    const fetchCreditProfile = async () => {
      try {
        // Get user email from localStorage
        const userData = localStorage.getItem('user')
        if (!userData) return

        const user = JSON.parse(userData)
        
        const response = await fetch('/api/credit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: user.email }),
        })

        const result = await response.json()
        
        if (result.success) {
          setCreditProfile(result.profile)
        }
      } catch (error) {
        console.error('Error fetching credit profile:', error)
      } finally {
        setCreditLoading(false)
      }
    }

    fetchCreditProfile()
  }, [])

  const getCreditScoreColor = (score: number) => {
    if (score >= 750) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 650) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getRiskLevelBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return <Badge className="bg-green-50 text-green-700 border-green-200">Low Risk</Badge>
      case 'medium':
        return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">Medium Risk</Badge>
      case 'high':
        return <Badge className="bg-red-50 text-red-700 border-red-200">High Risk</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  if (loading || !data) {
    return <div className="flex items-center justify-center p-8">Loading...</div>
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

      {/* Credit Score Card */}
      {creditProfile && !creditLoading && (
        <div className="px-4 lg:px-6">
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Credit Score</CardTitle>
                  <CardDescription>Your insurance credit profile</CardDescription>
                </div>
                {getRiskLevelBadge(creditProfile.risk_level)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Credit Score</div>
                  <div className={`text-5xl font-bold ${getCreditScoreColor(creditProfile.credit_score)}`}>
                    {creditProfile.credit_score}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last checked: {new Date(creditProfile.last_checked).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Premium Adjustment</div>
                  <div className="text-3xl font-bold">
                    {creditProfile.suggested_multiplier < 1 ? (
                      <span className="text-green-600">
                        {((1 - creditProfile.suggested_multiplier) * 100).toFixed(0)}% Discount
                      </span>
                    ) : creditProfile.suggested_multiplier > 1 ? (
                      <span className="text-red-600">
                        +{((creditProfile.suggested_multiplier - 1) * 100).toFixed(0)}% Surcharge
                      </span>
                    ) : (
                      <span className="text-gray-600">Standard Rate</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Multiplier: {creditProfile.suggested_multiplier}x
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Credit Rating</div>
                  <div className="space-y-2">
                    {creditProfile.credit_score >= 750 && (
                      <div className="text-lg font-semibold text-green-600">Excellent</div>
                    )}
                    {creditProfile.credit_score >= 700 && creditProfile.credit_score < 750 && (
                      <div className="text-lg font-semibold text-green-600">Good</div>
                    )}
                    {creditProfile.credit_score >= 650 && creditProfile.credit_score < 700 && (
                      <div className="text-lg font-semibold text-yellow-600">Fair</div>
                    )}
                    {creditProfile.credit_score < 650 && (
                      <div className="text-lg font-semibold text-red-600">Needs Improvement</div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Based on your credit history and risk assessment
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
