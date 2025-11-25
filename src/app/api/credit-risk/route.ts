// src/app/api/credit-risk/route.ts
import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET() {

    const { rows } = await sql`
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
    `;

    return NextResponse.json(rows);
}
