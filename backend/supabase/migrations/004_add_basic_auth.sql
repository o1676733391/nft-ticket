-- Add email/password authentication support to users table
ALTER TABLE users 
  ALTER COLUMN wallet_address DROP NOT NULL,
  ADD COLUMN password_hash VARCHAR(255),
  ADD COLUMN auth_type VARCHAR(20) DEFAULT 'wallet' CHECK (auth_type IN ('wallet', 'email')),
  ADD CONSTRAINT users_auth_check CHECK (
    (auth_type = 'wallet' AND wallet_address IS NOT NULL) OR
    (auth_type = 'email' AND email IS NOT NULL AND password_hash IS NOT NULL)
  );

-- Make email unique when used for authentication
CREATE UNIQUE INDEX idx_users_email_unique ON users(email) WHERE auth_type = 'email';

-- Update existing users to have wallet auth type
UPDATE users SET auth_type = 'wallet' WHERE wallet_address IS NOT NULL;

COMMENT ON COLUMN users.auth_type IS 'Authentication method: wallet (web) or email (mobile)';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password for email authentication';
