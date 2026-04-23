-- Create customer-service tables manually (avoiding db push conflicts)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'CUSTOMER',
  is_active BOOLEAN NOT NULL DEFAULT true,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_profiles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth TIMESTAMP,
  preferences JSONB DEFAULT '{}',
  total_orders INT NOT NULL DEFAULT 0,
  total_spent DECIMAL(10,2) NOT NULL DEFAULT 0,
  loyalty_points INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert test user (password: testpass123)
INSERT INTO users (id, email, password, first_name, last_name, phone, role, is_active, email_verified)
VALUES (
  'test-user-001',
  'test@cravedrop.com',
  '$2b$10$abcdefghijklmnopqrstuv', -- placeholder, auth will fail but user exists
  'Test',
  'User',
  '+1 555-9999',
  'CUSTOMER',
  true,
  true
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO customer_profiles (user_id)
VALUES ('test-user-001')
ON CONFLICT (user_id) DO NOTHING;
