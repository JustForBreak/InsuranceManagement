# Database Setup Guide

This guide will help you set up the PostgreSQL database for the Insurance Management System.

## Quick Start

### Option 1: Run All Migrations (Recommended for new installations)

```bash
# Navigate to the project directory
cd /path/to/InsuranceManagement

# Run migrations in order
psql -h <host> -U <user> -d <database> -f migrations/001_initial_schema.sql
psql -h <host> -U <user> -d <database> -f migrations/002_seed_data.sql
```

### Option 2: Use the main schema file

```bash
psql -h <host> -U <user> -d <database> -f schema.sql
```

Then optionally run seed data:

```bash
psql -h <host> -U <user> -d <database> -f migrations/002_seed_data.sql
```

## Database Connection

Make sure your environment variables are set correctly in `.env.local`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=insurance_db
DB_USER=your_username
DB_PASSWORD=your_password
```

## Test the Connection

Run this command to test your database connection:

```bash
node db-test.js
```

## SQL Commands to Run

### For a Fresh Database:

```sql
-- 1. Create the database (if it doesn't exist)
CREATE DATABASE insurance_db;

-- 2. Connect to the database
\c insurance_db

-- 3. Run the schema file
\i schema.sql

-- 4. (Optional) Run seed data for testing
\i migrations/002_seed_data.sql
```

### For Existing Database (Upgrade):

If you already have a database with the old schema:

```sql
-- Connect to your database
\c insurance_db

-- Run the update migration
\i migrations/003_update_existing_roles.sql
```

## Verify Installation

After running the migrations, verify the tables:

```sql
-- List all tables
\dt

-- Check users table structure
\d users

-- Verify test data
SELECT email, role FROM users;
```

## Test Credentials

After running seed data, you can login with:

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | password123 | admin |
| agent@example.com | password123 | agent |
| customer@example.com | password123 | customer |

## Troubleshooting

### Connection Refused

- Make sure PostgreSQL is running: `pg_ctl status`
- Check if the port is correct (default: 5432)
- Verify your credentials

### Permission Denied

- Make sure your user has the necessary permissions
- Try connecting as superuser: `psql -U postgres`

### Table Already Exists

- If you get "table already exists" errors, you can either:
  - Drop existing tables: `DROP TABLE users CASCADE;`
  - Or run the update migration: `migrations/003_update_existing_roles.sql`

## Security Notes

⚠️ **IMPORTANT**: The seed data uses plain text passwords for development only!

Before deploying to production:

1. Update `src/app/api/login/route.ts` to use bcrypt for password hashing
2. Never use the seed data in production
3. Implement proper password reset functionality
4. Enable SSL for database connections

## Need Help?

Check the detailed migration README:
```bash
cat migrations/README.md
```

