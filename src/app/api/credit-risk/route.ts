import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432", 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        c.credit_score,
        c.risk_level,
        (
          SELECT json_agg(claim)
          FROM (
            SELECT claim_number, status, amount 
            FROM claims 
            WHERE user_id = u.id AND status IN ('rejected', 'under_review')
          ) claim
        ) AS concerning_claims,
        (
          SELECT json_agg(pol)
          FROM (
            SELECT policy_number, status 
            FROM policies 
            WHERE user_id = u.id AND status = 'cancelled'
          ) pol
        ) AS concerning_policies
      FROM credit_profiles c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.credit_score;
    `);

    return NextResponse.json(rows);
  } catch (err) {
    console.error("Failed to fetch credit risk data:", err);
    return NextResponse.json({ error: "Failed to fetch credit risk data" }, { status: 500 });
  }
}
