-- =============================================
-- ADD ORGANIZER COLUMNS TO MOBILE_USERS
-- Run this if you only added acc_type manually
-- =============================================

-- Add organizer-specific columns if they don't exist
DO $$ 
BEGIN
    -- Add organization_name column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mobile_users' AND column_name = 'organization_name') THEN
        ALTER TABLE mobile_users ADD COLUMN organization_name VARCHAR(255);
    END IF;
    
    -- Add organization_description column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mobile_users' AND column_name = 'organization_description') THEN
        ALTER TABLE mobile_users ADD COLUMN organization_description TEXT;
    END IF;
    
    -- Add organization_logo column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mobile_users' AND column_name = 'organization_logo') THEN
        ALTER TABLE mobile_users ADD COLUMN organization_logo TEXT;
    END IF;
    
    -- Add is_organizer_verified column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mobile_users' AND column_name = 'is_organizer_verified') THEN
        ALTER TABLE mobile_users ADD COLUMN is_organizer_verified BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Create index on acc_type if not exists
CREATE INDEX IF NOT EXISTS idx_mobile_users_acc_type ON mobile_users(acc_type);
