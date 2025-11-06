# Database Migrations

This directory contains SQL migration scripts for the Insurance Management System.

## Running Migrations

Execute the migrations in order:

```bash
# 1. Initial schema setup
psql -h <host> -U <user> -d <database> -f 001_initial_schema.sql

# 2. Seed data (optional, for development/testing)
psql -h <host> -U <user> -d <database> -f 002_seed_data.sql

# 3. Update role constraints (if upgrading from older schema)
psql -h <host> -U <user> -d <database> -f 003_update_existing_roles.sql
```

## Migration Files

### 001_initial_schema.sql
- Creates all core tables (users, policies, credit_profiles, claims)
- Sets up indexes for performance
- Creates triggers for auto-updating timestamps
- **Role support:** admin, agent, customer

### 002_seed_data.sql
- Inserts sample users with different roles
- Creates sample policies for testing
- Adds credit profiles for customers
- Creates sample claims with various statuses
- **Test credentials:** All users have password `password123`

### 003_update_existing_roles.sql
- Updates role constraints to include 'admin' role
- Safe to run on existing databases
- No data loss

## User Roles

- **admin**: Full system access, can manage all users, policies, and claims
- **agent**: Can manage customer policies and process claims
- **customer**: Can view their own policies and file claims

## Test Accounts

After running migration 002, the following test accounts are available:

| Email | Password | Role | Purpose |
|-------|----------|------|---------|
| admin@example.com | password123 | admin | Full system access |
| agent@example.com | password123 | agent | Agent dashboard testing |
| agent2@example.com | password123 | agent | Multi-agent testing |
| customer@example.com | password123 | customer | Customer with policies |
| customer2@example.com | password123 | customer | Customer with different policies |
| customer3@example.com | password123 | customer | Another customer |

## Database Schema Overview

### Tables

1. **users** - User accounts with role-based access
2. **policies** - Insurance policies linked to users
3. **credit_profiles** - Credit scoring for customers
4. **claims** - Insurance claims filed by customers

### Relationships

- `policies.user_id` → `users.id` (Each policy belongs to a user)
- `credit_profiles.user_id` → `users.id` (Each customer has a credit profile)
- `claims.policy_id` → `policies.id` (Each claim is for a specific policy)
- `claims.user_id` → `users.id` (Each claim is filed by a user)

## Environment Variables

Make sure your `.env` or `.env.local` file has the correct database credentials:

```env
DB_HOST=your_database_host
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
```

## Rollback

To rollback migrations, drop the tables in reverse order:

```sql
DROP TABLE IF EXISTS claims CASCADE;
DROP TABLE IF EXISTS credit_profiles CASCADE;
DROP TABLE IF EXISTS policies CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column();
```

## Notes

- All passwords in seed data are stored in plain text for development. **In production, use proper password hashing (bcrypt).**
- The system currently uses simple password comparison. Update the login API to use bcrypt before deploying to production.
- The role mapping in the dashboard: `agent` → `admin` dashboard, `customer` → `user` dashboard

