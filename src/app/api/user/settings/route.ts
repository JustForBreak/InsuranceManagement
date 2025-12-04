// src/app/api/user/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const userCookie = request.cookies.get('user')?.value;
    if (!userCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = JSON.parse(userCookie);
    
    // Fetch user settings from DB (or defaults)
    const result = await pool.query(
      `SELECT 
        email_notifications, sms_notifications, 
        auto_renew, payment_method 
       FROM user_settings 
       WHERE user_id = $1`,
      [user.id]
    );

    const settings = result.rows[0] || {
      email_notifications: true,
      sms_notifications: false,
      auto_renew: true,
      payment_method: 'credit_card',
    };

    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ settings: {} }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userCookie = request.cookies.get('user')?.value;
    if (!userCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = JSON.parse(userCookie);
    const body = await request.json();

    // Upsert user settings
    await pool.query(
      `INSERT INTO user_settings (user_id, email_notifications, sms_notifications, auto_renew, payment_method)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE SET
       email_notifications = $2, sms_notifications = $3, auto_renew = $4, payment_method = $5`,
      [user.id, body.email_notifications, body.sms_notifications, body.auto_renew, body.payment_method]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}