import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    // Claims by status
    const claimsByStatus = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as total_amount
      FROM claims
      GROUP BY status
      ORDER BY count DESC
    `);

    // Claims by policy type
    const claimsByPolicyType = await pool.query(`
      SELECT 
        p.type as policy_type,
        COUNT(c.id) as count,
        COALESCE(SUM(c.amount), 0) as total_amount
      FROM claims c
      JOIN policies p ON c.policy_id = p.id
      GROUP BY p.type
      ORDER BY count DESC
    `);

    // Policies by type
    const policiesByType = await pool.query(`
      SELECT 
        type,
        COUNT(*) as count,
        COALESCE(SUM(premium), 0) as total_premium,
        COALESCE(SUM(coverage_amount), 0) as total_coverage
      FROM policies
      GROUP BY type
      ORDER BY count DESC
    `);

    // Policies by status
    const policiesByStatus = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM policies
      GROUP BY status
      ORDER BY count DESC
    `);

    // Credit score distribution (buckets)
    const creditScoreDistribution = await pool.query(`
      SELECT 
        score_range,
        count
      FROM (
        SELECT 
          CASE 
            WHEN credit_score >= 750 THEN 'Excellent (750+)'
            WHEN credit_score >= 700 THEN 'Good (700-749)'
            WHEN credit_score >= 650 THEN 'Fair (650-699)'
            WHEN credit_score >= 600 THEN 'Poor (600-649)'
            ELSE 'Very Poor (<600)'
          END as score_range,
          COUNT(*) as count,
          CASE 
            WHEN credit_score >= 750 THEN 1
            WHEN credit_score >= 700 THEN 2
            WHEN credit_score >= 650 THEN 3
            WHEN credit_score >= 600 THEN 4
            ELSE 5
          END as sort_order
        FROM credit_profiles
        GROUP BY 
          CASE 
            WHEN credit_score >= 750 THEN 'Excellent (750+)'
            WHEN credit_score >= 700 THEN 'Good (700-749)'
            WHEN credit_score >= 650 THEN 'Fair (650-699)'
            WHEN credit_score >= 600 THEN 'Poor (600-649)'
            ELSE 'Very Poor (<600)'
          END,
          CASE 
            WHEN credit_score >= 750 THEN 1
            WHEN credit_score >= 700 THEN 2
            WHEN credit_score >= 650 THEN 3
            WHEN credit_score >= 600 THEN 4
            ELSE 5
          END
      ) subq
      ORDER BY sort_order
    `);

    // Risk level distribution
    const riskLevelDistribution = await pool.query(`
      SELECT 
        risk_level,
        COUNT(*) as count
      FROM credit_profiles
      GROUP BY risk_level
      ORDER BY 
        CASE risk_level
          WHEN 'low' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'high' THEN 3
          ELSE 4
        END
    `);

    // Summary stats
    const summaryStats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM policies) as total_policies,
        (SELECT COUNT(*) FROM policies WHERE status = 'active') as active_policies,
        (SELECT COUNT(*) FROM claims) as total_claims,
        (SELECT COUNT(*) FROM claims WHERE status = 'pending') as pending_claims,
        (SELECT COUNT(*) FROM claims WHERE status = 'approved') as approved_claims,
        (SELECT COUNT(*) FROM claims WHERE status = 'rejected') as rejected_claims,
        (SELECT COALESCE(SUM(amount), 0) FROM claims) as total_claim_amount,
        (SELECT COALESCE(SUM(amount), 0) FROM claims WHERE status = 'approved') as approved_claim_amount,
        (SELECT COALESCE(SUM(premium), 0) FROM policies WHERE status = 'active') as total_premium_revenue,
        (SELECT AVG(credit_score) FROM credit_profiles) as avg_credit_score
    `);

    return NextResponse.json({
      claimsByStatus: claimsByStatus.rows.map(row => ({
        status: row.status,
        count: parseInt(row.count),
        totalAmount: parseFloat(row.total_amount),
      })),
      claimsByPolicyType: claimsByPolicyType.rows.map(row => ({
        policyType: row.policy_type,
        count: parseInt(row.count),
        totalAmount: parseFloat(row.total_amount),
      })),
      policiesByType: policiesByType.rows.map(row => ({
        type: row.type,
        count: parseInt(row.count),
        totalPremium: parseFloat(row.total_premium),
        totalCoverage: parseFloat(row.total_coverage),
      })),
      policiesByStatus: policiesByStatus.rows.map(row => ({
        status: row.status,
        count: parseInt(row.count),
      })),
      creditScoreDistribution: creditScoreDistribution.rows.map(row => ({
        range: row.score_range,
        count: parseInt(row.count),
      })),
      riskLevelDistribution: riskLevelDistribution.rows.map(row => ({
        level: row.risk_level,
        count: parseInt(row.count),
      })),
      summary: {
        totalUsers: parseInt(summaryStats.rows[0].total_users),
        totalPolicies: parseInt(summaryStats.rows[0].total_policies),
        activePolicies: parseInt(summaryStats.rows[0].active_policies),
        totalClaims: parseInt(summaryStats.rows[0].total_claims),
        pendingClaims: parseInt(summaryStats.rows[0].pending_claims),
        approvedClaims: parseInt(summaryStats.rows[0].approved_claims),
        rejectedClaims: parseInt(summaryStats.rows[0].rejected_claims),
        totalClaimAmount: parseFloat(summaryStats.rows[0].total_claim_amount),
        approvedClaimAmount: parseFloat(summaryStats.rows[0].approved_claim_amount),
        totalPremiumRevenue: parseFloat(summaryStats.rows[0].total_premium_revenue),
        avgCreditScore: summaryStats.rows[0].avg_credit_score ? Math.round(parseFloat(summaryStats.rows[0].avg_credit_score)) : null,
      },
    });
  } catch (err) {
    console.error("Failed to fetch analytics:", err);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}

