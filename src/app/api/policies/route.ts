// src/app/api/policies/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { type, coverageAmount, premium, startDate, endDate, userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID required' }, { status: 401 });
    }

    const policyNumber = `POL-${Date.now()}`;

    const result = await pool.query(
      `INSERT INTO policies 
       (policy_number, user_id, type, status, coverage_amount, premium, start_date, end_date) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [policyNumber, userId, type, 'active', coverageAmount, premium, startDate, endDate]
    );

    return NextResponse.json({ success: true, policy: result.rows[0] });
  } catch (error: any) {
    console.error('Policy creation error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create policy' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Extract userId from cookies or Authorization header (most secure)
    // For now, we'll read from a cookie your login sets
    const userCookie = request.cookies.get('user')?.value;

    if (!userCookie) {
      return NextResponse.json({ policies: [] }); // or 401 if you prefer
    }

    const user = JSON.parse(userCookie);
    const userId = user.id;

    const result = await pool.query(
      'SELECT * FROM policies WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    return NextResponse.json({ policies: result.rows });
  } catch (error: any) {
    console.error('Policy fetch error:', error);
    return NextResponse.json({ policies: [] }, { status: 500 });
  }
}
export async function PATCH(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Policy ID required" }, { status: 400 });
    }

    await pool.query(
      "UPDATE policies SET status = 'cancelled' WHERE id = $1",
      [id]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Cancel error:", error);
    return NextResponse.json({ error: "Failed to cancel" }, { status: 500 });
  }
}
