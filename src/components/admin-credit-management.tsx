'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { IconUser, IconCreditCard, IconTrendingUp, IconTrendingDown, IconMinus, IconSearch, IconShield, IconArrowRight } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface CreditProfile {
  name: string
  email: string
  credit_score: number
  risk_level: string
  last_checked: string
  suggested_multiplier: number
}

export function AdminCreditManagement() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<CreditProfile[]>([])
  const [email, setEmail] = useState('')
  const [creditProfile, setCreditProfile] = useState<CreditProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch all credit profiles on mount
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch('/api/credit/all')
        const result = await response.json()
        if (result.success) {
          setProfiles(result.profiles)
        }
      } catch (error) {
        console.error('Error fetching credit profiles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [])

  const handleCheckCredit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSearchLoading(true)
    setError('')
    setCreditProfile(null)

    try {
      const response = await fetch('/api/credit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (result.success) {
        setCreditProfile(result.profile)
        setError('')
      } else {
        setError(result.message || 'Failed to fetch credit profile')
        setCreditProfile(null)
      }
    } catch (error) {
      setError('Connection failed. Please try again.')
    } finally {
      setSearchLoading(false)
    }
  }

  const getCreditScoreColor = (score: number) => {
    if (score >= 750) return 'text-green-600'
    if (score >= 650) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRiskLevelBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return (
          <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 dark:border-green-500/30 font-semibold px-3 py-1 text-xs uppercase tracking-wide">
            Low Risk
          </Badge>
        )
      case 'medium':
        return (
          <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 dark:border-amber-500/30 font-semibold px-3 py-1 text-xs uppercase tracking-wide">
            Medium Risk
          </Badge>
        )
      case 'high':
        return (
          <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20 dark:border-red-500/30 font-semibold px-3 py-1 text-xs uppercase tracking-wide">
            High Risk
          </Badge>
        )
      default:
        return <Badge variant="outline" className="font-semibold px-3 py-1 text-xs uppercase tracking-wide">Unknown</Badge>
    }
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Assessment & Credit Management</CardTitle>
          <CardDescription>
            View customer credit scores and risk ratings to inform policy decisions
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Credit Profiles Display */}
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-muted-foreground">Loading credit profiles...</div>
        </div>
      ) : profiles.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No credit profiles found in the database.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Section Title */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Customer Credit Profiles
              </h2>
              <p className="text-muted-foreground">
                Review customer credit scores, risk assessments, and premium adjustments
              </p>
            </div>
            <Button
              onClick={() => router.push('/dashboard/users')}
              variant="outline"
              className="shrink-0"
            >
              View All Users
              <IconArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          {/* Credit Profiles Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {profiles
            .filter((profile, index, self) => 
              index === self.findIndex((p) => p.email === profile.email)
            )
            .map((profile, idx) => {
              const isDiscount = profile.suggested_multiplier < 1
              const isSurcharge = profile.suggested_multiplier > 1
              
              return (
                <Card 
                  key={`${profile.email}-${idx}`} 
                  className="group relative overflow-hidden border border-border/50 bg-card shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {/* Subtle accent bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${
                    profile.risk_level === 'low' 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-400' 
                      : profile.risk_level === 'medium'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                      : 'bg-gradient-to-r from-red-500 to-rose-400'
                  }`} />
                  
                  <CardHeader className="pb-4 pt-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold text-foreground mb-1 truncate">
                          {profile.name}
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground truncate">
                          {profile.email}
                        </CardDescription>
                      </div>
                      <div className="flex-shrink-0">
                        {getRiskLevelBadge(profile.risk_level)}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-5">
                    {/* Credit Score - Professional Display */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Credit Score
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-4xl font-bold tabular-nums leading-none ${getCreditScoreColor(profile.credit_score)}`}>
                          {profile.credit_score}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          / 850
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            profile.credit_score >= 750 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-400' 
                              : profile.credit_score >= 650
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                              : 'bg-gradient-to-r from-red-500 to-rose-400'
                          }`}
                          style={{ width: `${(profile.credit_score / 850) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Premium Adjustment - Banking Style */}
                    <div className="pt-4 border-t border-border/50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Premium Adjustment
                        </span>
                        {isDiscount ? (
                          <IconTrendingDown className="h-4 w-4 text-green-600" />
                        ) : isSurcharge ? (
                          <IconTrendingUp className="h-4 w-4 text-red-600" />
                        ) : (
                          <IconMinus className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="space-y-1">
                        {isDiscount ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-green-600 tabular-nums">
                              {((1 - profile.suggested_multiplier) * 100).toFixed(0)}%
                            </span>
                            <span className="text-sm font-medium text-green-600">Discount</span>
                          </div>
                        ) : isSurcharge ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-red-600 tabular-nums">
                              +{((profile.suggested_multiplier - 1) * 100).toFixed(0)}%
                            </span>
                            <span className="text-sm font-medium text-red-600">Surcharge</span>
                          </div>
                        ) : (
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-foreground tabular-nums">
                              Standard
                            </span>
                            <span className="text-sm font-medium text-muted-foreground">Rate</span>
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground font-mono">
                          Multiplier: {profile.suggested_multiplier.toFixed(2)}x
                        </div>
                      </div>
                    </div>

                    {/* Last Checked - AWS Style Footer */}
                    <div className="pt-4 border-t border-border/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Last Checked
                        </span>
                        <span className="text-xs font-semibold text-foreground tabular-nums">
                          {new Date(profile.last_checked).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Live Credit Check Form */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Visual Section */}
          <div className="hidden md:block relative bg-gradient-to-br from-primary/10 to-primary/5 p-8 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=80" 
                alt="Credit Analysis" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Dark overlay for better contrast */}
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="relative z-10 text-center space-y-4 px-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                <IconShield className="h-10 w-10 text-white" />
              </div>
              <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg p-6 shadow-xl border border-white/20">
                <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Credit Risk Assessment</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Get instant credit profile analysis and risk evaluation for informed policy decisions
                </p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-6 md:p-8">
            <CardHeader className="p-0 pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <IconSearch className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Check Individual Credit Profile</CardTitle>
                  <CardDescription className="mt-1">
                    Enter a customer email to fetch their credit profile from the database
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <form onSubmit={handleCheckCredit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="credit-email" className="text-sm font-medium">
                    Customer Email Address
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="credit-email"
                      type="email"
                      placeholder="customer@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={searchLoading}
                      className="flex-1 h-12 text-base"
                    />
                    <Button 
                      type="submit" 
                      disabled={searchLoading}
                      size="lg"
                      className="h-12 px-6"
                    >
                      {searchLoading ? (
                        <>
                          <span className="animate-spin mr-2 inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                          Checking...
                        </>
                      ) : (
                        <>
                          <IconSearch className="h-4 w-4 mr-2" />
                          Check Credit
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 p-4 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Loading Skeleton */}
                {searchLoading && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </div>
        </div>
      </Card>

      {/* Credit Profile Modal */}
      <Dialog open={!!creditProfile} onOpenChange={(open) => !open && setCreditProfile(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {creditProfile && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                      <IconUser className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-semibold">{creditProfile.name}</DialogTitle>
                      <DialogDescription className="text-sm mt-0.5">{creditProfile.email}</DialogDescription>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {getRiskLevelBadge(creditProfile.risk_level)}
                  </div>
                </div>
              </DialogHeader>

              <div className="grid md:grid-cols-3 gap-6 mt-6">
                {/* Credit Score Card */}
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <IconCreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Credit Score
                          </span>
                        </div>
                        <div className={`text-5xl font-bold tabular-nums leading-none mb-3 ${getCreditScoreColor(creditProfile.credit_score)}`}>
                          {creditProfile.credit_score}
                        </div>
                        <div className="text-xs text-muted-foreground mb-4">
                          Last checked: {new Date(creditProfile.last_checked).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                      <div className="pt-4 border-t border-border/50">
                        {creditProfile.credit_score >= 750 && (
                          <div className="text-sm font-semibold text-green-600 uppercase tracking-wide">Excellent Rating</div>
                        )}
                        {creditProfile.credit_score >= 700 && creditProfile.credit_score < 750 && (
                          <div className="text-sm font-semibold text-green-600 uppercase tracking-wide">Good Rating</div>
                        )}
                        {creditProfile.credit_score >= 650 && creditProfile.credit_score < 700 && (
                          <div className="text-sm font-semibold text-amber-600 uppercase tracking-wide">Fair Rating</div>
                        )}
                        {creditProfile.credit_score < 650 && (
                          <div className="text-sm font-semibold text-red-600 uppercase tracking-wide">Needs Improvement</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Premium Adjustment Card */}
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          {creditProfile.suggested_multiplier < 1 ? (
                            <IconTrendingDown className="h-4 w-4 text-green-600" />
                          ) : creditProfile.suggested_multiplier > 1 ? (
                            <IconTrendingUp className="h-4 w-4 text-red-600" />
                          ) : (
                            <IconMinus className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Premium Adjustment
                          </span>
                        </div>
                        <div className="mb-4">
                          {creditProfile.suggested_multiplier < 1 ? (
                            <div className="space-y-1">
                              <div className="text-3xl font-bold text-green-600 tabular-nums">
                                {((1 - creditProfile.suggested_multiplier) * 100).toFixed(0)}%
                              </div>
                              <div className="text-sm font-medium text-green-600">Discount</div>
                            </div>
                          ) : creditProfile.suggested_multiplier > 1 ? (
                            <div className="space-y-1">
                              <div className="text-3xl font-bold text-red-600 tabular-nums">
                                +{((creditProfile.suggested_multiplier - 1) * 100).toFixed(0)}%
                              </div>
                              <div className="text-sm font-medium text-red-600">Surcharge</div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <div className="text-3xl font-bold text-foreground">Standard</div>
                              <div className="text-sm font-medium text-muted-foreground">Rate</div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="pt-4 border-t border-border/50">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                          Multiplier
                        </div>
                        <div className="text-xl font-bold tabular-nums font-mono">{creditProfile.suggested_multiplier.toFixed(2)}x</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Recommendations Card */}
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <IconShield className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Recommendations
                        </span>
                      </div>
                      <div className="space-y-3">
                        {creditProfile.risk_level === 'low' && (
                          <>
                            <div className="flex items-start gap-3 text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-600 mt-1.5 flex-shrink-0" />
                              <span className="text-foreground">Approve for all policy types</span>
                            </div>
                            <div className="flex items-start gap-3 text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-600 mt-1.5 flex-shrink-0" />
                              <span className="text-foreground">Eligible for premium discounts</span>
                            </div>
                            <div className="flex items-start gap-3 text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-600 mt-1.5 flex-shrink-0" />
                              <span className="text-foreground">Fast-track claims processing</span>
                            </div>
                          </>
                        )}
                        {creditProfile.risk_level === 'medium' && (
                          <>
                            <div className="flex items-start gap-3 text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 flex-shrink-0" />
                              <span className="text-foreground">Standard policy approval process</span>
                            </div>
                            <div className="flex items-start gap-3 text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 flex-shrink-0" />
                              <span className="text-foreground">Regular premium rates apply</span>
                            </div>
                            <div className="flex items-start gap-3 text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 flex-shrink-0" />
                              <span className="text-foreground">Normal claims processing time</span>
                            </div>
                          </>
                        )}
                        {creditProfile.risk_level === 'high' && (
                          <>
                            <div className="flex items-start gap-3 text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0" />
                              <span className="text-foreground">Requires additional verification</span>
                            </div>
                            <div className="flex items-start gap-3 text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0" />
                              <span className="text-foreground">Higher premiums recommended</span>
                            </div>
                            <div className="flex items-start gap-3 text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0" />
                              <span className="text-foreground">Enhanced claims review needed</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
