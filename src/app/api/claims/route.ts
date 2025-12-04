// src/app/api/claims/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");

    let query = `
      SELECT 
        c.id,
        c.claim_number,
        c.amount,
        c.description,
        c.status,
        c.filed_date,
        c.resolved_date,
        c.policy_id,
        u.id as user_id,
        u.first_name,
        u.last_name,
        u.email,
        p.policy_number,
        p.type as policy_type
      FROM claims c
      JOIN users u ON c.user_id = u.id
      JOIN policies p ON c.policy_id = p.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND c.status = $${paramCount}`;
      params.push(status);
    }

    if (userId) {
      paramCount++;
      query += ` AND c.user_id = $${paramCount}`;
      params.push(parseInt(userId, 10));
    }

    query += ` ORDER BY c.filed_date DESC`;

    const { rows } = await pool.query(query, params);

    const claims = rows.map((row) => ({
      id: row.id,
      claimNumber: row.claim_number,
      amount: parseFloat(row.amount),
      description: row.description,
      status: row.status,
      filedDate: row.filed_date,
      resolvedDate: row.resolved_date,
      policyId: row.policy_id,
      policyNumber: row.policy_number,
      policyType: row.policy_type,
      user: {
        id: row.user_id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
      },
    }));

    return NextResponse.json(claims);
  } catch (err) {
    console.error("Failed to load claims:", err);
    return NextResponse.json({ error: "Failed to load claims" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { policyId, userId, amount, description } = body;

    if (!policyId || !userId || !amount || !description) {
      return NextResponse.json(
        { error: "Missing required fields: policyId, userId, amount, description" },
        { status: 400 }
      );
    }

    const claimNumberResult = await pool.query(
      `SELECT COUNT(*) + 1 as next_num FROM claims WHERE EXTRACT(YEAR FROM filed_date) = EXTRACT(YEAR FROM CURRENT_DATE)`
    );
    const nextNum = claimNumberResult.rows[0].next_num;
    const year = new Date().getFullYear();
    const claimNumber = `CLM-${year}-${String(nextNum).padStart(3, "0")}`;

    const policyCheck = await pool.query(
      `SELECT id FROM policies WHERE id = $1 AND user_id = $2`,
      [policyId, userId]
    );

    if (policyCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Policy not found or does not belong to user" },
        { status: 404 }
      );
    }

    const result = await pool.query(
      `INSERT INTO claims (claim_number, policy_id, user_id, amount, description, status, filed_date)
       VALUES ($1, $2, $3, $4, $5, 'pending', CURRENT_DATE)
       RETURNING id, claim_number, amount, description, status, filed_date`,
      [claimNumber, policyId, userId, parseFloat(amount), description]
    );

    return NextResponse.json({ success: true, claim: result.rows[0] }, { status: 201 });
  } catch (err) {
    console.error("Failed to create claim:", err);
    return NextResponse.json({ error: "Failed to create claim" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get("id") || "", 10);
    const body = await req.json();
    const newStatus = body.status;

    if (!id || !newStatus) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }

    if (!["pending", "approved", "rejected", "under_review"].includes(newStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updateQuery =
      newStatus === "approved" || newStatus === "rejected"
        ? `UPDATE claims SET status = $1, resolved_date = CURRENT_DATE, updated_at = CURRENT_TIMESTAMP WHERE id = $2`
        : `UPDATE claims SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`;

    await pool.query(updateQuery, [newStatus, id]);

    return NextResponse.json({ success: true, id, status: newStatus });
  } catch (err) {
    console.error("Failed to update claim:", err);
    return NextResponse.json({ error: "Failed to update claim" }, { status: 500 });
  }
}
