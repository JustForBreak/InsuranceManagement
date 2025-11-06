'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface CreditProfile {
  name: string
  email: string
  credit_score: number
  risk_level: string
  last_checked: string
  suggested_multiplier: number
}

export function AdminCreditManagement() {
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
      } else {
        setError(result.message || 'Failed to fetch credit profile')
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
        return <Badge className="bg-green-50 text-green-700 border-green-200">Low Risk</Badge>
      case 'medium':
        return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">Medium Risk</Badge>
      case 'high':
        return <Badge className="bg-red-50 text-red-700 border-red-200">High Risk</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
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
        <div className="grid gap-6 md:grid-cols-3">
          {profiles.map((profile) => (
            <Card key={profile.email} className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{profile.name}</CardTitle>
                    <CardDescription className="text-xs">{profile.email}</CardDescription>
                  </div>
                  {getRiskLevelBadge(profile.risk_level)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Credit Score</div>
                    <div className={`text-4xl font-bold ${getCreditScoreColor(profile.credit_score)}`}>
                      {profile.credit_score}
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <div className="text-xs text-muted-foreground mb-1">Premium Adjustment</div>
                    <div className="text-lg font-semibold">
                      {profile.suggested_multiplier < 1 ? (
                        <span className="text-green-600">
                          {((1 - profile.suggested_multiplier) * 100).toFixed(0)}% Discount
                        </span>
                      ) : profile.suggested_multiplier > 1 ? (
                        <span className="text-red-600">
                          +{((profile.suggested_multiplier - 1) * 100).toFixed(0)}% Surcharge
                        </span>
                      ) : (
                        <span className="text-gray-600">Standard Rate</span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground pt-2">
                    Last checked: {new Date(profile.last_checked).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Live Credit Check Form */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Check Individual Credit Profile</CardTitle>
          <CardDescription>
            Enter a customer email to fetch their credit profile from the database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCheckCredit} className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="customer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={searchLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={searchLoading}>
                {searchLoading ? 'Checking...' : 'Check Credit'}
              </Button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded text-sm">
                {error}
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Live Result Display */}
      {creditProfile && (
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{creditProfile.name}</CardTitle>
                <CardDescription>{creditProfile.email}</CardDescription>
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
                    Based on credit history and risk assessment
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-background rounded-lg border">
              <h4 className="font-semibold mb-2">Recommendations</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {creditProfile.risk_level === 'low' && (
                  <>
                    <li>✅ Approve for all policy types</li>
                    <li>✅ Eligible for premium discounts</li>
                    <li>✅ Fast-track claims processing</li>
                  </>
                )}
                {creditProfile.risk_level === 'medium' && (
                  <>
                    <li>⚠️ Standard policy approval process</li>
                    <li>⚠️ Regular premium rates apply</li>
                    <li>⚠️ Normal claims processing time</li>
                  </>
                )}
                {creditProfile.risk_level === 'high' && (
                  <>
                    <li>❌ Requires additional verification</li>
                    <li>❌ Higher premiums recommended</li>
                    <li>❌ Enhanced claims review needed</li>
                  </>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
