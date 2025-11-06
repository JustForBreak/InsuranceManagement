-- Insurance Management Database Schema
-- Migration 002: Seed Data
-- Description: Insert sample data for testing and development

-- Insert test users (password is 'password123' for all)
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@example.com', 'password123', 'Admin', 'User', 'admin'),
('agent@example.com', 'password123', 'John', 'Agent', 'agent'),
('agent2@example.com', 'password123', 'Sarah', 'Smith', 'agent'),
('customer@example.com', 'password123', 'Jane', 'Doe', 'customer'),
('customer2@example.com', 'password123', 'Michael', 'Johnson', 'customer'),
('customer3@example.com', 'password123', 'Emily', 'Williams', 'customer')
ON CONFLICT (email) DO NOTHING;

-- Get user IDs for reference
DO $$
DECLARE
    customer1_id INTEGER;
    customer2_id INTEGER;
    customer3_id INTEGER;
BEGIN
    SELECT id INTO customer1_id FROM users WHERE email = 'customer@example.com';
    SELECT id INTO customer2_id FROM users WHERE email = 'customer2@example.com';
    SELECT id INTO customer3_id FROM users WHERE email = 'customer3@example.com';

    -- Insert sample policies for customers
    INSERT INTO policies (policy_number, user_id, type, coverage_amount, premium, start_date, end_date, status) VALUES
    ('POL-2024-1001', customer1_id, 'auto', 25000.00, 145.00, '2024-01-01', '2025-01-01', 'active'),
    ('POL-2024-1002', customer1_id, 'home', 35000.00, 225.00, '2024-02-15', '2025-02-15', 'active'),
    ('POL-2024-1003', customer1_id, 'health', 15000.00, 80.00, '2024-03-01', '2025-03-01', 'active'),
    ('POL-2024-2001', customer2_id, 'auto', 30000.00, 165.00, '2024-01-15', '2025-01-15', 'active'),
    ('POL-2024-2002', customer2_id, 'life', 50000.00, 120.00, '2024-02-01', '2025-02-01', 'active'),
    ('POL-2024-3001', customer3_id, 'home', 40000.00, 250.00, '2024-01-20', '2025-01-20', 'active'),
    ('POL-2024-3002', customer3_id, 'health', 20000.00, 95.00, '2024-03-10', '2025-03-10', 'active')
    ON CONFLICT (policy_number) DO NOTHING;

    -- Insert credit profiles
    INSERT INTO credit_profiles (user_id, credit_score, risk_level) VALUES
    (customer1_id, 720, 'low'),
    (customer2_id, 680, 'medium'),
    (customer3_id, 750, 'low')
    ON CONFLICT DO NOTHING;

    -- Insert sample claims
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

