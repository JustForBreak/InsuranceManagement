# SQL Commands to Run

## Quick Setup (Copy and Paste These Commands)

### Step 1: Connect to PostgreSQL

```bash
# Replace with your actual database credentials
psql -h localhost -U your_username -d insurance_db
```

Or if you need to create the database first:

```bash
psql -h localhost -U your_username -d postgres
```

Then:

```sql
CREATE DATABASE insurance_db;
\c insurance_db
```

---

## Step 2: Run Initial Schema

Copy and paste this entire block into your PostgreSQL terminal:

```sql
-- Create users table with role-based authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('admin', 'agent', 'customer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create policies table
CREATE TABLE IF NOT EXISTS policies (
    id SERIAL PRIMARY KEY,
    policy_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    coverage_amount DECIMAL(15,2),
    premium DECIMAL(10,2),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customer Credit Profile Table
CREATE TABLE IF NOT EXISTS credit_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    credit_score INTEGER CHECK (credit_score BETWEEN 300 AND 850),
    risk_level VARCHAR(20),
    last_checked DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create claims table
CREATE TABLE IF NOT EXISTS claims (
    id SERIAL PRIMARY KEY,
    claim_number VARCHAR(50) UNIQUE NOT NULL,
    policy_id INTEGER REFERENCES policies(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    filed_date DATE DEFAULT CURRENT_DATE,
    resolved_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_policies_user_id ON policies(user_id);
CREATE INDEX IF NOT EXISTS idx_policies_policy_number ON policies(policy_number);
CREATE INDEX IF NOT EXISTS idx_policies_status ON policies(status);
CREATE INDEX IF NOT EXISTS idx_credit_profiles_user_id ON credit_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_claims_user_id ON claims(user_id);
CREATE INDEX IF NOT EXISTS idx_claims_policy_id ON claims(policy_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
```

---

## Step 3: Insert Test Data (Development Only)

Copy and paste this to create test accounts and sample data:

```sql
-- Insert test users (password is 'password123' for all)
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@example.com', 'password123', 'Admin', 'User', 'admin'),
('agent@example.com', 'password123', 'John', 'Agent', 'agent'),
('agent2@example.com', 'password123', 'Sarah', 'Smith', 'agent'),
('customer@example.com', 'password123', 'Jane', 'Doe', 'customer'),
('customer2@example.com', 'password123', 'Michael', 'Johnson', 'customer'),
('customer3@example.com', 'password123', 'Emily', 'Williams', 'customer')
ON CONFLICT (email) DO NOTHING;

-- Insert sample policies
DO $$
DECLARE
    customer1_id INTEGER;
    customer2_id INTEGER;
    customer3_id INTEGER;
BEGIN
    SELECT id INTO customer1_id FROM users WHERE email = 'customer@example.com';
    SELECT id INTO customer2_id FROM users WHERE email = 'customer2@example.com';
    SELECT id INTO customer3_id FROM users WHERE email = 'customer3@example.com';

    INSERT INTO policies (policy_number, user_id, type, coverage_amount, premium, start_date, end_date, status) VALUES
    ('POL-2024-1001', customer1_id, 'auto', 25000.00, 145.00, '2024-01-01', '2025-01-01', 'active'),
    ('POL-2024-1002', customer1_id, 'home', 35000.00, 225.00, '2024-02-15', '2025-02-15', 'active'),
    ('POL-2024-1003', customer1_id, 'health', 15000.00, 80.00, '2024-03-01', '2025-03-01', 'active'),
    ('POL-2024-2001', customer2_id, 'auto', 30000.00, 165.00, '2024-01-15', '2025-01-15', 'active'),
    ('POL-2024-2002', customer2_id, 'life', 50000.00, 120.00, '2024-02-01', '2025-02-01', 'active'),
    ('POL-2024-3001', customer3_id, 'home', 40000.00, 250.00, '2024-01-20', '2025-01-20', 'active'),
    ('POL-2024-3002', customer3_id, 'health', 20000.00, 95.00, '2024-03-10', '2025-03-10', 'active')
    ON CONFLICT (policy_number) DO NOTHING;

    INSERT INTO credit_profiles (user_id, credit_score, risk_level) VALUES
    (customer1_id, 720, 'low'),
    (customer2_id, 680, 'medium'),
    (customer3_id, 750, 'low')
    ON CONFLICT DO NOTHING;

    INSERT INTO claims (claim_number, policy_id, user_id, amount, description, status, filed_date) VALUES
    (
        'CLM-2024-001',
        (SELECT id FROM policies WHERE policy_number = 'POL-2024-1001'),
        customer1_id,
        2500.00,
        'Vehicle collision damage - rear-end accident',
        'under_review',
        '2024-06-10'
    ),
    (
        'CLM-2024-002',
        (SELECT id FROM policies WHERE policy_number = 'POL-2024-1002'),
        customer1_id,
        1200.00,
        'Water damage repair in basement',
        'approved',
        '2024-05-15'
    ),
    (
        'CLM-2024-003',
        (SELECT id FROM policies WHERE policy_number = 'POL-2024-1003'),
        customer1_id,
        850.00,
        'Medical expenses - routine procedure',
        'approved',
        '2024-04-20'
    ),
    (
        'CLM-2024-004',
        (SELECT id FROM policies WHERE policy_number = 'POL-2024-2001'),
        customer2_id,
        3200.00,
        'Windshield replacement and paint repair',
        'pending',
        '2024-06-12'
    ),
    (
        'CLM-2024-005',
        (SELECT id FROM policies WHERE policy_number = 'POL-2024-3001'),
        customer3_id,
        1800.00,
        'Roof damage from storm',
        'approved',
        '2024-05-20'
    )
    ON CONFLICT (claim_number) DO NOTHING;
END $$;
```

---

## Step 4: Verify Everything Worked

Run these commands to verify:

```sql
-- List all tables
\dt

-- Check users
SELECT email, role, first_name, last_name FROM users;

-- Check policies count
SELECT COUNT(*) as total_policies FROM policies;

-- Check claims count
SELECT COUNT(*) as total_claims FROM claims;
```

Expected output:
- 6 users (1 admin, 2 agents, 3 customers)
- 7 policies
- 5 claims

---

## Test Login Credentials

You can now login to the application with these credentials:

| Email | Password | Role | Dashboard |
|-------|----------|------|-----------|
| admin@example.com | password123 | admin | Admin Dashboard |
| agent@example.com | password123 | agent | Admin Dashboard |
| customer@example.com | password123 | customer | User Dashboard |

---

## If You Already Have a Database

If you already have tables and need to update the role constraint:

```sql
-- Drop old constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add new constraint with admin role
ALTER TABLE users ADD CONSTRAINT users_role_check 
    CHECK (role IN ('admin', 'agent', 'customer'));

-- Add claims table if it doesn't exist
CREATE TABLE IF NOT EXISTS claims (
    id SERIAL PRIMARY KEY,
    claim_number VARCHAR(50) UNIQUE NOT NULL,
    policy_id INTEGER REFERENCES policies(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    filed_date DATE DEFAULT CURRENT_DATE,
    resolved_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## Using Migration Files

Alternatively, you can run the migration files:

```bash
# From terminal (not in psql)
cd /path/to/InsuranceManagement

# Run initial schema
psql -h localhost -U your_username -d insurance_db -f migrations/001_initial_schema.sql

# Run seed data
psql -h localhost -U your_username -d insurance_db -f migrations/002_seed_data.sql

# Or if updating existing database
psql -h localhost -U your_username -d insurance_db -f migrations/003_update_existing_roles.sql
```

---

## Troubleshooting

### "relation already exists"
This means tables are already created. You can either:
1. Drop them: `DROP TABLE users CASCADE;`
2. Or run the update migration: `migrations/003_update_existing_roles.sql`

### "permission denied"
Make sure your PostgreSQL user has CREATE privileges:
```sql
GRANT ALL PRIVILEGES ON DATABASE insurance_db TO your_username;
```

### Can't connect
Check your `.env.local` file has correct credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=insurance_db
DB_USER=your_username
DB_PASSWORD=your_password
```

---

## Security Warning

⚠️ **The seed data uses plain text passwords for DEVELOPMENT ONLY!**

Before production:
1. Implement bcrypt password hashing
2. Remove seed data
3. Use strong passwords
4. Enable SSL for database connections

