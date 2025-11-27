import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT 
        c.id,
        c.claim_number,
        c.amount,
        c.description,
        c.status,
        c.filed_date,
        c.resolved_date,
        u.first_name,
        u.last_name,
        u.email,
        p.policy_number
      FROM claims c
      JOIN users u ON c.user_id = u.id
      JOIN policies p ON c.policy_id = p.id
      ORDER BY c.filed_date DESC
    `);
    return NextResponse.json(rows);
  } catch (err) {
    console.error("Failed to load claims:", err);
    return NextResponse.json({ error: "Failed to load claims" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { claimId, action } = await req.json();

    if (!["approved", "rejected", "under_review"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await pool.query(
      `UPDATE claims SET status = $1 WHERE id = $2`,
      [action, claimId]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to update claim:", err);
    return NextResponse.json({ error: "Failed to update claim" }, { status: 500 });
  }
}
