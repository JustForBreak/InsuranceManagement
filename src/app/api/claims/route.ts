// src/app/api/claims/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const userCookie = request.cookies.get('user')?.value;
    if (!userCookie) return NextResponse.json({ claims: [] });

    const user = JSON.parse(userCookie);

    const result = await pool.query(
      `SELECT c.*, p.policy_number 
       FROM claims c 
       LEFT JOIN policies p ON c.policy_id = p.id 
       WHERE c.user_id = $1 
       ORDER BY c.filed_date DESC`,
      [user.id]
    );

    return NextResponse.json({ claims: result.rows });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ claims: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const userCookie = request.cookies.get('user')?.value;
    if (!userCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = JSON.parse(userCookie);
    const policyId = formData.get('policyId') as string || null;
    const amount = formData.get('amount') as string;
    const description = formData.get('description') as string;

    const claimNumber = `CLM-${Date.now()}`;

    const result = await pool.query(
      `INSERT INTO claims 
       (claim_number, user_id, policy_id, amount, description, status, filed_date)
       VALUES ($1, $2, $3, $4, $5, 'pending', NOW())
       RETURNING *`,
      [claimNumber, user.id, policyId, amount, description]
    );

    return NextResponse.json({ success: true, claim: result.rows[0] });
  } catch (error: any) {
    console.error("Claim submit error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}