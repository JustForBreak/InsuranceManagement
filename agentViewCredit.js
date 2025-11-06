import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    //Find the user
    const userResult = await pool.query(
      `SELECT id, first_name, last_name, email 
       FROM users 
       WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No customer found with that email' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

    // Fetch their credit profile
    const creditResult = await pool.query(
      `SELECT credit_score, risk_level, last_checked 
       FROM credit_profiles 
       WHERE user_id = $1`,
      [user.id]
    );

    if (creditResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No credit profile found for this customer' },
        { status: 404 }
      );
    }

    const credit = creditResult.rows[0];

    // Compute premium adjustment suggestion
    let adjustmentFactor;
    switch (credit.risk_level) {
      case 'low':
        adjustmentFactor = 0.95; // 5% discount
        break;
      case 'medium':
        adjustmentFactor = 1.0; // no change
        break;
      case 'high':
        adjustmentFactor = 1.15; // 15% surcharge
        break;
      default:
        adjustmentFactor = 1.0;
    }

    //  Return the profile as JSON (to display on the page)
    return NextResponse.json({
      success: true,
      message: 'Customer credit profile retrieved successfully',
      profile: {
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        credit_score: credit.credit_score,
        risk_level: credit.risk_level,
        last_checked: credit.last_checked,
        suggested_multiplier: adjustmentFactor,
      },
    });
  } catch (error) {
    console.error('Error fetching credit profile:', error);
    return NextResponse.json(
      { success: false, message: 'Database error fetching credit profile' },
      { status: 500 }
    );
  }
}


