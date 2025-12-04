// src/app/api/policies/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    let query = `
        SELECT p.id, p.policy_number, p.type, p.coverage_amount, p.premium,
               p.start_date, p.end_date, p.status,
               u.id as user_id, u.first_name, u.last_name, u.email
        FROM policies p
        JOIN users u ON u.id = p.user_id
        WHERE 1=1
    `;
    const params: any[] = [];

    if (userId) {
      query += ` AND p.user_id = $1`;
      params.push(parseInt(userId, 10));
    }

    query += ` ORDER BY p.id`;

    const result = await pool.query(query, params);

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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, type, coverageAmount, premium, startDate, endDate } = body;

    if (!userId || !type || !coverageAmount || !premium || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields: userId, type, coverageAmount, premium, startDate, endDate" },
        { status: 400 }
      );
    }

    const year = new Date().getFullYear();
    const policyCountResult = await pool.query(
      `SELECT COUNT(*) + 1 as next_num FROM policies WHERE EXTRACT(YEAR FROM created_at) = $1`,
      [year]
    );
    const nextNum = policyCountResult.rows[0].next_num;
    const policyNumber = `POL-${year}-${String(nextNum).padStart(4, "0")}`;

    const result = await pool.query(
      `INSERT INTO policies (policy_number, user_id, type, coverage_amount, premium, start_date, end_date, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'under_review')
             RETURNING id, policy_number, type, coverage_amount, premium, start_date, end_date, status`,
      [
        policyNumber,
        parseInt(userId, 10),
        type,
        parseFloat(coverageAmount),
        parseFloat(premium),
        startDate,
        endDate,
      ]
    );

    return NextResponse.json({ success: true, policy: result.rows[0] }, { status: 201 });
  } catch (err: any) {
    console.error("Failed to create policy:", err);
    if (err.code === "23505") {
      return NextResponse.json({ error: "Policy number already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create policy" }, { status: 500 });
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
