import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

function toTitleCase(value: string | null): string {
  if (!value) return ''
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId in query string' },
        { status: 400 }
      )
    }

    // Load policies for this user
    const policiesResult = await sql<{
      id: number
      policy_number: string
      type: string
      coverage_amount: number | null
      premium: number | null
      start_date: Date | null
      end_date: Date | null
      status: string | null
    }>`
      SELECT
        p.id,
        p.policy_number,
        p.type,
        p.coverage_amount,
        p.premium,
        p.start_date,
        p.end_date,
        p.status
      FROM policies p
      WHERE p.user_id = ${userId}
      ORDER BY p.start_date ASC;
    `

    const policies = policiesResult.rows.map((p) => ({
      id: p.policy_number,
      type: toTitleCase(p.type),
      status: p.status ?? 'active',
      premium: Number(p.premium ?? 0),
      coverage: Number(p.coverage_amount ?? 0),
      startDate: p.start_date ? p.start_date.toISOString().slice(0, 10) : '',
      endDate: p.end_date ? p.end_date.toISOString().slice(0, 10) : '',
      // For now we surface the next payment date as the start date;
      // in a real system this would come from a billing schedule.
      nextPaymentDate: p.start_date ? p.start_date.toISOString().slice(0, 10) : '',
    }))

    // Load claims for this user
    const claimsResult = await sql<{
      id: number
      claim_number: string
      amount: number
      description: string | null
      status: string
      filed_date: Date | null
      policy_number: string
      policy_type: string
    }>`
      SELECT
        c.id,
        c.claim_number,
        c.amount,
        c.description,
        c.status,
        c.filed_date,
        p.policy_number,
        p.type as policy_type
      FROM claims c
      JOIN policies p ON c.policy_id = p.id
      WHERE c.user_id = ${userId}
      ORDER BY c.filed_date DESC;
    `

    const claims = claimsResult.rows.map((c) => ({
      id: c.claim_number,
      policyNumber: c.policy_number,
      type: toTitleCase(c.policy_type),
      amount: Number(c.amount),
      status: toTitleCase(c.status),
      date: c.filed_date ? c.filed_date.toISOString().slice(0, 10) : '',
      description: c.description ?? '',
    }))

    // Build simple monthly claim trends from the user's claims
    const trendsMap = new Map<
      string,
      { approved: number; rejected: number; pending: number }
    >()

    for (const c of claimsResult.rows) {
      const filed = c.filed_date ?? new Date()
      const monthLabel = filed.toLocaleString('en-US', { month: 'short' })

      if (!trendsMap.has(monthLabel)) {
        trendsMap.set(monthLabel, { approved: 0, rejected: 0, pending: 0 })
      }

      const bucket = trendsMap.get(monthLabel)!
      if (c.status === 'approved') {
        bucket.approved += 1
      } else if (c.status === 'rejected') {
        bucket.rejected += 1
      } else {
        bucket.pending += 1
      }
    }

    const claimTrends = Array.from(trendsMap.entries()).map(
      ([month, value]) => ({
        month,
        ...value,
      })
    )

    const totalCoverage = policies.reduce(
      (sum, p) => sum + Number(p.coverage || 0),
      0
    )

    const activeClaims = claimsResult.rows.filter((c) =>
      ['pending', 'under_review'].includes(c.status)
    ).length

    const data = {
      stats: {
        myPolicies: policies.length,
        activeClaims,
        totalClaims: claims.length,
        // As a simple approximation, use the sum of premiums as the "next payment"
        nextPayment: policies.reduce(
          (sum, p) => sum + Number(p.premium ?? 0),
          0
        ),
        nextPaymentDate:
          policiesResult.rows[0]?.start_date?.toISOString().slice(0, 10) ?? '',
        coverageTotal: totalCoverage,
      },
      myPolicies: policies,
      myClaims: claims,
      claimTrends,
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error loading user dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to load user dashboard data' },
      { status: 500 }
    )
  }
}

