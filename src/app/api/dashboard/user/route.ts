import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

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
    const userIdParam = searchParams.get('userId')

    if (!userIdParam) {
      return NextResponse.json(
        { error: 'Missing userId in query string' },
        { status: 400 }
      )
    }

    const userId = parseInt(userIdParam, 10)
    if (isNaN(userId) || userId <= 0) {
      return NextResponse.json(
        { error: 'Invalid userId: must be a positive integer' },
        { status: 400 }
      )
    }

    // Load policies for this user
    const policiesResult = await pool.query(
      `SELECT
        p.id,
        p.policy_number,
        p.type,
        p.coverage_amount,
        p.premium,
        p.start_date,
        p.end_date,
        p.status
      FROM policies p
      WHERE p.user_id = $1
      ORDER BY p.start_date ASC`,
      [userId]
    )

    const policies = policiesResult.rows.map((p: any) => ({
      id: p.policy_number,
      type: toTitleCase(p.type),
      status: p.status ?? 'active',
      premium: Number(p.premium ?? 0),
      coverage: Number(p.coverage_amount ?? 0),
      startDate: p.start_date ? new Date(p.start_date).toISOString().slice(0, 10) : '',
      endDate: p.end_date ? new Date(p.end_date).toISOString().slice(0, 10) : '',
      // For now we surface the next payment date as the start date;
      // in a real system this would come from a billing schedule.
      nextPaymentDate: p.start_date ? new Date(p.start_date).toISOString().slice(0, 10) : '',
    }))

    // Load claims for this user
    const claimsResult = await pool.query(
      `SELECT
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
      WHERE c.user_id = $1
      ORDER BY c.filed_date DESC`,
      [userId]
    )

    const claims = claimsResult.rows.map((c: any) => ({
      id: c.claim_number,
      policyNumber: c.policy_number,
      type: toTitleCase(c.policy_type),
      amount: Number(c.amount),
      status: toTitleCase(c.status),
      date: c.filed_date ? new Date(c.filed_date).toISOString().slice(0, 10) : '',
      description: c.description ?? '',
    }))

    // Build simple monthly claim trends from the user's claims
    const trendsMap = new Map<
      string,
      { approved: number; rejected: number; pending: number }
    >()

    for (const c of claimsResult.rows as any[]) {
      const filed = c.filed_date ? new Date(c.filed_date) : new Date()
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

    const activeClaims = (claimsResult.rows as any[]).filter((c) =>
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
          (policiesResult.rows[0] as any)?.start_date 
            ? new Date((policiesResult.rows[0] as any).start_date).toISOString().slice(0, 10) 
            : '',
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

