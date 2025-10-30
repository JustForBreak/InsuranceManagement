const { Client } = require('pg');

// Database connection configuration
// For Railway, this will come from environment variables
const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'insurance_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testDatabaseOperations() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');

    // Create sample user
    console.log('\n--- Creating sample user ---');
    const userResult = await client.query(`
      INSERT INTO users (email, password_hash, first_name, last_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, first_name, last_name
    `, ['john.doe@example.com', 'hashed_password_123', 'John', 'Doe']);

    console.log('Created user:', userResult.rows[0]);

    // Read user
    console.log('\n--- Reading user ---');
    const readUserResult = await client.query(`
      SELECT id, email, first_name, last_name, created_at FROM users WHERE email = $1
    `, ['john.doe@example.com']);

    console.log('Read user:', readUserResult.rows[0]);

    // Create sample policy
    console.log('\n--- Creating sample policy ---');
    const policyResult = await client.query(`
      INSERT INTO policies (policy_number, user_id, type, coverage_amount, premium, start_date, end_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, policy_number, type, coverage_amount, premium, status
    `, ['POL-001', userResult.rows[0].id, 'auto', 50000.00, 120.50, '2024-01-01', '2025-01-01', 'active']);

    console.log('Created policy:', policyResult.rows[0]);

    // Read policies for user
    console.log('\n--- Reading policies for user ---');
    const policiesResult = await client.query(`
      SELECT p.id, p.policy_number, p.type, p.coverage_amount, p.premium, p.status,
             u.first_name, u.last_name
      FROM policies p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = $1
    `, [userResult.rows[0].id]);

    console.log('User policies:', policiesResult.rows);

    // Update policy status
    console.log('\n--- Updating policy status ---');
    const updateResult = await client.query(`
      UPDATE policies
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE policy_number = $2
      RETURNING id, policy_number, status
    `, ['cancelled', 'POL-001']);

    console.log('Updated policy:', updateResult.rows[0]);

    // Delete policy (cleanup)
    console.log('\n--- Deleting policy ---');
    const deletePolicyResult = await client.query(`
      DELETE FROM policies WHERE policy_number = $1
      RETURNING id, policy_number
    `, ['POL-001']);

    console.log('Deleted policy:', deletePolicyResult.rows[0]);

    // Delete user (cleanup)
    console.log('\n--- Deleting user ---');
    const deleteUserResult = await client.query(`
      DELETE FROM users WHERE email = $1
      RETURNING id, email
    `, ['john.doe@example.com']);

    console.log('Deleted user:', deleteUserResult.rows[0]);

    console.log('\n--- Database operations completed successfully! ---');

  } catch (error) {
    console.error('Database operation failed:', error);
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

// Run the test
testDatabaseOperations();
