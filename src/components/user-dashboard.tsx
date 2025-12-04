'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { IconTrendingUp, IconPlus, IconUser } from '@tabler/icons-react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

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
  const [isCreatePolicyOpen, setIsCreatePolicyOpen] = useState(false)
  const [isCreateClaimOpen, setIsCreateClaimOpen] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)

  const [policyForm, setPolicyForm] = useState({
    type: '',
    coverage: '',
    premium: '',
  })

  const [claimForm, setClaimForm] = useState({
    policyId: '',
    amount: '',
    description: '',
  })

  useEffect(() => {
    // Load user from localStorage and fetch data from API
    const fetchUserData = async () => {
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

        setUserId(parsedUser.id)

        // Fetch policies and claims from API
        const [policiesResponse, claimsResponse] = await Promise.all([
          fetch(`/api/policies?userId=${parsedUser.id}`),
          fetch(`/api/claims?userId=${parsedUser.id}`)
        ])

        if (!policiesResponse.ok || !claimsResponse.ok) {
          throw new Error('Failed to fetch data from API')
        }

        const policies = await policiesResponse.json()
        const claims = await claimsResponse.json()

        // Transform API data to match component structure
        const transformedPolicies = policies.map((p: any) => ({
          id: p.policyNumber || `POL-${p.id}`,
          numericId: p.id, // Keep numeric ID for API calls
          type: p.type,
          coverage: parseFloat(p.coverageAmount) || 0,
          premium: parseFloat(p.premium) || 0,
          status: p.status || 'Active',
          nextPaymentDate: p.endDate 
            ? new Date(p.endDate).toISOString().slice(0, 10)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        }))

        const transformedClaims = claims.map((c: any) => ({
          id: c.claimNumber || `CLM-${c.id}`,
          description: c.description || '',
          amount: parseFloat(c.amount) || 0,
          status: c.status === 'pending' ? 'Pending' : 
                  c.status === 'approved' ? 'Approved' :
                  c.status === 'rejected' ? 'Rejected' :
                  c.status === 'under_review' ? 'Under Review' : c.status,
          date: c.filedDate || new Date().toISOString().slice(0, 10),
        }))

        // Calculate stats
        const activeClaims = transformedClaims.filter((c: any) => 
          ['Under Review', 'Pending'].includes(c.status)
        ).length
        const totalCoverage = transformedPolicies.reduce((sum: number, p: any) => sum + p.coverage, 0)
        const totalPremium = transformedPolicies.reduce((sum: number, p: any) => sum + p.premium, 0)
        const nextPaymentDate = transformedPolicies.length > 0 
          ? transformedPolicies.sort((a: any, b: any) => 
              new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime()
            )[0].nextPaymentDate
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

        // Generate claim trends (simplified - could be enhanced with real data)
        const claimTrends = [
          { month: 'Jan', approved: 0, rejected: 0, pending: 0 },
          { month: 'Feb', approved: 0, rejected: 0, pending: 0 },
          { month: 'Mar', approved: 0, rejected: 0, pending: 0 },
          { month: 'Apr', approved: 0, rejected: 0, pending: 0 },
          { month: 'May', approved: 0, rejected: 0, pending: 0 },
          { month: 'Jun', approved: 0, rejected: 0, pending: 0 },
        ]

        // Count claims by status for trends
        transformedClaims.forEach((claim: any) => {
          const claimDate = new Date(claim.date)
          const monthIndex = claimDate.getMonth()
          if (monthIndex >= 0 && monthIndex < 6) {
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
            const trendIndex = claimTrends.findIndex(t => t.month === monthNames[monthIndex])
            if (trendIndex !== -1) {
              if (claim.status === 'Approved') claimTrends[trendIndex].approved++
              else if (claim.status === 'Rejected') claimTrends[trendIndex].rejected++
              else claimTrends[trendIndex].pending++
            }
          }
        })

        setData({
          stats: {
            myPolicies: transformedPolicies.length,
            activeClaims,
            totalClaims: transformedClaims.length,
            nextPayment: totalPremium,
            nextPaymentDate,
            coverageTotal: totalCoverage,
          },
          myPolicies: transformedPolicies,
          myClaims: transformedClaims,
          claimTrends,
        })
      } catch (error) {
        console.error('Error loading user data:', error)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleCreatePolicy = async () => {
    if (!policyForm.type || !policyForm.coverage || !policyForm.premium) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!userId) {
      toast.error('User not found')
      return
    }

    try {
      // Calculate start and end dates (1 year policy)
      const startDate = new Date()
      const endDate = new Date()
      endDate.setFullYear(endDate.getFullYear() + 1)

      const response = await fetch('/api/policies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          type: policyForm.type,
          coverageAmount: parseFloat(policyForm.coverage),
          premium: parseFloat(policyForm.premium),
          startDate: startDate.toISOString().slice(0, 10),
          endDate: endDate.toISOString().slice(0, 10),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create policy')
      }

      // Refresh policies data
      const policiesResponse = await fetch(`/api/policies?userId=${userId}`)
      if (policiesResponse.ok) {
        const policies = await policiesResponse.json()
        const transformedPolicies = policies.map((p: any) => ({
          id: p.policyNumber || `POL-${p.id}`,
          numericId: p.id,
          type: p.type,
          coverage: parseFloat(p.coverageAmount) || 0,
          premium: parseFloat(p.premium) || 0,
          status: p.status || 'Active',
          nextPaymentDate: p.endDate 
            ? new Date(p.endDate).toISOString().slice(0, 10)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        }))

        const totalCoverage = transformedPolicies.reduce((sum: number, p: any) => sum + p.coverage, 0)
        const totalPremium = transformedPolicies.reduce((sum: number, p: any) => sum + p.premium, 0)
        const nextPaymentDate = transformedPolicies.length > 0 
          ? transformedPolicies.sort((a: any, b: any) => 
              new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime()
            )[0].nextPaymentDate
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

        if (data) {
          setData({
            ...data,
            myPolicies: transformedPolicies,
            stats: {
              ...data.stats,
              myPolicies: transformedPolicies.length,
              coverageTotal: totalCoverage,
              nextPayment: totalPremium,
              nextPaymentDate,
            },
          })
        }
      }

      toast.success('Policy created successfully and submitted for review')
      setIsCreatePolicyOpen(false)
      setPolicyForm({ type: '', coverage: '', premium: '' })
    } catch (error: any) {
      console.error('Error creating policy:', error)
      toast.error(error.message || 'Failed to create policy')
    }
  }

  const handleCreateClaim = async () => {
    if (!claimForm.policyId || !claimForm.amount || !claimForm.description) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!userId) {
      toast.error('User not found')
      return
    }

    // Find the policy ID from the policy number
    const selectedPolicy = data?.myPolicies.find(p => p.id === claimForm.policyId)
    if (!selectedPolicy) {
      toast.error('Invalid policy selected')
      return
    }

    try {
      // Find the policy using the stored numeric ID
      const selectedPolicyWithId = data?.myPolicies.find(p => p.id === claimForm.policyId)
      if (!selectedPolicyWithId || !('numericId' in selectedPolicyWithId)) {
        toast.error('Policy not found')
        return
      }

      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          policyId: (selectedPolicyWithId as any).numericId,
          userId: userId,
          amount: claimForm.amount,
          description: claimForm.description,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create claim')
      }

      // Refresh claims data
      const claimsResponse = await fetch(`/api/claims?userId=${userId}`)
      if (claimsResponse.ok) {
        const claims = await claimsResponse.json()
        const transformedClaims = claims.map((c: any) => ({
          id: c.claimNumber || `CLM-${c.id}`,
          description: c.description || '',
          amount: parseFloat(c.amount) || 0,
          status: c.status === 'pending' ? 'Pending' : 
                  c.status === 'approved' ? 'Approved' :
                  c.status === 'rejected' ? 'Rejected' :
                  c.status === 'under_review' ? 'Under Review' : c.status,
          date: c.filedDate || new Date().toISOString().slice(0, 10),
        }))

        const activeClaims = transformedClaims.filter((c: any) => 
          ['Under Review', 'Pending'].includes(c.status)
        ).length

        if (data) {
          setData({
            ...data,
            myClaims: transformedClaims,
            stats: {
              ...data.stats,
              activeClaims,
              totalClaims: transformedClaims.length,
            },
          })
        }
      }

      toast.success('Claim created successfully')
      setIsCreateClaimOpen(false)
      setClaimForm({ policyId: '', amount: '', description: '' })
    } catch (error: any) {
      console.error('Error creating claim:', error)
      toast.error(error.message || 'Failed to create claim')
    }
  }

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

  // Data is already filtered by userId from API, but keep as safety check
  const filteredPolicies = data.myPolicies
  const filteredClaims = data.myClaims

  return (
    <>
      {/* User Dashboard Header */}
      <div className="px-4 lg:px-6 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <IconUser className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">My Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome to your personal insurance portal</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800 px-3 py-1.5">
            <IconUser className="h-3.5 w-3.5 mr-1.5" />
            User Account
          </Badge>
        </div>
      </div>

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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>My Policies</CardTitle>
                <CardDescription>Your active insurance policies</CardDescription>
              </div>
              <Dialog open={isCreatePolicyOpen} onOpenChange={setIsCreatePolicyOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <IconPlus className="size-4" />
                    Quick Create Policy
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Policy</DialogTitle>
                    <DialogDescription>
                      Add a new insurance policy to your account
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="policy-type">Policy Type</Label>
                      <Select
                        value={policyForm.type}
                        onValueChange={(value) => setPolicyForm({ ...policyForm, type: value })}
                      >
                        <SelectTrigger id="policy-type">
                          <SelectValue placeholder="Select policy type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Health Insurance">Health Insurance</SelectItem>
                          <SelectItem value="Auto Insurance">Auto Insurance</SelectItem>
                          <SelectItem value="Home Insurance">Home Insurance</SelectItem>
                          <SelectItem value="Life Insurance">Life Insurance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="coverage">Coverage Amount ($)</Label>
                      <Input
                        id="coverage"
                        type="number"
                        placeholder="500000"
                        value={policyForm.coverage}
                        onChange={(e) => setPolicyForm({ ...policyForm, coverage: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="premium">Monthly Premium ($)</Label>
                      <Input
                        id="premium"
                        type="number"
                        step="0.01"
                        placeholder="450.00"
                        value={policyForm.premium}
                        onChange={(e) => setPolicyForm({ ...policyForm, premium: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreatePolicyOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreatePolicy}>Create Policy</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
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
                {filteredPolicies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No policies found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPolicies.map((policy) => (
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
                  ))
                )}
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Claims</CardTitle>
                <CardDescription>Your claim submissions</CardDescription>
              </div>
              <Dialog open={isCreateClaimOpen} onOpenChange={setIsCreateClaimOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-2">
                    <IconPlus className="size-4" />
                    Quick Create Claim
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Claim</DialogTitle>
                    <DialogDescription>
                      File a new claim for one of your policies
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="claim-policy">Policy</Label>
                      <Select
                        value={claimForm.policyId}
                        onValueChange={(value) => setClaimForm({ ...claimForm, policyId: value })}
                      >
                        <SelectTrigger id="claim-policy">
                          <SelectValue placeholder="Select a policy" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredPolicies.map((policy) => (
                            <SelectItem key={policy.id} value={policy.id}>
                              {policy.id} - {policy.type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="claim-amount">Claim Amount ($)</Label>
                      <Input
                        id="claim-amount"
                        type="number"
                        step="0.01"
                        placeholder="2500.00"
                        value={claimForm.amount}
                        onChange={(e) => setClaimForm({ ...claimForm, amount: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="claim-description">Description</Label>
                      <Textarea
                        id="claim-description"
                        placeholder="Describe the incident or reason for this claim..."
                        value={claimForm.description}
                        onChange={(e) => setClaimForm({ ...claimForm, description: e.target.value })}
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateClaimOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateClaim}>Submit Claim</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredClaims.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No claims found
                </div>
              ) : (
                filteredClaims.slice(0, 5).map((claim) => (
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
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
