import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function GET() {
  try {
    // Fetch all users with credit profiles
    const result = await pool.query(
      `SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        cp.credit_score,
        cp.risk_level,
        cp.last_checked
      FROM users u
      INNER JOIN credit_profiles cp ON u.id = cp.user_id
      ORDER BY cp.credit_score DESC`
    );

    const profiles = result.rows.map(row => {
      // Compute premium adjustment suggestion
      let adjustmentFactor;
      switch (row.risk_level) {
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

      return {
        name: `${row.first_name} ${row.last_name}`,
        email: row.email,
        credit_score: row.credit_score,
        risk_level: row.risk_level,
        last_checked: row.last_checked,
        suggested_multiplier: adjustmentFactor,
      };
    });

    return NextResponse.json({
      success: true,
      profiles,
    });
  } catch (error) {
    console.error('Error fetching credit profiles:', error);
    return NextResponse.json(
      { success: false, message: 'Database error fetching credit profiles' },
      { status: 500 }
    );
  }
}

