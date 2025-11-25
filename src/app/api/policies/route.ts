import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET /api/policies
export async function GET() {
  try {
    const policies = await query(`
      SELECT
        p.*,
        jsonb_build_object(
          'id', u.id,
          'first_name', u.first_name,
          'last_name', u.last_name,
          'email', u.email
        ) AS user,

        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', c.id,
              'claim_number', c.claim_number,
              'amount', c.amount,
              'status', c.status,
              'description', c.description
            )
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) AS claims

      FROM policies p
      LEFT JOIN users u ON u.id = p.user_id
      LEFT JOIN claims c ON c.policy_id = p.id
      GROUP BY p.id, u.id
      ORDER BY p.id ASC;
    `);

    return NextResponse.json(policies.rows);
  } catch (err) {
    console.error("Policy fetch error:", err);
    return NextResponse.json({ error: "Error loading policies" }, { status: 500 });
  }
}

// PATCH /api/policies?id=##
export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const body = await req.json();

    if (!id || !body.status)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    await query(
      `UPDATE policies SET status = $1, updated_at = NOW() WHERE id = $2`,
      [body.status, id]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Policy update error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

