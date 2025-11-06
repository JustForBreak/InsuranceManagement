-- Insurance Management Database Schema
-- Migration 003: Update Role Constraints
-- Description: Update existing role check constraint to include 'admin' role

-- Drop existing constraint if it exists
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add new constraint with admin, agent, and customer roles
ALTER TABLE users ADD CONSTRAINT users_role_check 
    CHECK (role IN ('admin', 'agent', 'customer'));

-- Update any existing 'agent' roles to remain as 'agent' (they can be mapped to admin in the UI)
-- This migration is safe for existing data
UPDATE users SET role = 'agent' WHERE role = 'agent';
UPDATE users SET role = 'customer' WHERE role = 'customer';

-- Optional: If you want to convert existing agents to admins, uncomment the following line:
-- UPDATE users SET role = 'admin' WHERE role = 'agent';

-- Add comment to role column
COMMENT ON COLUMN users.role IS 'User role: admin (full access), agent (manage policies/claims), customer (view own data)';

