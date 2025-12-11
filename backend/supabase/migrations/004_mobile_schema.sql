-- =============================================
-- MOBILE APP TABLES - No Blockchain
-- Traditional database-based ticketing
-- =============================================

-- Account type enum
CREATE TYPE account_type AS ENUM ('user', 'organizer', 'admin');

-- =============================================
-- 1. MOBILE USERS (Email/Password Auth)
-- =============================================
CREATE TABLE IF NOT EXISTS mobile_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(50),
    full_name VARCHAR(255),
    phone VARCHAR(20),
    avatar_url TEXT,
    acc_type account_type DEFAULT 'user',
    -- Organizer specific fields
    organization_name VARCHAR(255),
    organization_description TEXT,
    organization_logo TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_organizer_verified BOOLEAN DEFAULT FALSE, -- Admin approval for organizers
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mobile_users_email ON mobile_users(email);
CREATE INDEX IF NOT EXISTS idx_mobile_users_username ON mobile_users(username);
CREATE INDEX IF NOT EXISTS idx_mobile_users_acc_type ON mobile_users(acc_type);

-- =============================================
-- 2. MOBILE ORDERS (Purchase Records)
-- =============================================
CREATE TYPE order_status AS ENUM (
    'pending',
    'confirmed',
    'cancelled',
    'refunded',
    'failed'
);

CREATE TYPE payment_method AS ENUM (
    'card',
    'momo',
    'zalopay',
    'vnpay',
    'bank_transfer',
    'free'
);

CREATE TABLE IF NOT EXISTS mobile_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES mobile_users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES ticket_templates(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(20, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(20, 2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(20, 2) DEFAULT 0,
    promo_code VARCHAR(50),
    payment_method payment_method DEFAULT 'card',
    payment_reference VARCHAR(255), -- Transaction ID from payment gateway
    status order_status DEFAULT 'pending',
    confirmed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mobile_orders_user ON mobile_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_mobile_orders_event ON mobile_orders(event_id);
CREATE INDEX IF NOT EXISTS idx_mobile_orders_status ON mobile_orders(status);
CREATE INDEX IF NOT EXISTS idx_mobile_orders_created ON mobile_orders(created_at DESC);

-- =============================================
-- 3. MOBILE TICKETS (Digital Tickets)
-- =============================================
CREATE TYPE mobile_ticket_status AS ENUM (
    'valid',
    'used',
    'cancelled',
    'expired',
    'transferred'
);

CREATE TABLE IF NOT EXISTS mobile_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES mobile_orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES mobile_users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES ticket_templates(id),
    ticket_code VARCHAR(20) UNIQUE NOT NULL, -- e.g., "ABCD-1234-EFGH"
    qr_data TEXT NOT NULL, -- JSON data for QR code
    status mobile_ticket_status DEFAULT 'valid',
    is_checked_in BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    checked_in_by UUID REFERENCES mobile_users(id),
    -- Transfer history
    original_user_id UUID REFERENCES mobile_users(id),
    transferred_at TIMESTAMP WITH TIME ZONE,
    transferred_from UUID REFERENCES mobile_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mobile_tickets_order ON mobile_tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_mobile_tickets_user ON mobile_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_mobile_tickets_event ON mobile_tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_mobile_tickets_code ON mobile_tickets(ticket_code);
CREATE INDEX IF NOT EXISTS idx_mobile_tickets_status ON mobile_tickets(status);

-- =============================================
-- 4. MOBILE CHECK-IN LOGS
-- =============================================
CREATE TABLE IF NOT EXISTS mobile_checkin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES mobile_tickets(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    scanned_by UUID REFERENCES mobile_users(id),
    device_info JSONB,
    location_info JSONB,
    scan_result VARCHAR(50), -- 'success', 'already_used', 'invalid', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mobile_checkin_ticket ON mobile_checkin_logs(ticket_id);
CREATE INDEX IF NOT EXISTS idx_mobile_checkin_event ON mobile_checkin_logs(event_id);

-- =============================================
-- 5. PROMO CODES
-- =============================================
CREATE TABLE IF NOT EXISTS promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) DEFAULT 'percentage', -- 'percentage' or 'fixed'
    discount_value NUMERIC(10, 2) NOT NULL,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    min_order_amount NUMERIC(20, 2) DEFAULT 0,
    max_discount_amount NUMERIC(20, 2),
    event_id UUID REFERENCES events(id), -- NULL = applies to all events
    starts_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active) WHERE is_active = TRUE;

-- =============================================
-- 6. USER FAVORITES (Saved Events)
-- =============================================
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES mobile_users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, event_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user ON user_favorites(user_id);

-- =============================================
-- 7. NOTIFICATIONS
-- =============================================
CREATE TYPE notification_type AS ENUM (
    'order_confirmed',
    'ticket_ready',
    'event_reminder',
    'event_update',
    'promo',
    'system'
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES mobile_users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- =============================================
-- TRIGGERS
-- =============================================

-- Auto update updated_at for mobile tables
CREATE TRIGGER update_mobile_users_updated_at BEFORE UPDATE ON mobile_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mobile_orders_updated_at BEFORE UPDATE ON mobile_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mobile_tickets_updated_at BEFORE UPDATE ON mobile_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- VIEWS
-- =============================================

-- View: Mobile tickets with full event info
CREATE OR REPLACE VIEW mobile_tickets_full AS
SELECT 
    mt.id,
    mt.ticket_code,
    mt.status,
    mt.is_checked_in,
    mt.checked_in_at,
    mt.qr_data,
    tt.name as ticket_name,
    tt.tier,
    tt.benefits,
    mo.total_amount,
    mo.payment_method,
    e.id as event_id,
    e.title as event_title,
    e.start_date,
    e.end_date,
    e.location,
    e.venue_name,
    e.banner_url,
    e.thumbnail_url,
    mu.id as user_id,
    mu.email,
    mu.full_name
FROM mobile_tickets mt
JOIN ticket_templates tt ON mt.template_id = tt.id
JOIN events e ON mt.event_id = e.id
JOIN mobile_orders mo ON mt.order_id = mo.id
JOIN mobile_users mu ON mt.user_id = mu.id;

-- View: User order history
CREATE OR REPLACE VIEW mobile_orders_summary AS
SELECT 
    mo.id,
    mo.user_id,
    mo.quantity,
    mo.total_amount,
    mo.status,
    mo.payment_method,
    mo.created_at,
    e.title as event_title,
    e.start_date,
    e.banner_url,
    tt.name as ticket_type,
    COUNT(mt.id) as tickets_count
FROM mobile_orders mo
JOIN events e ON mo.event_id = e.id
JOIN ticket_templates tt ON mo.template_id = tt.id
LEFT JOIN mobile_tickets mt ON mt.order_id = mo.id
GROUP BY mo.id, e.id, tt.id;

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function: Check ticket validity
CREATE OR REPLACE FUNCTION check_ticket_validity(p_ticket_code VARCHAR)
RETURNS TABLE (
    is_valid BOOLEAN,
    message VARCHAR,
    ticket_id UUID,
    event_title VARCHAR,
    ticket_holder VARCHAR,
    is_checked_in BOOLEAN
) AS $$
DECLARE
    v_ticket RECORD;
BEGIN
    SELECT mt.*, e.title as event_title, e.start_date, e.end_date, mu.full_name
    INTO v_ticket
    FROM mobile_tickets mt
    JOIN events e ON mt.event_id = e.id
    JOIN mobile_users mu ON mt.user_id = mu.id
    WHERE mt.ticket_code = p_ticket_code;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Ticket not found'::VARCHAR, NULL::UUID, NULL::VARCHAR, NULL::VARCHAR, FALSE;
        RETURN;
    END IF;
    
    IF v_ticket.status != 'valid' THEN
        RETURN QUERY SELECT FALSE, ('Ticket status: ' || v_ticket.status)::VARCHAR, 
            v_ticket.id, v_ticket.event_title::VARCHAR, v_ticket.full_name::VARCHAR, v_ticket.is_checked_in;
        RETURN;
    END IF;
    
    IF v_ticket.is_checked_in THEN
        RETURN QUERY SELECT FALSE, 'Ticket already checked in'::VARCHAR,
            v_ticket.id, v_ticket.event_title::VARCHAR, v_ticket.full_name::VARCHAR, TRUE;
        RETURN;
    END IF;
    
    RETURN QUERY SELECT TRUE, 'Ticket is valid'::VARCHAR,
        v_ticket.id, v_ticket.event_title::VARCHAR, v_ticket.full_name::VARCHAR, FALSE;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SAMPLE DATA (for testing)
-- =============================================

-- Insert test mobile user (password: test123)
-- INSERT INTO mobile_users (email, password_hash, username, full_name) VALUES
-- ('test@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.qzJXxqQvzq8QKG', 'testuser', 'Test User');

COMMENT ON TABLE mobile_users IS 'Mobile app users with email/password authentication';
COMMENT ON TABLE mobile_orders IS 'Purchase orders for mobile app (no blockchain)';
COMMENT ON TABLE mobile_tickets IS 'Digital tickets for mobile app users';
COMMENT ON TABLE mobile_checkin_logs IS 'Check-in history for mobile tickets';
COMMENT ON TABLE promo_codes IS 'Promotional discount codes';
COMMENT ON TABLE user_favorites IS 'User saved/favorited events';
COMMENT ON TABLE notifications IS 'User notifications';
