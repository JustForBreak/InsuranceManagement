import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { Resend } from 'resend';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, role } = await request.json();

    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (role !== 'agent' && role !== 'customer') {
      return NextResponse.json(
        { success: false, message: 'Invalid role. Must be "agent" or "customer"' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user (Note: In production, hash the password!)
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, role',
      [email, password, firstName, lastName, role]
    );

    const newUser = result.rows[0];
    
    // Send welcome email (non-blocking - don't fail registration if email fails)
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        await resend.emails.send({
          from: 'Insurance Portal <insurance@vidova.ai>',
          to: email,
          subject: 'Welcome to Insurance Management!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #333;">Welcome to Insurance Portal!</h1>
              <p>Hi <strong>${firstName} ${lastName}</strong>,</p>
              <p>Your account has been successfully created with the following details:</p>
              <ul>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Account Type:</strong> ${role === 'agent' ? 'Agent' : 'Customer'}</li>
              </ul>
              <p>You can now log in to access your dashboard and manage your insurance policies.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" 
                 style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 20px;">
                Login to Dashboard
              </a>
              <p style="margin-top: 30px; color: #666; font-size: 12px;">
                If you didn't create this account, please ignore this email.
              </p>
            </div>
          `
        });
        console.log('✅ Welcome email sent successfully to:', email);
      } catch (emailError) {
        // Log error but don't fail registration
        console.error('⚠️ Failed to send welcome email:', emailError);
        console.log('ℹ️ Registration completed successfully despite email failure');
      }
    } else {
      console.log('⚠️ RESEND_API_KEY not configured - skipping welcome email');
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please check your email for confirmation.',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: `${newUser.first_name} ${newUser.last_name}`,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Database error during registration' },
      { status: 500 }
    );
  }
}
