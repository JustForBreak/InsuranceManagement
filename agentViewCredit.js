// agentViewCredit.js
const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'insurance_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function getCustomerCreditProfile(email) {
  try {
    await client.connect();
    console.log(`🔍 Looking up credit profile for ${email}...`);

    // 1. Find the user
    const userResult = await client.query(
      `SELECT id, first_name, last_name, email FROM users WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      console.log('❌ No customer found with that email.');
      return;
    }

    const user = userResult.rows[0];

    // 2. Fetch their credit profile
    const creditResult = await client.query(
      `SELECT credit_score, risk_level, last_checked 
       FROM credit_profiles 
       WHERE user_id = $1`,
      [user.id]
    );

    if (creditResult.rows.length === 0) {
      console.log('⚠️ No credit profile found for this customer.');
      return;
    }

    const credit = creditResult.rows[0];

    // 3. Compute premium adjustment suggestion
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

    console.log('\n--- Customer Credit Profile ---');
    console.log(`Name: ${user.first_name} ${user.last_name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Credit Score: ${credit.credit_score}`);
    console.log(`Risk Level: ${credit.risk_level}`);
    console.log(`Last Checked: ${credit.last_checked}`);
    console.log(`Suggested Premium Multiplier: x${adjustmentFactor}`);
    console.log('--------------------------------');

  } catch (err) {
    console.error('Error fetching credit profile:', err);
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

// Example usage:
getCustomerCreditProfile('john.doe@example.com');

