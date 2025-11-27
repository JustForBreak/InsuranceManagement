import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT p.id, p.policy_number, p.type, p.coverage_amount, p.premium,
             p.start_date, p.end_date, p.status,
             u.id as user_id, u.first_name, u.last_name, u.email
      FROM policies p
      JOIN users u ON u.id = p.user_id
      ORDER BY p.id
    `);

    const policies = result.rows.map((row) => ({
      id: row.id,
      policyNumber: row.policy_number,
      type: row.type,
      coverageAmount: row.coverage_amount,
      premium: row.premium,
      startDate: row.start_date,
      endDate: row.end_date,
      status: row.status,
      user: {
        id: row.user_id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
      },
    }));

    return NextResponse.json(policies);
  } catch (err) {
    console.error("Failed to fetch policies:", err);
    return NextResponse.json({ error: "Failed to fetch policies" }, { status: 500 });
  }
}

// PATCH /api/policies?id=123
export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get("id") || "", 10);
    const body = await req.json();
    const newStatus = body.status; // "Active", "Denied", "Flagged"

    if (!id || !newStatus) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }

    // Update the policy status in the database
    await pool.query(
      `UPDATE policies SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [newStatus, id]
    );

    return NextResponse.json({ success: true, id, status: newStatus });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update policy" }, { status: 500 });
  }
}
