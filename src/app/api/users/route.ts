import { NextResponse } from "next/server";
import { query } from "@/lib/db"; // Adjust path if needed

// GET /api/users
export async function GET() {
  try {
    const users = await query(`
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.role,

        cp.credit_score,
        cp.risk_level,
        cp.last_checked,

        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', p.id,
              'policy_number', p.policy_number,
              'type', p.type,
              'coverage_amount', p.coverage_amount,
              'premium', p.premium,
              'start_date', p.start_date,
              'end_date', p.end_date,
              'status', p.status
            )
          ) FILTER (WHERE p.id IS NOT NULL),
          '[]'
        ) AS policies,

        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', c.id,
              'claim_number', c.claim_number,
              'amount', c.amount,
              'description', c.description,
              'status', c.status,
              'filed_date', c.filed_date
            )
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) AS claims

      FROM users u
      LEFT JOIN credit_profiles cp ON cp.user_id = u.id
      LEFT JOIN policies p ON p.user_id = u.id
      LEFT JOIN claims c ON c.user_id = u.id

      GROUP BY u.id, cp.id

      ORDER BY u.id ASC;
    `);

    return NextResponse.json(users.rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
