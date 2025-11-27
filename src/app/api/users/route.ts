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
    // Fetch users with credit profile
    const usersResult = await pool.query(`
      SELECT u.id, u.first_name, u.last_name, u.email,
             c.credit_score, c.risk_level
      FROM users u
      LEFT JOIN credit_profiles c ON c.user_id = u.id
      ORDER BY u.id
    `);

    const users = [];

    for (const row of usersResult.rows) {
      // Fetch policies for each user
      const policiesResult = await pool.query(
        `SELECT id, policy_number, type, coverage_amount, premium, start_date, end_date, status
         FROM policies
         WHERE user_id = $1`,
        [row.id]
      );

      // Fetch claims for each user
      const claimsResult = await pool.query(
        `SELECT id, claim_number, amount, description, status, filed_date, resolved_date
         FROM claims
         WHERE user_id = $1`,
        [row.id]
      );

      users.push({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        creditScore: row.credit_score,
        riskLevel: row.risk_level,
        policies: policiesResult.rows,
        claims: claimsResult.rows,
      });
    }

    return NextResponse.json(users);
  } catch (err) {
    console.error("Failed to fetch users:", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
