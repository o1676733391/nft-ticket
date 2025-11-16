-- =============================================
-- NFT TICKETING SYSTEM - SUPABASE DATABASE SCHEMA
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. USERS TABLE
-- =============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    username VARCHAR(50),
    email VARCHAR(255),
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_username ON users(username);

-- =============================================
-- 2. EVENTS TABLE
-- =============================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location TEXT,
    venue_name VARCHAR(255),
    banner_url TEXT,
    thumbnail_url TEXT,
    category VARCHAR(50),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    event_id_onchain BIGINT UNIQUE, -- ID từ smart contract
    contract_address VARCHAR(42),
    royalty_fee INTEGER DEFAULT 0, -- basis points (500 = 5%)
    is_active BOOLEAN DEFAULT TRUE,
    is_published BOOLEAN DEFAULT FALSE,
    total_supply INTEGER DEFAULT 0,
    total_sold INTEGER DEFAULT 0,
    metadata JSONB, -- Extra metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_dates ON events(start_date, end_date);
CREATE INDEX idx_events_active ON events(is_active, is_published);
CREATE INDEX idx_events_category ON events(category);

-- =============================================
-- 3. TICKET TEMPLATES (Loại vé)
-- =============================================
CREATE TABLE ticket_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- VIP, Regular, Student...
    description TEXT,
    price_token NUMERIC(20, 2) NOT NULL DEFAULT 0,
    supply INTEGER NOT NULL DEFAULT 0,
    sold INTEGER DEFAULT 0,
    tier INTEGER DEFAULT 1, -- 1=Regular, 2=VIP, 3=VVIP
    royalty_fee INTEGER DEFAULT 0, -- basis points
    benefits JSONB, -- ["Backstage access", "Free drink"]
    metadata_uri TEXT, -- IPFS or Supabase Storage URL
    is_soulbound BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sale_starts_at TIMESTAMP WITH TIME ZONE,
    sale_ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_templates_event ON ticket_templates(event_id);
CREATE INDEX idx_templates_active ON ticket_templates(is_active);

-- =============================================
-- 4. TICKET OWNERSHIP (NFT Tickets)
-- =============================================
CREATE TYPE ticket_status AS ENUM (
    'minted',
    'listed',
    'sold',
    'checked_in',
    'transferred',
    'burned',
    'cancelled'
);

CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id BIGINT UNIQUE NOT NULL,
    template_id UUID NOT NULL REFERENCES ticket_templates(id),
    event_id UUID NOT NULL REFERENCES events(id),
    owner_wallet VARCHAR(42) NOT NULL,
    original_owner VARCHAR(42), -- First minter
    status ticket_status DEFAULT 'minted',
    tx_hash VARCHAR(66),
    metadata_uri TEXT,
    qr_code_url TEXT, -- QR for check-in
    qr_hash VARCHAR(64) UNIQUE, -- SHA256 hash for validation
    is_checked_in BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    checked_in_by UUID REFERENCES users(id),
    is_transferable BOOLEAN DEFAULT TRUE,
    minted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tickets_token_id ON tickets(token_id);
CREATE INDEX idx_tickets_owner ON tickets(owner_wallet);
CREATE INDEX idx_tickets_event ON tickets(event_id);
CREATE INDEX idx_tickets_template ON tickets(template_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_qr_hash ON tickets(qr_hash);

-- =============================================
-- 5. MARKETPLACE LISTINGS
-- =============================================
CREATE TYPE listing_status AS ENUM ('active', 'sold', 'cancelled');

CREATE TABLE marketplace_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    token_id BIGINT NOT NULL,
    seller_wallet VARCHAR(42) NOT NULL,
    price_token NUMERIC(20, 2) NOT NULL,
    status listing_status DEFAULT 'active',
    tx_hash VARCHAR(66),
    listed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sold_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    buyer_wallet VARCHAR(42),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_listings_ticket ON marketplace_listings(ticket_id);
CREATE INDEX idx_listings_seller ON marketplace_listings(seller_wallet);
CREATE INDEX idx_listings_status ON marketplace_listings(status);
CREATE INDEX idx_listings_active ON marketplace_listings(status) WHERE status = 'active';

-- =============================================
-- 6. CHECK-IN LOGS
-- =============================================
CREATE TABLE checkin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id),
    token_id BIGINT NOT NULL,
    event_id UUID NOT NULL REFERENCES events(id),
    scanned_by UUID REFERENCES users(id), -- Staff/Scanner
    scanned_wallet VARCHAR(42), -- Nếu không có user account
    device_info JSONB, -- Device metadata
    location_info JSONB, -- GPS if available
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_checkin_ticket ON checkin_logs(ticket_id);
CREATE INDEX idx_checkin_event ON checkin_logs(event_id);
CREATE INDEX idx_checkin_timestamp ON checkin_logs(timestamp);

-- =============================================
-- 7. TRANSACTIONS HISTORY
-- =============================================
CREATE TYPE transaction_type AS ENUM (
    'mint',
    'transfer',
    'list',
    'unlist',
    'sale',
    'burn'
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES tickets(id),
    token_id BIGINT,
    type transaction_type NOT NULL,
    from_wallet VARCHAR(42),
    to_wallet VARCHAR(42),
    price_token NUMERIC(20, 2),
    tx_hash VARCHAR(66) UNIQUE NOT NULL,
    block_number BIGINT,
    gas_used BIGINT,
    metadata JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_transactions_ticket ON transactions(ticket_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_wallets ON transactions(from_wallet, to_wallet);
CREATE INDEX idx_transactions_tx_hash ON transactions(tx_hash);

-- =============================================
-- 8. ANALYTICS & STATS (Denormalized for performance)
-- =============================================
CREATE TABLE event_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    tickets_sold INTEGER DEFAULT 0,
    revenue_token NUMERIC(20, 2) DEFAULT 0,
    unique_buyers INTEGER DEFAULT 0,
    checkins_count INTEGER DEFAULT 0,
    secondary_sales INTEGER DEFAULT 0,
    secondary_revenue NUMERIC(20, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, date)
);

-- Indexes
CREATE INDEX idx_analytics_event ON event_analytics(event_id);
CREATE INDEX idx_analytics_date ON event_analytics(date);

-- =============================================
-- 9. WHITELIST (Private/Presale)
-- =============================================
CREATE TABLE whitelist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    wallet_address VARCHAR(42) NOT NULL,
    allocation INTEGER DEFAULT 1, -- Số vé được phép mua
    used INTEGER DEFAULT 0,
    proof_data JSONB, -- Merkle proof data nếu cần
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, wallet_address)
);

-- Indexes
CREATE INDEX idx_whitelist_event ON whitelist(event_id);
CREATE INDEX idx_whitelist_wallet ON whitelist(wallet_address);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Auto update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_templates_updated_at BEFORE UPDATE ON ticket_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_listings_updated_at BEFORE UPDATE ON marketplace_listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_analytics_updated_at BEFORE UPDATE ON event_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkin_logs ENABLE ROW LEVEL SECURITY;

-- Users: Can read all, update only own
CREATE POLICY "Users can read all profiles" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Events: Public read, organizer write
CREATE POLICY "Anyone can read published events" ON events
    FOR SELECT USING (is_published = true OR organizer_id = auth.uid());

CREATE POLICY "Organizers can manage own events" ON events
    FOR ALL USING (organizer_id = auth.uid());

-- Tickets: Owner can see own tickets
CREATE POLICY "Users can see own tickets" ON tickets
    FOR SELECT USING (
        owner_wallet = (SELECT wallet_address FROM users WHERE id = auth.uid())
    );

-- Marketplace: Anyone can read active listings
CREATE POLICY "Anyone can read active listings" ON marketplace_listings
    FOR SELECT USING (status = 'active' OR seller_wallet = (
        SELECT wallet_address FROM users WHERE id = auth.uid()
    ));

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- View: Tickets với thông tin đầy đủ
CREATE VIEW tickets_full AS
SELECT 
    t.id,
    t.token_id,
    t.owner_wallet,
    t.status,
    t.is_checked_in,
    t.qr_code_url,
    tt.name as ticket_name,
    tt.price_token,
    tt.tier,
    e.id as event_id,
    e.title as event_title,
    e.start_date,
    e.end_date,
    e.location,
    e.banner_url
FROM tickets t
JOIN ticket_templates tt ON t.template_id = tt.id
JOIN events e ON t.event_id = e.id;

-- View: Marketplace listings với metadata
CREATE VIEW marketplace_full AS
SELECT 
    ml.id,
    ml.token_id,
    ml.seller_wallet,
    ml.price_token,
    ml.status,
    ml.listed_at,
    t.owner_wallet,
    tt.name as ticket_name,
    tt.tier,
    e.title as event_title,
    e.start_date,
    e.banner_url
FROM marketplace_listings ml
JOIN tickets t ON ml.ticket_id = t.id
JOIN ticket_templates tt ON t.template_id = tt.id
JOIN events e ON t.event_id = e.id
WHERE ml.status = 'active';

-- View: Event statistics
CREATE VIEW event_stats AS
SELECT 
    e.id,
    e.title,
    COUNT(DISTINCT t.id) as total_tickets,
    COUNT(DISTINCT CASE WHEN t.is_checked_in THEN t.id END) as checked_in_count,
    SUM(tt.price_token) as total_revenue,
    COUNT(DISTINCT t.owner_wallet) as unique_holders
FROM events e
LEFT JOIN tickets t ON e.id = t.event_id
LEFT JOIN ticket_templates tt ON t.template_id = tt.id
GROUP BY e.id, e.title;

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================

-- Insert sample user
-- INSERT INTO users (wallet_address, username, email) VALUES
-- ('0x1234567890123456789012345678901234567890', 'testuser', 'test@example.com');

COMMENT ON TABLE users IS 'User profiles linked to wallet addresses';
COMMENT ON TABLE events IS 'Events created by organizers';
COMMENT ON TABLE ticket_templates IS 'Ticket types/tiers for each event';
COMMENT ON TABLE tickets IS 'Individual NFT tickets owned by users';
COMMENT ON TABLE marketplace_listings IS 'Secondary market listings';
COMMENT ON TABLE checkin_logs IS 'Check-in history at event venues';
COMMENT ON TABLE transactions IS 'On-chain transaction history';
COMMENT ON TABLE event_analytics IS 'Daily analytics per event';
COMMENT ON TABLE whitelist IS 'Whitelist for presale/private access';
