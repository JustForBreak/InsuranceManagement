// src/app/api/documents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const userCookie = request.cookies.get('user')?.value;
    if (!userCookie) return NextResponse.json({ policies: [] });

    const user = JSON.parse(userCookie);

    const result = await pool.query(
      `SELECT 
        p.id,
        p.policy_number,
        p.type,
        p.status,
        p.coverage_amount,
        p.premium,
        p.start_date,
        p.end_date,
        p.created_at
       FROM policies p 
       WHERE p.user_id = $1 
       ORDER BY p.created_at DESC`,
      [user.id]
    );

    const policies = result.rows.map((policy: any) => ({
      ...policy,
      documents: [
        {
          type: "Policy Contract",
          description: `Full insurance contract for ${policy.type} policy`,
          id: `${policy.id}-contract`,
        },
        {
          type: "Digital ID Card",
          description: "Insurance ID card (print or show to authorities)",
          id: `${policy.id}-idcard`,
        },
        {
          type: "Payment Receipt",
          description: "Premium payment confirmation",
          id: `${policy.id}-receipt`,
        },
      ],
    }));

    return NextResponse.json({ policies });
  } catch (error) {
    console.error("Documents fetch error:", error);
    return NextResponse.json({ policies: [] }, { status: 500 });
  }
}